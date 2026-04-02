const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const files = [];

function getFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            getFiles(fullPath);
        } else if (file.endsWith('.html')) {
            files.push(fullPath);
        }
    });
}

const allPages = new Set();
const allFiles = new Set();

function populateCollections(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const rel = '/' + path.relative(publicDir, fullPath).split(path.sep).join('/');
        
        // Normalize to NFC for comparison
        const normalizedRel = rel.normalize('NFC');
        
        if (stat.isDirectory()) {
            allPages.add(normalizedRel + '/');
            populateCollections(fullPath);
        } else {
            allFiles.add(normalizedRel);
            if (file === 'index.html') {
                allPages.add(normalizedRel.replace('index.html', ''));
            }
        }
    });
}

getFiles(publicDir);
allPages.add('/');
populateCollections(publicDir);

const broken = [];

// Load redirects
const redirects = new Map();
if (fs.existsSync('source/_redirects')) {
    const lines = fs.readFileSync('source/_redirects', 'utf8').split('\n');
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
            redirects.set(parts[0], parts[1]);
        }
    });
}

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.matchAll(/href=["']([^"']+)["']/g);
    
    for (const match of matches) {
        const originalLink = match[1];
        if (originalLink.startsWith('http') || originalLink.startsWith('//') || originalLink.startsWith('tel:') || originalLink.startsWith('mailto:') || originalLink.startsWith('whatsapp:') || originalLink.startsWith('#') || originalLink.startsWith('javascript:')) {
            continue;
        }
        
        let link = originalLink.split('#')[0].split('?')[0];
        if (link === '') continue;

        let resolvedLink;
        if (link.startsWith('/')) {
            resolvedLink = link;
        } else {
            const dir = '/' + path.relative(publicDir, path.dirname(file)).split(path.sep).join('/');
            resolvedLink = path.posix.resolve(dir, link);
        }
        
        let decodedLink;
        try {
            decodedLink = decodeURIComponent(resolvedLink).normalize('NFC');
        } catch(e) {
            decodedLink = resolvedLink.normalize('NFC');
        }

        if (!decodedLink.endsWith('/') && !path.extname(decodedLink)) {
            decodedLink += '/';
        }

        if (!allPages.has(decodedLink) && !allFiles.has(decodedLink) && !allFiles.has(decodedLink.replace(/\/$/, '')) && !redirects.has(decodedLink)) {
             broken.push({ source: '/' + path.relative(publicDir, file).split(path.sep).join('/'), target: originalLink, resolved: decodedLink });
        }
    }
});

const grouped = {};
broken.forEach(b => {
    if (!grouped[b.resolved]) grouped[b.resolved] = [];
    grouped[b.resolved].push(b.source);
});

console.log(JSON.stringify(grouped, null, 2));
