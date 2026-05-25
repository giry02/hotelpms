import os

file_path = os.path.join('dashboard', 'frontdesk', 'groups.html')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_html = """                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">결제 방식</div><div style="font-weight:600">${g.routing}</div></div>
                <div style="grid-column:1/-1"><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">담당자 연락처</div><div style="font-weight:600">${g.contact}</div></div>
                <div style="grid-column:1/-1"><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">특이사항</div><div style="font-weight:500;color:var(--txt2)">${g.note || '없음'}</div></div>
            </div>
        </div>`;"""

new_html = """                <div><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">결제 방식</div><div style="font-weight:600">${g.routing}</div></div>
                <div style="grid-column:1/-1"><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">담당자 연락처</div><div style="font-weight:600">${g.contact}</div></div>
                <div style="grid-column:1/-1"><div style="font-size:0.75rem;color:var(--txt3);font-weight:600;margin-bottom:4px">특이사항</div><div style="font-weight:500;color:var(--txt2)">${g.note || '없음'}</div></div>
            </div>
            
            <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:16px;">
                <div style="font-size:0.85rem; font-weight:700; margin-bottom:10px;">객실 할당 상세 및 가변 단가</div>
                ${g.allocations && g.allocations.length > 0 ? `
                <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                    <thead>
                        <tr style="background:var(--bg); color:var(--txt2);">
                            <th style="padding:6px; text-align:left; border-bottom:1px solid var(--border);">객실 타입</th>
                            <th style="padding:6px; text-align:right; border-bottom:1px solid var(--border);">할당 객실</th>
                            <th style="padding:6px; text-align:right; border-bottom:1px solid var(--border);">특별 단가</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${g.allocations.map(a => `
                        <tr>
                            <td style="padding:6px; border-bottom:1px solid #f1f5f9;">${a.type}</td>
                            <td style="padding:6px; text-align:right; border-bottom:1px solid #f1f5f9;">${a.count}실</td>
                            <td style="padding:6px; text-align:right; border-bottom:1px solid #f1f5f9;">${a.rate ? a.rate.toLocaleString() + '원' : '-'}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<div style="font-size:0.8rem; color:var(--txt3);">할당 내역이 없습니다. (구버전 데이터)</div>'}
            </div>
        </div>`;"""

content = content.replace(old_html, new_html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated showDetail in groups.html')
