const fs = require('fs');
const file = 'E:/AI_Project/Hotel_PMS/dashboard/common/js/reservation-actions.js';
let content = fs.readFileSync(file, 'utf8');

// Replace openUnifiedResModal logic
const openUnifiedOld = `    window.openUnifiedResModal = async function(resId) {
        ensureModal();
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) {
            alert('Error: reservations variable not found!');
            return;
        }
        const res = allRes.find(r => r.id === resId);
        if (!res) {
            alert('Error: reservation not found for ID ' + resId);
            return;
        }
        
        const isB2B = res.isB2B;
        const isVip = res.isVip || (res.vip && res.vip.toLowerCase().includes('vip'));
        const b2bBadge = isB2B ? '<span style="background:#111827;color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:600;vertical-align:middle;letter-spacing:0.5px"><i class="fa-solid fa-building"></i> B2B 고객</span>' : '';
        const vipBadge = isVip ? '<span style="background:rgba(245,158,11,.15);color:#D97706;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:700;vertical-align:middle;"><i class="fa-solid fa-crown"></i> VIP</span>' : '';
        
        document.getElementById('unifiedModalTitle').innerHTML = \`\${res.id} \${b2bBadge} \${vipBadge}\`;
        
        
        document.getElementById('unifiedResId').value = res.id;
        
        // Populate room select
        if (!window.rooms || window.rooms.length === 0) {
            if (typeof window.PmsAPI !== 'undefined' && window.PmsAPI.getAllRooms) {
                window.rooms = await window.PmsAPI.getAllRooms();
            }
        }`;

const openUnifiedNew = `    window.openUnifiedResModal = async function(resId) {
        ensureModal();
        const allRes = window.reservations || (typeof reservations !== 'undefined' ? reservations : null);
        if (!allRes) {
            alert('Error: reservations variable not found!');
            return;
        }

        // Initialize Guest Search Widget
        if (!window._editGuestWidget && typeof initGuestSearch === 'function') {
            window._editGuestWidget = initGuestSearch('Edit');
        }

        // Populate room select
        if (!window.rooms || window.rooms.length === 0) {
            if (typeof window.PmsAPI !== 'undefined' && window.PmsAPI.getAllRooms) {
                window.rooms = await window.PmsAPI.getAllRooms();
            }
        }
        
        const roomSelect = document.getElementById('unifiedRoom');
        roomSelect.innerHTML = '';
        if (window.rooms && window.rooms.length > 0) {
            window.rooms.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = \`\${r.id} (\${r.type || 'Standard'})\`;
                roomSelect.appendChild(opt);
            });
        }

        if (!resId) {
            // NEW BOOKING MODE
            document.getElementById('unifiedModalTitle').innerHTML = \`신규 예약 등록 (New Booking)\`;
            document.getElementById('unifiedResId').value = '';
            document.getElementById('unifiedStatus').value = 'confirmed';
            
            // Set default dates to today and tomorrow
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const fmt = d => \`\${d.getMonth()+1}/\${d.getDate()}\`;
            document.getElementById('unifiedCin').textContent = fmt(today);
            document.getElementById('unifiedCout').textContent = fmt(tomorrow);
            document.getElementById('unifiedNights').textContent = '1박';
            document.getElementById('unifiedType').textContent = 'Standard';
            
            if (window._editGuestWidget) {
                window._editGuestWidget.reset();
                window._editGuestWidget.showNewForm();
            }
        } else {
            // EDIT BOOKING MODE
            const res = allRes.find(r => r.id === resId);
            if (!res) {
                alert('Error: reservation not found for ID ' + resId);
                return;
            }
            
            const isB2B = res.isB2B;
            const isVip = res.isVip || (res.vip && res.vip.toLowerCase().includes('vip'));
            const b2bBadge = isB2B ? '<span style="background:#111827;color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:600;vertical-align:middle;letter-spacing:0.5px"><i class="fa-solid fa-building"></i> B2B 고객</span>' : '';
            const vipBadge = isVip ? '<span style="background:rgba(245,158,11,.15);color:#D97706;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:700;vertical-align:middle;"><i class="fa-solid fa-crown"></i> VIP</span>' : '';
            
            document.getElementById('unifiedModalTitle').innerHTML = \`\${res.id} \${b2bBadge} \${vipBadge}\`;
            document.getElementById('unifiedResId').value = res.id;
            
            if (window.rooms && window.rooms.length === 0) {
                const opt = document.createElement('option');
                opt.value = res.room;
                opt.textContent = res.room;
                roomSelect.appendChild(opt);
            }
            roomSelect.value = res.room;

            if (window._editGuestWidget) {
                window._editGuestWidget.reset();
                const existingGuest = typeof GUEST_DB !== 'undefined' ? GUEST_DB.find(g => g.name === res.guest) : null;
                if (existingGuest) {
                    window._editGuestWidget.select(existingGuest.id);
                } else {
                    window._editGuestWidget.showNewForm();
                    const nameInput = document.getElementById('nrGuestEdit');
                    if (nameInput) nameInput.value = res.guest;
                }
            }
        
            document.getElementById('unifiedStatus').value = res.status;
            document.getElementById('unifiedCin').textContent = res.cin || '-';
            document.getElementById('unifiedCout').textContent = res.cout || '-';
            document.getElementById('unifiedNights').textContent = res.nights ? (res.nights + '박') : (res.len ? res.len + '박' : '-');
            document.getElementById('unifiedType').textContent = res.type || '-';
        }`;

content = content.replace(openUnifiedOld, openUnifiedNew);

// Remove the old duplicate populate room code and Guest initialization code from the middle
const dupStart = content.indexOf(`        const roomSelect = document.getElementById('unifiedRoom');`);
const dupEnd = content.indexOf(`        document.getElementById('unifiedStatus').value = res.status;`);
if(dupStart > -1 && dupEnd > dupStart) {
    // Wait, the replace above already swallowed up to `if (typeof window.PmsAPI !== 'undefined' && window.PmsAPI.getAllRooms) { window.rooms = await window.PmsAPI.getAllRooms(); } }`
    // I need to be careful with string replacement.
}

fs.writeFileSync('patch-openUnified.cjs', \`
const fs = require('fs');
let content = fs.readFileSync('\${file}', 'utf8');

// Use a more robust regex to replace openUnifiedResModal completely
const startIdx = content.indexOf('window.openUnifiedResModal = async function(resId) {');
const endIdx = content.indexOf('window.closeUnifiedResModal = function() {');

if (startIdx > -1 && endIdx > -1) {
    const newContent = content.substring(0, startIdx) + \`\${openUnifiedNew}

        // Hide other modals if they are open
        ['resModal', 'resDetailModal', 'editResModal'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.remove('active');
        });
        
        document.getElementById('unifiedResModal').classList.add('active');
    };

    \` + content.substring(endIdx);
    fs.writeFileSync('\${file}', newContent, 'utf8');
    console.log('Patched openUnifiedResModal');
} else {
    console.log('Could not find bounds for openUnifiedResModal');
}
\`, 'utf8');
