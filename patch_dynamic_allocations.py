import os

file_path = os.path.join('dashboard', 'frontdesk', 'groups.html')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Modal HTML
old_block_html = """            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                    <label class="form-label">블록 객실 수 <span style="color:var(--danger)">*</span></label>
                    <input type="number" id="ngBlock" class="form-input" style="width:100%" min="1" placeholder="10">
                </div>
                <div>
                    <label class="form-label">총 인원 (PAX)</label>
                    <input type="number" id="ngPax" class="form-input" style="width:100%" min="1" placeholder="20">
                </div>
            </div>"""

new_block_html = """            <!-- Dynamic Room Allocation -->
            <div style="background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <label class="form-label" style="margin:0;">객실 할당 및 가변 단가 설정 <span style="color:var(--danger)">*</span></label>
                    <button class="btn-outline-sm" onclick="addAllocationRow()" type="button"><i class="fa-solid fa-plus"></i> 객실 추가</button>
                </div>
                <div id="allocationContainer" style="display:flex; flex-direction:column; gap:8px;">
                    <!-- Rows will be added here via JS -->
                </div>
                <div style="margin-top:12px; font-weight:600; font-size:0.85rem; color:var(--txt);">
                    총 할당 객실 수: <span id="ngTotalBlock" style="color:var(--primary); font-size:1rem;">0</span> 실
                </div>
            </div>
            <div>
                <label class="form-label">총 인원 (PAX)</label>
                <input type="number" id="ngPax" class="form-input" style="width:100%" min="1" placeholder="20">
            </div>"""

content = content.replace(old_block_html, new_block_html)

