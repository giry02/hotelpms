const fs = require('fs');
const path = require('path');
function walk(d) {
    const files = fs.readdirSync(d);
    for (const f of files) {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.html')) {
            const text = fs.readFileSync(p, 'utf8');
            const match = text.match(/<div class="topbar-right">([\s\S]*?)<\/header>/);
            if (match && match[1].includes('<button')) {
                console.log(p);
            }
        }
    }
}
walk('.');
