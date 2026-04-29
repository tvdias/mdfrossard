// ────────────────────────────────────────────────────────────────────────
// /api/track-contact — Worker handler (chamado por src/worker.js)
//
// Recebe um beacon enviado pelo browser quando o usuário clica em
// WhatsApp ou Telefone, e dispara o evento `Contact` server-side
// para a Meta Conversions API (CAPI). Server-side complementa o
// fbq('track','Contact') do browser usando o mesmo event_id, e a
// Meta deduplica via dedup browser+server.
//
// Sem PII: o click não captura email/telefone. Match quality vem
// dos cookies _fbp/_fbc + IP + UA enviados pelo browser.
//
// Value-based bidding: o beacon pode incluir { value, currency } quando
// a LP define `contact_value` no front-matter. Sanitização rígida no
// handler (cap 1MM, currency ISO-4217). Sem value, evento Contact é
// enviado sem valor monetário (comportamento legado preservado).
//
// Advanced Matching: o beacon pode incluir { external_id } (UUID gerado
// client-side, persistido em localStorage com consent). Worker hasheia
// com SHA-256 antes de incluir em user_data — Meta CAPI exige hash
// para qualquer PII identificadora. Melhora match quality em iOS Safari
// (cookies expiram em 7d via ITP) e em browsers com adblocker.
//
// Variáveis de ambiente esperadas (Cloudflare → Settings → Variables):
//   META_PIXEL_ID         — ex.: 266409860211711
//   META_CAPI_TOKEN       — Access Token CAPI (Events Manager)
//   META_TEST_EVENT_CODE  — opcional, p/ "Eventos de Teste"
//
// Falha silenciosa: o beacon é fire-and-forget, qualquer erro
// retorna 204 sem quebrar a navegação do usuário.
// ────────────────────────────────────────────────────────────────────────

const META_API_VERSION = "v18.0";
const ALLOWED_ORIGIN = "https://mdfrossard.com.br";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const p of parts) {
    const [k, ...v] = p.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

// SHA-256 hex — Meta CAPI exige user_data hashed (exceto fbp/fbc/IP/UA).
// Usa Web Crypto API nativa do Cloudflare Workers runtime.
async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function handleOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function handlePost(request, env, ctx) {
  // Sem secrets configurados: silencia em vez de quebrar UX
  if (!env.META_PIXEL_ID || !env.META_CAPI_TOKEN) {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  let payload = null;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (!payload || typeof payload.event_id !== "string" || !payload.event_id) {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Sanitiza campos vindos do client
  const eventId = String(payload.event_id).slice(0, 64);
  const channel = ["whatsapp", "phone"].includes(payload.channel) ? payload.channel : "click";
  const sourceUrlClient = typeof payload.source_url === "string" ? payload.source_url.slice(0, 1024) : "";

  // Value-based bidding: aceita value (número) e currency (string ISO 4217).
  // Sanitização rígida: número finito, > 0, ≤ 1.000.000 (sanity cap).
  // Currency aceita apenas 3 letras maiúsculas A-Z. Inválido = ignora.
  let contactValue = null;
  let contactCurrency = null;
  const rawValue = Number(payload.value);
  if (Number.isFinite(rawValue) && rawValue > 0 && rawValue <= 1_000_000) {
    contactValue = rawValue;
    const rawCurrency = typeof payload.currency === "string" ? payload.currency.toUpperCase() : "";
    contactCurrency = /^[A-Z]{3}$/.test(rawCurrency) ? rawCurrency : "BRL";
  }

  // Advanced Matching: External ID estável (UUID gerado client-side com consent).
  // Sanitização: 8-128 caracteres, [A-Za-z0-9-_]. Inválido = ignora silenciosamente.
  // Hashed server-side antes de enviar ao Meta CAPI (PII policy).
  let externalIdRaw = null;
  if (typeof payload.external_id === "string") {
    const candidate = payload.external_id.trim();
    if (/^[A-Za-z0-9_-]{8,128}$/.test(candidate)) {
      externalIdRaw = candidate;
    }
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const fbp = getCookie(cookieHeader, "_fbp");
  const fbc = getCookie(cookieHeader, "_fbc");

  const ipAddr =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || sourceUrlClient || "https://mdfrossard.com.br/";

  const userData = {};
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (ipAddr) userData.client_ip_address = ipAddr;
  if (userAgent) userData.client_user_agent = userAgent;
  // External ID: Meta CAPI requer SHA-256 hex em lowercase
  if (externalIdRaw) {
    try {
      userData.external_id = await sha256Hex(externalIdRaw);
    } catch (e) {
      // Falha no hash não pode quebrar o evento; segue sem external_id
      console.log("[CAPI/track-contact] sha256 failed:", e && e.message);
    }
  }

  const customData = {
    content_category: channel,
    lead_source: "click_cta",
  };
  // Inclui value/currency apenas se enviados pelo browser (LP definiu contact_value).
  // Páginas sem contact_value mantêm o comportamento anterior (Contact sem valor).
  if (contactValue != null) {
    customData.value = contactValue;
    customData.currency = contactCurrency;
  }

  const body = {
    data: [
      {
        event_name: "Contact",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: referer,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };
  if (env.META_TEST_EVENT_CODE) {
    body.test_event_code = env.META_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${META_API_VERSION}/${env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(env.META_CAPI_TOKEN)}`;

  const capiPromise = fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(async (res) => {
      if (!res.ok) {
        const txt = await res.text();
        console.log("[CAPI/track-contact] HTTP", res.status, txt);
      }
    })
    .catch((err) => {
      console.log("[CAPI/track-contact] exception:", err && err.message);
    });

  if (ctx && ctx.waitUntil) {
    ctx.waitUntil(capiPromise);
  }

  // 204 No Content — beacon não precisa de body
  return new Response(null, { status: 204, headers: corsHeaders() });
}
