// ────────────────────────────────────────────────────────────────────────
// /api/contact — Worker handler (chamado por src/worker.js)
//
// Recebe envio do formulário, dispara email via SparkPost e
// envia evento `Lead` server-side para a Meta Conversions API (CAPI).
//
// Variáveis de ambiente esperadas (Cloudflare → Settings → Variables):
//   SPARKPOST_SECRET     — token SparkPost (já existia)
//   CONTACT_EMAIL        — destinatário do email (já existia)
//   SITE_EMAIL_FROM      — opcional, remetente
//   META_PIXEL_ID        — ID do pixel (ex.: 266409860211711)
//   META_CAPI_TOKEN      — Access Token CAPI (Events Manager → API de Conversões)
//   META_TEST_EVENT_CODE — opcional, p/ testar em "Eventos de Teste"
//
// O token CAPI nunca aparece no client. Falha de CAPI não bloqueia
// o submit — log + ok 200 para não quebrar UX.
// ────────────────────────────────────────────────────────────────────────

const SPARKPOST_API_URL = "https://api.sparkpost.com/api/v1/transmissions";
const ALLOWED_ORIGIN = "https://mdfrossard.com.br";
const META_API_VERSION = "v18.0";

// ── Helpers ──────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

// SHA-256 hex (Web Crypto, disponível no runtime do Cloudflare Workers)
async function sha256Hex(str) {
  const data = new TextEncoder().encode(String(str));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Normaliza dado do usuário antes de hashear (regra Meta: lowercase + trim, telefone só dígitos)
function normEmail(s) {
  return String(s ?? "").trim().toLowerCase();
}
function normPhone(s) {
  // Mantém só dígitos (incluindo DDI). 21 99999-9999 → 21999999999
  return String(s ?? "").replace(/\D+/g, "");
}
function normName(s) {
  return String(s ?? "").trim().toLowerCase();
}

// Lê cookie do header
function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const p of parts) {
    const [k, ...v] = p.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

// ── SparkPost ────────────────────────────────────────────────────────────

async function sendMessage(payload, env) {
  const response = await fetch(SPARKPOST_API_URL, {
    method: "POST",
    headers: {
      Authorization: env.SPARKPOST_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: {
        from: env.SITE_EMAIL_FROM || "site@email.mdfrossard.com.br",
        subject: `CONTATO: ${payload.subject}`,
        html: `<html><body><p>Mensagem enviada pelo site</p><p>De: ${escHtml(payload.name)} - ${escHtml(payload.email)}</p><p>Assunto: ${escHtml(payload.subject)}</p><p>Mensagem:<br />${escHtml(payload.message)}</p></body></html>`,
      },
      recipients: [{ address: env.CONTACT_EMAIL }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `SparkPost request failed with ${response.status}`);
  }
}

// ── Meta Conversions API ─────────────────────────────────────────────────

/**
 * Envia evento `Lead` server-side para a Meta CAPI.
 * Usa o mesmo `event_id` enviado pelo client em fbq('track','Lead',{},{eventID})
 * para deduplicação. Hashea email/phone com SHA-256.
 *
 * Não joga exception — loga e retorna boolean. CAPI nunca deve bloquear o form.
 */
async function sendMetaCapi({ env, payload, request, eventId }) {
  if (!env.META_PIXEL_ID || !env.META_CAPI_TOKEN) {
    console.log("[CAPI] META_PIXEL_ID ou META_CAPI_TOKEN não configurados; pulando.");
    return false;
  }

  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const fbp = getCookie(cookieHeader, "_fbp");
    const fbc = getCookie(cookieHeader, "_fbc");

    // Cloudflare expõe IP em CF-Connecting-IP; UA no header padrão.
    const ipAddr =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "";
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "https://mdfrossard.com.br/contato/";

    // user_data com PII hashed. Vazios são omitidos.
    const userData = {};
    if (payload.email) userData.em = [await sha256Hex(normEmail(payload.email))];
    if (payload.phone) userData.ph = [await sha256Hex(normPhone(payload.phone))];
    if (payload.name) {
      const parts = normName(payload.name).split(/\s+/);
      if (parts[0]) userData.fn = [await sha256Hex(parts[0])];
      if (parts.length > 1) userData.ln = [await sha256Hex(parts.slice(1).join(" "))];
    }
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;
    if (ipAddr) userData.client_ip_address = ipAddr;
    if (userAgent) userData.client_user_agent = userAgent;

    const body = {
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId, // dedup com browser
          action_source: "website",
          event_source_url: referer,
          user_data: userData,
          custom_data: {
            content_name: payload.subject ? String(payload.subject).slice(0, 100) : "Formulário Contato",
            lead_source: "site_form",
          },
        },
      ],
    };
    if (env.META_TEST_EVENT_CODE) {
      body.test_event_code = env.META_TEST_EVENT_CODE;
    }

    const url = `https://graph.facebook.com/${META_API_VERSION}/${env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(env.META_CAPI_TOKEN)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.log("[CAPI] erro HTTP", res.status, txt);
      return false;
    }
    return true;
  } catch (err) {
    console.log("[CAPI] exception:", err && err.message);
    return false;
  }
}

// ── Handlers ─────────────────────────────────────────────────────────────

export async function handleOptions() {
  return json({ ok: true });
}

export async function handlePost(request, env, ctx) {
  if (!env.SPARKPOST_SECRET || !env.CONTACT_EMAIL) {
    return json({ message: "Missing SPARKPOST_SECRET or CONTACT_EMAIL." }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ message: "Invalid JSON payload." }, 400);
  }

  // Honeypot: campo "website" preenchido = bot. Retorna ok silenciosamente.
  if (payload.website) {
    return json({ message: "Message sent successfully!" });
  }

  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    return json({ message: "Required information is missing." }, 422);
  }

  // event_id vem do client. Se não vier (cliente antigo), gera um — sem dedup
  // mas pelo menos a CAPI dispara.
  const eventId =
    typeof payload.event_id === "string" && payload.event_id
      ? payload.event_id
      : crypto.randomUUID();

  try {
    await sendMessage(payload, env);
  } catch (error) {
    return json({ message: `Internal Server Error: ${error.message}` }, 500);
  }

  // CAPI não bloqueia a resposta nem o sucesso do form.
  // waitUntil deixa rodar em background sem segurar a Response.
  const capiPromise = sendMetaCapi({ env, payload, request, eventId });
  if (ctx && ctx.waitUntil) {
    ctx.waitUntil(capiPromise);
  }

  return json({ message: "Message sent successfully!", event_id: eventId });
}
