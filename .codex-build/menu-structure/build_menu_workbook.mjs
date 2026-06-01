import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const outputDir = path.join(root, "outputs", "menu-structure");
const outputPath = path.join(outputDir, "Hotel_PMS_Menu_Structure.xlsx");

const roles = [
  {
    key: "sys_admin",
    label: "Admin",
    scope: "호텔 운영 전체",
    description: "호텔 운영/설정/정산/권한 전반을 관리하는 기본 최고 권한",
  },
  {
    key: "sys_gm",
    label: "General Manager",
    scope: "운영 총괄",
    description: "예약, 운영, 정산, 설정 현황을 총괄 확인하고 관리",
  },
  {
    key: "sys_desk",
    label: "Front Desk",
    scope: "프론트 업무",
    description: "예약, 체크인/아웃, 고객, 정산, 부가서비스 접수 중심",
  },
  {
    key: "sys_housekeeping",
    label: "Housekeeping",
    scope: "객실 정비",
    description: "객실 현황과 하우스키핑 작업 관리 중심",
  },
  {
    key: "sys_maintenance",
    label: "Maintenance",
    scope: "시설 보수",
    description: "객실 현황과 시설 보수 요청/작업 관리 중심",
  },
  {
    key: "super_admin",
    label: "Super Admin / Platform Owner",
    scope: "플랫폼 관리 전체",
    description: "입점 호텔, 광고, 시스템, 관리자 계정을 관리하는 어드민 기본 권한",
  },
];

const allDashboardRoles = ["sys_admin", "sys_gm", "sys_desk", "sys_housekeeping", "sys_maintenance"];
const frontDeskRoles = ["sys_admin", "sys_gm", "sys_desk"];
const settingsRoles = ["sys_admin", "sys_gm"];
const housekeepingRoles = ["sys_admin", "sys_gm", "sys_housekeeping"];
const maintenanceRoles = ["sys_admin", "sys_gm", "sys_maintenance"];

