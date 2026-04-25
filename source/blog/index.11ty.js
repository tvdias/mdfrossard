class BlogIndexPage {
  data() {
    return {
      layout: "index.ejs",
      active_menu: "blog",
      pagination: {
        data: "collections.posts",
        size: 10,
        alias: "posts",
      },
      permalink: (data) => {
        if (data.pagination.pageNumber === 0) {
          return "/blog/index.html";
        }

        return `/blog/page/${data.pagination.pageNumber + 1}/index.html`;
      },
      // Diferencia title/description por página de paginação para evitar duplicate-content em SEO.
      // Cada paginação canonicaliza para si mesma e agora tem metadados únicos.
      eleventyComputed: {
        title: (data) => {
          const n = (data.pagination && data.pagination.pageNumber) || 0;
          return n === 0 ? "Blog" : `Blog - Página ${n + 1}`;
        },
        description: (data) => {
          const n = (data.pagination && data.pagination.pageNumber) || 0;
          return n === 0
            ? "Dicas, curiosidades e artigos sobre saúde bucal escritos pelos especialistas da MD Frossard. Fique por dentro das novidades em odontologia."
            : `Artigos do blog da MD Frossard - Página ${n + 1}. Conteúdo sobre saúde bucal, implantes, ortodontia, estética dental e cuidados odontológicos.`;
        },
      },
    };
  }

  render() {
    return "";
  }
}

module.exports = BlogIndexPage;
