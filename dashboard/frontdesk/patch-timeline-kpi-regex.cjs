const fs = require('fs');
const file = 'E:/AI_Project/Hotel_PMS/dashboard/frontdesk/reservation-timeline.html';
let content = fs.readFileSync(file, 'utf8');

// Use Regex to find the purple card and append the B2B card
const purpleCardRegex = /<div class="kpi-card purple">[\s\S]*?<\/div>\s*<\/div>/;
const match = content.match(purpleCardRegex);

if (match) {
    const replacement = match[0] + `
            <div class="kpi-card" style="background:#f8fafc; border:1px solid #111827">
                <div class="kpi-icon" style="background:#111827; color:#fff"><i class="fa-solid fa-building"></i></div>
                <div class="kpi-body"><div class="kpi-value" id="kpiB2B" style="color:#111827">0</div><div class="kpi-label" style="color:#374151">B2B / 단체</div></div>
            </div>`;
    content = content.replace(purpleCardRegex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully patched timeline HTML!');
} else {
    console.log('Could not find purple card in timeline');
}
