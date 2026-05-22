
// Mock Room Data — building field is optional (null = no building)
let allRooms = [];

const statusConfig = {
    'occupied': { label: 'Occupied' },
    'vacant-clean': { label: 'Vacant Clean' },
    'vacant-dirty': { label: 'Vacant Dirty' },
    'oos': { label: 'Out of Order' }
};

let currentStatus = 'all';

function toggleBuilding(el) {
    el.classList.toggle('collapsed');
    el.nextElementSibling.classList.toggle('collapsed');
}

function renderRooms() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const container = document.getElementById('roomContainer');
    container.innerHTML = '';
    
    const filtered = allRooms.filter(r => {
        if (currentStatus !== 'all') {
            if (currentStatus === 'vacant' && r.status !== 'vacant-clean' && r.status !== 'vacant-dirty') return false;
            else if (currentStatus !== 'vacant' && r.status !== currentStatus) return false;
        }
        if (search && !r.id.toLowerCase().includes(search)) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--txt3)">검색 결과가 없습니다.</div>';
        return;
    }

    // Auto-detect: if any room has a building value, use building>floor grouping
    const hasBuildings = allRooms.some(r => r.building);

    if (hasBuildings) {
        // 2-level grouping: Building > Floor
        const buildings = [...new Set(filtered.map(r => r.building || '미지정'))].sort();
        buildings.forEach(bldg => {
            const bldgRooms = filtered.filter(r => (r.building || '미지정') === bldg);
            const floors = [...new Set(bldgRooms.map(r => r.floor))].sort((a,b) => b - a);
            let html = `<div class="building-section">`;
            html += `<div class="building-header" onclick="toggleBuilding(this)">`;
            html += `<i class="fa-solid fa-building bldg-icon"></i>`;
            html += `<span class="bldg-name">${bldg}</span>`;
            html += `<span class="bldg-count">(${bldgRooms.length}Room)</span>`;
            html += `<i class="fa-solid fa-chevron-down bldg-chevron"></i>`;
            html += `</div>`;
            html += `<div class="building-body">`;
            floors.forEach(f => {
                const floorRooms = bldgRooms.filter(r => r.floor === f);
                html += `<div class="floor-section">`;
                html += `<div class="floor-title"><i class="fa-solid fa-layer-group"></i> ${f}층 <span style="font-size:0.8rem;color:var(--txt3);font-weight:500;margin-left:8px">(${floorRooms.length}Room)</span></div>`;
                html += `<div class="room-grid">`;
                floorRooms.forEach(r => {
                    const stLabel = statusConfig[r.status].label;
                    const guestHtml = r.guest ? `<div class="room-guest-name">${r.guest}</div>` : '';
                    html += `<div class="room-box ${r.status}"><div class="room-box-num">${r.id}</div><div class="room-box-type">${r.type}</div><div class="room-box-status">${stLabel}</div>${guestHtml}</div>`;
                });
                html += `</div></div>`;
            });
            html += `</div></div>`;
            container.innerHTML += html;
        });
    } else {
        // Single-level grouping: Floor only
        const floors = [...new Set(filtered.map(r => r.floor))].sort((a,b) => b - a);
        floors.forEach(f => {
            const floorRooms = filtered.filter(r => r.floor === f);
            let html = `<div class="floor-section">`;
            html += `<div class="floor-title"><i class="fa-solid fa-layer-group"></i> ${f}층 <span style="font-size:0.8rem;color:var(--txt3);font-weight:500;margin-left:8px">(${floorRooms.length}Room)</span></div>`;
            html += `<div class="room-grid">`;
            floorRooms.forEach(r => {
                const stLabel = statusConfig[r.status].label;
                const guestHtml = r.guest ? `<div class="room-guest-name">${r.guest}</div>` : '';
                html += `<div class="room-box ${r.status}"><div class="room-box-num">${r.id}</div><div class="room-box-type">${r.type}</div><div class="room-box-status">${stLabel}</div>${guestHtml}</div>`;
            });
            html += `</div></div>`;
            container.innerHTML += html;
        });
    }
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

function selectFilter(status, label) {
    currentStatus = status;
    
    // Update bottom sheet selected state
    document.querySelectorAll('.bs-option').forEach(o => {
        o.classList.remove('selected');
        const oc = o.getAttribute('onclick');
        if (oc && oc.includes(`'${status}'`)) {
            o.classList.add('selected');
        }
    });
    
    // Update mobile trigger label
    const mLabel = document.getElementById('mFilterLabel');
    if (mLabel) mLabel.textContent = label || status;
    
    // Sync desktop chips
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.chip').forEach(chip => {
        const oc = chip.getAttribute('onclick');
        if (oc) {
            if (status === 'vacant' && (oc.includes('vacant-clean') || oc.includes('vacant-dirty'))) {
                chip.classList.add('active');
            } else if (oc.includes(`'${status}'`)) {
                chip.classList.add('active');
            }
        }
    });
    
    closeBottomSheet();
    /* renderRooms(); */
}