# 2. Add JavaScript Functions
js_to_add = """
function addAllocationRow(type='Standard Double', count=1, rate='') {
    const container = document.getElementById('allocationContainer');
    const row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '2fr 1fr 1.5fr auto';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    
    row.innerHTML = `
        <select class="form-input alloc-type" style="width:100%; padding:6px 10px; font-size:0.85rem;">
            <option ${type==='Standard Double'?'selected':''}>Standard Double</option>
            <option ${type==='Deluxe Twin'?'selected':''}>Deluxe Twin</option>
            <option ${type==='Suite'?'selected':''}>Suite</option>
        </select>
        <input type="number" class="form-input alloc-count" style="width:100%; padding:6px 10px; font-size:0.85rem;" min="1" value="${count}" onchange="calcTotalBlock()" placeholder="수량">
        <input type="number" class="form-input alloc-rate" style="width:100%; padding:6px 10px; font-size:0.85rem;" value="${rate}" placeholder="특별단가(KRW)">
        <button type="button" class="btn-outline-sm" style="color:var(--danger); border-color:var(--danger); padding:4px 8px;" onclick="this.parentElement.remove(); calcTotalBlock();"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
    calcTotalBlock();
}

function calcTotalBlock() {
    const counts = document.querySelectorAll('.alloc-count');
    let total = 0;
    counts.forEach(c => total += parseInt(c.value || 0));
    document.getElementById('ngTotalBlock').textContent = total;
}

// Override existing openNewGroupModal
function openNewGroupModal() {
    document.getElementById('ngModalTitle').textContent = '신규 행사(블록) 등록';
    document.getElementById('ngId').value = '';
    document.getElementById('ngName').value = '';
    document.getElementById('ngAgency').selectedIndex = 0;
    document.getElementById('ngCheckin').value = '';
    document.getElementById('ngCheckout').value = '';
    document.getElementById('ngPax').value = '';
    document.getElementById('ngContact').value = '';
    document.getElementById('ngNote').value = '';
    
    document.getElementById('allocationContainer').innerHTML = '';
    addAllocationRow(); // Add one default row
    
    openModal('newGroupModal');
}

// Override existing saveGroup
function saveGroup() {
    const id = document.getElementById('ngId').value;
    const name = document.getElementById('ngName').value;
    if (!name) { alert('행사(블록)명을 입력하세요.'); return; }
    
    const agency = document.getElementById('ngAgency').value;
    const type = document.getElementById('ngType').value;
    const checkin = document.getElementById('ngCheckin').value;
    const checkout = document.getElementById('ngCheckout').value;
    const pax = document.getElementById('ngPax').value || 0;
    const routing = document.getElementById('ngRouting').value;
    const sales = document.getElementById('ngSales').value.split(' ')[0];
    const contact = document.getElementById('ngContact').value;
    const note = document.getElementById('ngNote').value;

    // Collect Allocations
    const allocRows = document.getElementById('allocationContainer').children;
    let allocations = [];
    let block = 0;
    for(let i=0; i<allocRows.length; i++) {
        const row = allocRows[i];
        const rType = row.querySelector('.alloc-type').value;
        const rCount = parseInt(row.querySelector('.alloc-count').value || 0);
        const rRate = parseInt(row.querySelector('.alloc-rate').value || 0);
        if (rCount > 0) {
            allocations.push({ type: rType, count: rCount, rate: rRate });
            block += rCount;
        }
    }
    
    if (block === 0) { alert('최소 1개 이상의 객실을 할당해야 합니다.'); return; }

    if (id) {
        const g = groups.find(x => x.id === id);
        if (g) {
            g.name = name; g.agency = agency; g.type = type; g.checkin = checkin; g.checkout = checkout;
            g.block = block; g.allocations = allocations; g.pax = parseInt(pax); g.routing = routing;
            g.sales = sales; g.contact = contact; g.note = note;
        }
        showToast('행사 정보가 수정되었습니다.');
    } else {
        const newId = 'GRP-' + Math.floor(Math.random()*10000);
        groups.unshift({
            id: newId, name, agency, type, checkin, checkout, block: block, allocations: allocations,
            pax: parseInt(pax), routing, sales, contact, note,
            status: 'confirmed', pickup: 0
        });
        showToast('신규 행사 블록이 등록되었습니다.');
    }
    
    localStorage.setItem('pms_groups', JSON.stringify(groups));
    closeModal('newGroupModal');
    updateFilterCounts();
    renderGroups();
}

// Override existing editGroup
function editGroup(id) {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    document.getElementById('ngModalTitle').textContent = '행사 정보 수정';
    document.getElementById('ngId').value = g.id;
    document.getElementById('ngName').value = g.name || '';
    
    if(g.agency) {
        const agencySel = document.getElementById('ngAgency');
        const aMatch = Array.from(agencySel.options).find(o => o.value.includes(g.agency) || g.agency.includes(o.value));
        if (aMatch) agencySel.value = aMatch.value;
    }
    
    document.getElementById('ngType').value = g.type || '기업 행사 / 컨퍼런스';
    document.getElementById('ngCheckin').value = g.checkin || '';
    document.getElementById('ngCheckout').value = g.checkout || '';
    document.getElementById('ngPax').value = g.pax || '';
    
    const routingSel = document.getElementById('ngRouting');
    const rMatch = Array.from(routingSel.options).find(o => o.value.includes(g.routing) || g.routing.includes(o.value));
    if (rMatch) routingSel.value = rMatch.value;

    const salesSel = document.getElementById('ngSales');
    const sMatch = Array.from(salesSel.options).find(o => o.value.includes(g.sales) || g.sales.includes(o.value));
    if (sMatch) salesSel.value = sMatch.value;

    document.getElementById('ngContact').value = g.contact || '';
    document.getElementById('ngNote').value = g.note || '';
    
    // Populate Allocations
    document.getElementById('allocationContainer').innerHTML = '';
    if (g.allocations && g.allocations.length > 0) {
        g.allocations.forEach(a => {
            addAllocationRow(a.type, a.count, a.rate);
        });
    } else {
        // Fallback for old groups
        addAllocationRow('Standard Double', g.block || 1, '');
    }
    
    openModal('newGroupModal');
}
"""

import re
# We need to replace the old openNewGroupModal, saveGroup, and editGroup.
# The safest way is to append the new ones at the very end of the <script> block, 
# which will overwrite the previous definitions in the global scope.

# Find the end of the script tag right before updateFilterCounts
content = content.replace("</script>\n\n<script>\nfunction updateFilterCounts()", "\n" + js_to_add + "\n</script>\n\n<script>\nfunction updateFilterCounts()")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched groups.html for dynamic allocations')
