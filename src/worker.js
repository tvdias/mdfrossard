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

    // 3) Redirects de limpeza — parâmetros legados e URLs antigas
    //    que o _redirects não consegue tratar (query params).

    // 3a) ?nonamp=1 — resquício das AMP pages antigas.
    //     Retornavam 5xx porque o Assets binding não sabe lidar com esse param.
    if (url.searchParams.has("nonamp")) {
      const clean = new URL(request.url);
      clean.searchParams.delete("nonamp");
      // Remove trailing slash acidental que ficava no valor (ex: ?nonamp=1/)
      const dest = clean.toString().replace(/\/\s*$/, "/");
      return Response.redirect(clean.toString(), 301);
    }

    // 3b) URLs antigas do WordPress (/slug/index.html)
    if (url.pathname.endsWith("/index.html") && url.pathname !== "/index.html") {
      const clean = url.pathname.replace(/\/index\.html$/, "/");
      return Response.redirect(new URL(clean, request.url).toString(), 301);
    }

    // 3c) Slugs antigos pontuais sem redirect no _redirects
    const legacyRedirects = {
      // URLs antigas sem correspondência direta no site atual
      "/dentistas-na-barra-tijuca/": "/dentista-barra-da-tijuca/",  // sem "da" → com "da"
      "/tratamentos/check-up-digital-preventivo": "/check-up-digital-preventivo-dos-dentes/",
      // Trailing slash (Assets binding não normaliza automaticamente em todos os casos)
      "/tratamentos/periodontia": "/tratamentos/periodontia/",
      "/sensibilidade-nos-dentes": "/sensibilidade-nos-dentes/",
      "/localizacao": "/localizacao/",
      "/equipe": "/equipe/",
    };
    const legacyDest = legacyRedirects[url.pathname];
    if (legacyDest) {
      return Response.redirect(new URL(legacyDest, request.url).toString(), 301);
    }

    // 4) Delega tudo o mais para Static Assets (Eleventy → ./public)
    return env.ASSETS.fetch(request);
  },
};
