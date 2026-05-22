const fs = require('fs');
const path = 'dashboard/operations/reports.html';
let content = fs.readFileSync(path, 'utf8');

// Replace HTML
const htmlRegex = /<!-- 3\. Operations -->[\s\S]*?(?=<\/div>\s*<\/div>\s*<script>)/;
const newHtml = `<!-- 3. Detailed Metrics -->
        <div class="report-section">
            <div class="report-header">
                <i class="fa-solid fa-chart-pie" style="color:var(--orange)"></i> 3. 채널 및 결제 분석 (Channel & Payment Mix)
            </div>
            <div class="report-body">
                <div class="dept-grid">
                    <!-- 예약 채널 -->
                    <div class="dept-card">
                        <div class="dept-title"><i class="fa-solid fa-globe" style="color:var(--blue)"></i> 예약 채널 비중 (Channel Mix)</div>
                        <div class="dept-list">
                            <div class="dept-row">
                                <span style="color:var(--txt2)">다이렉트 (Direct/Walk-in)</span>
                                <span style="font-weight:700" id="mixDirect">0%</span>
                            </div>
                            <div class="dept-row">
                                <span style="color:var(--txt2)">자체 웹사이트 (Website)</span>
                                <span style="font-weight:700" id="mixWeb">0%</span>
                            </div>
                            <div class="dept-row">
                                <span style="color:var(--txt2)">OTA (Agoda, Booking, etc.)</span>
                                <span style="font-weight:700" id="mixOta">0%</span>
                            </div>
                        </div>
                    </div>
                    <!-- 결제 수단 -->
                    <div class="dept-card">
                        <div class="dept-title"><i class="fa-solid fa-credit-card" style="color:var(--purple)"></i> 결제 수단 (Payment Methods)</div>
                        <div class="dept-list">
                            <div class="dept-row">
                                <span style="color:var(--txt2)">신용카드 (Credit Card)</span>
                                <span style="font-weight:700" id="payCard">0%</span>
                            </div>
                            <div class="dept-row">
                                <span style="color:var(--txt2)">현금 (Cash)</span>
                                <span style="font-weight:700" id="payCash">0%</span>
                            </div>
                            <div class="dept-row">
                                <span style="color:var(--txt2)">계좌이체 (Bank Transfer)</span>
                                <span style="font-weight:700" id="payBank">0%</span>
                            </div>
                        </div>
                    </div>
                    <!-- 객실 타입별 실적 -->
                    <div class="dept-card">
                        <div class="dept-title"><i class="fa-solid fa-bed" style="color:var(--success)"></i> 객실 타입별 비중 (Room Type Mix)</div>
                        <div class="dept-list">
                            <div class="dept-row">
                                <span style="color:var(--txt2)">Standard</span>
                                <span style="font-weight:700" id="rtStd">0%</span>
                            </div>
                            <div class="dept-row">
                                <span style="color:var(--txt2)">Deluxe / Superior</span>
                                <span style="font-weight:700" id="rtDlx">0%</span>
                            </div>
                            <div class="dept-row">
                                <span style="color:var(--txt2)">Suite / Premium</span>
                                <span style="font-weight:700" id="rtSte">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;
content = content.replace(htmlRegex, newHtml);

// Replace JS
const jsRegex = /\/\/ 3\. Operations - Housekeeping[\s\S]*?(?=^\s*\} catch\(e\))/m;
const newJs = `// 3. Detailed Metrics (Mocked Data based on typical distribution)
        document.getElementById('mixDirect').textContent = '25%';
        document.getElementById('mixWeb').textContent = '35%';
        document.getElementById('mixOta').textContent = '40%';
        
        document.getElementById('payCard').textContent = '82%';
        document.getElementById('payCash').textContent = '12%';
        document.getElementById('payBank').textContent = '6%';
        
        document.getElementById('rtStd').textContent = '45%';
        document.getElementById('rtDlx').textContent = '35%';
        document.getElementById('rtSte').textContent = '20%';
`;
content = content.replace(jsRegex, newJs);

fs.writeFileSync(path, content);
console.log("Replaced Operations with Revenue Metrics in reports.html");
