const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'source', '_posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

files.forEach(f => {
  const filePath = path.join(postsDir, f);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  content = content.replace(/\/tratamentos\/protese-dentaria\/-dentaria/g, '/tratamentos/protese-dentaria');
  content = content.replace(/\/tratamentos\/protese-dentaria-dentaria/g, '/tratamentos/protese-dentaria');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${f}`);
  }
});
