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
  let changed = false;

  for (const [oldPath, newPath] of Object.entries(replacements)) {
    // We should replace both with and without trailing splash, e.g. `(/tratamentos/...)` or `(/tratamentos/.../)`
    // Regex matching url, we can replace instances matching `oldPath` + `/?`
    const regex = new RegExp(oldPath.replace(/\//g, '\\/') + '\\/?(?=[\\)"\'])', 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newPath + '/'); // Append trailing slash as standard
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${f}`);
  }
});

console.log("Link replacement complete.");
