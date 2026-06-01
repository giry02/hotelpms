const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const htmlFiles = walk('E:/AI_Project/Hotel_PMS/dashboard');

let modifiedCount = 0;
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const regex = /const\s+([a-zA-Z0-9_]+)\s*=\s*translations\[([a-zA-Z0-9_]+)\]\s*\|\|\s*translations\.ko\s*;/g;
    
    content = content.replace(regex, "const $1 = Object.assign({}, window.translations ? window.translations[$2] : {}, translations[$2] || translations.ko);");

    if (content !== original) {
        fs.writeFileSync(file, content);
        modifiedCount++;
        console.log("Modified:", file);
    }
});

console.log(`Modified ${modifiedCount} additional files.`);
