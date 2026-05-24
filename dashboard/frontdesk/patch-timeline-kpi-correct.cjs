const fs = require('fs');
const file = 'E:/AI_Project/Hotel_PMS/dashboard/frontdesk/reservation-timeline.html';
let content = fs.readFileSync(file, 'utf8');

const target = `            <div class="kpi-card purple">
                <div class="kpi-icon"><i class="fa-solid fa-crown"></i></div>
                <div class="kpi-body"><div class="kpi-value" id="kpiVip">0</div><div class="kpi-label" data-i18n-key="VIP">VIP</div></div>
            </div>`;
const replacement = `            <div class="kpi-card purple">
                <div class="kpi-icon"><i class="fa-solid fa-crown"></i></div>
                <div class="kpi-body"><div class="kpi-value" id="kpiVip">0</div><div class="kpi-label" data-i18n-key="VIP">VIP</div></div>
            </div>
            <div class="kpi-card" style="background:#f8fafc; border:1px solid #111827">
                <div class="kpi-icon" style="background:#111827; color:#fff"><i class="fa-solid fa-building"></i></div>
                <div class="kpi-body"><div class="kpi-value" id="kpiB2B" style="color:#111827">0</div><div class="kpi-label" style="color:#374151">B2B / 단체</div></div>
            </div>`;

content = content.replace(target, replacement);

const targetInit = `let cntConfirmed=0, cntCheckedin=0, cntCheckout=0, cntVip=0;`;
const replacementInit = `let cntConfirmed=0, cntCheckedin=0, cntCheckout=0, cntVip=0, cntB2B=0;`;
content = content.replace(targetInit, replacementInit);

const targetLoop = `if(isVip) cntVip++;`;
const replacementLoop = `if(isVip) cntVip++;\n        if(isB2B) cntB2B++;`;
if (!content.includes('cntB2B++')) {
    content = content.replace(targetLoop, replacementLoop);
}

const targetUpdate = `document.getElementById('kpiVip').textContent = cntVip;`;
const replacementUpdate = `document.getElementById('kpiVip').textContent = cntVip;\n    if (document.getElementById('kpiB2B')) document.getElementById('kpiB2B').textContent = cntB2B;`;
if (!content.includes('kpiB2B')) {
    content = content.replace(targetUpdate, replacementUpdate);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched timeline HTML correctly!');