const dashboardRows = [
  ["Main", 1, "대시보드", "dashboard.html", "dashboard/dashboard.html", "메뉴", "호텔 운영 KPI, 금일 체크인/활동, 부가서비스, 하우스키핑 현황을 한 화면에서 확인", allDashboardRoles, "기본 진입 화면"],
  ["Main", 2, "알림 및 실시간 활동", "notifications.html", "dashboard/notifications.html", "연결 페이지", "호텔 알림과 실시간 활동 로그를 확인", allDashboardRoles, "상단 알림에서 접근"],
  ["Front Desk", 1, "예약 타임라인", "reservation-timeline.html", "dashboard/frontdesk/reservation-timeline.html", "메뉴", "객실별 예약 블록을 타임라인으로 확인하고 투숙/공실 흐름을 파악", frontDeskRoles, "프론트 기본 예약 뷰"],
  ["Front Desk", 1, "예약 관리", "reservation-list.html", "dashboard/frontdesk/reservation-list.html", "메뉴", "예약 목록, 상태 필터, 신규 예약, 체크인/체크아웃 업무를 처리", frontDeskRoles, "checkin.html은 이 화면의 체크인 탭으로 연결"],
  ["Front Desk", 2, "체크인/아웃", "checkin.html", "dashboard/frontdesk/checkin.html", "연결/리디렉션", "체크인/아웃 업무 진입점. 현재 예약 관리의 체크인 탭으로 연결", frontDeskRoles, "레거시 진입 경로 유지"],
  ["Front Desk", 1, "단체/행사 목록", "groups_blocks.html", "dashboard/frontdesk/groups_blocks.html", "메뉴", "단체 행사, 객실 블록, 주관 업체, 정산 방식을 관리", frontDeskRoles, "Groups 하위 메뉴"],
  ["Front Desk", 2, "행사 등록/관리", "groups_block_detail.html", "dashboard/frontdesk/groups_block_detail.html", "상세 페이지", "단체 행사 상세, 룸 블록, 룸잉 리스트, 객실 배정을 관리", frontDeskRoles, "목록에서 상세 진입"],
  ["Front Desk", 1, "단체업체 관리", "groups_companies.html", "dashboard/frontdesk/groups_companies.html", "메뉴", "기업/여행사 계정, 계약 조건, 후불/개별 정산 조건을 관리", frontDeskRoles, "Groups 하위 메뉴"],
  ["Guest & CRM", 1, "투숙객 관리", "guests.html", "dashboard/crm/guests.html", "메뉴", "고객 검색, 등급, 연락처, 투숙 이력, 고객 등록을 관리", frontDeskRoles, "CRM 기본 화면"],
  ["Guest & CRM", 1, "VIP 멤버십", "membership.html", "dashboard/crm/membership.html", "메뉴", "멤버십 등급별 혜택, 승급 기준, 등급 통계를 관리", frontDeskRoles, "VIP 정책 관리"],
  ["Guest & CRM", 2, "등급 변동 이력", "tier-history.html", "dashboard/crm/tier-history.html", "연결 페이지", "고객 등급 승급/강등 이력을 조회하고 필터링", frontDeskRoles, "멤버십 관련 상세"],
  ["Operations", 1, "객실 관리", "rooms.html", "dashboard/operations/rooms.html", "메뉴", "객실 목록, 점유/공실/OOS 상태, 객실 속성을 관리", allDashboardRoles, "Room Mgmt 하위 메뉴"],
  ["Operations", 1, "객실 유형", "room-setup.html", "dashboard/operations/room-setup.html", "메뉴", "객실 타입, 기준 인원, 요금 속성, 객실 생성/수정 관리", allDashboardRoles, "Room Mgmt 하위 메뉴"],
  ["Operations", 1, "요금 캘린더", "rates.html", "dashboard/operations/rates.html", "메뉴", "객실 유형별 평일/주말/휴일 요금과 VIP 할인율 설정", allDashboardRoles, "Room Mgmt 하위 메뉴"],
  ["Operations", 1, "하우스키핑", "housekeeping.html", "dashboard/operations/housekeeping.html", "메뉴", "청소 대기, 점검 대기, 완료 객실과 담당 작업을 관리", housekeepingRoles, "하우스키핑 전용 권한 포함"],
  ["Operations", 1, "시설 보수", "maintenance.html", "dashboard/operations/maintenance.html", "메뉴", "시설 보수 요청, 우선순위, 작업 상태와 담당자를 관리", maintenanceRoles, "시설 보수 전용 권한 포함"],
  ["Operations", 1, "정산 목록", "folio.html", "dashboard/operations/folio.html", "메뉴", "Folio 정산, 결제 수단, 미수금, 영수증/명세서 업무를 처리", frontDeskRoles, "Folio & Billing 하위 메뉴"],
  ["Operations", 1, "매출 분석", "reports.html", "dashboard/operations/reports.html", "메뉴", "일/월/부서별 매출 추이와 전년 대비 실적을 분석", frontDeskRoles, "Folio & Billing 하위 메뉴"],
  ["Operations", 2, "매출 차트", "folio-chart.html", "dashboard/operations/folio-chart.html", "연결 페이지", "매출 분석을 차트 중심으로 확인", frontDeskRoles, "레거시/보조 분석 화면"],
  ["Operations", 1, "일일 마감", "night-audit.html", "dashboard/operations/night-audit.html", "메뉴", "마감 전 체크리스트, 정산액 검증, 일일 마감 처리를 수행", frontDeskRoles, "Folio & Billing 하위 메뉴"],
  ["Operations", 1, "통합 POS", "unified-pos.html", "dashboard/operations/unified-pos.html", "메뉴", "부가서비스 주문을 통합 접수하고 Folio 연동 상태를 관리", frontDeskRoles, "Ancillary 하위 메뉴"],
  ["Operations", 2, "POS", "pos.html", "dashboard/operations/pos.html", "연결 페이지", "카페/뷔페/미니바 등 현장 POS 주문과 결제를 처리", frontDeskRoles, "보조 POS 화면"],
  ["Operations", 2, "룸서비스", "room-service.html", "dashboard/operations/room-service.html", "연결 페이지", "룸서비스 주문, 조리/서빙 상태, Folio 청구액을 관리", frontDeskRoles, "부가서비스 세부 화면"],
  ["Operations", 2, "부가서비스", "ancillary.html", "dashboard/operations/ancillary.html", "연결 페이지", "부가서비스 주문 현황과 수기 등록을 관리", frontDeskRoles, "대시보드 카드에서 접근"],
  ["Operations", 1, "골프 예약", "golf.html", "dashboard/operations/golf.html", "메뉴", "제휴 골프장 예약, 라운딩 상태, 수수료 정산을 관리", frontDeskRoles, "Ancillary 하위 메뉴"],
  ["Operations", 1, "렌터카", "rentacar.html", "dashboard/operations/rentacar.html", "메뉴", "렌터카 예약, 대여 시간, 업체 수수료와 상태를 관리", frontDeskRoles, "Ancillary 하위 메뉴"],
  ["Settings", 1, "호텔 설정", "settings.html", "dashboard/settings/settings.html", "메뉴", "호텔 기본 정보, 운영 정책, 다국어, 보증금/취소 정책을 설정", settingsRoles, "설정 권한 필요"],
  ["Settings", 1, "직원 관리", "staff.html", "dashboard/settings/staff.html", "메뉴", "직원 목록, 근무 상태, 계정 정보를 관리", settingsRoles, "Staff Mgmt 하위 메뉴"],
  ["Settings", 1, "권한 설정", "roles.html", "dashboard/settings/roles.html", "메뉴", "역할별 메뉴 접근과 권한 구성을 확인/관리", settingsRoles, "Staff Mgmt 하위 메뉴"],
  ["Settings", 1, "요금 및 결제", "billing.html", "dashboard/settings/billing.html", "메뉴", "구독/결제, 인보이스, 청구 상태를 확인", settingsRoles, "설정 권한 필요"],
  ["Settings", 1, "공지사항", "notices.html", "dashboard/settings/notices.html", "메뉴", "호텔 공지 작성, 노출 대상, 게시 상태를 관리", settingsRoles, "설정 권한 필요"],
  ["Settings", 1, "고객지원", "support.html", "dashboard/settings/support.html", "메뉴", "지원 문의, 카테고리, 처리 상태를 관리", settingsRoles, "설정 권한 필요"],
];

