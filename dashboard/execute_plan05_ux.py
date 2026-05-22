import os

base_path = r"E:\AI_Project\Hotel_PMS"
dashboard_path = os.path.join(base_path, "dashboard")

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. rates.html: Batch Update Modal
rates_path = os.path.join(dashboard_path, "settings", "rates.html")
if os.path.exists(rates_path):
    r_content = read_file(rates_path)
    
    batch_btn = '<button class="btn-primary-sm" onclick="openModal(\'batchUpdateModal\')"><i class="fa-solid fa-bolt"></i> 일괄 업데이트 (Batch Update)</button>'
    if "일괄 업데이트" not in r_content:
        # insert button
        r_content = r_content.replace('<div class="filter-right">', f'<div class="filter-right">\n                {batch_btn}')
        
        # insert modal
        batch_modal = """
<!-- BATCH UPDATE MODAL -->
<div class="modal-overlay" id="batchUpdateModal">
    <div class="modal-card">
        <div class="modal-header">
            <h3>요금 일괄 업데이트</h3>
            <button class="modal-close" onclick="closeModal('batchUpdateModal')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div style="display:flex; flex-direction:column; gap:15px;">
                <div>
                    <label style="font-weight:600; font-size:0.85rem">기간 설정 (Date Range)</label>
                    <div style="display:flex; gap:10px; margin-top:5px">
                        <input type="date" class="form-input" style="flex:1">
                        <span style="display:flex;align-items:center">~</span>
                        <input type="date" class="form-input" style="flex:1">
                    </div>
                </div>
                <div>
                    <label style="font-weight:600; font-size:0.85rem">적용 객실 타입</label>
                    <select class="form-input" style="width:100%; margin-top:5px">
                        <option>전체 (All Room Types)</option>
                        <option>Standard Double</option>
                        <option>Deluxe King</option>
                    </select>
                </div>
                <div>
                    <label style="font-weight:600; font-size:0.85rem">적용 요일</label>
                    <div style="display:flex; gap:8px; margin-top:5px">
                        <label><input type="checkbox" checked> 월</label>
                        <label><input type="checkbox" checked> 화</label>
                        <label><input type="checkbox" checked> 수</label>
                        <label><input type="checkbox" checked> 목</label>
                        <label style="color:var(--primary)"><input type="checkbox" checked> 금</label>
                        <label style="color:var(--primary)"><input type="checkbox" checked> 토</label>
                        <label style="color:var(--danger)"><input type="checkbox" checked> 일</label>
                    </div>
                </div>
                <div>
                    <label style="font-weight:600; font-size:0.85rem">새 요금 ($)</label>
                    <input type="number" class="form-input" style="width:100%; margin-top:5px" placeholder="예: 150">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-outline" onclick="closeModal('batchUpdateModal')">취소</button>
            <button class="btn-primary-sm" onclick="showToast('요금이 일괄 업데이트 되었습니다.'); closeModal('batchUpdateModal');"><i class="fa-solid fa-check"></i> 일괄 적용</button>
        </div>
    </div>
</div>
"""
        r_content = r_content.replace('</body>', batch_modal + '\n</body>')
        write_file(rates_path, r_content)

# 2. staff.html: Password Reset & Delete button isolation
staff_path = os.path.join(dashboard_path, "settings", "staff.html")
if os.path.exists(staff_path):
    s_content = read_file(staff_path)
    
    if "비밀번호 초기화" not in s_content:
        pwd_btn = '<button class="btn-outline-sm" style="width:100%; margin-top:10px" onclick="showToast(\'임시 비밀번호가 이메일로 발송되었습니다.\')"><i class="fa-solid fa-key"></i> 비밀번호 초기화 (Reset Password)</button>'
        # find the end of modal-body for staff edit
        s_content = s_content.replace('</select>\n                </div>\n            </div>\n        </div>\n        <div class="modal-footer">', 
                                      '</select>\n                </div>\n            </div>\n            ' + pwd_btn + '\n        </div>\n        <div class="modal-footer" style="display:flex; justify-content:space-between">')
        
        # fix the footer layout: move delete button to left
        del_btn = '<button class="btn-outline" style="color:var(--danger);border-color:var(--danger)"><i class="fa-solid fa-trash"></i> 삭제</button>'
        s_content = s_content.replace('<button class="btn-outline" onclick="closeModal(\'staffModal\')">Cancel</button>\n            <button class="btn-primary-sm">Save</button>',
                                      f'<div>{del_btn}</div>\n            <div style="display:flex;gap:10px">\n                <button class="btn-outline" onclick="closeModal(\'staffModal\')">Cancel</button>\n                <button class="btn-primary-sm">Save</button>\n            </div>')
        write_file(staff_path, s_content)

# 3. rooms.html: Vacant filter fix
rooms_path = os.path.join(dashboard_path, "settings", "rooms.html")
if os.path.exists(rooms_path):
    rm_content = read_file(rooms_path)
    
    # Update setFilter JS
    if "currentFilter = status;" in rm_content:
        vacant_fix = """
    if (status === 'vacant') {
        document.querySelectorAll('.chip').forEach(c => {
            if(c.innerText.includes('Vacant')) c.classList.add('active');
            else c.classList.remove('active');
        });
    } else {
"""
        rm_content = rm_content.replace("    currentFilter = status;\n    \n    // Update Desktop Chips", "    currentFilter = status;\n    " + vacant_fix + "        // Update Desktop Chips")
        # Add closing brace for else
        rm_content = rm_content.replace("        else c.classList.remove('active');\n    });", "        else c.classList.remove('active');\n    });\n    }")
        write_file(rooms_path, rm_content)

# 4. hotel-settings.html: Multi-lang tabs
hotel_path = os.path.join(dashboard_path, "settings", "hotel-settings.html")
if os.path.exists(hotel_path):
    h_content = read_file(hotel_path)
    
    if "lang-tab" not in h_content:
        tabs_html = """
                    <div style="display:flex;gap:5px;margin-bottom:8px">
                        <button class="lang-tab active" style="padding:4px 12px;font-size:0.75rem;border:1px solid var(--border);background:var(--primary);color:#fff;border-radius:4px;cursor:pointer">한국어</button>
                        <button class="lang-tab" style="padding:4px 12px;font-size:0.75rem;border:1px solid var(--border);background:#fff;color:var(--txt2);border-radius:4px;cursor:pointer">English</button>
                    </div>
"""
        h_content = h_content.replace('<textarea class="form-input" style="height:100px; resize:vertical">Grand Saigon Hotel is...</textarea>',
                                      tabs_html + '<textarea class="form-input" style="height:100px; resize:vertical">Grand Saigon Hotel is...</textarea>')
        
        sticky_save = 'style="position:sticky; top:20px; z-index:10"'
        h_content = h_content.replace('<button class="btn-primary">', f'<button class="btn-primary" {sticky_save}>')
        write_file(hotel_path, h_content)

print("Plan 05 UX Improvements script executed successfully.")
