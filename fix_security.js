const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walk(path.join(dir, file), fileList);
      }
    } else {
      if (file.endsWith('.md') || file.endsWith('.html') || file.endsWith('.ejs')) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

const sourceDir = path.join(__dirname, 'source');
const themeDir = path.join(__dirname, 'themes/mdfrossard/layout');

const allFiles = [...walk(sourceDir), ...walk(themeDir)];

let updatedHttp = 0;
let updatedBlank = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix http:// to https:// in markdown links and hrefs.
  // We'll target strings starting with http:// and ending with common characters.
  content = content.replace(/http:\/\/(www\.)?([^"'\s)>]+)/gi, (match, www, domain) => {
      // Exclude strings that shouldn't be converted (like schemas).
      if (domain.startsWith('www.w3.org')) return match;
      if (domain.includes('localhost')) return match;
      return `https://${www ? www : ''}${domain}`;
  });

  // Fix target="_blank" missing rel="noopener noreferrer"
  // Look for target="_blank" inside tags. Check if rel="noopener" or rel="noreferrer" exists nearby inside the same tag.
  const targetBlankPattern = /<a\s+([^>]*?)target=(["'])_blank\2([^>]*?)>/gi;
  content = content.replace(targetBlankPattern, (match, p1, quote, p3) => {
    const isRelPresent = /rel=(['"])[^'"]*(noopener|noreferrer)[^'"]*\1/i.test(match);
    if (!isRelPresent) {
      return `<a ${p1}target="_blank" rel="noopener noreferrer"${p3}>`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    if (originalContent.includes('http://') && !content.includes('http://')) updatedHttp++;
    updatedBlank++;
    console.log('Fixed:', path.relative(__dirname, file));
  }
}
console.log(`Done. Fixed ${updatedBlank} files for security.`);
