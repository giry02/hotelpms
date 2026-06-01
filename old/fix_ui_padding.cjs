const fs = require('fs');

['dashboard/operations/folio-chart.html', 'dashboard/operations/reports.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    // 1. Remove search button wrapper
    c = c.replace(/<div class="filter-right">[\s\S]*?<\/div>/, '');
    
    // 2. Remove padding:0 from card-body
    c = c.replace('<div class="card-body" style="padding:0"><table class="trend-table">', '<div class="card-body"><table class="trend-table">');
    
    // 3. Remove header for '비교'
    c = c.replace('<th>Date</th><th>매출액</th><th>전일대비</th><th class="trend-bar-cell">비교</th>', '<th>Date</th><th>매출액</th><th>전일대비</th>');
    
    // 4. Remove table cell for '비교' in JS string
    c = c.replace(/<td>\$\{d\}<\/td><td class="trend-bar-cell">.*?<\/td>/, '<td>${d}</td>');
    
    fs.writeFileSync(f, c);
});

console.log('UI Tweaks Applied Successfully.');
