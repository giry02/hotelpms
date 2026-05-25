const fs = require('fs');
const path = require('path');

const htmlFiles = [];
function findHtml(dir) {
    fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            findHtml(full);
        } else if (full.endsWith('.html')) {
            htmlFiles.push(full);
        }
    });
}

findHtml('./dashboard');

console.log('--- HTML Links Check ---');
htmlFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('href="#"') || line.match(/href=""/)) {
            console.log(f + ':' + (i+1) + ' - Empty/Hash href');
        }
        if (line.includes('<button') && !line.includes('onclick') && !line.includes('type="submit"') && !line.includes('type="reset"') && !line.includes('id=')) {
            // Check if it has a class that might be bound via JS (often .btn-outline, .btn-primary, etc.)
            // We'll just flag it for review
            console.log(f + ':' + (i+1) + ' - Button with no onclick/id/type');
        }
    });
});
