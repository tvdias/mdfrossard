class AtomFeed {
  data() {
    return {
      permalink: "/atom.xml",
    };
  }

  render(data) {
    const posts = (data.collections.posts || []).slice(0, 20);
    const updated = posts[0]?.date || new Date();
    const entries = posts.map((post) => {
      const absoluteUrl = new URL(post.url, data.config.url).toString();
      const title = post.data.title || "Sem titulo";
      const description = post.data.description || "";

      return `<entry>\n  <title><![CDATA[${title}]]></title>\n  <link href="${absoluteUrl}"/>\n  <id>${absoluteUrl}</id>\n  <updated>${new Date(post.date).toISOString()}</updated>\n  <summary><![CDATA[${description}]]></summary>\n</entry>`;
    }).join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${data.config.title}</title>\n  <id>${data.config.url}/</id>\n  <link href="${data.config.url}/atom.xml" rel="self"/>\n  <link href="${data.config.url}/"/>\n  <updated>${new Date(updated).toISOString()}</updated>\n  <subtitle>${data.config.description || ""}</subtitle>\n${entries}\n</feed>`;
  }
}

module.exports = AtomFeed;