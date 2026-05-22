
let guests = [];
PmsAPI.getGuests()
    .then(data => {
        guests = data.map(g => ({
            name: g.name,
            init: g.name ? g.name.substring(0,2).toUpperCase() : '??',
            color: g.color || '#3B82F6',
            nation: g.nation || g.country || '',
            tier: g.tier ? g.tier.toLowerCase() : 'standard',
            visits: g.visits || 0,
            last: g.last || g.lastStay || '-',
            spend: g.spend || 0,
            email: g.email || '-',
            phone: g.phone || '-'
        }));
        if(typeof renderGuests === 'function') {
            renderGuests();
            updateFilterCounts();
        }
    })
    .catch(err => console.error(err));

const tierCfg = {
    diamond:{label:'Diamond',icon:'fa-gem',color:'#60A5FA',bg:'rgba(96,165,250,.1)'},
    platinum:{label:'Platinum',icon:'fa-star',color:'#A78BFA',bg:'rgba(167,139,250,.1)'},
    gold:{label:'Gold',icon:'fa-crown',color:'#F59E0B',bg:'rgba(245,158,11,.1)'},
    standard:{label:'Standard',icon:'fa-user',color:'#9CA3AF',bg:'rgba(156,163,175,.1)'}
};

let currentTier = 'all';

function renderGuests() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = guests.filter(g => {
        if (currentTier !== 'all' && g.tier !== currentTier) return false;
        if (search && !g.name.toLowerCase().includes(search) && !g.email.toLowerCase().includes(search) && !g.phone.includes(search)) return false;
        return true;
    });

    const tbody = document.getElementById('guestBody');
    const mobile = document.getElementById('guestMobile');
    const t = tierCfg;

    // Desktop table
    tbody.innerHTML = filtered.map(g => {
        const tc = t[g.tier];
        return `<tr onclick="openGuestDetail('${g.email}')" style="cursor:pointer" class="guest-row">
            <td><div class="guest-cell"><div class="guest-avatar" style="background:${g.color}">${g.init}</div><div><strong>${g.name}</strong> <span style="font-size:.7rem;color:var(--txt3)">${g.email}</span></div></div></td>
            <td>${g.nation}</td>
            <td><span class="tier-badge" style="background:${tc.bg};color:${tc.color}"><i class="fa-solid ${tc.icon}"></i> ${tc.label}</span></td>
            <td><strong>${g.visits}</strong>회</td>
            <td>${g.last}</td>
            <td style="font-weight:700">$${g.spend.toLocaleString()}</td>
            <td><span style="font-size:.75rem;color:var(--txt2)">${g.phone}</span></td>
            <td><div class="action-btns">
                <button class="act-btn" title="상세"><i class="fa-solid fa-eye"></i></button>
            </div></td>
        </tr>`;
    }).join('');

    // Mobile cards
    mobile.innerHTML = filtered.map(g => {
        const tc = t[g.tier];
        return `<div class="m-res-card" onclick="openGuestDetail('${g.email}')" style="cursor:pointer">
            <div class="m-res-top">
                <div class="m-res-guest">
                    <div class="guest-avatar" style="background:${g.color}">${g.init}</div>
                    <div>
                        <div class="m-res-name">${g.name}</div>
                        <div class="m-res-sub">${g.nation}</div>
                    </div>
                </div>
                <div style="text-align:right">
                    <span class="tier-badge" style="background:${tc.bg};color:${tc.color}"><i class="fa-solid ${tc.icon}"></i> ${tc.label}</span>
                    <div class="m-res-amount">$${g.spend.toLocaleString()}</div>
                </div>
            </div>
            <div class="m-res-details">
                <div class="m-res-detail"><i class="fa-solid fa-rotate"></i> 방문 ${g.visits}회</div>
                <div class="m-res-detail"><i class="fa-solid fa-calendar"></i> 최근: ${g.last}</div>
                <div class="m-res-detail"><i class="fa-solid fa-phone"></i> ${g.phone}</div>
                <div class="m-res-detail"><i class="fa-solid fa-envelope"></i> ${g.email}</div>
            </div>
            <div class="m-res-actions">
                <button class="act-btn"><i class="fa-solid fa-eye"></i> 상세</button>
            </div>
        </div>`;
    }).join('');
}

function setTier(btn, tier) {
    currentTier = tier;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    renderGuests();
}

function updateFilterCounts() {
    document.querySelectorAll('.chip').forEach(chip => {
        const tier = chip.getAttribute('data-tier');
        if (!tier) return;
        const countSpan = chip.querySelector('.chip-count');
        if (!countSpan) return;
        
        let count = 0;
        if (tier === 'all') count = guests.length;
        else count = guests.filter(g => g.tier === tier).length;
        
        countSpan.textContent = `(${count})`;
    });
}

