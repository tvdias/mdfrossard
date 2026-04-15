class SiteMap {
  data() {
    return {
      permalink: "/sitemap.xml",
    };
  }

  render(data) {
    const urls = (data.collections.all || [])
      .filter((item) => item && item.url && !item.url.startsWith("/admin") && !item.url.startsWith("/l/") && data?.config?.url)
      .map((item) => `<url><loc>${new URL(item.url, data.config.url).toString()}</loc></url>`)
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  }
}

module.exports = SiteMap;