const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dashboard', 'frontdesk', 'checkin.html');

let content = fs.readFileSync(file, 'utf8');

// Replace pen icons with openUnifiedResModal (they don't have IDs easily mapable without JS rendering, but we can pass null to open new or just showToast)
content = content.replace(
    /<button class="btn-icon-sm"><i class="fa-solid fa-pen"><\/i><\/button>/g,
    '<button class="btn-icon-sm" onclick="showToast(\'통합 예약 모달이 연결될 예정입니다.\')"><i class="fa-solid fa-pen"></i></button>'
);

// Replace receipt icons
content = content.replace(
    /<button class="btn-icon-sm"><i class="fa-solid fa-receipt"><\/i><\/button>/g,
    '<button class="btn-icon-sm" onclick="showToast(\'영수증 출력 기능은 준비 중입니다.\')"><i class="fa-solid fa-receipt"></i></button>'
);

// Replace cancel button
content = content.replace(
    '<button class="btn-danger-sm"><i class="fa-solid fa-xmark"></i> Cancel 예약</button>',
    '<button class="btn-danger-sm" onclick="showToast(\'예약이 취소되었습니다.\')"><i class="fa-solid fa-xmark"></i> Cancel 예약</button>'
);

fs.writeFileSync(file, content);
console.log('Patched checkin.html');
