const fs = require('fs');

// 1. Update API data
const apiPath = 'dashboard/common/js/api/api-operations.js';
let apiContent = fs.readFileSync(apiPath, 'utf8');
const newTrendApi = `getTrendData: async () => { 
        return [
            {date:'2026-05-22', room:{v:18500, d:5.2}, pos:{v:3200, d:1.5}, golf:{v:1900, d:-2.1}, car:{v:1400, d:4.0}},
            {date:'2026-05-21', room:{v:17600, d:-1.2}, pos:{v:3150, d:-0.5}, golf:{v:1940, d:3.1}, car:{v:1340, d:1.2}},
            {date:'2026-05-20', room:{v:17800, d:2.5}, pos:{v:3160, d:1.2}, golf:{v:1880, d:-1.5}, car:{v:1320, d:0.5}},
            {date:'2026-05-19', room:{v:17350, d:4.1}, pos:{v:3120, d:2.8}, golf:{v:1910, d:5.5}, car:{v:1310, d:2.2}},
            {date:'2026-05-18', room:{v:16650, d:-3.5}, pos:{v:3030, d:-4.1}, golf:{v:1810, d:-6.2}, car:{v:1280, d:-1.5}},
            {date:'2026-05-17', room:{v:17250, d:8.2}, pos:{v:3160, d:6.5}, golf:{v:1930, d:12.4}, car:{v:1300, d:5.1}},
            {date:'2026-05-16', room:{v:15950, d:0}, pos:{v:2970, d:0}, golf:{v:1720, d:0}, car:{v:1240, d:0}}
        ]; 
    },`;
apiContent = apiContent.replace(/getTrendData:\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,/, newTrendApi);
fs.writeFileSync(apiPath, apiContent);

// 2. Update HTML & Render logic
['dashboard/operations/folio-chart.html', 'dashboard/operations/reports.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    // Replace Table Header
    c = c.replace(/<th>Date<\/th><th style="text-align:right">매출액<\/th><th style="text-align:right">전일대비<\/th>/, '<th>Date</th><th style="text-align:right">객실</th><th style="text-align:right">통합 POS</th><th style="text-align:right">골프장</th><th style="text-align:right">렌트카</th>');
    
    // Replace renderTrend function
    const oldRenderTrendRegex = /let trendData = \[\];\s*function renderTrend\(\)\{[\s\S]*?\}\s*let currentLang/m;
    const newRenderTrend = `let trendData = [];
function renderTrend(){
    document.getElementById('trendBody').innerHTML = trendData.map(t => {
        const formatCell = (obj) => {
            if(!obj) return '-';
            const diffClass = obj.d > 0 ? 'trend-up' : (obj.d < 0 ? 'trend-down' : '');
            const diffIcon = obj.d > 0 ? '<i class="fa-solid fa-arrow-up"></i>' : (obj.d < 0 ? '<i class="fa-solid fa-arrow-down"></i>' : '');
            const diffStr = obj.d !== 0 ? \`<span class="\${diffClass}" style="margin-left:6px; font-size:0.72rem; white-space:nowrap;">\${diffIcon} \${obj.d > 0 ? '+' : ''}\${obj.d}%</span>\` : \`<span style="margin-left:6px; font-size:0.72rem; color:var(--txt3); white-space:nowrap;">-</span>\`;
            return \`<span style="font-weight:700">$\${obj.v.toLocaleString()}</span> \${diffStr}\`;
        };
        return \`<tr>
            <td style="font-weight:600">\${t.date}</td>
            <td style="text-align:right">\${formatCell(t.room)}</td>
            <td style="text-align:right">\${formatCell(t.pos)}</td>
            <td style="text-align:right">\${formatCell(t.golf)}</td>
            <td style="text-align:right">\${formatCell(t.car)}</td>
        </tr>\`;
    }).join('');
}
let currentLang`;
    c = c.replace(oldRenderTrendRegex, newRenderTrend);
    
    fs.writeFileSync(f, c);
});

console.log('Trend table rewritten for 4 departments.');
