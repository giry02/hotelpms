import os

file_path = os.path.join('dashboard', 'frontdesk', 'groups.html')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the modals
content = content.replace(
    '<input type="text" class="form-input" style="width:100%" placeholder="예: Samsung Tech Conference 2026">',
    '<input type="text" id="ngName" class="form-input" style="width:100%" placeholder="예: Samsung Tech Conference 2026">'
)
content = content.replace(
    '<h3 class="modal-title">신규 단체 등록</h3>',
    '<h3 class="modal-title" id="ngModalTitle">신규 단체 등록</h3>\n            <input type="hidden" id="ngId" value="">'
)
content = content.replace(
    '<select class="form-input" style="width:100%">\n                    <option>기업 행사 / 컨퍼런스</option>',
    '<select id="ngType" class="form-input" style="width:100%">\n                    <option>기업 행사 / 컨퍼런스</option>'
)
content = content.replace(
    '<label class="form-label">체크인 <span style="color:var(--danger)">*</span></label>\n                    <input type="date" class="form-input" style="width:100%">',
    '<label class="form-label">체크인 <span style="color:var(--danger)">*</span></label>\n                    <input type="date" id="ngCheckin" class="form-input" style="width:100%">'
)
content = content.replace(
    '<label class="form-label">체크아웃 <span style="color:var(--danger)">*</span></label>\n                    <input type="date" class="form-input" style="width:100%">',
    '<label class="form-label">체크아웃 <span style="color:var(--danger)">*</span></label>\n                    <input type="date" id="ngCheckout" class="form-input" style="width:100%">'
)
content = content.replace(
    '<label class="form-label">블록 객실 수 <span style="color:var(--danger)">*</span></label>\n                    <input type="number" class="form-input" style="width:100%" min="1" placeholder="10">',
    '<label class="form-label">블록 객실 수 <span style="color:var(--danger)">*</span></label>\n                    <input type="number" id="ngBlock" class="form-input" style="width:100%" min="1" placeholder="10">'
)
content = content.replace(
    '<label class="form-label">총 인원 (PAX)</label>\n                    <input type="number" class="form-input" style="width:100%" min="1" placeholder="20">',
    '<label class="form-label">총 인원 (PAX)</label>\n                    <input type="number" id="ngPax" class="form-input" style="width:100%" min="1" placeholder="20">'
)
content = content.replace(
    '<select class="form-input" style="width:100%">\n                        <option>Master Folio (단체 일괄)</option>',
    '<select id="ngRouting" class="form-input" style="width:100%">\n                        <option>Master Folio (단체 일괄)</option>'
)
content = content.replace(
    '<select class="form-input" style="width:100%">\n                        <option>김지훈 (영업팀장)</option>',
    '<select id="ngSales" class="form-input" style="width:100%">\n                        <option>김지훈 (영업팀장)</option>'
)
content = content.replace(
    '<input type="text" class="form-input" style="width:100%" placeholder="예: 홍길동 / 010-1234-5678">',
    '<input type="text" id="ngContact" class="form-input" style="width:100%" placeholder="예: 홍길동 / 010-1234-5678">'
)
content = content.replace(
    '<textarea class="form-input" style="width:100%;min-height:70px;resize:vertical" placeholder="VIP 요청, 조식 여부, 특별 케이터링 등..."></textarea>',
    '<textarea id="ngNote" class="form-input" style="width:100%;min-height:70px;resize:vertical" placeholder="VIP 요청, 조식 여부, 특별 케이터링 등..."></textarea>'
)
content = content.replace(
    '<button class="btn-primary-sm" onclick="createGroup()"><i class="fa-solid fa-check"></i> 단체 등록</button>',
    '<button class="btn-primary-sm" onclick="saveGroup()"><i class="fa-solid fa-check"></i> 저장</button>'
)
content = content.replace(
    '<button class="btn-primary-sm" style="height:38px;padding:0 16px" onclick="openModal(\'newGroupModal\')">',
    '<button class="btn-primary-sm" style="height:38px;padding:0 16px" onclick="openNewGroupModal()">'
)