// Bottom sheet
function openBottomSheet() {
    document.getElementById('bsOverlay').classList.add('active');
    document.getElementById('bsPanel').classList.add('active');
}
function closeBottomSheet() {
    document.getElementById('bsOverlay').classList.remove('active');
    document.getElementById('bsPanel').classList.remove('active');
}
function selectFilter(tier, label) {
    currentTier = tier;
    // Update bottom sheet selected state
    document.querySelectorAll('.bs-option').forEach(o => o.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    // Update mobile trigger label
    document.getElementById('mFilterLabel').textContent = label;
    // Sync desktop chips
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    const chips = document.querySelectorAll('.chip');
    if (tier === 'all') chips[0].classList.add('active');
    else if (tier === 'diamond') chips[1].classList.add('active');
    else if (tier === 'platinum') chips[2].classList.add('active');
    else if (tier === 'gold') chips[3].classList.add('active');
    else chips[4].classList.add('active');
    closeBottomSheet();
    renderGuests();
}

function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

renderGuests();
updateFilterCounts();

// i18n
let currentLang='ko';
const translations={ko: {
        "Main": "메인",
        "Front Desk": "프론트 데스크",
        "Guest & CRM": "투숙객 및 CRM",
        "Operations": "운영 관리",
        "Settings": "설정",
        "Dashboard": "대시보드",
        "Reservations": "예약 타임라인",
        "Booking List": "예약 목록",
        "Check-in/out": "체크인/아웃",
        "Guest CRM": "투숙객 관리",
        "VIP Members": "VIP 멤버십",
        "Room Mgmt": "객실 관리",
        "Room Types": "객실 유형",
        "Rates Calendar": "요금 캘린더",
        "Housekeeping": "하우스키핑",
        "Folio & Billing": "통합 정산",
        "Folio List": "정산 목록",
        "Revenue Analytics": "매출 분석",
        "Ancillary Svcs": "부가서비스",
        "Room Service": "룸서비스",
        "Golf": "골프",
        "Rent-a-car": "렌터카",
        "Hotel Settings": "호텔 설정",
        "Staff Mgmt": "직원 관리",
        "Billing & Payment": "요금 및 결제",
        "Notices": "공지사항",
        "Support": "고객지원",
"Guest CRM":"투숙객 관리","Dashboard":"대시보드","Reservations":"예약 타임라인","Booking List":"예약 목록","Check-in/out":"체크인/아웃","VIP Members":"VIP 멤버십","Room Mgmt":"객실 관리","Housekeeping":"하우스키핑","Folio & Billing":"통합 정산","Ancillary Svcs":"부가서비스","Hotel Settings":"호텔 설정","Staff Mgmt":"직원 관리","Total Guests":"총 고객 수","Return Rate":"재방문율","VIP Guests":"VIP 고객","Avg. Spend/Guest":"고객당 평균 지출","All":"전체","Export":"엑셀 다운","고객 등록":"고객 등록","Guest":"고객","Country":"국적","Tier":"등급","Visits":"방문 횟수","Last Stay":"최근 투숙","Total Spend":"총 지출","Contact":"연락처","Actions":"관리"},en: {
        "Main": "Main",
        "Front Desk": "Front Desk",
        "Guest & CRM": "Guest & CRM",
        "Operations": "Operations",
        "Settings": "Settings",
        "Dashboard": "Dashboard",
        "Reservations": "Reservations",
        "Booking List": "Booking List",
        "Check-in/out": "Check-in/out",
        "Guest CRM": "Guest CRM",
        "VIP Members": "VIP Members",
        "Room Mgmt": "Room Mgmt",
        "Room Types": "Room Types",
        "Rates Calendar": "Rates Calendar",
        "Housekeeping": "Housekeeping",
        "Folio & Billing": "Folio & Billing",
        "Folio List": "Folio List",
        "Revenue Analytics": "Revenue Analytics",
        "Ancillary Svcs": "Ancillary Svcs",
        "Room Service": "Room Service",
        "Golf": "Golf",
        "Rent-a-car": "Rent-a-car",
        "Hotel Settings": "Hotel Settings",
        "Staff Mgmt": "Staff Mgmt",
        "Billing & Payment": "Billing & Payment",
        "Notices": "Notices",
        "Support": "Support",
"Guest CRM":"Guest CRM","Dashboard":"Dashboard","Reservations":"Reservations","Booking List":"Booking List","Check-in/out":"Check-in/out","VIP Members":"VIP Members","Room Mgmt":"Room Mgmt","Housekeeping":"Housekeeping","Folio & Billing":"Folio & Billing","Ancillary Svcs":"Ancillary Svcs","Hotel Settings":"Hotel Settings","Staff Mgmt":"Staff Mgmt","Total Guests":"Total Guests","Return Rate":"Return Rate","VIP Guests":"VIP Guests","Avg. Spend/Guest":"Avg. Spend/Guest","All":"All","Export":"Export","고객 등록":"고객 등록","Guest":"Guest","Country":"Country","Tier":"Tier","Visits":"Visits","Last Stay":"Last Stay","Total Spend":"Total Spend","Contact":"Contact","Actions":"Actions"}};
function setupI18n(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);let n;const t=[];while(n=w.nextNode()){const o=n.nodeValue,x=o.trim();if(x&&translations.ko[x]&&!n.parentNode.hasAttribute('data-i18n-key')){const s=document.createElement('span');s.setAttribute('data-i18n-key',x);s.textContent=x;t.push({node:n,span:s,originalText:o})}}t.forEach(({node:n,span:s,originalText:o})=>{const f=document.createDocumentFragment();const l=o.match(/^\s+/),r=o.match(/\s+$/);if(l)f.appendChild(document.createTextNode(l[0]));f.appendChild(s);if(r)f.appendChild(document.createTextNode(r[0]));n.parentNode.replaceChild(f,n)})}
function changeLang(l){currentLang=l;const d=translations[l]||translations.ko;document.querySelectorAll('[data-i18n-key]').forEach(e=>{const k=e.getAttribute('data-i18n-key');if(d[k])e.textContent=d[k]});    document.getElementById('searchInput').placeholder=l==='en'?'Search name, phone, email...':'이름, Contact, 이메일 검색...';
}

// 모달
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function saveGuest() {
    showToast('신규 Guest이 등록되었습니다.');
    closeModal('addGuestModal');
}

document.addEventListener('DOMContentLoaded',()=>{setupI18n();changeLang(currentLang)});
