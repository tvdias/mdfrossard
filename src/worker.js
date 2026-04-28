// ────────────────────────────────────────────────────────────────────────
// Cloudflare Worker — entry point único do site mdfrossard.com.br
//
// Responsabilidades:
//   1. Roteia /api/track-contact (POST/OPTIONS) → handlers/track-contact
//      Único endpoint ativo: recebe beacon dos cliques em WhatsApp/telefone
//      e dispara evento `Contact` server-side via Meta CAPI.
//   2. Qualquer outra rota é delegada a env.ASSETS (Static Assets binding),
//      que serve os arquivos gerados pelo Eleventy em ./public.
//
// Bindings esperados (definidos em wrangler.toml):
//   env.ASSETS              — fetch p/ arquivos estáticos
// Variáveis (Production env vars no Cloudflare):
//   env.META_PIXEL_ID       — id do pixel Meta
//   env.META_CAPI_TOKEN     — access token CAPI
//   env.META_TEST_EVENT_CODE — opcional, p/ aba "Test Events"
//
// NOTA: O endpoint /api/contact (form de contato + SparkPost) foi removido
// porque o form não está em uso. Se voltar, restaurar src/api/contact.js
// do histórico do git e adicionar de volta no ROUTES.
// ────────────────────────────────────────────────────────────────────────

import * as trackContact from "./api/track-contact.js";

const ROUTES = {
  "/api/track-contact": trackContact,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const handler = ROUTES[url.pathname];

    // 1) Rota /api/* registrada → despacha por método
    if (handler) {
      const method = request.method.toUpperCase();
      if (method === "OPTIONS" && handler.handleOptions) {
        return handler.handleOptions(request, env, ctx);
      }
      if (method === "POST" && handler.handlePost) {
        return handler.handlePost(request, env, ctx);
      }
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST, OPTIONS" },
      });
    }

    // 2) Bloqueia rotas /api/* não registradas em vez de cair pra estático
    //    (evita servir HTML de "página não encontrada" quando o cliente
    //     espera JSON de uma API).
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // 3) Delega tudo o mais para Static Assets (Eleventy → ./public)
    return env.ASSETS.fetch(request);
  },
};
