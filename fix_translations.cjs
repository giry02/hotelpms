const fs = require('fs');

const path = 'E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js';
let content = fs.readFileSync(path, 'utf8');

const additionsKo = `
    "Groups": "그룹 관리",
    "Room List": "객실 현황",
    "Maintenance": "시설 관리",
    "Night Audit": "야간 마감",
    "Unified POS": "통합 POS",
    "Staff List": "직원 목록",
    "Role & Perms": "권한 설정",
`;

const additionsEn = `
    "Groups": "Groups",
    "Room List": "Room List",
    "Maintenance": "Maintenance",
    "Night Audit": "Night Audit",
    "Unified POS": "Unified POS",
    "Staff List": "Staff List",
    "Role & Perms": "Role & Perms",
`;

// Insert to ko dictionary
// Assuming the first { corresponds to window.translations = {
// and the next is ko: {
let koIdx = content.indexOf('ko: {');
if (koIdx !== -1) {
    let insertIdx = content.indexOf('\n', koIdx) + 1;
    content = content.slice(0, insertIdx) + additionsKo + content.slice(insertIdx);
}

// Insert to en dictionary
let enIdx = content.indexOf('en: {');
if (enIdx !== -1) {
    let insertIdx = content.indexOf('\n', enIdx) + 1;
    content = content.slice(0, insertIdx) + additionsEn + content.slice(insertIdx);
}

fs.writeFileSync(path, content);
console.log("Translation keys added successfully.");
