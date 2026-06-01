const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dashboard', 'frontdesk', 'reservation-list.html');

let content = fs.readFileSync(file, 'utf8');

// List Desktop Buttons
content = content.replace(
    /<button class="act-btn" title="상세보기"><i class="fa-solid fa-eye"><\/i><\/button>/g,
    '<button class="act-btn" title="상세보기" onclick="window.openUnifiedResModal(\'${r.id}\')"><i class="fa-solid fa-eye"></i></button>'
);
content = content.replace(
    /<button class="act-btn" title="수정"><i class="fa-solid fa-pen"><\/i><\/button>/g,
    '<button class="act-btn" title="수정" onclick="window.openUnifiedResModal(\'${r.id}\')"><i class="fa-solid fa-pen"></i></button>'
);
content = content.replace(
    /<button class="act-btn danger" title="Cancel"><i class="fa-solid fa-xmark"><\/i><\/button>/g,
    '<button class="act-btn danger" title="Cancel" onclick="window.cancelResAction(\'${r.id}\')"><i class="fa-solid fa-xmark"></i></button>'
);

// List Mobile Buttons
content = content.replace(
    /<button class="act-btn"><i class="fa-solid fa-eye"><\/i> 상세<\/button>/g,
    '<button class="act-btn" onclick="window.openUnifiedResModal(\'${r.id}\')"><i class="fa-solid fa-eye"></i> 상세</button>'
);
content = content.replace(
    /<button class="act-btn"><i class="fa-solid fa-pen"><\/i> 수정<\/button>/g,
    '<button class="act-btn" onclick="window.openUnifiedResModal(\'${r.id}\')"><i class="fa-solid fa-pen"></i> 수정</button>'
);
content = content.replace(
    /<button class="act-btn danger"><i class="fa-solid fa-xmark"><\/i> Cancel<\/button>/g,
    '<button class="act-btn danger" onclick="window.cancelResAction(\'${r.id}\')"><i class="fa-solid fa-xmark"></i> Cancel</button>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched reservation-list buttons');
