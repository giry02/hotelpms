const fs = require('fs');
const file = 'E:/AI_Project/Hotel_PMS/dashboard/frontdesk/reservation-timeline.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add B2B card
const searchStr = '<div class="kpi-card purple">';
const endIdx = content.indexOf('</div>', content.indexOf('</div>', content.indexOf(searchStr)) + 6) + 6; // finds the closing div of kpi-card purple

const part1 = content.substring(0, endIdx);
const part2 = content.substring(endIdx);

const b2bCard = `
            <div class="kpi-card" style="background:#f8fafc; border:1px solid #111827">
                <div class="kpi-icon" style="background:#111827; color:#fff"><i class="fa-solid fa-building"></i></div>
                <div class="kpi-body"><div class="kpi-value" id="kpiB2B" style="color:#111827">0</div><div class="kpi-label" style="color:#374151">B2B / 단체</div></div>
            </div>`;

if (!part1.includes('kpiB2B') && !part2.includes('kpiB2B')) {
    content = part1 + b2bCard + part2;
}

// 2. Add cntB2B to script
content = content.replace(/let cntConfirmed\s*=\s*0,\s*cntCheckedin\s*=\s*0,\s*cntCheckout\s*=\s*0,\s*cntVip\s*=\s*0;/, 'let cntConfirmed=0, cntCheckedin=0, cntCheckout=0, cntVip=0, cntB2B=0;');

// 3. Add to loop
if (!content.includes('cntB2B++')) {
    content = content.replace(/if\(isVip\) cntVip\+\+;/, 'if(isVip) cntVip++;\n        if(isB2B) cntB2B++;');
}

// 4. Update UI
if (!content.includes('kpiB2B\').textContent')) {
    content = content.replace(/document\.getElementById\('kpiVip'\)\.textContent = cntVip;/, "document.getElementById('kpiVip').textContent = cntVip;\n    if (document.getElementById('kpiB2B')) document.getElementById('kpiB2B').textContent = cntB2B;");
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed timeline HTML');
