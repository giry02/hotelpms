const fs = require('fs');
const path = 'dashboard/operations/reports.html';
let content = fs.readFileSync(path, 'utf8');

const regex = /<link\s+rel="stylesheet"\s+href="\.\.\/common\/css\/operations\.css">/;
const replacement = `<link rel="stylesheet" href="../common/css/frontdesk.css">\n    <link rel="stylesheet" href="../common/css/operations.css">`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content);
console.log("Fixed missing CSS in reports.html");
