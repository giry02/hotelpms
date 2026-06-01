const fs = require('fs');

// 1. Fix guests.html parsing error
let guestsHtml = fs.readFileSync('./dashboard/crm/guests.html', 'utf8');
// Remove the premature </div>
guestsHtml = guestsHtml.replace(
    /기본 인적 사항<\/div>\s*<label style=\"font-size:\.75rem/g,
    '기본 인적 사항</div>\n                <div style=\"display:flex;flex-direction:column;gap:4px\">\n                    <label style=\"font-size:.75rem'
);
fs.writeFileSync('./dashboard/crm/guests.html', guestsHtml, 'utf8');

// 2. Fix dashboard double kpi-body
const files = [
    './dashboard/dashboard.html',
    './dashboard/operations/folio.html',
    './dashboard/operations/folio-chart.html',
    './dashboard/operations/ancillary.html',
    './dashboard/settings/staff.html'
];
files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/<div class=\"kpi-body\">\s*<div class=\"kpi-body\">/g, '<div class=\"kpi-body\">');
        content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/a>/g, '</div></div></a>');
        // for regular divs:
        content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*(<div class=\"kpi-card|<div class=\"filter-bar)/g, '</div></div></div>\n        $1');
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Fixed guests.html and dashboard HTML files.');
