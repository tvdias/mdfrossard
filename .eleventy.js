const fs = require("node:fs");
const path = require("node:path");
const ejs = require("ejs");
const yaml = require("js-yaml");
const markdownIt = require("markdown-it");
const { DateTime } = require("luxon");
const sizeOf = require("image-size");

const markdown = markdownIt({
  html: true,
  linkify: true,
  typographer: false,
});

markdown.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');
  const src = token.attrs[srcIndex][1];
  const altText = self.renderInlineAsText(token.children, options, env);
  
  let width = '';
  let height = '';

  if (src && !src.startsWith('http') && !src.startsWith('//')) {
    try {
      let imagePath = decodeURIComponent(src);
      if (imagePath.includes('?')) imagePath = imagePath.split('?')[0];
      if (imagePath.includes('#')) imagePath = imagePath.split('#')[0];
      
      const fullPath = path.join(__dirname, 'source', imagePath);
      if (fs.existsSync(fullPath)) {
        const dimensions = sizeOf(fullPath);
        width = dimensions.width;
        height = dimensions.height;
      } else {
        const nfdPath = path.join(__dirname, 'source', imagePath.normalize('NFD'));
        if (fs.existsSync(nfdPath)) {
            const dimensions = sizeOf(nfdPath);
            width = dimensions.width;
            height = dimensions.height;
        }
      }
    } catch (e) {
      console.log('Error getting size for', src, e);
    }
  }

  let imgAttrs = `src="${src}" alt="${altText}" loading="lazy" decoding="async"`;
  if (width && height) {
    imgAttrs += ` width="${width}" height="${height}"`;
  }

  token.attrs.forEach((attr) => {
    if (!['src', 'alt', 'loading', 'width', 'height', 'decoding'].includes(attr[0])) {
      imgAttrs += ` ${attr[0]}="${attr[1]}"`;
    }
  });

  return `<img ${imgAttrs}>`;
};

function loadYaml(filePath) {
  return yaml.load(fs.readFileSync(path.join(__dirname, filePath), "utf8"));
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, filePath), "utf8"));
}

function normalizeTestimonials(items = []) {
  return items.map((item) => ({
    ...item,
    name: item.name || item.author || "Paciente",
    content: item.content || item.text || "",
    role: item.role || "Paciente",
  }));
}

const siteConfig = loadYaml("source/_data/config.yml");
const themeConfig = loadYaml("themes/mdfrossard/_config.yml");
const siteData = {
  authors: loadJson("source/_data/authors.json"),
  informativos: loadJson("source/_data/informativos.json"),
  testimonials: normalizeTestimonials(loadJson("source/_data/testimonials.json")),
};

function urlFor(input = "/") {
  if (!input) {
    return "/";
  }

  if (/^(https?:)?\/\//i.test(input)) {
    return input;
  }

  let normalized = input.replace(/\\/g, "/");

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace(/\/index\.html$/, "/");
  normalized = normalized.replace(/\/+/g, "/");

  return normalized === "" ? "/" : normalized;
}

function toAbsoluteUrl(input = "/") {
  return new URL(urlFor(input), siteConfig.url).toString();
}

function formatDate(value, format = "dd LLL yyyy") {
  if (!value) {
    return "";
  }

  const mappedFormat = {
    "MMM D": "LLL d",
    "YYYY-MM-DD": "yyyy-LL-dd",
    "HH:mm:ss": "HH:mm:ss",
  }[format] || format;

  return DateTime.fromJSDate(new Date(value), {
    zone: siteConfig.timezone || "America/Sao_Paulo",
  }).setLocale("pt-BR").toFormat(mappedFormat);
}

function dateXml(value) {
  if (!value) {
    return "";
  }

  return DateTime.fromJSDate(new Date(value), {
    zone: siteConfig.timezone || "America/Sao_Paulo",
  }).toISO();
}

function stripHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptHtml(value = "", fallback = "") {
  if (fallback) {
    return `<p>${fallback}</p>`;
  }

  const excerpt = stripHtml(value).slice(0, 220).trim();

  return excerpt ? `<p>${excerpt}...</p>` : "";
}

function buildPost(postLike, htmlOverride) {
  const source = postLike || {};
  const raw = source.data ? source.data : source;
  const url = source.url ? source.url : raw.url || raw.path || "/";
  const html = htmlOverride || source.templateContent || raw.content || "";

  return {
    id: raw.id || raw.page?.fileSlug || path.basename(url.replace(/\/$/, "")) || "post",
    layout: raw.layout || "post",
    title: raw.title || "",
    author: raw.author || siteConfig.author,
    description: raw.description || "",
    excerpt: raw.excerpt || excerptHtml(html, raw.description),
    content: html,
    path: url,
    url,
    featured_image: raw.featured_image,
    category: raw.category,
    comments: raw.comments !== false,
    date: raw.date,
  };
}

