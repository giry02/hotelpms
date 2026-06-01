import os

file_path = os.path.join('dashboard', 'frontdesk', 'groups_blocks.html')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change the title
content = content.replace('<title>Groups - Hotel PMS</title>', '<title>행사 및 객실배정 - Hotel PMS</title>')
content = content.replace('<h1 data-i18n-key="Groups">단체 행사/블록 관리</h1>', '<h1 data-i18n-key="Block Allocations">행사 및 객실배정</h1>')

# Update the newGroupModal's ngAgency select
old_agency_select = """                <select id="ngAgency" class="form-input" style="width:100%">
                    <option>삼성전자 (Samsung Electronics)</option>
                    <option>모두투어 (Modetour)</option>
                    <option>하나투어 (Hana Tour)</option>
                    <option>한화이글스 (Hanwha Eagles)</option>
                    <option>개인(Private Event)</option>
                </select>"""

new_agency_select = """                <select id="ngAgency" class="form-input" style="width:100%">
                    <!-- Loaded dynamically from pms_companies -->
                </select>"""

content = content.replace(old_agency_select, new_agency_select)

# Add JS to load companies
js_injection = """
function loadCompaniesForDropdown() {
    const stored = localStorage.getItem('pms_companies');
    const sel = document.getElementById('ngAgency');
    if (!sel) return;
    sel.innerHTML = '<option value="">주관 업체를 선택하세요</option>';
    
    if (stored) {
        const comps = JSON.parse(stored);
        comps.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.name} (${c.type === 'Corporate' ? '기업' : '여행사/기타'})`;
            sel.appendChild(opt);
        });
    }
}

// Override openNewGroupModal to ensure companies are loaded
const origOpenNewGroupModal = openNewGroupModal;
window.openNewGroupModal = function() {
    loadCompaniesForDropdown();
    
    // Check if we arrived here from groups_companies with a preselected company
    const urlParams = new URLSearchParams(window.location.search);
    const preComp = urlParams.get('comp');
    if(preComp) {
        setTimeout(() => { document.getElementById('ngAgency').value = preComp; }, 50);
    }
    
    origOpenNewGroupModal();
}
"""

content = content.replace('function updateFilterCounts()', js_injection + '\nfunction updateFilterCounts()')

# Add a script tag to auto-open if we came from groups_companies.html
auto_open_script = """
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('newBlock') === 'true') {
        setTimeout(() => { openNewGroupModal(); }, 300);
    }
});
"""
content = content.replace('</body>', auto_open_script + '\n</body>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched groups_blocks.html')
