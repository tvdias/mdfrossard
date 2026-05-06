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
        if (url.startsWith("/images/")) return false;
        if (url.startsWith("/_drafts/")) return false;
        // Excluir páginas que tenham noindex explícito no frontmatter
        if (item.data && item.data.noindex === true) return false;
        return true;
      })
      .sort((a, b) => {
        // Colocar a Home no topo
        if (a.url === "/") return -1;
        if (b.url === "/") return 1;
        return 0;
      })
      .map((item) => {
        const loc = new URL(item.url, data.config.url).toString();
        const lastmod = item.data && item.data.updated
          ? new Date(item.data.updated).toISOString().split("T")[0]
          : item.date
            ? new Date(item.date).toISOString().split("T")[0]
            : null;
        
        let imageTag = "";
        if (item.data && item.data.featured_image) {
          const imgUrl = new URL(item.data.featured_image, data.config.url).toString();
          imageTag = `\n    <image:image>\n      <image:loc>${imgUrl}</image:loc>\n      <image:title>${item.data.title || ""}</image:title>\n    </image:image>`;
        }

        return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${imageTag}
  </url>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
  }
}

module.exports = SiteMap;