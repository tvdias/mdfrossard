class SiteMap {
  data() {
    return {
      permalink: "/sitemap.xml",
    };
  }

  render(data) {
    const urls = (data.collections.all || [])
      .filter((item) => {
        if (!item || !item.url || !data?.config?.url) return false;
        const url = item.url;
        // Excluir seções que não devem ser indexadas
        if (url.startsWith("/admin")) return false;
        if (url.startsWith("/l/")) return false;
        if (url.startsWith("/email-confirmado")) return false;
        if (url.startsWith("/landing-page-mancha-no-dente")) return false;
        if (url.startsWith("/images/")) return false;
        if (url.startsWith("/_drafts/")) return false;
        // Excluir páginas que tenham noindex explícito no frontmatter
        if (item.data && item.data.noindex === true) return false;
        return true;
      })
      .map((item) => {
        const loc = new URL(item.url, data.config.url).toString();
        const lastmod = item.data && item.data.updated
          ? new Date(item.data.updated).toISOString().split("T")[0]
          : item.date
            ? new Date(item.date).toISOString().split("T")[0]
            : null;
        return lastmod
          ? `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
          : `<url><loc>${loc}</loc></url>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  }
}

module.exports = SiteMap;