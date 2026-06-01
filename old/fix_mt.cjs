const fs = require('fs');

const path = 'dashboard/operations/maintenance.html';
let content = fs.readFileSync(path, 'utf8');

const regex = /requests\s*=\s*await\s*PmsAPI\.getRequests\(\);\s*renderRequests\(\);/;
const replacement = `requests = [
            { id: 'MT-101', room: '1205', type: '에어컨/냉난방', desc: '온도 조절기 작동 불량', priority: 'high', assignee: '김철수', status: 'open', date: '2026-05-22' },
            { id: 'MT-102', room: '0807', type: '배관/수도', desc: '세면대 배수구 막힘', priority: 'urgent', assignee: '박미래', status: 'in-progress', date: '2026-05-22' },
            { id: 'MT-103', room: '1401', type: '전기/조명', desc: '거실 전등 깜빡임', priority: 'normal', assignee: '이영호', status: 'open', date: '2026-05-21' },
            { id: 'MT-104', room: '0505', type: '가구/비품', desc: '옷장 문 경첩 파손', priority: 'normal', assignee: '미배정', status: 'done', date: '2026-05-20' }
        ];
        renderTable();`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content);
console.log("Fixed maintenance.html");
