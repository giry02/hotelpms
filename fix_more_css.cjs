const fs = require('fs');

// Fix night-audit.html
const p1 = 'dashboard/operations/night-audit.html';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace(/<link\s+rel="stylesheet"\s+href="\.\.\/common\/css\/operations\.css">/, '<link rel="stylesheet" href="../common/css/frontdesk.css">\n    <link rel="stylesheet" href="../common/css/operations.css">');
fs.writeFileSync(p1, c1);

// Fix support.html
const p2 = 'dashboard/settings/support.html';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace(/<link\s+href="\.\.\/common\/css\/dashboard\.css"\s+rel="stylesheet"\/>/, '<link href="../common/css/dashboard.css" rel="stylesheet"/>\n<link href="../common/css/frontdesk.css" rel="stylesheet"/>');
fs.writeFileSync(p2, c2);

console.log("Fixed missing CSS in night-audit.html and support.html");