const adminRoles = ["super_admin"];
const adminRows = [
  ["Main", 1, "플랫폼 현황", "admin.html", "admin/admin.html", "메뉴", "입점 호텔, MRR, 캠페인, 시스템 알림, 플랫폼 KPI를 확인", adminRoles, "Super Admin 기본 진입"],
  ["Tenant Mgmt", 1, "호텔 목록", "list.html", "admin/tenants/list.html", "메뉴", "입점 호텔 목록, 플랜, 상태, 상세 진입을 관리", adminRoles, "테넌트 관리"],
  ["Tenant Mgmt", 2, "호텔 상세", "detail.html", "admin/tenants/detail.html", "상세 페이지", "테넌트 기본 정보, 초기 관리자, 운영 설정과 상태를 확인", adminRoles, "호텔 목록에서 진입"],
  ["Tenant Mgmt", 1, "관리자 직접 등록", "register.html", "admin/tenants/register.html", "메뉴", "신규 호텔/테넌트와 초기 관리자 계정을 등록", adminRoles, "테넌트 생성"],
  ["Tenant Mgmt", 2, "입점 신청", "apply.html", "admin/tenants/apply.html", "외부/연결 페이지", "호텔 담당자가 입점 신청과 초기 관리자 정보를 제출", adminRoles, "로그인 전 접근 가능"],
  ["Ad Network", 1, "캠페인 목록", "campaigns.html", "admin/ads/campaigns.html", "메뉴", "광고 캠페인, 광고주, 계약 기간, CTR, 상태를 관리", adminRoles, "광고 운영"],
  ["Ad Network", 2, "캠페인 상세", "detail.html", "admin/ads/detail.html", "상세 페이지", "캠페인 소재, 타겟, 성과, 수정 진입을 확인", adminRoles, "캠페인 목록에서 진입"],
  ["Ad Network", 1, "캠페인 등록", "new.html", "admin/ads/new.html", "메뉴", "신규 광고 캠페인, 과금 방식, 소재와 기간을 등록", adminRoles, "광고 생성"],
  ["Ad Network", 2, "타겟팅 설정", "targeting.html", "admin/ads/targeting.html", "연결 페이지", "국가/도시/호텔 단위 타겟팅과 가중치를 설정", adminRoles, "캠페인 상세에서 진입"],
  ["Ad Network", 1, "광고 정산", "billing.html", "admin/ads/billing.html", "메뉴", "광고 과금 방식, 노출/클릭, 청구액을 확인", adminRoles, "광고 청구"],
  ["System", 1, "관리자 계정", "users.html", "admin/system/users.html", "메뉴", "플랫폼 관리자 계정, 역할, 상태, 비밀번호 초기화를 관리", adminRoles, "시스템 관리"],
  ["System", 2, "관리자 프로필", "profile.html", "admin/system/profile.html", "연결 페이지", "현재 관리자 프로필과 보안 설정을 확인", adminRoles, "사이드바 사용자에서 진입"],
  ["System", 1, "구독 및 결제", "billing.html", "admin/system/billing.html", "메뉴", "테넌트별 구독, 청구 상태, 만료/이탈 관리를 확인", adminRoles, "플랫폼 과금"],
  ["System", 1, "연동 관리", "integrations.html", "admin/system/integrations.html", "메뉴", "Stripe/NICE Pay 등 외부 연동 모듈 상태를 관리", adminRoles, "시스템 연동"],
  ["System", 1, "고객 지원", "helpdesk.html", "admin/system/helpdesk.html", "메뉴", "플랫폼 지원 티켓, 문의 카테고리, 처리 상태를 관리", adminRoles, "지원 운영"],
  ["System", 1, "공지사항 관리", "notices.html", "admin/system/notices.html", "메뉴", "플랫폼 공지, 대상, 게시 상태를 관리", adminRoles, "공지 운영"],
  ["System", 1, "감사 로그", "audit-logs.html", "admin/system/audit-logs.html", "메뉴", "로그인, 장치, 위험 이벤트 등 감사 로그를 조회", adminRoles, "보안/감사"],
];

