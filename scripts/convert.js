const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'source', 'images');

async function getAllFiles(dir, exts = []) {
    let results = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(await getAllFiles(fullPath, exts));
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (exts.includes(ext)) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

async function convertImages() {
    const images = await getAllFiles(imagesDir, ['.jpg', '.jpeg', '.png']);
    console.log(`Encontradas ${images.length} imagens para converter.`);
    
    let success = 0;
    
    for (const file of images) {
        const ext = path.extname(file);
        const webpPath = file.substring(0, file.lastIndexOf(ext)) + '.webp';
        
        try {
            await sharp(file)
                .webp({ quality: 80, effort: 4 })
                .toFile(webpPath);
            success++;
        } catch (e) {
            console.log(`Erro ao converter ${file}:`, e.message);
        }
    }
    
    console.log(`Convertidas ${success} de ${images.length} imagens para WebP.`);
}

async function replaceInFiles(dir, exts = []) {
    const files = await getAllFiles(dir, exts);
    console.log(`Modificando paths em ${files.length} arquivos a partir de ${dir}`);
    
    let modifiedCount = 0;
    // Regex matches /images/(any path without quotes/spaces).(jpg|png|jpeg)
    const urlRegex = /(\/images\/[^"'\s]+)\.(jpg|jpeg|png)/ig;
    
    for (const file of files) {
        const content = await fs.promises.readFile(file, 'utf8');
        if (urlRegex.test(content)) {
            const newContent = content.replace(urlRegex, '$1.webp');
            await fs.promises.writeFile(file, newContent, 'utf8');
            modifiedCount++;
        }
    }
    console.log(`${modifiedCount} arquivos tiveram links .jpg/png substituídos por .webp em ${dir}`);
}

async function run() {
    await convertImages();
    // Substituir nos posts
    await replaceInFiles(path.join(__dirname, 'source', '_posts'), ['.md']);
    // Substituir em data
    await replaceInFiles(path.join(__dirname, 'source', '_data'), ['.json']);
    // Substituir layouts e templates EJS na source
    await replaceInFiles(path.join(__dirname, 'source'), ['.ejs', '.html']);
    // Substituir no tema
    await replaceInFiles(path.join(__dirname, 'themes', 'mdfrossard'), ['.ejs', '.html', '.yml']);
    console.log('Finalizado!');
}

run();
