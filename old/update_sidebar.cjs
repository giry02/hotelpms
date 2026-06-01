const fs = require('fs');
let c = fs.readFileSync('dashboard/common/js/sidebar.js', 'utf8');

c = c.replace("{ label: 'Room Service', href: BASE + 'operations/room-service.html' }", "{ label: 'Unified POS', href: BASE + 'operations/unified-pos.html' }");
c = c.replace(/\s*\{\s*icon:\s*'fa-cash-register',\s*label:\s*'Unified POS',\s*href:\s*BASE\s*\+\s*'operations\/unified-pos\.html'\s*\},/, "");

fs.writeFileSync('dashboard/common/js/sidebar.js', c);
console.log('Sidebar updated');
