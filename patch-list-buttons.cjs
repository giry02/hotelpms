const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dashboard', 'frontdesk', 'reservation-list.html');

let content = fs.readFileSync(file, 'utf8');

// Export button
content = content.replace(
    '<button class="btn-outline"><i class="fa-solid fa-download"></i> Export</button>',
    '<button class="btn-outline" onclick="showToast(\'엑셀 다운로드 기능은 준비 중입니다.\')"><i class="fa-solid fa-download"></i> Export</button>'
);

// Pagination buttons
content = content.replace(
    '<button class="page-btn"><i class="fa-solid fa-chevron-right"></i></button>',
    '<button class="page-btn" onclick="showToast(\'마지막 페이지입니다.\')"><i class="fa-solid fa-chevron-right"></i></button>'
);
content = content.replace(
    '<button class="page-btn active">1</button>',
    '<button class="page-btn active" onclick="showToast(\'현재 1페이지입니다.\')">1</button>'
);

// Grid action buttons
content = content.replace(
    '<button class="act-btn" title="상세보기"><i class="fa-solid fa-eye"></i></button>\n                    <button class="act-btn" title="수정"><i class="fa-solid fa-pen"></i></button>\n                    <button class="act-btn danger" title="Cancel"><i class="fa-solid fa-xmark"></i></button>',
    '<button class="act-btn" title="상세보기" onclick="window.openUnifiedResModal(\'${r.id}\')"><i class="fa-solid fa-eye"></i></button>\n                    <button class="act-btn" title="수정" onclick="window.openUnifiedResModal(\'${r.id}\')"><i class="fa-solid fa-pen"></i></button>\n                    <button class="act-btn danger" title="Cancel" onclick="window.cancelResAction(\'${r.id}\')"><i class="fa-solid fa-xmark"></i></button>'
);

// Mobile action buttons
content = content.replace(
    '<button class="act-btn"><i class="fa-solid fa-eye"></i> 상세</button>\n                <button class="act-btn"><i class="fa-solid fa-pen"></i> 수정</button>\n                <button class="act-btn danger"><i class="fa-solid fa-xmark"></i> Cancel</button>',
    '<button class="act-btn" onclick="window.openUnifiedResModal(\'${r.id}\')"><i class="fa-solid fa-eye"></i> 상세</button>\n                <button class="act-btn" onclick="window.openUnifiedResModal(\'${r.id}\')"><i class="fa-solid fa-pen"></i> 수정</button>\n                <button class="act-btn danger" onclick="window.cancelResAction(\'${r.id}\')"><i class="fa-solid fa-xmark"></i> Cancel</button>'
);

fs.writeFileSync(file, content);
console.log('Patched reservation-list.html');
