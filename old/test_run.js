
    const dom = {
        value: '',
        innerHTML: '',
        classList: { add:()=>{}, remove:()=>{}, toggle:()=>{} },
        style: {},
        textContent: '',
        checked: false
    };
    global.document = {
        getElementById: () => dom,
        querySelectorAll: () => [dom, dom]
    };
    global.window = {
        MockData: { reservations: [{status:'confirmed', vip:'', amount:0, guest:'', room:'', id:'', type:'', cin:'', cout:'', nights:0, channel:''}], guests: [] },
        addEventListener: (e, cb) => cb(),
        applyLocalI18n: () => {}
    };
    const currentLang = 'en';
    const changeLang = () => {};
    const setupI18n = () => {};
    
// ===== RESERVATION DATA =====
let reservations = [];
let dummyGuestDB = [];

const statusConfig = {
    confirmed: {label:'확정',cls:'confirmed'},
    pending: {label:'대기',cls:'checkout'},
    checkedin: {label:'체크인',cls:'checkin'},
    checkout: {label:'체크아웃',cls:'vip'},
    cancelled: {label:'취소',cls:'cancelled'},
    vip: {label:'VIP',cls:'vip'}
};

let currentFilter = 'all';

function renderTable() {
    const tbody = document.getElementById('resBody');
    const mobileContainer = document.getElementById('resMobileCards');
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = reservations.filter(r => {
        if (currentFilter !== 'all' && r.status !== currentFilter) return false;
        if (search && !r.guest.toLowerCase().includes(search) && !r.room.toLowerCase().includes(search) && !r.id.toLowerCase().includes(search)) return false;
        return true;
    });

    // Desktop table
    tbody.innerHTML = filtered.map(r => {
        const st = statusConfig[r.status];
        const isVip = r.vip.includes('VIP') || r.vip.includes('Gold');
        return `
        <tr>
            <td><input type="checkbox" class="row-check"></td>
            <td><span class="res-id">${r.id}</span></td>
            <td>
                <div class="guest-cell">
                    <div class="guest-avatar" style="background:${r.color}">${r.initials}</div>
                    <div>
                        ${r.guest}${isVip ? ' <i class="fa-solid fa-crown" style="color:#F59E0B;font-size:.6rem"></i>' : ''}
                        <span style="font-size:.72rem;color:#9CA3AF;margin-left:6px">${r.vip}</span>
                    </div>
                </div>
            </td>
            <td><span class="room-tag">${r.room}</span></td>
            <td>${r.type}</td>
            <td>${r.cin}</td>
            <td>${r.cout}</td>
            <td>${r.nights}박</td>
            <td><span class="channel-tag ${r.channel.toLowerCase().replace('-','')}">${r.channel}</span></td>
            <td style="font-weight:700">$${r.amount.toLocaleString('en',{minimumFractionDigits:2})}<br><span style="font-size:0.7rem;color:var(--success);background:var(--success-lt);padding:2px 6px;border-radius:4px;"><i class="fa-solid fa-check"></i> 선결제 완료</span></td>
            <td><span class="status-badge ${st.cls}">${st.label}</span></td>
            <td>
                <div class="action-btns">
                    <a href="../operations/folio.html" class="act-btn" style="color:var(--primary);text-decoration:none;" title="결제/Folio 보기"><i class="fa-solid fa-file-invoice-dollar"></i></a>
                    <button class="act-btn" title="상세보기"><i class="fa-solid fa-eye"></i></button>
                    <button class="act-btn" title="수정"><i class="fa-solid fa-pen"></i></button>
                    <button class="act-btn danger" title="취소"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');

    // Mobile cards
    mobileContainer.innerHTML = filtered.map(r => {
        const st = statusConfig[r.status];
        const isVip = r.vip.includes('VIP') || r.vip.includes('Gold');
        return `
        <div class="m-res-card">
            <div class="m-res-top">
                <div class="m-res-guest">
                    <div class="guest-avatar" style="background:${r.color}">${r.initials}</div>
                    <div>
                        <div class="m-res-name">${r.guest} ${isVip ? '<i class="fa-solid fa-crown" style="color:#F59E0B;font-size:.65rem"></i>' : ''}</div>
                        <div class="m-res-sub">${r.vip}</div>
                    </div>
                </div>
                <div style="text-align:right">
                    <span class="status-badge ${st.cls}">${st.label}</span>
                    <div class="m-res-amount">$${r.amount.toLocaleString('en',{minimumFractionDigits:2})}</div>
                </div>
            </div>
            <div class="m-res-details">
                <div class="m-res-detail"><i class="fa-solid fa-door-open"></i> <span class="room-tag">${r.room}</span> ${r.type}</div>
                <div class="m-res-detail"><i class="fa-solid fa-calendar"></i> ${r.cin} → ${r.cout} (${r.nights}박)</div>
                <div class="m-res-detail"><i class="fa-solid fa-globe"></i> <span class="channel-tag ${r.channel.toLowerCase().replace('-','')}">${r.channel}</span></div>
            </div>
            <div class="m-res-actions">
                <button class="act-btn"><i class="fa-solid fa-eye"></i> 상세</button>
                <button class="act-btn"><i class="fa-solid fa-pen"></i> 수정</button>
                <button class="act-btn danger"><i class="fa-solid fa-xmark"></i> 취소</button>
            </div>
        </div>`;
    }).join('');
}

function setFilter(btn, filter) {
    currentFilter = filter;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
}

function filterTable() { renderTable(); }
function toggleAll() {
    const checked = document.getElementById('checkAll').checked;
    document.querySelectorAll('.row-check').forEach(c => c.checked = checked);
}

// ===== MOBILE MENU =====
function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

// ===== BOTTOM SHEET =====
function openResBS() {
    document.getElementById('resBsOverlay').classList.add('active');
    document.getElementById('resBsPanel').classList.add('active');
}
function closeResBS() {
    document.getElementById('resBsOverlay').classList.remove('active');
    document.getElementById('resBsPanel').classList.remove('active');
}
function selectResFilter(btn, filter, label) {
    currentFilter = filter;
    document.querySelectorAll('.bs-option').forEach(o => o.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('mResFilterLabel').textContent = label;
    // Sync desktop chips
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    const target = document.querySelector(`.chip[data-filter="${filter}"]`);
    if (target) target.classList.add('active');
    closeResBS();
    renderTable();
}

window.addEventListener('DataReady', () => {
    reservations = (window.MockData && window.MockData.reservations) ? window.MockData.reservations : [];
    dummyGuestDB = (window.MockData && window.MockData.guests) ? window.MockData.guests : [];
    renderTable();
});

// ===== i18n =====
window.applyLocalI18n = function(lang) {
    document.getElementById('searchInput').placeholder = lang==='en' ? 'Search by name, room, booking #...' : '이름, 객실번호, 예약번호 검색...';
}

// ===== GUEST LOOKUP LOGIC =====

function searchGuest(query) {
    const list = document.getElementById('guestAutocompleteList');
    if (!query.trim()) { list.style.display = 'none'; return; }
    
    const q = query.toLowerCase();
    const matches = dummyGuestDB.filter(g => g.name.toLowerCase().includes(q) || g.phone.includes(q) || g.email.includes(q));
    
    if (matches.length > 0) {
        list.innerHTML = matches.map(m => `
            <li style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border2);display:flex;justify-content:space-between;align-items:center;" onmouseover="this.style.background='var(--border2)'" onmouseout="this.style.background='transparent'" onclick="selectGuest('${m.name}', '${m.phone}', '${m.email}', '${m.nationality}')">
                <div>
                    <div style="font-weight:600;font-size:.85rem;color:var(--txt)">${m.name} <span style="font-size:0.7rem;color:var(--txt3)">(${m.nationality})</span></div>
                    <div style="font-size:.7rem;color:var(--txt3)">${m.phone} | ${m.email}</div>
                </div>
                ${m.vip !== 'Standard' ? `<span style="font-size:.65rem;background:var(--purple-lt);color:var(--purple);padding:2px 6px;border-radius:4px;font-weight:700">${m.vip}</span>` : ''}
            </li>
        `).join('');
        list.style.display = 'block';
    } else {
        list.innerHTML = `<li style="padding:10px 14px;font-size:.8rem;color:var(--txt3);text-align:center">검색 결과가 없습니다. 하단에 신규 정보를 입력해주세요.</li>`;
        list.style.display = 'block';
    }
}

function selectGuest(name, phone, email, nationality) {
    document.getElementById('nrGuest').value = name;
    document.getElementById('nrPhone').value = phone;
    document.getElementById('nrEmail').value = email;
    document.getElementById('nrNationality').value = nationality;
    document.getElementById('guestAutocompleteList').style.display = 'none';
    document.getElementById('guestSearchInput').value = name;
}

// 모달 공통 함수
function openModal(id) {
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}
function saveNewRes() {
    alert('새 예약이 성공적으로 저장되었습니다!');
    closeModal('newResModal');
}

