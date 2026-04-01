module.exports = {
  layout: "post.ejs",
  permalink: (data) => `/${data.page.fileSlug}/`,
};