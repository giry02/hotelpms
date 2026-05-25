document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Reservations to calculate KPIs and populate Check-in/Out
    let reservations = [];
    if (window.PmsAPI && window.PmsAPI.getReservations) {
        reservations = await window.PmsAPI.getReservations();
    }
    
    // Calculate KPIs
    let totalRooms = 120; // assumed
    let occupied = reservations.filter(r => r.status === 'checkedin').length;
    let occ = ((occupied / totalRooms) * 100).toFixed(1) + '%';
    
    let rev = reservations.reduce((sum, r) => sum + (r.amount || 0), 0);
    let adr = occupied > 0 ? '$' + (rev / occupied).toFixed(2) : '.00';
    let revpar = '$' + (rev / totalRooms).toFixed(2);
    
    let checkin = reservations.filter(r => r.status === 'confirmed').length;
    let checkout = reservations.filter(r => r.status === 'checkout').length;
    let cio = checkin + ' / ' + checkout;

    // Apply KPIs to DOM based on class matches or structural DOM navigation since we didn't add IDs
    const kpiVals = document.querySelectorAll('.kpi-value');
    if(kpiVals.length >= 4) {
        kpiVals[0].textContent = occ;
        kpiVals[1].textContent = adr;
        kpiVals[2].textContent = revpar;
        kpiVals[3].textContent = cio;
    }

    // Populate Housekeeping
    let tasks = [];
    if (window.PmsAPI && window.PmsAPI.getTasks) {
        tasks = await window.PmsAPI.getTasks();
    }
    
    const hkCounts = document.querySelectorAll('.hk-count');
    if(hkCounts.length >= 5) {
        hkCounts[0].textContent = tasks.filter(t => t.status === 'clean').length;
        hkCounts[1].textContent = tasks.filter(t => t.status === 'dirty').length;
        hkCounts[2].textContent = tasks.filter(t => t.status === 'cleaning').length;
        hkCounts[3].textContent = tasks.filter(t => t.status === 'inspect').length;
        hkCounts[4].textContent = tasks.filter(t => t.status === 'oos').length;
    }

    // Populate Today Check-in
    const checkinLink = document.querySelector('a.card-title-link[href="frontdesk/checkin.html"]');
    const checkinBody = checkinLink ? checkinLink.closest('.card').querySelector('tbody') : null;
    if (checkinBody) {
        const checkinRes = reservations.filter(r => r.status === 'confirmed').slice(0, 5);
        if (checkinRes.length > 0) {
            checkinBody.innerHTML = checkinRes.map(r => {
                const isVip = r.vip && (r.vip.includes('VIP') || r.vip.includes('Gold'));
                const vipBadge = isVip ? `<span style="font-size:.62rem;color:#9CA3AF">${r.vip}</span>` : '';
                return `<tr><td><div class="guest-cell"><div class="guest-avatar" style="background:${r.color}">${r.initials}</div><div>${r.guest} ${vipBadge}</div></div></td><td>${r.room}</td><td>${r.type}</td><td>${r.cin} - ${r.cout} (${r.nights}N)</td><td><span class="status-badge confirmed">Confirmed</span></td></tr>`;
            }).join('');
        }
    }

    // Populate Live Activity
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const acts = [
            {icon:'ci', iconClass:'fa-right-to-bracket', text:`<b>${reservations[0]?.room || '101'}호</b> ${reservations[0]?.guest || 'Guest'} Check-in Completed`, time:'방금 전'},
            {icon:'hk', iconClass:'fa-broom', text:`<b>${tasks[0]?.room || '202'}호</b> 청소 Completed → Inspected`, time:'5분 전'},
            {icon:'co', iconClass:'fa-right-from-bracket', text:`<b>${reservations[1]?.room || '303'}호</b> ${reservations[1]?.guest || 'Guest'} Check-out`, time:'12분 전'}
        ];
        activityList.innerHTML = acts.map(a => `<div class="activity-item"><div class="activity-icon ${a.icon}"><i class="fa-solid ${a.iconClass}"></i></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></div>`).join('');
    }
});
