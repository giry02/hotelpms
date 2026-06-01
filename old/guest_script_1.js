
function openGuestDetail(email) {
    const guest = guests.find(g => g.email === email);
    if(!guest) return;

    // Populate data
    const t = tierCfg[guest.tier];
    document.getElementById('gdName').innerHTML = `<span class="tier-badge" style="background:${t.bg};color:${t.color};margin-right:8px"><i class="fa-solid ${t.icon}"></i> ${t.label}</span> ${guest.name}`;
    
    document.getElementById('gdVisits').textContent = guest.visits + '회';
    document.getElementById('gdLastStay').textContent = guest.last;
    document.getElementById('gdSpend').textContent = '$' + guest.spend.toLocaleString();
    
    // Populate profile form fields
    const nameParts = guest.name.trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() : '';
    const firstName = nameParts.join(' ');
    document.getElementById('gdInputFirstName').value = firstName || guest.name;
    document.getElementById('gdInputLastName').value = lastName;
    document.getElementById('gdInput전화번호').value = guest.phone;
    document.getElementById('gdInput이메일').value = guest.email;
    const nSel = document.getElementById('gdInputNation');
    if(!Array.from(nSel.options).some(o => o.value === guest.nation)) {
        nSel.add(new Option(guest.nation, guest.nation));
    }
    nSel.value = guest.nation;
    document.getElementById('gdInputTier').value = guest.tier;
    
    // Dummy No-show/Cancel data based on name length for variation
    const noShow = guest.name.length % 2;
    const cancel = (guest.name.length % 3) + 1;
    document.getElementById('gdCancel').textContent = `${noShow} / ${cancel}`;

    // Generate Dummy History
    const tbody = document.getElementById('gdHistoryBody');
    let historyHtml = '';
    const stayCount = Math.max(guest.visits, 15); // Show at least 15 items for scroll demonstration
    window.currentGuestVisits = []; // store for filter
    
    for(let i=0; i<stayCount; i++) {
        const d = new Date(guest.last);
        d.setDate(d.getDate() - (i*30)); // space out past stays by ~1 month
        const checkIn = d.toISOString().split('T')[0];
        d.setDate(d.getDate() + (guest.name.length % 3 + 1));
        const checkOut = d.toISOString().split('T')[0];
        
        const roomTypes = ['Deluxe King', 'Standard Twin', 'Executive Suite', 'Ocean View', 'Family Room'];
        const rt = roomTypes[(guest.name.length + i) % roomTypes.length];
        const pmt = Math.floor((guest.spend / guest.visits) || 200);

        window.currentGuestVisits.push({ checkIn, checkOut, rt, pmt });
    }
    
    renderDummyHistory(window.currentGuestVisits);

    // Mobile Expansion Reset
    const panel = document.getElementById('guestDetailPanel');
    panel.classList.remove('expanded');

    // Show
    document.getElementById('guestDetailOverlay').classList.add('active');
    panel.classList.add('active');
}

function renderDummyHistory(data) {
    const tbody = document.getElementById('gdHistoryBody');
    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--txt3)">해당 기간의 이력이 없습니다.</td></tr>`;
        return;
    }
    let html = '';
    data.forEach(v => {
        html += `
        <tr>
            <td data-label="투숙 일자">${v.checkIn} ~ ${v.checkOut}</td>
            <td data-label="객실 타입">${v.rt}</td>
            <td data-label="결제 금액"><strong>$${v.pmt.toLocaleString()}</strong></td>
            <td data-label="상태"><span style="color:var(--success);font-weight:600">Completed</span></td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function filterDummyHistory() {
    const start = document.getElementById('gdFilterStart').value;
    const end = document.getElementById('gdFilterEnd').value;
    if(!start && !end) {
        renderDummyHistory(window.currentGuestVisits);
        return;
    }
    
    const filtered = window.currentGuestVisits.filter(v => {
        let pass = true;
        if(start && v.checkIn < start) pass = false;
        if(end && v.checkIn > end) pass = false;
        return pass;
    });
    renderDummyHistory(filtered);
}

function closeGuestDetail() {
    document.getElementById('guestDetailOverlay').classList.remove('active');
    document.getElementById('guestDetailPanel').classList.remove('active');
}

// Mobile Scroll/Drag to Expand Bottom Sheet
document.addEventListener('DOMContentLoaded', () => {
    const gdBody = document.getElementById('gdBody');
    const panel = document.getElementById('guestDetailPanel');
    const handle = document.querySelector('.gd-handle');
    
    // Expand on scroll up (which means scrolling down the content)
    gdBody.addEventListener('scroll', function() {
        if (window.innerWidth <= 768 && this.scrollTop > 10) {
            panel.classList.add('expanded');
        }
    });

    // Expand or close on handle drag
    let startY = 0;
    handle.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, {passive: true});
    handle.addEventListener('touchmove', e => {
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 50) {
            closeGuestDetail(); // Dragged down enough
        } else if (diff < -30) {
            panel.classList.add('expanded'); // Dragged up enough
        }
    }, {passive: true});
});
