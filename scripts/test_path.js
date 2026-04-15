const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const src = '/images/6fdf2b86-6bdb-44d1-96db-bce7450e8b67_alimentos-e-a-c%C3%A1rie.jpg';

let imagePath = decodeURIComponent(src);
console.log('Decoded:', imagePath);

const fullPath = path.join(__dirname, 'source', imagePath);
console.log('FullPath:', fullPath);

if (fs.existsSync(fullPath)) {
    console.log('Exists!');
    console.log(sizeOf(fullPath));
} else {
    // Try NFD
    const nfdPath = path.join(__dirname, 'source', imagePath.normalize('NFD'));
    if (fs.existsSync(nfdPath)) {
        console.log('Exists with NFD!');
        console.log(sizeOf(nfdPath));
    } else {
        console.log('DOES NOT EXIST');
    }
}
    console.log('DOES NOT EXIST');
    
    // Try NFD
    const nfdPath = path.join(__dirname, 'source', imagePath.normalize('NFD'));
    if (fs.existsSync(nfdPath)) {
        console.log('Exists with NFD!');
    }
}