content = content.replace(
    '<button class="btn-outline-sm" onclick="showDetail(\'${g.id}\')"><i class="fa-solid fa-eye"></i> 상세</button>',
    '<button class="btn-outline-sm" onclick="showDetail(\'${g.id}\')" title="상세"><i class="fa-solid fa-eye"></i></button>\n                    <button class="btn-outline-sm" onclick="editGroup(\'${g.id}\')" title="수정"><i class="fa-solid fa-pen"></i></button>\n                    <button class="btn-outline-sm" onclick="deleteGroup(\'${g.id}\')" title="삭제" style="color:var(--danger);border-color:var(--danger)"><i class="fa-solid fa-trash"></i></button>'
)

# Replace the createGroup function with our new functions
import re
js_funcs = """
function openNewGroupModal() {
    document.getElementById('ngModalTitle').textContent = '신규 단체 등록';
    document.getElementById('ngId').value = '';
    document.getElementById('ngName').value = '';
    document.getElementById('ngCheckin').value = '';
    document.getElementById('ngCheckout').value = '';
    document.getElementById('ngBlock').value = '';
    document.getElementById('ngPax').value = '';
    document.getElementById('ngContact').value = '';
    document.getElementById('ngNote').value = '';
    openModal('newGroupModal');
}

function editGroup(id) {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    document.getElementById('ngModalTitle').textContent = '단체 정보 수정';
    document.getElementById('ngId').value = g.id;
    document.getElementById('ngName').value = g.name || '';
    document.getElementById('ngType').value = g.type || '기업 행사 / 컨퍼런스';
    document.getElementById('ngCheckin').value = g.checkin || '';
    document.getElementById('ngCheckout').value = g.checkout || '';
    document.getElementById('ngBlock').value = g.block || '';
    document.getElementById('ngPax').value = g.pax || '';
    
    const routingSel = document.getElementById('ngRouting');
    const rMatch = Array.from(routingSel.options).find(o => o.value.includes(g.routing) || g.routing.includes(o.value));
    if (rMatch) routingSel.value = rMatch.value;

    const salesSel = document.getElementById('ngSales');
    const sMatch = Array.from(salesSel.options).find(o => o.value.includes(g.sales) || g.sales.includes(o.value));
    if (sMatch) salesSel.value = sMatch.value;

    document.getElementById('ngContact').value = g.contact || '';
    document.getElementById('ngNote').value = g.note || '';
    
    openModal('newGroupModal');
}

function saveGroup() {
    const id = document.getElementById('ngId').value;
    const name = document.getElementById('ngName').value;
    if (!name) { alert('단체명을 입력하세요.'); return; }
    
    const type = document.getElementById('ngType').value;
    const checkin = document.getElementById('ngCheckin').value;
    const checkout = document.getElementById('ngCheckout').value;
    const block = document.getElementById('ngBlock').value || 0;
    const pax = document.getElementById('ngPax').value || 0;
    const routing = document.getElementById('ngRouting').value;
    const sales = document.getElementById('ngSales').value.split(' ')[0];
    const contact = document.getElementById('ngContact').value;
    const note = document.getElementById('ngNote').value;

    if (id) {
        const g = groups.find(x => x.id === id);
        if (g) {
            g.name = name; g.type = type; g.checkin = checkin; g.checkout = checkout;
            g.block = parseInt(block); g.pax = parseInt(pax); g.routing = routing;
            g.sales = sales; g.contact = contact; g.note = note;
        }
        showToast('단체 정보가 수정되었습니다.');
    } else {
        const newId = 'GRP-' + Math.floor(Math.random()*10000);
        groups.unshift({
            id: newId, name, type, checkin, checkout, block: parseInt(block),
            pax: parseInt(pax), routing, sales, contact, note,
            status: 'confirmed', pickup: 0
        });
        showToast('신규 단체가 등록되었습니다.');
    }
    
    localStorage.setItem('pms_groups', JSON.stringify(groups));
    closeModal('newGroupModal');
    updateFilterCounts();
    renderGroups();
}

function deleteGroup(id) {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    
    if (confirm(`정말 [${g.name}] 단체를 삭제하시겠습니까? 관련 예약에 영향을 줄 수 있습니다.`)) {
        groups = groups.filter(x => x.id !== id);
        localStorage.setItem('pms_groups', JSON.stringify(groups));
        showToast('단체가 삭제되었습니다.');
        updateFilterCounts();
        renderGroups();
    }
}
"""

content = re.sub(r'function createGroup\(\)\s*\{\s*showToast\(\'신규 단체가 등록되었습니다\.\'\);\s*closeModal\(\'newGroupModal\'\);\s*\}', js_funcs, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched Python groups script')
