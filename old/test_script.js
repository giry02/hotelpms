
let allBuildings = [];
let allRooms = [];

const statusConfig = {
    'occupied': { label: 'Occupied' },
    'vacant-clean': { label: 'Vacant Clean' },
    'vacant-dirty': { label: 'Vacant Dirty' },
    'oos': { label: 'Out of Order' }
};

let currentTab = 'all';

function openModal(id) { 
    if(id === 'roomTypeModal') renderRoomTypes();
    document.getElementById(id).classList.add('active'); 
}
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

let mockRoomTypes = [
    { id: 1, name: 'Standard Double', desc: '최대 2인 · 킹베드 1개 · 25m²' },
    { id: 2, name: 'Deluxe King', desc: '최대 2인 · 킹베드 1개 · 35m² · 시티뷰' },
    { id: 3, name: 'Executive Suite', desc: '최대 4인 · 킹베드 1개, 소파베드 1개 · 60m² · 오션뷰' }
];

function renderRoomTypes() {
    const container = document.getElementById('roomTypeListContainer');
    if (!container) return;
    let html = '';
    mockRoomTypes.forEach((rt, index) => {
        html += `
            <div style="border:1px solid var(--border);border-radius:4px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div style="font-weight:700">${rt.name}</div>
                    <div style="font-size:0.8rem;color:var(--txt2)">${rt.desc}</div>
                </div>
                <div><button class="btn-outline-sm" onclick="editRoomType(${index})">수정</button></div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addRoomType() {
    const name = prompt('새 객실 유형 이름을 입력하세요:');
    if (!name) return;
    const desc = prompt('객실 유형 설명을 입력하세요:');
    if (desc !== null) {
        mockRoomTypes.push({ id: Date.now(), name, desc });
        renderRoomTypes();
        showToast('객실 유형이 추가되었습니다.', 'success');
    }
}

function editRoomType(index) {
    const rt = mockRoomTypes[index];
    const name = prompt('객실 유형 이름을 입력하세요:', rt.name);
    if (!name) return;
    const desc = prompt('객실 유형 설명을 입력하세요:', rt.desc);
    if (desc !== null) {
        rt.name = name;
        rt.desc = desc;
        renderRoomTypes();
        showToast('객실 유형이 수정되었습니다.', 'success');
    }
}

function renderTabs() {
    try {
        const buildings = allBuildings.slice().sort();
        
        // Desktop Chips
        const chipContainer = document.getElementById('buildingChips');
        let chipHtml = `<button class="chip ${currentTab === 'all' ? 'active' : ''}" onclick="setTab('all')">All <span class="chip-count">${allRooms.length}</span></button>`;
    
    // Mobile List
    const mobileContainer = document.getElementById('mobileBuildingList');
    let mobileHtml = `<button class="mobile-bldg-item ${currentTab === 'all' ? 'active' : ''}" onclick="setTab('all')">All <span>${currentTab === 'all' ? '<i class="fa-solid fa-check"></i>' : ''}</span></button>`;
    
    // Building Management Select & List
    const bldgSelect = document.getElementById('addRoomBuilding');
    const manageList = document.getElementById('buildingManageList');
    let selectHtml = '<option value="">건물 미지정 (단일 건물)</option>';
    let manageHtml = '';

    buildings.forEach(b => {
        const count = allRooms.filter(r => r && r.building === b).length;
        chipHtml += `<button class="chip ${currentTab === b ? 'active' : ''}" onclick="setTab('${b}')">${b} <span class="chip-count">${count}</span></button>`;
        mobileHtml += `<button class="mobile-bldg-item ${currentTab === b ? 'active' : ''}" onclick="setTab('${b}')">${b} <span>${currentTab === b ? '<i class="fa-solid fa-check"></i>' : ''}</span></button>`;
        
        selectHtml += `<option value="${b}">${b}</option>`;
        manageHtml += `
            <div style="border:1px solid var(--border);border-radius:4px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
                <div style="font-weight:700">${b}</div>
                <div style="display:flex;gap:6px">
                    <button class="btn-outline-sm" onclick="editBuilding('${b}')">수정</button>
                    <button class="btn-outline-sm" style="color:var(--danger);border-color:var(--danger)" onclick="deleteBuilding('${b}')">삭제</button>
                </div>
            </div>`;
    });
    
    if (chipContainer) chipContainer.innerHTML = chipHtml;
    if (mobileContainer) mobileContainer.innerHTML = mobileHtml;
    if (bldgSelect) bldgSelect.innerHTML = selectHtml;
    if (manageList) manageList.innerHTML = manageHtml;
    
        // Update Mobile Button Text
        const btn = document.getElementById('mobileBuildingBtn');
        if (btn) btn.innerHTML = `<i class="fa-solid fa-filter" style="color:var(--txt3)"></i> ${currentTab === 'all' ? 'All' : currentTab} <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem; margin-left:2px; color:var(--txt3)"></i>`;
    } catch (e) {
        document.getElementById('roomGrid').innerHTML = `<div style="color:red;padding:20px;grid-column:1/-1;">Error in renderTabs: ${e.message}</div>`;
        console.error(e);
    }
}

function setTab(tab) {
    currentTab = tab;
    renderTabs();
    renderTable();
    closeModal('mobileBuildingModal');
}

function addBuilding() {
    const name = prompt('새 건물/구역의 이름을 입력하세요:');
    if (name && name.trim()) {
        const trimmed = name.trim();
        if (allBuildings.includes(trimmed)) {
            showToast('이미 존재하는 건물/구역명입니다.', 'error');
        } else {
            allBuildings.push(trimmed);
            if (window.PmsAPI) window.PmsAPI.saveBuildings(allBuildings);
            renderTabs();
        }
    }
}

function editBuilding(oldName) {
    const newName = prompt('건물/구역의 새 이름을 입력하세요:', oldName);
    if (newName && newName.trim() && newName.trim() !== oldName) {
        const trimmed = newName.trim();
        if (allBuildings.includes(trimmed)) {
            showToast('이미 존재하는 건물/구역명입니다.', 'error');
        } else {
            const idx = allBuildings.indexOf(oldName);
            if (idx > -1) allBuildings[idx] = trimmed;
            
            allRooms.forEach(r => {
                if (r.building === oldName) r.building = trimmed;
            });
            if (window.PmsAPI) {
                window.PmsAPI.saveBuildings(allBuildings);
                window.PmsAPI.saveRooms(allRooms);
            }
            
            if (currentTab === oldName) currentTab = trimmed;
            renderTabs();
            renderTable();
        }
    }
}

function deleteBuilding(name) {
    const roomsInBuilding = allRooms.filter(r => r.building === name).length;
    let msg = `'${name}'을(를) 삭제하시겠습니까?`;
    if (roomsInBuilding > 0) {
        msg = `'${name}'에 속한 Room이 ${roomsInBuilding}개 있습니다.\\n정말 삭제하시겠습니까? (Room의 건물 정보가 '건물 미지정'으로 변경됩니다)`;
    }
    if (await showConfirm(msg)) {
        allBuildings = allBuildings.filter(b => b !== name);
        allRooms.forEach(r => {
            if (r.building === name) r.building = null;
        });
        if (window.PmsAPI) {
            window.PmsAPI.saveBuildings(allBuildings);
            window.PmsAPI.saveRooms(allRooms);
        }
        if (currentTab === name) currentTab = 'all';
        renderTabs();
        renderTable();
    }
}

function renderTable() {
    try {
        const search = document.getElementById('roomSearchInput').value.toLowerCase();
        const container = document.getElementById('roomGrid');
        container.innerHTML = '';
    
    const filtered = allRooms.filter(r => {
        if (!r) return false;
        if (currentTab !== 'all' && r.building !== currentTab) return false;
        if (search) {
            const rId = r.id ? r.id.toString().toLowerCase() : '';
            const rType = r.type ? r.type.toString().toLowerCase() : '';
            if (!rId.includes(search) && !rType.includes(search)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--txt3); background:var(--card); border-radius:var(--radius); border:1px solid var(--border)">등록된 Room이 없습니다.</div>';
        return;
    }

    filtered.forEach((r, idx) => {
        const bldgStr = r.building || '건물 미지정';
        const floorStr = r.floor ? `${r.floor}층` : '-';
        container.innerHTML += `
            <div class="room-card">
                <div class="room-card-header">
                    <div class="room-card-title"><i class="fa-solid fa-door-closed"></i> ${r.id}</div>
                    <div class="room-card-type">${r.type}</div>
                </div>
                <div class="room-card-info">
                    <div class="room-info-row"><i class="fa-solid fa-building"></i> ${bldgStr}</div>
                    <div class="room-info-row"><i class="fa-solid fa-layer-group"></i> ${floorStr}</div>
                </div>
                <div class="room-card-actions">
                    <button class="btn-icon" onclick="editRoom(${idx})" title="수정"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteRoom(${idx})" title="삭제"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        });
    } catch (e) {
        document.getElementById('roomGrid').innerHTML = `<div style="color:red;padding:20px;grid-column:1/-1;">Error in renderTable: ${e.message}</div>`;
        console.error(e);
    }
}

let editingIdx = -1;

function editRoom(idx) {
    editingIdx = idx;
    const r = allRooms[idx];
    document.getElementById('roomModalTitle').innerText = 'Room 정보 수정';
    document.getElementById('saveBtnText').innerText = '수정 Completed';
    
    document.getElementById('addRoomId').value = r.id;
    document.getElementById('addRoomFloor').value = r.floor || '';
    document.getElementById('addRoomType').value = r.type;
    document.getElementById('addRoomBuilding').value = r.building || '';
    
    openModal('addRoomModal');
}

// Override openModal for Add Room to clear fields
const originalOpenModal = openModal;
openModal = function(id) {
    if (id === 'addRoomModal' && event && event.currentTarget && event.currentTarget.innerText.includes('Add Room')) {
        editingIdx = -1;
        document.getElementById('roomModalTitle').innerText = 'Add Room';
        document.getElementById('saveBtnText').innerText = 'Add Room';
        document.getElementById('addRoomId').value = '';
        document.getElementById('addRoomFloor').value = '';
        document.getElementById('addRoomType').value = 'Standard';
        document.getElementById('addRoomBuilding').value = '';
    }
    originalOpenModal(id);
}

function saveRoom() {
    const id = document.getElementById('addRoomId').value;
    const floor = document.getElementById('addRoomFloor').value;
    const type = document.getElementById('addRoomType').value;
    const building = document.getElementById('addRoomBuilding').value || null;

    if (!id) {
        showToast('Room 번호를 입력해주세요.', 'error');
        return;
    }

    if (editingIdx >= 0) {
        allRooms[editingIdx] = { ...allRooms[editingIdx], id, floor: parseInt(floor)||0, type, building };
    } else {
        allRooms.push({ id, floor: parseInt(floor)||0, type, status: 'vacant-clean', building });
    }
    
    if (window.PmsAPI) window.PmsAPI.saveRooms(allRooms);
    
    closeModal('addRoomModal');
    renderTabs();
    renderTable();
}

async function deleteRoom(idx) {
    if (await showConfirm('이 Room을 삭제하시겠습니까?')) {
        allRooms.splice(idx, 1);
        if (window.PmsAPI) window.PmsAPI.saveRooms(allRooms);
        renderTabs();
        renderTable();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.PmsAPI) {
            allBuildings = await window.PmsAPI.getBuildings();
            allRooms = await window.PmsAPI.getAllRooms();
        }
        
        if (!Array.isArray(allBuildings)) allBuildings = [];
        if (!Array.isArray(allRooms)) allRooms = [];
        
        renderTabs();
        renderTable();
    } catch(e) { 
        document.getElementById('roomGrid').innerHTML = `<div style="color:red;padding:20px;grid-column:1/-1;">Fatal Init Error: ${e.message}</div>`;
        console.error(e); 
    }
});


// Sync language selector to stored preference
(function(){
    var sel = document.getElementById('langSelect');
    if(sel) sel.value = localStorage.getItem('pms_lang') || 'ko';
})();
