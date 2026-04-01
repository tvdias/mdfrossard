const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'source', '_posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const replacements = {
  '/tratamentos/prevencao-e-manutencao': '/tratamentos/prevencao-manutencao',
  '/tratamentos/estetica-dos-dentes': '/tratamentos/estetica-dental',
  '/tratamentos/implante-dental': '/tratamentos/implante-dentario',
  '/tratamentos/protese': '/tratamentos/protese-dentaria',
  '/tratamentos/check-up-digital-preventivo': '/odontologia-personalizada'
};

files.forEach(f => {
  const filePath = path.join(postsDir, f);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  for (const [oldPath, newPath] of Object.entries(replacements)) {
    const regex = new RegExp(oldPath.replace(/\//g, '\\/') + '\\/?(?=[\\)"\\\'])', 'g');
    content = content.replace(regex, newPath + '/');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${f}`);
  }
});

console.log("Link replacement complete.");
