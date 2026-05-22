const fs = require('fs');

const path = 'E:/AI_Project/Hotel_PMS/dashboard/common/js/i18n.js';
let code = fs.readFileSync(path, 'utf8');

const missingEn = `
    "주간 객실 현황": "Weekly Room Status",
    "월": "Mon", "화": "Tue", "수": "Wed", "목": "Thu", "금": "Fri", "토": "Sat", "일": "Sun", "합계": "Total",
    "투숙객": "Guest", "객실": "Room", "객실 타입": "Room Type", "상태": "Status",
    "골프(외주)": "Golf (Outsourced)", "미청소": "Dirty", "청소 중": "Cleaning", "청소 완료": "Clean", "점검 대기": "To Inspect",
    "처리 완료": "Completed", "전체 작업": "Total Tasks", "청소 대기": "Pending Clean",
    "새로운 알림이 없습니다.": "No new notifications.", "로그아웃": "Logout", "프로필 설정": "Profile Settings",
    "객실 픽업률": "Room Pickup Rate",
    "현재 투숙 중": "In-house", "미정산 단체": "Unsettled Groups", "블록 배정 객실": "Blocked Rooms",
`;

// Insert into window.translations.en block
code = code.replace(/Object\.assign\(window\.translations\.en,\s*\{/, `Object.assign(window.translations.en, {${missingEn}`);

fs.writeFileSync(path, code);
