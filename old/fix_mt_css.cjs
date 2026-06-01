const fs = require('fs');
const path = 'dashboard/operations/maintenance.html';
let content = fs.readFileSync(path, 'utf8');

const regex = /<link\s+rel="stylesheet"\s+href="\.\.\/common\/css\/dashboard\.css">/;
const replacement = `<link rel="stylesheet" href="../common/css/dashboard.css">
    <link rel="stylesheet" href="../common/css/frontdesk.css">
    <link rel="stylesheet" href="../common/css/operations.css">`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content);
console.log("Fixed missing CSS in maintenance.html");
