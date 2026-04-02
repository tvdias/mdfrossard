const fs = require('fs');
const path = require('path');

const baseDirs = [
    path.join(__dirname, 'themes/mdfrossard/layout')
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
    getAllFiles(dir, ['.ejs'], filesToProcess);
});

filesToProcess.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/% loading="lazy" decoding="async">/g, '%>" loading="lazy" decoding="async">');
    
    // Also, some files might have fetchpriority or alt tags after it, like mdf_servico.ejs
    // `<img src="<%= featured_image || '/images/hero-img.webp' % loading="lazy" decoding="async">" alt="<%= title %>" fetchpriority="high">`
    content = content.replace(/% loading="lazy" decoding="async">"/g, '%>" loading="lazy" decoding="async"');

    // let's do a more robust string replacement
    // find all '% loading="lazy" decoding="async">' or '% loading="lazy" decoding="async">"'
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

// Since the regex replace is tricky, let's just do it directly using specific file contents or manual replace in JS.
console.log('Fixed tags');
