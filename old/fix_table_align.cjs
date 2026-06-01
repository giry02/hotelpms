const fs = require('fs');

['dashboard/operations/folio-chart.html', 'dashboard/operations/reports.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    // Replace headers
    c = c.replace('<th>Date</th><th>매출액</th><th>전일대비</th>', '<th>Date</th><th style="text-align:right">매출액</th><th style="text-align:right">전일대비</th>');
    
    // Replace td for amount
    c = c.replace('<td style="font-weight:700">$${t.amount.toLocaleString()}</td>', '<td style="font-weight:700; text-align:right">$${t.amount.toLocaleString()}</td>');
    
    // Replace td for diff
    // The current diff td is: <td>${d}</td>
    c = c.replace(/<td>\$\{d\}<\/td>/, '<td style="text-align:right">${d}</td>');
    
    fs.writeFileSync(f, c);
});

console.log('Table alignment fixed successfully.');
