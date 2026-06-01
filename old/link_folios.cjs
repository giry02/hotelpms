const fs = require('fs');

// 1. Fix folio.html (translation bug + URL param parsing + mock data expansion)
let folioHtml = fs.readFileSync('dashboard/operations/folio.html', 'utf8');
folioHtml = folioHtml.replace("'정산 Completed'", "'정산 완료'");

// Inject URL param parsing after renderFolios() call at the bottom
const urlParseLogic = `
renderFolios();
const urlParams = new URLSearchParams(window.location.search);
const pDept = urlParams.get('dept');
if (pDept) {
    const btn = document.querySelector(\`.filter-chips .chip[onclick*="'\${pDept}'"]\`);
    if(btn) {
        currentDept = pDept;
        document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        renderFolios();
    }
}
`;
folioHtml = folioHtml.replace('renderFolios();\r\n\r\n// i18n', urlParseLogic + '\r\n// i18n');
folioHtml = folioHtml.replace('renderFolios();\n\n// i18n', urlParseLogic + '\n// i18n');

// Expand mock data in folio.html so filters have more items
const mockDataRegex = /'year':\s*\[([\s\S]*?)\]/;
const match = folioHtml.match(mockDataRegex);
if(match) {
    const yearItems = match[1];
    // Duplicate the block twice to artificially inflate the items
    const expanded = yearItems + ',\n' + yearItems.replace(/FOL-1/g, 'FOL-2').replace(/dept:'room'/g, "dept:'golf'").replace(/dept:'pos'/g, "dept:'car'") + ',\n' + yearItems.replace(/FOL-1/g, 'FOL-3').replace(/dept:'car'/g, "dept:'room'").replace(/dept:'golf'/g, "dept:'pos'");
    folioHtml = folioHtml.replace(match[0], `'year': [\n${expanded}\n]`);
}
fs.writeFileSync('dashboard/operations/folio.html', folioHtml);


// 2. Add links to night-audit.html
let nightHtml = fs.readFileSync('dashboard/operations/night-audit.html', 'utf8');
const roomLink = ` <a href="folio.html?dept=room" target="_blank" style="font-size:0.75rem; color:var(--primary); font-weight:600; text-decoration:none; margin-left:8px; padding:4px 8px; border:1px solid var(--primary-lt); border-radius:4px; background:rgba(37,99,235,0.05)"><i class="fa-solid fa-square-arrow-up-right"></i> 상세보기</a>`;
const fnbLink = ` <a href="folio.html?dept=pos" target="_blank" style="font-size:0.75rem; color:var(--primary); font-weight:600; text-decoration:none; margin-left:8px; padding:4px 8px; border:1px solid var(--primary-lt); border-radius:4px; background:rgba(37,99,235,0.05)"><i class="fa-solid fa-square-arrow-up-right"></i> 상세보기</a>`;
const ancLink = ` <a href="folio.html?dept=golf" target="_blank" style="font-size:0.75rem; color:var(--primary); font-weight:600; text-decoration:none; margin-left:8px; padding:4px 8px; border:1px solid var(--primary-lt); border-radius:4px; background:rgba(37,99,235,0.05)"><i class="fa-solid fa-square-arrow-up-right"></i> 상세보기</a>`;

nightHtml = nightHtml.replace('<td class="rev-amount" id="revRoomAmt">$0</td>', `<td class="rev-amount" style="display:flex; justify-content:flex-end; align-items:center"><span id="revRoomAmt">$0</span>${roomLink}</td>`);
nightHtml = nightHtml.replace('<td class="rev-amount" id="revFnbAmt">$0</td>', `<td class="rev-amount" style="display:flex; justify-content:flex-end; align-items:center"><span id="revFnbAmt">$0</span>${fnbLink}</td>`);
nightHtml = nightHtml.replace('<td class="rev-amount" id="revAncAmt">$0</td>', `<td class="rev-amount" style="display:flex; justify-content:flex-end; align-items:center"><span id="revAncAmt">$0</span>${ancLink}</td>`);
fs.writeFileSync('dashboard/operations/night-audit.html', nightHtml);


// 3. Add links to folio-chart.html & reports.html
['dashboard/operations/folio-chart.html', 'dashboard/operations/reports.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    // Find renderDepts function
    const oldRow = `return \`<div class="dept-row">`;
    const newRow = `const getDeptKey = (name) => {
            if(name.includes('객실')) return 'room';
            if(name.includes('POS')) return 'pos';
            if(name.includes('골프')) return 'golf';
            if(name.includes('렌트카')) return 'car';
            return 'all';
        };
        const dk = getDeptKey(d.name);
        return \`<div class="dept-row" style="cursor:pointer; transition:background 0.2s; padding:10px; border-radius:8px" onmouseover="this.style.background='var(--border2)'" onmouseout="this.style.background='transparent'" onclick="window.open('folio.html?dept=\${dk}', '_blank')">`;
        
    if(c.includes(oldRow)) {
        c = c.replace(oldRow, newRow);
        // Add chevron to the end of the row
        c = c.replace(`<div class="dept-val">$\${d.amt.toLocaleString()}</div>`, `<div class="dept-val">$\${d.amt.toLocaleString()}</div><i class="fa-solid fa-chevron-right" style="color:var(--txt3); margin-left:16px;"></i>`);
        fs.writeFileSync(f, c);
    }
});

console.log('Cross-linking and fixes applied.');
