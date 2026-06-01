import os

file_path = os.path.join('dashboard', 'frontdesk', 'groups.html')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_html = """            <div class="group-meta">
                <div class="group-meta-item"><i class="fa-solid fa-calendar-check"></i> ${g.checkin} ~ ${g.checkout}</div>
                <div class="group-meta-item"><i class="fa-solid fa-person"></i> ${g.pax}명</div>
                <div class="group-meta-item"><i class="fa-solid fa-file-invoice-dollar"></i> ${g.routing}</div>
                <div class="group-meta-item"><i class="fa-solid fa-phone"></i> ${g.contact}</div>
            </div>
            <div>
                <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--txt2);margin-bottom:6px">
                    <span>객실 픽업률</span>
                    <span style="font-weight:700;color:var(--primary)">${g.pickup} / ${g.block} 실 (${pct}%)</span>
                </div>"""

new_html = """            <div class="group-meta">
                <div class="group-meta-item"><i class="fa-solid fa-calendar-check"></i> ${g.checkin} ~ ${g.checkout}</div>
                <div class="group-meta-item"><i class="fa-solid fa-person"></i> ${g.pax}명</div>
                <div class="group-meta-item"><i class="fa-solid fa-file-invoice-dollar"></i> ${g.routing}</div>
                <div class="group-meta-item"><i class="fa-solid fa-phone"></i> ${g.contact}</div>
            </div>
            <div style="background:#F8FAFC; border-radius:6px; padding:8px 10px; font-size:0.75rem; color:var(--txt2); margin-top:8px;">
                <div style="font-weight:600; margin-bottom:4px; color:var(--txt);">객실 할당 내역</div>
                ${g.allocations ? g.allocations.map(a => `
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                        <span>- ${a.type}</span>
                        <span>${a.count}실 (단가: ${a.rate.toLocaleString()}원)</span>
                    </div>
                `).join('') : '<div style="color:var(--txt3)">할당 내역 없음</div>'}
            </div>
            <div style="margin-top:12px;">
                <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--txt2);margin-bottom:6px">
                    <span>전체 객실 픽업률</span>
                    <span style="font-weight:700;color:var(--primary)">${g.pickup} / ${g.block} 실 (${pct}%)</span>
                </div>"""

content = content.replace(old_html, new_html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated renderGroups UI in groups.html')
