class BlogIndexPage {
  data() {
    return {
      layout: "index.ejs",
      title: "Blog",
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
    };
  }

  render() {
    return "";
  }
}

module.exports = BlogIndexPage;