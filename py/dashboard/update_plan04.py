import os
import re

base_path = r"E:\AI_Project\Hotel_PMS"
dashboard_path = os.path.join(base_path, "dashboard")

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Housekeeping Audit Log
hk_path = os.path.join(dashboard_path, "operations", "housekeeping.html")
if os.path.exists(hk_path):
    hk_content = read_file(hk_path)
    
    log_modal = """
<!-- HOUSEKEEPING AUDIT LOG MODAL -->
<div class="modal-overlay" id="hkLogModal">
    <div class="modal-card">
        <div class="modal-header">
            <h3 id="hkLogTitle">작업 이력 (Audit Log)</h3>
            <button class="modal-close" onclick="closeModal('hkLogModal')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" style="padding:0">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>시간</th>
                        <th>담당자</th>
                        <th>액션 (상태 변경)</th>
                    </tr>
                </thead>
                <tbody id="hkLogBody">
                    <!-- filled by js -->
                </tbody>
            </table>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:flex-end;padding:16px">
            <button class="btn-primary-sm" onclick="closeModal('hkLogModal')">닫기</button>
        </div>
    </div>
</div>
"""
    if "hkLogModal" not in hk_content:
        hk_content = hk_content.replace("</body>", log_modal + "\n</body>")
    
    js_func = """
function showHkLog(roomId) {
    document.getElementById('hkLogTitle').textContent = roomId + '호 작업 이력';
    const logs = [
        {time: '14:30', user: 'Maria (Supervisor)', action: '점검 완료 (To Inspect -> Completed)'},
        {time: '14:15', user: 'Anna (Maid)', action: '청소 완료 (Pending Clean -> To Inspect)'},
        {time: '11:00', user: 'System', action: '체크아웃 접수 (Occupied -> Pending Clean)'}
    ];
    let html = '';
    logs.forEach(l => {
        html += `<tr><td style="color:var(--txt2);font-size:0.85rem">${l.time}</td><td style="font-weight:600">${l.user}</td><td>${l.action}</td></tr>`;
    });
    document.getElementById('hkLogBody').innerHTML = html;
    openModal('hkLogModal');
}
"""
    if "showHkLog" not in hk_content:
        hk_content = hk_content.replace("updateKpis();", js_func + "\nupdateKpis();")
        
    write_file(hk_path, hk_content)


# 2. Reservation Timeline B2B Badge
tl_path = os.path.join(dashboard_path, "frontdesk", "reservation-timeline.html")
if os.path.exists(tl_path):
    tl_content = read_file(tl_path)
    
    # Update timeline JS
    b2b_js = """
        const isB2B = ['Agoda', 'Booking', 'Expedia'].includes(res.channel);
        const b2bBadge = isB2B ? `<span style="background:#000;color:#fff;font-size:0.6rem;padding:2px 4px;border-radius:4px;margin-right:4px">B2B</span>` : '';
        block.innerHTML = `<span class="tl-block-text">${b2bBadge}${res.guest}</span>`;
"""
    if "b2bBadge" not in tl_content:
        tl_content = tl_content.replace("block.innerHTML = `<span class=\"tl-block-text\">${res.guest}</span>`;", b2b_js)
    
    write_file(tl_path, tl_content)


# 3. Folio B2B Ledger Tab
folio_path = os.path.join(dashboard_path, "operations", "folio.html")
if os.path.exists(folio_path):
    f_content = read_file(folio_path)
    
    # Add tab button
    tab_btn = '<button class="tab-btn" onclick="switchTab(\'b2b\')"><i class="fa-solid fa-building"></i> B2B / TA 정산 (AR)</button>'
    if "B2B / TA 정산" not in f_content:
        f_content = f_content.replace('</nav>', f'    {tab_btn}\n        </nav>')
        
    # Add tab content
    tab_html = """
        <!-- B2B Tab -->
        <div class="tab-pane" id="tab-b2b">
            <div class="filter-bar">
                <button class="btn-primary-sm" onclick="showToast('Invoice 생성 창')"><i class="fa-solid fa-file-invoice"></i> 인보이스 (Invoice) 생성</button>
            </div>
            <table class="data-table" style="margin-top:20px">
                <thead>
                    <tr>
                        <th>거래처(TA/Corp)</th>
                        <th>유형</th>
                        <th>미수금 잔액(AR)</th>
                        <th>지급 수수료(AP)</th>
                        <th>상태</th>
                        <th>액션</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight:700">Agoda (B2B)</td>
                        <td>OTA</td>
                        <td style="color:var(--primary)">$1,250.00</td>
                        <td style="color:var(--danger)">$250.00</td>
                        <td><span class="role-badge" style="background:var(--warning-lt);color:var(--warning)">미정산</span></td>
                        <td><button class="btn-outline-sm">정산/수납</button></td>
                    </tr>
                    <tr>
                        <td style="font-weight:700">Samsung Electronics</td>
                        <td>Corporate</td>
                        <td style="color:var(--primary)">$4,500.00</td>
                        <td>-</td>
                        <td><span class="role-badge" style="background:var(--success-lt);color:var(--success)">완료</span></td>
                        <td><button class="btn-outline-sm">내역 보기</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
"""
    if "id=\"tab-b2b\"" not in f_content:
        f_content = f_content.replace('    </div>\n</div>\n\n<script>', tab_html + '    </div>\n</div>\n\n<script>')
    
    write_file(folio_path, f_content)


# 4. Sidebar Reorganization
sb_path = os.path.join(dashboard_path, "common", "js", "sidebar.js")
if os.path.exists(sb_path):
    sb_content = read_file(sb_path)
    
    # Remove from Operations
    ops_rooms = """                {
                    icon: 'fa-bed', label: 'Room Mgmt', id: 'rooms',
                    mainHref: BASE + 'operations/rooms.html',
                    children: [
                        { label: 'Room Mgmt', href: BASE + 'operations/rooms.html' },
                        { label: 'Room Types', href: BASE + 'operations/room-setup.html' },
                    ]
                },
"""
    ops_rates = "                { icon: 'fa-tags',  label: 'Rates Calendar', href: BASE + 'operations/rates.html' },\n"
    
    sb_content = sb_content.replace(ops_rooms, "")
    sb_content = sb_content.replace(ops_rates, "")
    
    # Add to Settings
    settings_insert = "            items: [\n" + ops_rooms + ops_rates
    sb_content = sb_content.replace("            items: [\n                { icon: 'fa-gear',", settings_insert + "                { icon: 'fa-gear',")
    
    write_file(sb_path, sb_content)

print("Plan 04 Part 1 executed successfully.")