const roleMatrix = [
  ["대시보드", "Main", "운영 KPI/알림", allDashboardRoles],
  ["대시보드", "Front Desk", "예약/단체/고객 접점", frontDeskRoles],
  ["대시보드", "Guest & CRM", "고객/멤버십", frontDeskRoles],
  ["대시보드", "Room Mgmt", "객실/객실유형/요금", allDashboardRoles],
  ["대시보드", "Housekeeping", "청소/점검 작업", housekeepingRoles],
  ["대시보드", "Maintenance", "시설 보수", maintenanceRoles],
  ["대시보드", "Folio & Billing", "정산/매출/마감", frontDeskRoles],
  ["대시보드", "Ancillary Svcs", "POS/골프/렌터카", frontDeskRoles],
  ["대시보드", "Settings", "호텔 설정/직원/권한/공지/지원", settingsRoles],
  ["어드민", "Super Admin", "플랫폼/테넌트/광고/시스템 전체", adminRoles],
];

const sectionColors = {
  Main: "#334155",
  "Front Desk": "#0F766E",
  "Guest & CRM": "#7C3AED",
  Operations: "#1D4ED8",
  Settings: "#B45309",
  "Tenant Mgmt": "#0F766E",
  "Ad Network": "#7C3AED",
  System: "#1D4ED8",
  어드민: "#111827",
  대시보드: "#111827",
};

const wb = Workbook.create();

function fitColumns(sheet, widths) {
  widths.forEach((w, i) => {
    sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidthPx = w;
  });
}

