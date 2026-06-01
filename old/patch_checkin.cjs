const fs = require('fs');

let apiCore = fs.readFileSync('dashboard/common/js/api/api-core.js', 'utf8');
apiCore = apiCore.replace(/const API_VERSION = 'v1.\d+';/, "const API_VERSION = 'v1.6';");
fs.writeFileSync('dashboard/common/js/api/api-core.js', apiCore);

let checkin = fs.readFileSync('dashboard/frontdesk/checkin.html', 'utf8');

// The KPI and dynamic rendering logic
const newJS = `
let reservations = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        reservations = await PmsAPI.getReservations();
        renderCheckinData();
    } catch(e) {
        console.error(e);
    }
});

function renderCheckinData() {
    const today = '5/25'; // Mock today date

    const expectedCheckins = reservations.filter(r => r.cin === today);
    const expectedCheckouts = reservations.filter(r => r.cout === today);

    const completedCheckins = expectedCheckins.filter(r => r.status === 'checked-in').length;
    const pendingCheckins = expectedCheckins.filter(r => r.status === 'confirmed').length;

    const completedCheckouts = expectedCheckouts.filter(r => r.status === 'checked-out').length;
    const pendingCheckouts = expectedCheckouts.filter(r => r.status === 'checked-in').length;

    const vipArrivals = expectedCheckins.filter(r => r.isVip).length;

    // Update KPIs
    document.getElementById('kpiExpectedCin').textContent = expectedCheckins.length;
    document.getElementById('kpiCompletedCin').textContent = completedCheckins;
    document.getElementById('kpiExpectedCout').textContent = expectedCheckouts.length;
    document.getElementById('kpiVipArrivals').textContent = vipArrivals;

    document.getElementById('kpiExpectedCinSub').textContent = \`Confirmed \${pendingCheckins} · Pending 0\`;
    document.getElementById('kpiExpectedCoutSub').textContent = \`Completed \${completedCheckouts} · 잔여 \${pendingCheckouts}\`;

    document.getElementById('tabCheckinCount').textContent = pendingCheckins;
    document.getElementById('tabCheckoutCount').textContent = pendingCheckouts;

    // Render Panels
    const cinPanel = document.getElementById('checkinPanel');
    const coutPanel = document.getElementById('checkoutPanel');

    const formatCard = (r, isCout) => {
        const isDone = isCout ? r.status === 'checked-out' : r.status === 'checked-in';
        const actionBtn = isDone 
            ? \`<div class="ci-done-icon co"><i class="fa-solid fa-check"></i></div>\`
            : \`<button class="btn-primary-sm" onclick="processCheck\${isCout?'out':'in'}(this, '\${r.id}')"><i class="fa-solid fa-right-\${isCout?'from':'to'}-bracket"></i> \${isCout?'체크아웃':'체크인'}</button>\`;

        const vipTag = r.isVip ? \`<span class="guest-tier" style="color:var(--orange);border-color:#FDE68A;background:#FFFBEB"><i class="fa-solid fa-crown"></i> \${r.vip}</span>\` : '';

        return \`
            <div class="ci-card \${isDone ? 'done' : ''}" id="\${r.id}">
                <div class="ci-left">
                    <div class="ci-avatar" style="background:\${r.color}">\${r.initials}</div>
                    <div class="ci-info">
                        <div class="ci-name">\${r.guest} \${vipTag}</div>
                        <div class="ci-meta">\${r.room} · \${r.type} · \${r.nights}박 (\${r.cin} - \${r.cout}) · \${r.channel}</div>
                        \${!isDone && r.isVip ? \`<div class="ci-warning"><i class="fa-solid fa-bell-concierge"></i> 환영 준비 필요</div>\` : ''}
                        \${isDone ? \`<div class="ci-warning" style="color:var(--success); background:rgba(16,185,129,.1)">\${isCout?'체크아웃 완료':'체크인 완료'}</div>\` : ''}
                    </div>
                </div>
                <div class="ci-right">
                    <div class="ci-folio">
                        \${isCout ? 
                            (r.amount > 0 ? \`<b>$\${r.amount}</b><br><span style="color:var(--danger)">미정산</span>\` : \`<b>$0.00</b><br><span style="color:var(--txt3)">(정산 완료)</span>\`) :
                            \`<b>$\${r.amount.toLocaleString()}</b>\`
                        }
                    </div>
                    \${actionBtn}
                    <button class="btn-outline-sm" onclick="window.location.href='reservation-list.html?id=\${r.id}'"><i class="fa-solid fa-pen"></i></button>
                </div>
            </div>
        \`;
    };

    cinPanel.innerHTML = expectedCheckins.map(r => formatCard(r, false)).join('');
    coutPanel.innerHTML = expectedCheckouts.map(r => formatCard(r, true)).join('');
}

async function processCheckin(btn, id) {
    const r = reservations.find(x => x.id === id);
    if (!r) return;
    const confirmMsg = currentLang === 'en' ? \`Process check-in for \${r.guest}?\` : \`\${r.guest} 님을 체크인 처리하시겠습니까?\`;
    if (await showConfirm(confirmMsg)) {
        r.status = 'checked-in';
        await PmsAPI.syncGroupsToReservations(reservations);
        if(window.PmsAPI.saveReservations) {
            await window.PmsAPI.saveReservations(reservations);
        } else {
            localStorage.setItem('pms_reservations', JSON.stringify(reservations));
        }
        renderCheckinData();
        showToast(currentLang === 'en' ? 'Check-in Completed' : '체크인 완료');
    }
}

async function processCheckout(btn, id) {
    const r = reservations.find(x => x.id === id);
    if (!r) return;
    if (r.amount > 0) {
        const errorMsg = currentLang === 'en' ? 'Outstanding balance remains. Please settle the folio first.' : '정산 잔액이 남아 있습니다. 먼저 정산을 완료해 주세요.';
        showToast(errorMsg, 'error');
        return;
    }
    const confirmMsg = currentLang === 'en' ? \`Process check-out for \${r.guest}?\` : \`\${r.guest} 님을 체크아웃 처리하시겠습니까?\`;
    if (await showConfirm(confirmMsg)) {
        r.status = 'checked-out';
        await PmsAPI.syncGroupsToReservations(reservations);
        if(window.PmsAPI.saveReservations) {
            await window.PmsAPI.saveReservations(reservations);
        } else {
            localStorage.setItem('pms_reservations', JSON.stringify(reservations));
        }
        renderCheckinData();
        showToast(currentLang === 'en' ? 'Check-out Completed' : '체크아웃 완료');
    }
}

function exportData() {
    if(!reservations.length) { showToast('No data'); return; }
    const rows = reservations.map(r => [r.id, r.guest, r.room, r.cin, r.cout, r.status].join(',')).join('\\n');
    const blob = new Blob(['ID,Guest,Room,CheckIn,CheckOut,Status\\n' + rows], {type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'checkin_out.csv';
    link.click();
}
`;