function setStatus(btn, status) {
    let label = '전체';
    if(status === 'occupied') label = '투숙 중';
    else if(status === 'vacant-clean') label = '청결 공실';
    else if(status === 'vacant-dirty') label = '오염 공실';
    else if(status === 'oos') label = '점검 중 (OOS)';
    
    selectFilter(status, label);
}

function updateFilterCounts() {
    document.querySelectorAll('.chip').forEach(chip => {
        const status = chip.getAttribute('data-status');
        if (!status) return;
        
        let count = 0;
        if (status === 'all') {
            count = allRooms.length;
        } else if (status === 'vacant') {
            count = allRooms.filter(r => r.status === 'vacant-clean' || r.status === 'vacant-dirty').length;
        } else {
            count = allRooms.filter(r => r.status === status).length;
        }

        // find text node or text content and append/update count
        let baseText = chip.getAttribute('data-base-text');
        if (!baseText) {
            // we have html inside some chips like <span class="status-dot"></span> Occupied
            // extract the text part
            const textNode = Array.from(chip.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0);
            if (textNode) {
                baseText = textNode.textContent.trim().replace(/\s*\(\d+\)$/, '');
                chip.setAttribute('data-base-text', baseText);
                textNode.textContent = ` ${baseText} (${count})`;
            } else {
                baseText = chip.textContent.trim().replace(/\s*\(\d+\)$/, '');
                chip.setAttribute('data-base-text', baseText);
                chip.textContent = `${baseText} (${count})`;
            }
        } else {
            const textNode = Array.from(chip.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.includes(baseText));
            if (textNode) {
                textNode.textContent = ` ${baseText} (${count})`;
            } else if (!chip.querySelector('.status-dot')) {
                chip.textContent = `${baseText} (${count})`;
            }
        }
    });
}

function saveRoom() {
    showToast('신규 Room이 등록되었습니다.');
    closeModal('addRoomModal');
}

/* renderRooms(); */
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
"Room Mgmt":"객실 관리","Dashboard":"대시보드","Reservations":"예약 타임라인","Booking List":"예약 목록","Check-in/out":"체크인/아웃","Guest CRM":"투숙객 관리","VIP Members":"VIP 멤버십","Housekeeping":"하우스키핑","Folio & Billing":"통합 정산","Ancillary Svcs":"부가서비스","Hotel Settings":"호텔 설정","Staff Mgmt":"직원 관리","Total Rooms":"총 객실","Occupied":"판매 중","Vacant":"공실 (Vacant)","OOS":"점검 중 (OOS)","All":"전체","Occupied":"판매 중","Vacant Clean":"청결 공실","Vacant Dirty":"오염 공실","Out of Order":"점검 중","Export":"엑셀 다운","Room Types":"객실 유형 관리","Add Room":"신규 객실 등록","Add Room":"신규 객실 등록"},en: {
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
"Room Mgmt":"Room Mgmt","Dashboard":"Dashboard","Reservations":"Reservations","Booking List":"Booking List","Check-in/out":"Check-in/out","Guest CRM":"Guest CRM","VIP Members":"VIP Members","Housekeeping":"Housekeeping","Folio & Billing":"Folio & Billing","Ancillary Svcs":"Ancillary Svcs","Hotel Settings":"Hotel Settings","Staff Mgmt":"Staff Mgmt","Total Rooms":"Total Rooms","Occupied":"Occupied","Vacant":"Vacant","OOS":"OOS","All":"All","Occupied":"Occupied","Vacant Clean":"Vacant Clean","Vacant Dirty":"Vacant Dirty","Out of Order":"Out of Order","Export":"Export","Room Types":"Room Types","Add Room":"Add Room","Add Room":"Add Room"}};
function setupI18n(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);let n;const t=[];while(n=w.nextNode()){const o=n.nodeValue,x=o.trim();if(x&&translations.ko[x]&&!n.parentNode.hasAttribute('data-i18n-key')){const s=document.createElement('span');s.setAttribute('data-i18n-key',x);s.textContent=x;t.push({node:n,span:s,originalText:o})}}t.forEach(({node:n,span:s,originalText:o})=>{const f=document.createDocumentFragment();const l=o.match(/^\s+/),r=o.match(/\s+$/);if(l)f.appendChild(document.createTextNode(l[0]));f.appendChild(s);if(r)f.appendChild(document.createTextNode(r[0]));n.parentNode.replaceChild(f,n)})}
function changeLang(l){
    currentLang=l;
    const d=translations[l]||translations.ko;
    document.querySelectorAll('[data-i18n-key]').forEach(e=>{const k=e.getAttribute('data-i18n-key');if(d[k])e.textContent=d[k]});
    document.getElementById('searchInput').placeholder=l==='en'?'Search room number...':'Room 번호 검색...';
    // Update JS rendered labels
    statusConfig['occupied'].label = l==='en'?'Occupied':'판매 중';
    statusConfig['vacant-clean'].label = l==='en'?'Vacant Clean':'청결 공실';
    statusConfig['vacant-dirty'].label = l==='en'?'Vacant Dirty':'오염 공실';
    statusConfig['oos'].label = l==='en'?'Out of Order':'점검/수리중';
    /* renderRooms(); */
}


