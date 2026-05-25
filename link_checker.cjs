const fs = require('fs');
const path = require('path');

function checkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
            checkDir(fp);
        } else if (f.endsWith('.html')) {
            const content = fs.readFileSync(fp, 'utf8');
            const regex = /href=["'](?!http|mailto|tel|javascript|#)([^"']+)["']/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const link = match[1].split('?')[0].split('#')[0];
                if (link.endsWith('.css') || link.endsWith('.js') || link.endsWith('.png') || link.endsWith('.jpg') || link.endsWith('.ico') || link === '') continue;
                
                const targetPath = path.resolve(dir, link);
                if (!fs.existsSync(targetPath)) {
                    console.log('BROKEN LINK in ' + fp + ' -> ' + link + ' (Resolved: ' + targetPath + ')');
                }
            }
        }
    }
}

checkDir('dashboard');
console.log('Link check done.');
