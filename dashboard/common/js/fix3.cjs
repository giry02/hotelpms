const fs = require('fs');
let code = fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/operations/room-setup.html', 'utf8');

const startIdx = code.indexOf('<script>\n// Mock Room Data');
if (startIdx > -1) {
    const topHalf = code.substring(0, startIdx);
    const bottomHalf = `<script>
let allBuildings = [];
let allRooms = [];
let allRoomTypes = [];
let currentTab = 'all';

async function initData() {
    allRooms = await PmsAPI.getAllRooms();
    allRoomTypes = await PmsAPI.getAllRoomTypes();
    
    // Extract unique buildings
    const bldgs = new Set();
    allRooms.forEach(r => { if(r.building) bldgs.add(r.building); });
    allBuildings = Array.from(bldgs).sort();

    renderTabs();
    renderTable();
    renderRoomTypeList();
}

function renderRoomTypeList() {
    const list = document.getElementById('roomTypeList');
    if (!list) return;
    list.innerHTML = allRoomTypes.map((rt) => \`
        <div style="border:1px solid var(--border);border-radius:4px;padding:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
                <div style="font-weight:700">\${rt.name}</div>
                <div style="font-size:0.8rem;color:var(--txt2)">\${rt.desc}</div>
            </div>
            <div style="display:flex;gap:6px">
                <button class="btn-outline-sm" onclick="editRoomType('\${rt.id}')">수정</button>
                <button class="btn-outline-sm" style="color:var(--danger);border-color:var(--danger)" onclick="deleteRoomType('\${rt.id}')">삭제</button>
            </div>
        </div>\`).join('');

    // Sync dropdown
    const sel = document.getElementById('addRoomType');
    if (sel) sel.innerHTML = allRoomTypes.map(rt => \`<option value="\${rt.name}">\${rt.name}</option>\`).join('');
}

async function addRoomType() {
    const name = prompt('새 객실 유형 이름을 입력하세요:');
    if (name && name.trim()) {
        const newId = 'RT-' + Date.now();
        await PmsAPI.saveRoomType({ id: newId, name: name.trim(), desc: '' });
        await initData();
        showToast('새 객실 유형이 추가되었습니다.');
    }
}

async function editRoomType(id) {
    const rt = allRoomTypes.find(t => t.id === id);
    if(!rt) return;
    const newName = prompt('객실 유형 이름 수정:', rt.name);
    if (newName && newName.trim()) {
        rt.name = newName.trim();
        await PmsAPI.saveRoomType(rt);
        await initData();
        showToast('객실 유형이 수정되었습니다.');
    }
}

async function deleteRoomType(id) {
    const rt = allRoomTypes.find(t => t.id === id);
    if (rt && confirm(\`'\${rt.name}' 객실 유형을 삭제하시겠습니까?\`)) {
        const types = await PmsAPI.getAllRoomTypes();
        const filtered = types.filter(t => t.id !== id);
        localStorage.setItem('pms_room_types', JSON.stringify(filtered));
        await initData();
        showToast('객실 유형이 삭제되었습니다.');
    }
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function renderTabs() {
    const buildings = allBuildings.slice().sort();
    
    const chipContainer = document.getElementById('buildingChips');
    let chipHtml = \`<button class="chip \${currentTab === 'all' ? 'active' : ''}" onclick="setTab('all')">All <span class="chip-count">\${allRooms.length}</span></button>\`;
    
    const mobileContainer = document.getElementById('mobileBuildingList');
    let mobileHtml = \`<button class="mobile-bldg-item \${currentTab === 'all' ? 'active' : ''}" onclick="setTab('all')">All <span>\${currentTab === 'all' ? '<i class="fa-solid fa-check"></i>' : ''}</span></button>\`;
    
    const bldgSelect = document.getElementById('addRoomBuilding');
    const manageList = document.getElementById('buildingManageList');
    let selectHtml = '<option value="">건물 미지정 (단일 건물)</option>';
    let manageHtml = '';

    buildings.forEach(b => {
        const count = allRooms.filter(r => r.building === b).length;
        chipHtml += \`<button class="chip \${currentTab === b ? 'active' : ''}" onclick="setTab('\${b}')">\${b} <span class="chip-count">\${count}</span></button>\`;
        mobileHtml += \`<button class="mobile-bldg-item \${currentTab === b ? 'active' : ''}" onclick="setTab('\${b}')">\${b} <span>\${currentTab === b ? '<i class="fa-solid fa-check"></i>' : ''}</span></button>\`;
        
        selectHtml += \`<option value="\${b}">\${b}</option>\`;
        manageHtml += \`
            <div style="border:1px solid var(--border);border-radius:4px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
                <div style="font-weight:700">\${b}</div>
                <div style="display:flex;gap:6px">
                    <button class="btn-outline-sm" onclick="editBuilding('\${b}')">수정</button>
                    <button class="btn-outline-sm" style="color:var(--danger);border-color:var(--danger)" onclick="deleteBuilding('\${b}')">삭제</button>
                </div>
            </div>\`;
    });
    
    if (chipContainer) chipContainer.innerHTML = chipHtml;
    if (mobileContainer) mobileContainer.innerHTML = mobileHtml;
    if (bldgSelect) bldgSelect.innerHTML = selectHtml;
    if (manageList) manageList.innerHTML = manageHtml;
    
    const btn = document.getElementById('mobileBuildingBtn');
    if (btn) btn.innerHTML = \`<i class="fa-solid fa-filter" style="color:var(--txt3)"></i> \${currentTab === 'all' ? 'All' : currentTab} <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem; margin-left:2px; color:var(--txt3)"></i>\`;
}

function setTab(tab) {
    currentTab = tab;
    renderTabs();
    renderTable();
    closeModal('mobileBuildingModal');
}

async function addBuilding() {
    const name = prompt('새 건물/구역의 이름을 입력하세요:');
    if (name && name.trim()) {
        const trimmed = name.trim();
        if (!allBuildings.includes(trimmed)) {
            allBuildings.push(trimmed);
            renderTabs();
        }
    }
}

async function editBuilding(oldName) {
    const newName = prompt('건물/구역의 새 이름을 입력하세요:', oldName);
    if (newName && newName.trim() && newName.trim() !== oldName) {
        const trimmed = newName.trim();
        for(let r of allRooms) {
            if (r.building === oldName) {
                r.building = trimmed;
                await PmsAPI.saveRoom(r);
            }
        }
        await initData();
        if (currentTab === oldName) currentTab = trimmed;
    }
}

async function deleteBuilding(name) {
    const roomsInBuilding = allRooms.filter(r => r.building === name).length;
    let msg = \`'\${name}'을(를) 삭제하시겠습니까?\`;
    if (roomsInBuilding > 0) {
        msg = \`'\${name}'에 속한 객실이 \${roomsInBuilding}개 있습니다.\\n정말 삭제하시겠습니까? (객실의 건물 정보가 '건물 미지정'으로 변경됩니다)\`;
    }
    if (await showConfirm(msg)) {
        for(let r of allRooms) {
            if (r.building === name) {
                r.building = null;
                await PmsAPI.saveRoom(r);
            }
        }
        await initData();
        if (currentTab === name) currentTab = 'all';
    }
}

function renderTable() {
    const search = document.getElementById('roomSearchInput').value.toLowerCase();
    const container = document.getElementById('roomGrid');
    container.innerHTML = '';
    
    const filtered = allRooms.filter(r => {
        if (currentTab !== 'all' && r.building !== currentTab) return false;
        if (search && !r.id.toLowerCase().includes(search) && !r.type.toLowerCase().includes(search)) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--txt3); background:var(--card); border-radius:var(--radius); border:1px solid var(--border)">등록된 객실이 없습니다.</div>';
        return;
    }

    filtered.forEach((r) => {
        const bldgStr = r.building || '건물 미지정';
        const floorStr = r.floor ? \`\${r.floor}층\` : '-';
        container.innerHTML += \`
            <div class="room-card">
                <div class="room-card-header">
                    <div class="room-card-title"><i class="fa-solid fa-door-closed"></i> \${r.id}</div>
                    <div class="room-card-type">\${r.type}</div>
                </div>
                <div class="room-card-info">
                    <div class="room-info-row"><i class="fa-solid fa-building"></i> \${bldgStr}</div>
                    <div class="room-info-row"><i class="fa-solid fa-layer-group"></i> \${floorStr}</div>
                </div>
                <div class="room-card-actions">
                    <button class="btn-icon" onclick="editRoom('\${r.id}')" title="수정"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteRoom('\${r.id}')" title="삭제"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        \`;
    });
}

let editingId = null;

function editRoom(id) {
    editingId = id;
    const r = allRooms.find(x => x.id === id);
    document.getElementById('roomModalTitle').innerText = '객실 정보 수정';
    document.getElementById('saveBtnText').innerText = '수정 완료';
    
    document.getElementById('addRoomId').value = r.id;
    document.getElementById('addRoomFloor').value = r.floor || '';
    document.getElementById('addRoomType').value = r.type;
    document.getElementById('addRoomBuilding').value = r.building || '';
    
    openModal('addRoomModal');
}

const originalOpenModal = openModal;
openModal = function(id) {
    if (id === 'addRoomModal' && event && event.currentTarget && event.currentTarget.innerText.includes('Add Room')) {
        editingId = null;
        document.getElementById('roomModalTitle').innerText = '객실 등록';
        document.getElementById('saveBtnText').innerText = '등록 완료';
        document.getElementById('addRoomId').value = '';
        document.getElementById('addRoomFloor').value = '';
        document.getElementById('addRoomType').value = allRoomTypes.length > 0 ? allRoomTypes[0].name : '';
        document.getElementById('addRoomBuilding').value = '';
    }
    originalOpenModal(id);
}

async function saveRoom() {
    const id = document.getElementById('addRoomId').value;
    const floor = document.getElementById('addRoomFloor').value;
    const type = document.getElementById('addRoomType').value;
    const building = document.getElementById('addRoomBuilding').value || null;

    if (!id) {
        showToast('객실 번호를 입력해주세요.');
        return;
    }

    let existingStatus = 'vacant-clean';
    let guestInfo = '';
    
    if (editingId) {
        const old = allRooms.find(x => x.id === editingId);
        if(old) {
            existingStatus = old.status || 'vacant-clean';
            guestInfo = old.guest || '';
            if(editingId !== id) {
                // ID changed, delete old
                await PmsAPI.deleteRoom(editingId);
            }
        }
    }

    await PmsAPI.saveRoom({ id, floor: parseInt(floor)||0, type, status: existingStatus, guest: guestInfo, building });
    
    closeModal('addRoomModal');
    await initData();
}

async function deleteRoom(id) {
    if (await showConfirm('이 객실을 삭제하시겠습니까?')) {
        await PmsAPI.deleteRoom(id);
        await initData();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initData();
});
</script>
</body>
</html>`;

    fs.writeFileSync('E:/AI_Project/Hotel_PMS/dashboard/operations/room-setup.html', topHalf + bottomHalf);
}
