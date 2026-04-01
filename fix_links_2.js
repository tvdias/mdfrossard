const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'source', '_posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const replacements = {
  '/tratamentos/prevencao-e-manutencao/': '/tratamentos/prevencao-manutencao/',
  '/tratamentos/prevencao-e-manutencao': '/tratamentos/prevencao-manutencao/',
  '/tratamentos/estetica-dos-dentes/': '/tratamentos/estetica-dental/',
  '/tratamentos/estetica-dos-dentes': '/tratamentos/estetica-dental/',
  '/tratamentos/implante-dental/': '/tratamentos/implante-dentario/',
  '/tratamentos/implante-dental': '/tratamentos/implante-dentario/',
  '/tratamentos/protese/': '/tratamentos/protese-dentaria/',
  '/tratamentos/protese': '/tratamentos/protese-dentaria/',
  '/tratamentos/check-up-digital-preventivo/': '/odontologia-personalizada/',
  '/tratamentos/check-up-digital-preventivo': '/odontologia-personalizada/'
};

files.forEach(f => {
  const filePath = path.join(postsDir, f);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Perform replace for each
  for (const [oldPath, newPath] of Object.entries(replacements)) {
    content = content.split(oldPath).join(newPath); // Simple global replace
  }

  // Deduplicate trailing slashes if any were created like /tratamentos/prevencao-manutencao//
  content = content.replace(/(\/tratamentos\/[a-z-]+)\/\//g, '$1/');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${f}`);
  }
});
