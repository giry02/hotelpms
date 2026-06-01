const fs = require('fs');
const path = 'dashboard/operations/reports.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Add CSS
if (!content.includes('.progress-group')) {
    const cssToAdd = `
        .progress-group { margin-bottom: 18px; }
        .progress-group:last-child { margin-bottom: 0; }
        .progress-label { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: var(--txt); }
        .progress-val { font-weight: 800; color: var(--txt); display: inline-block; width: 40px; text-align: right; }
        .progress-sub { color: var(--txt3); font-weight: 500; font-size: 0.8rem; margin-right: 8px; }
        .progress-track { background: var(--border); border-radius: 20px; height: 10px; width: 100%; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); }
        .progress-fill { height: 100%; border-radius: 20px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        
        @media print {
            .progress-track { border: 1px solid #ddd; }
            .progress-fill { background-color: #333 !important; }
        }
    </style>`;
    content = content.replace('</style>', cssToAdd);
}

// 2. Replace HTML
const htmlRegex = /<!-- 3\. Detailed Metrics -->[\s\S]*?(?=<\/div>\s*<\/div>\s*<script>)/;
const newHtml = `<!-- 3. Detailed Metrics -->
        <div class="report-section">
            <div class="report-header">
                <i class="fa-solid fa-chart-pie" style="color:var(--orange)"></i> 3. 세부 매출 분석 (Detailed Revenue Analysis)
            </div>
            <div class="report-body">
                <div class="dept-grid">
                    <!-- 부가서비스 매출 -->
                    <div class="dept-card" style="border-top: 4px solid var(--purple)">
                        <div class="dept-title"><i class="fa-solid fa-bell-concierge" style="color:var(--purple)"></i> 부가서비스 세부 (Ancillary Breakdown)</div>
                        <div class="dept-list" id="ancillaryMix">
                            <!-- JS injected -->
                        </div>
                    </div>
                    <!-- 예약 채널 -->
                    <div class="dept-card" style="border-top: 4px solid var(--blue)">
                        <div class="dept-title"><i class="fa-solid fa-globe" style="color:var(--blue)"></i> 예약 채널 비중 (Channel Mix)</div>
                        <div class="dept-list" id="channelMix">
                            <!-- JS injected -->
                        </div>
                    </div>
                    <!-- 결제 수단 -->
                    <div class="dept-card" style="border-top: 4px solid var(--success)">
                        <div class="dept-title"><i class="fa-solid fa-credit-card" style="color:var(--success)"></i> 결제 수단 비중 (Payment Methods)</div>
                        <div class="dept-list" id="paymentMix">
                            <!-- JS injected -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;
content = content.replace(htmlRegex, newHtml);

// 3. Replace JS
const jsRegex = /\/\/ 3\. Detailed Metrics \(Mocked Data based on typical distribution\)[\s\S]*?(?=^\s*\} catch\(e\))/m;
const newJs = `// 3. Detailed Metrics (Visual Progress Bars)
        function createProgressBars(containerId, items, color) {
            const container = document.getElementById(containerId);
            container.innerHTML = items.map(item => \`
                <div class="progress-group">
                    <div class="progress-label">
                        <span>\${item.label}</span>
                        <div>
                            <span class="progress-sub">\${item.sub}</span>
                            <span class="progress-val">\${item.pct}%</span>
                        </div>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: 0%; background: \${color}" data-width="\${item.pct}%"></div>
                    </div>
                </div>
            \`).join('');
            
            // Animate width
            setTimeout(() => {
                container.querySelectorAll('.progress-fill').forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
            }, 100);
        }

        const aRevVal = typeof aRev !== 'undefined' ? aRev : 1800; // Total ancillary
        
        createProgressBars('ancillaryMix', [
            { label: '골프장 (Golf)', sub: '$' + Math.round(aRevVal * 0.47).toLocaleString(), pct: 47 },
            { label: '렌터카 (Rent-a-car)', sub: '$' + Math.round(aRevVal * 0.30).toLocaleString(), pct: 30 },
            { label: '룸서비스 (Room Service)', sub: '$' + Math.round(aRevVal * 0.23).toLocaleString(), pct: 23 }
        ], 'var(--purple)');

        const rRevVal = typeof rRev !== 'undefined' ? rRev : 19100;
        createProgressBars('channelMix', [
            { label: 'OTA (Agoda/Booking)', sub: '$' + Math.round(rRevVal * 0.48).toLocaleString(), pct: 48 },
            { label: '자체 웹사이트 (Website)', sub: '$' + Math.round(rRevVal * 0.35).toLocaleString(), pct: 35 },
            { label: '다이렉트 (Direct)', sub: '$' + Math.round(rRevVal * 0.17).toLocaleString(), pct: 17 }
        ], 'var(--blue)');

        const tRevVal = typeof tRev !== 'undefined' ? tRev : 23350;
        createProgressBars('paymentMix', [
            { label: '신용카드 (Credit Card)', sub: '$' + Math.round(tRevVal * 0.82).toLocaleString(), pct: 82 },
            { label: '계좌이체 (Bank Transfer)', sub: '$' + Math.round(tRevVal * 0.12).toLocaleString(), pct: 12 },
            { label: '현금 (Cash)', sub: '$' + Math.round(tRevVal * 0.06).toLocaleString(), pct: 6 }
        ], 'var(--success)');
`;
content = content.replace(jsRegex, newJs);

fs.writeFileSync(path, content);
console.log("Applied visual redesign to reports.html");
