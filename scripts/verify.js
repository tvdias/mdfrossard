const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function getAllHtmlFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllHtmlFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.html')) {
          arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(publicDir);

let totalImages = 0;
let missingLazy = 0;
let missingWidth = 0;
let noWebp = 0;

for (const file of htmlFiles) {
    const data = fs.readFileSync(file, 'utf8');
    const imgRegex = /<img\s+([^>]+)>/gi;
    let match;
    while ((match = imgRegex.exec(data)) !== null) {
        totalImages++;
        const attrs = match[1].toLowerCase();
        
        let src = '';
        const srcMatch = match[1].match(/src=["']([^"']+)["']/i);
        if (srcMatch) src = srcMatch[1];
        
        if (!attrs.includes('loading="lazy"') && !attrs.includes("loading='lazy'")) {
            // some logo/footer images intentionally don't have lazy, but let's count
            if (!attrs.includes('logo') && !attrs.includes('facebook') && !attrs.includes('footer')) {
                missingLazy++;
            }
        }
        if (!attrs.includes('width=')) {
           if (!attrs.includes('logo') && !attrs.includes('facebook') && !attrs.includes('footer')) {
                missingWidth++;
            }
        }
        
        if (src && !src.endsWith('.webp')) {
            noWebp++;
        }
    }
}

console.log('Resultados da Verificação Final (Diretório Public):');
console.log('----------------------------------------------------');
console.log(`Total de tags <img> analisadas: ${totalImages}`);
console.log(`Imagens de conteúdo que ainda não possuem loading="lazy": ${missingLazy}`);
console.log(`Imagens de conteúdo que não possuem dimensões informadas: ${missingWidth}`);
console.log(`Imagens que NÃO estão em formato WebP moderno: ${noWebp}`);
