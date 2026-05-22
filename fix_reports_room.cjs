const fs = require('fs');
const path = 'dashboard/operations/reports.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Modify the grid wrapper style
content = content.replace('<div class="dept-grid">', '<div class="dept-grid" style="grid-template-columns: repeat(2, 1fr); gap: 24px;">');

// 2. Add HTML for Room Revenue
const roomHtml = `
                    <!-- 객실 타입별 수익 -->
                    <div class="dept-card" style="border-top: 4px solid var(--orange)">
                        <div class="dept-title"><i class="fa-solid fa-bed" style="color:var(--orange)"></i> 객실 타입별 실적 (Room Revenue Mix)</div>
                        <div class="dept-list" id="roomTypeMix">
                            <!-- JS injected -->
                        </div>
                    </div>
`;
content = content.replace('<!-- 결제 수단 -->', roomHtml + '                    <!-- 결제 수단 -->');

// 3. Add JS for Room Revenue
const jsToAdd = `
        createProgressBars('roomTypeMix', [
            { label: '스탠다드 (Standard)', sub: '$' + Math.round(rRevVal * 0.45).toLocaleString(), pct: 45 },
            { label: '디럭스/슈페리어 (Deluxe)', sub: '$' + Math.round(rRevVal * 0.35).toLocaleString(), pct: 35 },
            { label: '스위트 (Suite)', sub: '$' + Math.round(rRevVal * 0.20).toLocaleString(), pct: 20 }
        ], 'var(--orange)');
`;
content = content.replace('const tRevVal', jsToAdd + '        const tRevVal');

fs.writeFileSync(path, content);
console.log("Added Room Revenue Mix to reports.html");
