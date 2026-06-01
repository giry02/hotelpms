import os
import re

file_path = r"E:\AI_Project\Hotel_PMS\dashboard\operations\rentacar.html"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

modal_body_new = """<div class="modal-body" style="padding:20px;display:flex;flex-direction:column;gap:16px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">호실 선택 (Room) <span style="color:var(--danger)">*</span></label>
                    <select id="rentRoom" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;background:#fff" onchange="autoFillGuest('rent')">
                        <option value="">선택...</option>
                        <option value="1401">1401</option>
                        <option value="0807">0807</option>
                        <option value="1205">1205</option>
                    </select>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">고객명 (Guest) <span style="color:var(--danger)">*</span></label>
                    <input type="text" id="rentGuest" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%" placeholder="자동 입력">
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">연락처 (Contact)</label>
                    <input type="text" id="rentPhone" readonly style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;background:#f1f5f9" placeholder="자동 입력">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">차량 등급 (Car Type) <span style="color:var(--danger)">*</span></label>
                    <select id="rentCarType" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;background:#fff">
                        <option>Sedan (Standard)</option>
                        <option>SUV (Family)</option>
                        <option>Luxury Van</option>
                    </select>
                </div>
            </div>
            <hr style="border:none;border-top:1px solid var(--border2)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">대여 일시 (Date/Time) <span style="color:var(--danger)">*</span></label>
                    <input type="datetime-local" id="rentDate" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">대여 기간 (Duration) <span style="color:var(--danger)">*</span></label>
                    <select id="rentDuration" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%;background:#fff">
                        <option>4시간 (Half Day)</option>
                        <option>8시간 (Full Day)</option>
                        <option>24시간 (1 Day)</option>
                        <option>공항 샌딩 (Airport Drop)</option>
                    </select>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
                <label style="font-size:.8rem;font-weight:600;color:var(--txt2)">픽업 / 반납 장소 (Location) <span style="color:var(--danger)">*</span></label>
                <input type="text" id="rentLocation" style="height:38px;border:1px solid var(--border);border-radius:4px;padding:0 10px;font-family:var(--font);width:100%" placeholder="예: 호텔 정문 픽업 -> 다낭 국제공항 반납">
            </div>
        </div>"""

script_new = """<script>
// Mock guest registry for auto-fill based on room
const dummyGuests = {
    '1401': { name: 'Tran Linh', nation: 'Vietnam', agency: 'Agoda', phone: '+84 91 888 9999' },
    '0807': { name: 'John Smith', nation: 'USA', agency: 'Booking.com', phone: '+1 212 555 0142' },
    '1205': { name: 'Park Soo', nation: 'Korea', agency: 'Direct', phone: '+82 10 5678 1234' }
};

function autoFillGuest(type) {
    const roomEl = document.getElementById(type + 'Room');
    const guestEl = document.getElementById(type + 'Guest');
    const phoneEl = document.getElementById(type + 'Phone');
    
    if(roomEl && roomEl.value && dummyGuests[roomEl.value]) {
        const info = dummyGuests[roomEl.value];
        if(guestEl) guestEl.value = info.name;
        if(phoneEl && info.phone) phoneEl.value = info.phone;
    } else {
        if(guestEl) guestEl.value = '';
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

print("Updated rentacar.html successfully.")
