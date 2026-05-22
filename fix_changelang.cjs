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

    // We want to replace `const d=translations[l]||translations.ko;`
    // or `const d = translations[l] || translations.ko;`
    // with `const d = Object.assign({}, window.translations[l], translations[l]) || window.translations.ko;`
    
    // Using regex to handle spaces
    const regex = /const\s+d\s*=\s*translations\[l\]\s*\|\|\s*translations\.ko\s*;/g;
    content = content.replace(regex, "const d = Object.assign({}, window.translations ? window.translations[l] : {}, translations[l] || translations.ko);");

    if (content !== original) {
        fs.writeFileSync(file, content);
        modifiedCount++;
    }
});

console.log(`Modified ${modifiedCount} files.`);
