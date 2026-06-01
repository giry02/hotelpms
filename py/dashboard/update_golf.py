import os
import re

file_path = r"E:\AI_Project\Hotel_PMS\dashboard\operations\golf.html"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

modal_body_new = """<div class="modal-body" style="padding:20px;display:flex;flex-direction:column;gap:16px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">호실 선택 (Room) <span style="color:var(--danger)">*</span></label>
                    <select id="golfRoom" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;background:#fff" onchange="autoFillGuest('golf')">
                        <option value="">선택...</option>
                        <option value="1401">1401</option>
                        <option value="0807">0807</option>
                        <option value="1205">1205</option>
                    </select>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">고객명 (Guest) <span style="color:var(--danger)">*</span></label>
                    <input type="text" id="golfGuest" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%" placeholder="자동 입력">
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">국적 (Nationality)</label>
                    <input type="text" id="golfNation" readonly style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;background:#f1f5f9" placeholder="자동 입력">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">에이전시 (Agency)</label>
                    <input type="text" id="golfAgency" readonly style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;background:#f1f5f9" placeholder="자동 입력">
                </div>
            </div>
            <hr style="border:none;border-top:1px solid var(--border2)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">이용 일시 (Date) <span style="color:var(--danger)">*</span></label>
                    <input type="date" id="golfDate" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">티타임 (Tee Time) <span style="color:var(--danger)">*</span></label>
                    <input type="time" id="golfTime" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%">
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">코스 (Course) <span style="color:var(--danger)">*</span></label>
                    <select id="golfCourse" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;background:#fff">
                        <option>썬밸리 CC (Sun Valley)</option>
                        <option>스카이72 (SKY72)</option>
                    </select>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">인원 / 홀 (Pax / Holes) <span style="color:var(--danger)">*</span></label>
                    <div style="display:flex;gap:8px">
                        <input type="number" id="golfPax" style="flex:1;height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);" placeholder="인원(명)">
                        <select id="golfHoles" style="flex:1;height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);background:#fff">
                            <option>9홀</option>
                            <option selected>18홀</option>
                            <option>27홀</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>"""

script_new = """<script>
// Mock guest registry for auto-fill based on room
const dummyGuests = {
    '1401': { name: 'Tran Linh', nation: 'Vietnam', agency: 'Agoda' },
    '0807': { name: 'John Smith', nation: 'USA', agency: 'Booking.com' },
    '1205': { name: 'Park Soo', nation: 'Korea', agency: 'Direct' }
};

function autoFillGuest(type) {
    const roomEl = document.getElementById(type + 'Room');
    const guestEl = document.getElementById(type + 'Guest');
    const nationEl = document.getElementById(type + 'Nation');
    const agencyEl = document.getElementById(type + 'Agency');
    const phoneEl = document.getElementById(type + 'Phone');
    
    if(roomEl && roomEl.value && dummyGuests[roomEl.value]) {
        const info = dummyGuests[roomEl.value];
        if(guestEl) guestEl.value = info.name;
        if(nationEl) nationEl.value = info.nation;
        if(agencyEl) agencyEl.value = info.agency;
        if(phoneEl && info.phone) phoneEl.value = info.phone;
    } else {
        if(guestEl) guestEl.value = '';
        if(nationEl) nationEl.value = '';
        if(agencyEl) agencyEl.value = '';
        if(phoneEl) phoneEl.value = '';
    }
}
</script>
</body>"""

# Replace modal body
content = re.sub(r'<div class="modal-body".*?>.*?</div>\s*<div class="modal-footer"', modal_body_new + '\n        <div class="modal-footer"', content, flags=re.IGNORECASE|re.DOTALL)

# Add script before </body>
content = content.replace("</body>", script_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated golf.html successfully.")
