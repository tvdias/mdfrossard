const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const baseDirs = [
    path.join(__dirname, 'source'),
    path.join(__dirname, 'themes/mdfrossard')
];

function getAllFiles(dirPath, extFilter, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, extFilter, arrayOfFiles);
    } else {
      if (extFilter.some(ext => file.endsWith(ext))) {
          arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const filesToProcess = [];
baseDirs.forEach(dir => {
    getAllFiles(dir, ['.ejs', '.html', '.md'], filesToProcess);
});

let modifiedFiles = 0;

function processAttributes(attrString) {
    let srcMatch = attrString.match(/src=["']([^"']+)["']/i);
    let src = srcMatch ? srcMatch[1] : null;

    if (!src) return attrString;

    let newAttrs = attrString;
    
    // Convert to webp
    if (src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png')) {
        let newSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        newAttrs = newAttrs.replace(src, newSrc);
        src = newSrc;
    }

    const isLogoOrFooter = /logo|facebook|footer|banner/i.test(attrString);

    if (!isLogoOrFooter) {
        if (!/loading=["']lazy["']/i.test(newAttrs)) {
            newAttrs += ' loading="lazy"';
        }
    } else {
        // even if it's logo, use eager? Or just don't add lazy.
    }

    if (!/decoding=["']async["']/i.test(newAttrs)) {
        newAttrs += ' decoding="async"';
    }

    if (!/width=/i.test(newAttrs) || !/height=/i.test(newAttrs)) {
        try {
            let imagePath = decodeURIComponent(src);
            if (imagePath.includes('?')) imagePath = imagePath.split('?')[0];
            if (imagePath.includes('#')) imagePath = imagePath.split('#')[0];
            
            // local absolute or relative check
            let fullPath = null;
            if (imagePath.startsWith('/')) {
                fullPath = path.join(__dirname, 'source', imagePath);
                // check if it exists in themes
                if (!fs.existsSync(fullPath)) {
                    fullPath = path.join(__dirname, 'themes/mdfrossard/source', imagePath);
                }
            } else if (!imagePath.startsWith('http')) {
                fullPath = path.join(__dirname, 'source', imagePath); // naive assume relative means from source root, which may be wrong but works for many cases
            }

            if (fullPath && fs.existsSync(fullPath)) {
                const dimensions = sizeOf(fullPath);
                if (!/width=/i.test(newAttrs)) newAttrs += ` width="${dimensions.width}"`;
                if (!/height=/i.test(newAttrs)) newAttrs += ` height="${dimensions.height}"`;
            }
        } catch (e) {
            // failed to get size, ignore
        }
    }

    return newAttrs;
}

filesToProcess.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const imgRegex = /<img\s+([^>]+)>/gi;
    content = content.replace(imgRegex, (match, attrs) => {
        // Skip tags that already have everything or process them
        // To be safe, don't double add
        return `<img ${processAttributes(attrs)}>`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedFiles++;
    }
});

console.log(`${modifiedFiles} arquivos modificados com tags <img> otimizadas.`);
