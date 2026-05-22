const fs = require('fs');

['dashboard/operations/folio-chart.html', 'dashboard/operations/reports.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    // Replace hardcoded labels
    c = c.replace('<div class="kpi-label">Room 매출</div>', '<div class="kpi-label">객실 매출</div>');
    c = c.replace('<div class="kpi-label">Ancillary Rev</div>', '<div class="kpi-label">부가서비스 매출</div>');
    
    fs.writeFileSync(f, c);
});

console.log('KPI Labels Translated Successfully.');
