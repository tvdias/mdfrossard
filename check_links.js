const fs = require('fs');
const path = require('path');

const baseDir = '/Users/davifrossard/Dropbox/My Mac (MacBook Pro de Davi)/Desktop/Site MD Frossard/mdfrossard';
const postsDir = path.join(baseDir, 'source', '_posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const links = [];
const routeRegex = /\[.*?\]\((.*?)\)/g;

files.forEach(f => {
  const content = fs.readFileSync(path.join(postsDir, f), 'utf-8');
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    let url = match[1].split(' ')[0].split('"')[0]; // Handle cases like `](/img.jpg "title")`
    if (url.startsWith('/')) {
      links.push({ file: f, url });
    }
  }
});

// Remove trailing slashes and hash
const normalizedLinks = links.map(l => {
  let u = l.url;
  if(u.includes('#')) u = u.split('#')[0];
  if(u.endsWith('/') && u.length > 1) u = u.slice(0, -1);
  return { file: l.file, url: u, original: l.url };
});

const invalid = [];

normalizedLinks.forEach(l => {
  // If image or file, check if it exists in source
  if(l.url.includes('.')) {
    const assetPath = path.join(baseDir, 'source', l.url);
    if (!fs.existsSync(assetPath)) invalid.push(l);
  } else {
    // If route, check if source corresponding folder/index.ejs exists
    // Examples: 
    // /tratamentos/estetica -> source/tratamentos/estetica/index.md or source/tratamentos/estetica.md
    // /equipe/davi -> source/equipe/davi/index.ejs etc
    const urlParts = l.url.split('/').filter(Boolean);
    if(urlParts.length === 0) return; // root
    
    // Simplistic check for Eleventy
    const directMd = path.join(baseDir, 'source', ...urlParts) + '.md';
    const directEjs = path.join(baseDir, 'source', ...urlParts) + '.ejs';
    const indexMd = path.join(baseDir, 'source', ...urlParts, 'index.md');
    const indexEjs = path.join(baseDir, 'source', ...urlParts, 'index.ejs');
    const postMd = path.join(postsDir, urlParts[urlParts.length-1] + '.md');
    
    if(!fs.existsSync(directMd) && !fs.existsSync(directEjs) && !fs.existsSync(indexMd) && !fs.existsSync(indexEjs) && !fs.existsSync(postMd)) {
       invalid.push(l);
    }
  }
});

console.log(JSON.stringify(invalid, null, 2));