function renderOpenGraph(meta = {}) {
  const title = meta.title ? `${meta.title} | ${siteConfig.title}` : siteConfig.title;
  const description = meta.description || siteConfig.description || "";
  const image = meta.image ? toAbsoluteUrl(meta.image) : undefined;
  const tags = [
    `<meta property="og:locale" content="pt_BR">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${toAbsoluteUrl(meta.url || "/")}">`,
    `<meta property="og:site_name" content="${siteConfig.title}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
  ];

  if (image) {
    tags.push(`<meta property="og:image" content="${image}">`);
    tags.push(`<meta name="twitter:image" content="${image}">`);
  }

  return tags.join("\n  ");
}

module.exports = function(eleventyConfig) {
  const contentAssetGlobs = [
    "source/contato/**/*.{jpg,jpeg,png,gif,svg}",
    "source/equipe/**/*.{jpg,jpeg,png,gif,svg}",
    "source/estrutura/**/*.{jpg,jpeg,png,gif,svg}",
    "source/localizacao/**/*.{jpg,jpeg,png,gif,svg}",
    "source/tratamentos/**/*.{jpg,jpeg,png,gif,svg}",
  ];

  eleventyConfig.setLibrary("md", markdown);
  eleventyConfig.addExtension("ejs", {
    outputFileExtension: "html",
    compile: function(str, inputPath) {
      return function(data) {
        return ejs.render(str, data, {
          filename: inputPath,
        });
      };
    },
  });

  eleventyConfig.addPassthroughCopy({ "source/images": "images" });
  eleventyConfig.addPassthroughCopy({ "source/css": "css" });
  eleventyConfig.addPassthroughCopy({ "source/js": "js" });
  eleventyConfig.addPassthroughCopy({ "source/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "source/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "source/_redirects": "_redirects" });
  for (const assetGlob of contentAssetGlobs) {
    eleventyConfig.addPassthroughCopy(assetGlob);
  }
  
  eleventyConfig.addPassthroughCopy({ "themes/mdfrossard/source/css": "css" });
  eleventyConfig.addPassthroughCopy({ "themes/mdfrossard/source/fancybox": "fancybox" });
  eleventyConfig.addPassthroughCopy({ "themes/mdfrossard/source/files": "files" });
  eleventyConfig.addPassthroughCopy({ "themes/mdfrossard/source/fonts": "fonts" });
  eleventyConfig.addPassthroughCopy({ "themes/mdfrossard/source/images": "images" });
  eleventyConfig.addPassthroughCopy({ "themes/mdfrossard/source/js": "js" });
  eleventyConfig.addPassthroughCopy({ "themes/mdfrossard/source/revslider": "revslider" });
  eleventyConfig.addWatchTarget("themes/mdfrossard/layout");
  eleventyConfig.addWatchTarget("source/css");
  eleventyConfig.addWatchTarget("source/js");

  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("./source/_posts/*.md")
      .sort((left, right) => new Date(right.date) - new Date(left.date));
  });

  eleventyConfig.addGlobalData("config", siteConfig);
  eleventyConfig.addGlobalData("theme", themeConfig);
  eleventyConfig.addGlobalData("site", { data: siteData });
  eleventyConfig.addGlobalData("url_for", () => urlFor);
  eleventyConfig.addGlobalData("markdown", () => (value) => markdown.render(value || ""));
  eleventyConfig.addGlobalData("format_date", () => formatDate);
  eleventyConfig.addGlobalData("format_date_xml", () => dateXml);
  eleventyConfig.addGlobalData("build_post", () => buildPost);
  eleventyConfig.addGlobalData("open_graph", () => renderOpenGraph);

  eleventyConfig.addTransform("strip-hexo-raw", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }

    return content
      .replace(/<p>\s*{%\s*raw\s*%}\s*<\/p>/g, "")
      .replace(/<p>\s*{%\s*endraw\s*%}\s*<\/p>/g, "")
      .replace(/{%\s*raw\s*%}/g, "")
      .replace(/{%\s*endraw\s*%}/g, "");
  });

  return {
    dir: {
      input: "source",
      output: "public",
      layouts: "../themes/mdfrossard/layout",
    },
    htmlTemplateEngine: "ejs",
    markdownTemplateEngine: "ejs",
    templateFormats: ["md", "html", "ejs", "11ty.js"],
  };
};