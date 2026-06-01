const fs = require('fs');

const path = 'dashboard/common/js/sidebar.js';
let content = fs.readFileSync(path, 'utf8');

// Replace mainHref for Ancillary Svcs
content = content.replace(/mainHref:\s*BASE\s*\+\s*'operations\/room-service\.html'/, "mainHref: BASE + 'operations/unified-pos.html'");

fs.writeFileSync(path, content);
console.log('Sidebar mainHref updated to unified-pos.html');