// Insert the script into checkin.html
let parts = checkin.split('<script>');

// We need to inject our script. Let's find a good spot.
// Wait, checkin.html has a big <script> block at the end. We'll replace the existing processCheckin, processCheckout, updateFilterCounts with our dynamic ones.

let modifiedHtml = checkin.replace(/<div class="kpi-value">24<\/div>/, '<div class="kpi-value" id="kpiExpectedCin">0</div>')
                          .replace(/<div class="kpi-value">6<\/div>/, '<div class="kpi-value" id="kpiCompletedCin">0</div>')
                          .replace(/<div class="kpi-value">18<\/div>/, '<div class="kpi-value" id="kpiExpectedCout">0</div>')
                          .replace(/<div class="kpi-value">3<\/div>/, '<div class="kpi-value" id="kpiVipArrivals">0</div>')
                          .replace(/Confirmed 21 · Pending 3/, '<span id="kpiExpectedCinSub">Confirmed 0 · Pending 0</span>')
                          .replace(/Completed 12 · 잔여 6/, '<span id="kpiExpectedCoutSub">Completed 0 · 잔여 0</span>')
                          .replace(/체크인 대기 \(6\)/, '체크인 대기 (<span id="tabCheckinCount">0</span>)')
                          .replace(/체크아웃 대기 \(3\)/, '체크아웃 대기 (<span id="tabCheckoutCount">0</span>)')
                          .replace(/<button class="btn-outline"><i class="fa-solid fa-download"><\/i> Export<\/button>/, '<button class="btn-outline" onclick="exportData()"><i class="fa-solid fa-download"></i> Export</button>');

// Replace the hardcoded panels
modifiedHtml = modifiedHtml.replace(/<div class="ci-panel active" id="checkinPanel">[\s\S]*?<\/div>\s*<!-- CHECK-OUT PANEL -->/, '<div class="ci-panel active" id="checkinPanel"></div>\n\n        <!-- CHECK-OUT PANEL -->');
modifiedHtml = modifiedHtml.replace(/<!-- CHECK-OUT PANEL -->\s*<div class="ci-panel" id="checkoutPanel">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '<!-- CHECK-OUT PANEL -->\n        <div class="ci-panel" id="checkoutPanel"></div>\n\n    </div>\n</div>\n</div>');

// Add script imports if missing
if (!modifiedHtml.includes('api-core.js')) {
    modifiedHtml = modifiedHtml.replace('<script src="../common/js/i18n.js"></script>', '<script src="../common/js/api/api-core.js"></script>\n    <script src="../common/js/api/api-frontdesk.js"></script>\n    <script src="../common/js/i18n.js"></script>');
}

// Strip out old checkin functions
modifiedHtml = modifiedHtml.replace(/async function processCheckin[\s\S]*?\}\s*\}/, '')
                           .replace(/async function processCheckout[\s\S]*?\}\s*\}/, '')
                           .replace(/function updateFilterCounts[\s\S]*?\}\s*\}/, '');

// Insert newJS right before setupI18n
modifiedHtml = modifiedHtml.replace('function setupI18n', newJS + '\\nfunction setupI18n');

fs.writeFileSync('dashboard/frontdesk/checkin.html', modifiedHtml);
console.log('Patched checkin.html');
