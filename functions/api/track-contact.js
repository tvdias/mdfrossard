// Cloudflare Pages Function: /api/track-contact
// Recebe um beacon enviado pelo browser quando o usuário clica em
// WhatsApp ou Telefone, e dispara o evento `Contact` server-side
// para a Meta Conversions API (CAPI). Server-side complementa o
// fbq('track','Contact') do browser usando o mesmo event_id, e a
// Meta deduplica via dedup browser+server.
//
// Sem PII: o click não captura email/telefone. Match quality vem
// dos cookies _fbp/_fbc + IP + UA enviados pelo browser.
//
// Variáveis de ambiente esperadas:
//   META_PIXEL_ID         — ex.: 266409860211711
//   META_CAPI_TOKEN       — Access Token CAPI (Events Manager)
//   META_TEST_EVENT_CODE  — opcional, p/ "Eventos de Teste"
//
// Falha silenciosa: o beacon é fire-and-forget, qualquer erro
// retorna 204 sem quebrar a navegação do usuário.

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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context) {
  const { env, request } = context;

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

  const body = {
    data: [
      {
        event_name: "Contact",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: referer,
        user_data: userData,
        custom_data: {
          content_category: channel,
          lead_source: "click_cta",
        },
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

  if (context.waitUntil) {
    context.waitUntil(capiPromise);
  }

  // 204 No Content — beacon não precisa de body
  return new Response(null, { status: 204, headers: corsHeaders() });
}
