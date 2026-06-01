const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlFiles = [];

function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for(const f of files) {
        const fullPath = path.join(currentDir, f);
        if(fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if(f.endsWith('.html')) {
            htmlFiles.push(fullPath);
        }
    }
}
walk(dir);

for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Remove inline i18n script block from checkin.html
    if (content.includes('const translations = {')) {
        content = content.replace(/<script>\s*let currentLang = 'ko';[\s\S]*?<\/script>/, '');
        changed = true;
    }

    // Determine correct relative path to topbar.js
    const relDepth = path.relative(dir, path.dirname(file)).split(path.sep).length;
    let topbarPath = 'common/js/topbar.js';
    if (path.relative(dir, path.dirname(file)) !== '') {
        topbarPath = '../common/js/topbar.js';
    }

    // Add topbar.js if not present
    if (!content.includes('topbar.js')) {
        content = content.replace(/<script src="([^"]*?ui-components\.js)"><\/script>/, `<script src="$1"></script>\n    <script src="${topbarPath}"></script>`);
        changed = true;
    }

    // If it's dashboard.html, remove the updateDate logic
    if (file.endsWith('dashboard.html')) {
        content = content.replace(/\/\/ ===== LIVE CLOCK =====[\s\S]*?\/\/ ===== MOBILE MENU TOGGLE =====/, '// ===== MOBILE MENU TOGGLE =====');
        changed = true;
    }
    
    // We don't remove the hardcoded .topbar-right or .topbar because topbar.js will REPLACE the whole .topbar innerHTML globally!
    // But we should ensure the script is there.

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
}