function styleTitle(sheet, title, subtitle, endCol) {
  sheet.showGridLines = false;
  const titleRange = sheet.getRangeByIndexes(0, 0, 1, endCol);
  titleRange.merge();
  titleRange.values = [[title]];
  titleRange.format = {
    fill: "#0F172A",
    font: { color: "#FFFFFF", bold: true, size: 18 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
  titleRange.format.rowHeightPx = 42;
  const subRange = sheet.getRangeByIndexes(1, 0, 1, endCol);
  subRange.merge();
  subRange.values = [[subtitle]];
  subRange.format = {
    fill: "#E2E8F0",
    font: { color: "#334155", bold: true, size: 10 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
  subRange.format.rowHeightPx = 26;
}

function applyHeader(range, fill = "#1E293B") {
  range.format = {
    fill,
    font: { color: "#FFFFFF", bold: true },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  range.format.rowHeightPx = 30;
}

function applyBody(range) {
  range.format = {
    fill: "#FFFFFF",
    font: { color: "#1E293B", size: 10 },
    verticalAlignment: "top",
    wrapText: true,
  };
}

function formatMenuSheet(sheet, title, subtitle, rows, tableName) {
  styleTitle(sheet, title, subtitle, 10);
  const headers = [["구분", "레벨", "메뉴/페이지", "파일", "경로", "유형", "기능 설명", "기본 권한", "비고", "페이지 상태"]];
  const body = rows.map((row) => {
    const [section, level, menu, file, pagePath, type, desc, roleKeys, note] = row;
    return [section, level, menu, file, pagePath, type, desc, roleKeys.map((r) => roles.find((role) => role.key === r)?.label || r).join(", "), note, type.includes("상세") || type.includes("연결") || type.includes("리디렉션") ? "보조" : "메뉴"];
  });
  const startRow = 4;
  sheet.getRangeByIndexes(startRow, 0, 1, headers[0].length).values = headers;
  sheet.getRangeByIndexes(startRow + 1, 0, body.length, headers[0].length).values = body;
  applyHeader(sheet.getRangeByIndexes(startRow, 0, 1, headers[0].length), "#1E293B");
  applyBody(sheet.getRangeByIndexes(startRow + 1, 0, body.length, headers[0].length));
  sheet.freezePanes.freezeRows(startRow + 1);
  fitColumns(sheet, [120, 58, 190, 190, 340, 105, 500, 320, 250, 96]);
  sheet.getRangeByIndexes(startRow + 1, 1, body.length, 1).format.horizontalAlignment = "center";
  sheet.getRangeByIndexes(startRow + 1, 5, body.length, 1).format.horizontalAlignment = "center";
  sheet.getRangeByIndexes(startRow + 1, 9, body.length, 1).format.horizontalAlignment = "center";
  for (let i = 0; i < body.length; i++) {
    const section = body[i][0];
    const rowRange = sheet.getRangeByIndexes(startRow + 1 + i, 0, 1, headers[0].length);
    rowRange.format.fill = i % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
    sheet.getRangeByIndexes(startRow + 1 + i, 0, 1, 1).format = {
      fill: sectionColors[section] || "#475569",
      font: { color: "#FFFFFF", bold: true },
      horizontalAlignment: "center",
      verticalAlignment: "center",
    };
  }
  sheet.getRangeByIndexes(startRow, 0, body.length + 1, headers[0].length).format.autofitRows();
  const table = sheet.tables.add(`A${startRow + 1}:J${startRow + body.length + 1}`, true, tableName);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
}

const overview = wb.worksheets.add("요약");
styleTitle(overview, "Hotel PMS 메뉴 구조도", "현재 파일 기준 · 페이지/기능/기본 권한 요약", 10);
overview.getRange("A4:J4").merge();
overview.getRange("A4").values = [["구성 요약"]];
overview.getRange("A4:J4").format = { fill: "#0F766E", font: { color: "#FFFFFF", bold: true, size: 12 }, horizontalAlignment: "center" };
const cards = [
  ["대시보드 페이지", dashboardRows.length, "호텔 운영 포털 메뉴 및 연결 페이지"],
  ["어드민 페이지", adminRows.length, "Super Admin 포털 메뉴 및 연결 페이지"],
  ["기본 권한", roles.length, "현재 코드의 기본 role 구성"],
  ["총 페이지", dashboardRows.length + adminRows.length, "메뉴/상세/연결 페이지 합계"],
];
overview.getRange("A6:J8").values = [
  ["항목", "값", "설명", "", "항목", "값", "설명", "", "항목", "값"],
  [cards[0][0], cards[0][1], cards[0][2], "", cards[1][0], cards[1][1], cards[1][2], "", cards[2][0], cards[2][1]],
  ["", "", "", "", "", "", "", "", cards[3][0], cards[3][1]],
];
overview.getRange("A6:C8").format = { fill: "#ECFDF5", font: { color: "#064E3B", bold: true }, wrapText: true, verticalAlignment: "center" };
overview.getRange("E6:G8").format = { fill: "#EEF2FF", font: { color: "#312E81", bold: true }, wrapText: true, verticalAlignment: "center" };
overview.getRange("I6:J8").format = { fill: "#FFF7ED", font: { color: "#7C2D12", bold: true }, wrapText: true, verticalAlignment: "center" };
overview.getRange("A11:E11").values = [["권한", "적용 영역", "설명", "대시보드 여부", "어드민 여부"]];
overview.getRange("A12:E17").values = roles.map((role) => [role.label, role.scope, role.description, role.key.startsWith("sys_") ? "Y" : "", role.key === "super_admin" ? "Y" : ""]);
applyHeader(overview.getRange("A11:E11"), "#334155");
applyBody(overview.getRange("A12:E17"));
overview.getRange("G11:J11").values = [["포털", "영역", "기능 범위", "기본 권한"]];
overview.getRange("G12:J21").values = roleMatrix.map(([portal, area, scope, roleKeys]) => [portal, area, scope, roleKeys.map((r) => roles.find((role) => role.key === r)?.label || r).join(", ")]);
applyHeader(overview.getRange("G11:J11"), "#334155");
applyBody(overview.getRange("G12:J21"));
fitColumns(overview, [180, 150, 430, 125, 125, 28, 125, 170, 280, 360]);
overview.freezePanes.freezeRows(4);

const dashboard = wb.worksheets.add("대시보드");
formatMenuSheet(dashboard, "대시보드 메뉴 구조도", "호텔 운영 포털 · 페이지 기준 기능 설명 및 기본 권한", dashboardRows, "DashboardMenu");

const admin = wb.worksheets.add("어드민");
formatMenuSheet(admin, "어드민 메뉴 구조도", "Super Admin 포털 · 페이지 기준 기능 설명 및 기본 권한", adminRows, "AdminMenu");

const permission = wb.worksheets.add("권한 구성");
styleTitle(permission, "기본 권한 구성", "코드에 정의된 기본 role 기준 · 확장 RBAC 정책은 제외", 9);
permission.getRange("A5:F5").values = [["권한 코드", "표시명", "포털", "기본 업무 범위", "접근 기준", "비고"]];
permission.getRange("A6:F11").values = roles.map((role) => [
  role.key,
  role.label,
  role.key === "super_admin" ? "어드민" : "대시보드",
  role.scope,
  role.description,
  role.key === "super_admin" ? "admin_logged_in 세션 필요" : "localStorage currentUserRole 기준",
]);
applyHeader(permission.getRange("A5:F5"), "#1E293B");
applyBody(permission.getRange("A6:F11"));
permission.getRange("A14:I14").values = [["포털", "영역", "Admin", "General Manager", "Front Desk", "Housekeeping", "Maintenance", "Super Admin", "설명"]];
permission.getRange("A15:I24").values = roleMatrix.map(([portal, area, scope, roleKeys]) => [
  portal,
  area,
  roleKeys.includes("sys_admin") ? "●" : "",
  roleKeys.includes("sys_gm") ? "●" : "",
  roleKeys.includes("sys_desk") ? "●" : "",
  roleKeys.includes("sys_housekeeping") ? "●" : "",
  roleKeys.includes("sys_maintenance") ? "●" : "",
  roleKeys.includes("super_admin") ? "●" : "",
  scope,
]);
applyHeader(permission.getRange("A14:I14"), "#1E293B");
applyBody(permission.getRange("A15:I24"));
permission.getRange("C15:H24").format = { horizontalAlignment: "center", font: { color: "#0F766E", bold: true, size: 12 } };
fitColumns(permission, [130, 190, 105, 190, 190, 180, 130, 155, 430]);
permission.freezePanes.freezeRows(5);

for (const sheetName of ["요약", "대시보드", "어드민", "권한 구성"]) {
  const sheet = wb.worksheets.getItem(sheetName);
  sheet.getUsedRange().format.font.name = "맑은 고딕";
}

await fs.mkdir(outputDir, { recursive: true });

const check = await wb.inspect({
  kind: "table",
  range: "대시보드!A5:J15",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 10,
});
console.log(check.ndjson);

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of ["요약", "대시보드", "어드민", "권한 구성"]) {
  const preview = await wb.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(outputPath);
console.log(JSON.stringify({ outputPath, dashboardRows: dashboardRows.length, adminRows: adminRows.length }));
