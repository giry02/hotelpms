const fs = require('fs');
let js = fs.readFileSync('dashboard/common/js/dashboard-dynamic.js', 'utf8');

const replacement = `
    const today = '5/25';
    let totalRooms = 120; // assumed
    let occupied = reservations.filter(r => r.status === 'checked-in').length;
    let occ = ((occupied / totalRooms) * 100).toFixed(1) + '%';
    
    let rev = reservations.reduce((sum, r) => sum + (r.amount || 0), 0);
    let adr = occupied > 0 ? '$' + (rev / occupied).toFixed(2) : '$0.00';
    let revpar = '$' + (rev / totalRooms).toFixed(2);
    
    let expectedCheckins = reservations.filter(r => r.cin === today);
    let expectedCheckouts = reservations.filter(r => r.cout === today);
    
    let pendingCheckins = expectedCheckins.filter(r => r.status === 'confirmed').length;
    let pendingCheckouts = expectedCheckouts.filter(r => r.status === 'checked-in').length;
    
    let cio = pendingCheckins + ' / ' + pendingCheckouts;
`;

// Replace from 'let totalRooms =' to 'let cio ='
js = js.replace(/let totalRooms = 120;[\s\S]*?let cio =.*?;/, replacement.trim());

// Also replace the check-in list render logic
const listReplacement = `
    const cinList = document.querySelector('.card:nth-child(2) tbody');
    if (cinList) {
        cinList.innerHTML = expectedCheckins.filter(r => r.status === 'confirmed').slice(0, 5).map(r => \`
            <tr>
                <td><div style="display:flex;align-items:center;gap:8px"><div class="guest-avatar" style="background:\${r.color}">\${r.initials}</div>\${r.guest}</div></td>
                <td>\${r.room}</td>
                <td><span class="status-badge" style="background:var(--primary-lt);color:var(--primary)">Confirmed</span></td>
                <td><button class="btn-outline-sm" onclick="window.location.href='frontdesk/checkin.html'">체크인</button></td>
            </tr>
        \`).join('');
    }
    
    const coutList = document.querySelector('.card:nth-child(3) tbody');
    if (coutList) {
        coutList.innerHTML = expectedCheckouts.filter(r => r.status === 'checked-in').slice(0, 5).map(r => \`
            <tr>
                <td><div style="display:flex;align-items:center;gap:8px"><div class="guest-avatar" style="background:\${r.color}">\${r.initials}</div>\${r.guest}</div></td>
                <td>\${r.room}</td>
                <td><span class="status-badge" style="background:rgba(245,158,11,0.1);color:var(--orange)">Check-out</span></td>
                <td><button class="btn-outline-sm" onclick="window.location.href='frontdesk/checkin.html'">체크아웃</button></td>
            </tr>
        \`).join('');
    }
`;

js = js.replace(/const cinList = document\.querySelector\('\.card:nth-child\(2\) tbody'\);[\s\S]*?\}\s*\}/, listReplacement.trim());

fs.writeFileSync('dashboard/common/js/dashboard-dynamic.js', js);
console.log('Patched dashboard-dynamic.js');
