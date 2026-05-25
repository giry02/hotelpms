const fs = require('fs');

let html = fs.readFileSync('dashboard/frontdesk/checkin.html', 'utf8');

const regex = /<!-- CHECK-IN QUEUE -->[\s\S]*?<!-- CHECK-OUT QUEUE \(hidden by default\) -->[\s\S]*?<div class="ci-queue" id="checkoutPanel" style="display:none">[\s\S]*?<\/div>(\s*<\/div>\s*<\/div>)/;

const newPanels = `<!-- CHECK-IN QUEUE -->
        <div class="ci-queue" id="checkinPanel">
        </div>

        <!-- CHECK-OUT QUEUE (hidden by default) -->
        <div class="ci-queue" id="checkoutPanel" style="display:none">
        </div>$1`;

if (regex.test(html)) {
    html = html.replace(regex, newPanels);
    fs.writeFileSync('dashboard/frontdesk/checkin.html', html);
    console.log("Successfully stripped hardcoded cards.");
} else {
    console.log("Failed to match regex.");
}
