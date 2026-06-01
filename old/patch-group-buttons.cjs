const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dashboard', 'frontdesk', 'groups.html');

let content = fs.readFileSync(file, 'utf8');

// Download button
content = content.replace(
    '<button class="btn-outline" style="height:38px"><i class="fa-solid fa-download"></i> 엑셀 다운로드</button>',
    '<button class="btn-outline" style="height:38px" onclick="showToast(\'엑셀 다운로드 기능은 준비 중입니다.\')"><i class="fa-solid fa-download"></i> 엑셀 다운로드</button>'
);

fs.writeFileSync(file, content);
console.log('Patched groups.html buttons');
