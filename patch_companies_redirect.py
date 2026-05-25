import os

file_path = os.path.join('dashboard', 'frontdesk', 'groups_companies.html')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block_flow = """// Block Allocation Flow
function openBlockModal(compId) {
    const c = companies.find(x => x.id === compId);
    if(!c) return;
    document.getElementById('blockCompId').value = c.id;
    document.getElementById('blockCompNameDisplay').textContent = c.name;
    document.getElementById('blockEventName').value = '';
    document.getElementById('blockCin').value = '';
    document.getElementById('blockCout').value = '';
    
    document.getElementById('allocationContainer').innerHTML = '';
    addAllocationRow(); // default row
    
    openModal('blockModal');
}

function addAllocationRow(type='Standard Double', count=1, rate='') {
    const container = document.getElementById('allocationContainer');
    const row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '2fr 1fr 1.5fr auto';
    row.style.gap = '8px';
    
    row.innerHTML = `
        <select class="form-input alloc-type" style="padding:6px 10px; font-size:0.85rem;">
            <option ${type==='Standard Double'?'selected':''}>Standard Double</option>
            <option ${type==='Deluxe Twin'?'selected':''}>Deluxe Twin</option>
            <option ${type==='Suite'?'selected':''}>Suite</option>
        </select>
        <input type="number" class="form-input alloc-count" style="padding:6px 10px; font-size:0.85rem;" min="1" value="${count}" onchange="calcBlock()" placeholder="수량">
        <input type="number" class="form-input alloc-rate" style="padding:6px 10px; font-size:0.85rem;" value="${rate}" placeholder="가변할인가(KRW)">
        <button type="button" class="btn-outline-sm" style="color:var(--danger); border-color:var(--danger); padding:4px 8px;" onclick="this.parentElement.remove(); calcBlock();"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
    calcBlock();
}

function calcBlock() {
    const counts = document.querySelectorAll('.alloc-count');
    let total = 0;
    counts.forEach(c => total += parseInt(c.value || 0));
    document.getElementById('blockTotal').textContent = total;
}

function saveBlock() {
    const ename = document.getElementById('blockEventName').value;
    if(!ename) { alert('행사명을 입력해주세요.'); return; }
    
    // In a real system, this would save to pms_blocks or a reservations array.
    showToast(`행사 [${ename}]에 객실 배정이 완료되었습니다! (임시 시뮬레이션)`);
    closeModal('blockModal');
}"""

new_block_flow = """// Redirect to Block Allocation Page
function openBlockModal(compId) {
    window.location.href = `groups_blocks.html?newBlock=true&comp=${compId}`;
}"""

content = content.replace(old_block_flow, new_block_flow)

# Also remove the block modal HTML
start_modal = content.find("<!-- 2단계: 행사 및 객실 배정 모달 -->")
end_modal = content.find("<script src=\"../common/js/sidebar.js\">")

if start_modal != -1 and end_modal != -1:
    content = content[:start_modal] + content[end_modal:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated groups_companies.html')
