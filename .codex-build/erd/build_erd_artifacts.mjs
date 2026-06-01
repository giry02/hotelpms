import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const outputDir = path.join(root, "outputs", "erd");
const { chromium } = await import(pathToFileURL(path.join(root, "node_modules", "playwright", "index.mjs")).href);
const { SpreadsheetFile, Workbook } = await import(pathToFileURL(path.join(
  root,
  ".codex-build",
  "menu-structure",
  "node_modules",
  "@oai",
  "artifact-tool",
  "dist",
  "artifact_tool.mjs",
)).href);

const paths = {
  svg: path.join(outputDir, "Hotel_PMS_Operating_ERD.svg"),
  png: path.join(outputDir, "Hotel_PMS_Operating_ERD.png"),
  html: path.join(outputDir, "Hotel_PMS_Operating_ERD.html"),
  mermaid: path.join(outputDir, "Hotel_PMS_Operating_ERD.mmd"),
  xlsx: path.join(outputDir, "Hotel_PMS_Table_Definition.xlsx"),
};

const groups = {
  platform: { label: "Admin / Platform", color: "#4F46E5", fill: "#EEF2FF" },
  core: { label: "Hotel Core", color: "#0F766E", fill: "#ECFDF5" },
  sales: { label: "Reservation / CRM", color: "#B45309", fill: "#FFF7ED" },
  ops: { label: "Operations / Billing", color: "#2563EB", fill: "#EFF6FF" },
};

const tables = [
  {
    id: "tenants",
    name: "tenants",
    ko: "입점 호텔/테넌트",
    group: "platform",
    x: 80,
    y: 150,
    desc: "플랫폼에 입점한 호텔 단위. 현재 admin tenants JSON의 운영 DB 대상.",
    source: "admin/data/api/v1/admin/tenants.json",
    fields: [
      ["PK", "tenant_id", "varchar", "호텔/테넌트 ID"],
      ["", "hotel_name", "varchar", "호텔명"],
      ["", "country", "varchar", "국가"],
      ["", "city", "varchar", "도시"],
      ["", "status", "varchar", "active/trial/suspended"],
      ["", "currency", "char(3)", "기본 통화"],
    ],
  },
  {
    id: "plans",
    name: "plans",
    ko: "구독 플랜",
    group: "platform",
    x: 80,
    y: 410,
    desc: "SaaS 구독 플랜과 과금 정책.",
    source: "admin/data/api/v1/admin/billing.json",
    fields: [
      ["PK", "plan_id", "varchar", "플랜 ID"],
      ["", "plan_name", "varchar", "Free/Standard/Premium"],
      ["", "monthly_fee", "decimal", "월 과금"],
      ["", "features", "json", "제공 기능"],
    ],
  },
  {
    id: "tenant_contracts",
    name: "tenant_contracts",
    ko: "호텔 계약",
    group: "platform",
    x: 420,
    y: 270,
    desc: "입점 호텔별 계약 기간, 구독 상태, 플랜 연결.",
    source: "admin/data/api/v1/admin/tenants.json",
    fields: [
      ["PK", "contract_id", "varchar", "계약 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "plan_id", "varchar", "plans"],
      ["", "contract_start", "date", "계약 시작"],
      ["", "contract_end", "date", "계약 종료"],
      ["", "billing_status", "varchar", "청구 상태"],
    ],
  },
  {
    id: "admin_users",
    name: "admin_users",
    ko: "플랫폼 관리자",
    group: "platform",
    x: 760,
    y: 150,
    desc: "Super Admin 포털 사용자.",
    source: "admin/data/api/v1/admin/users.json",
    fields: [
      ["PK", "admin_user_id", "varchar", "관리자 ID"],
      ["", "email", "varchar", "로그인 이메일"],
      ["", "name", "varchar", "관리자명"],
      ["", "role", "varchar", "super_admin"],
      ["", "status", "varchar", "계정 상태"],
    ],
  },
  {
    id: "audit_logs",
    name: "audit_logs",
    ko: "감사 로그",
    group: "platform",
    x: 760,
    y: 390,
    desc: "플랫폼/호텔 운영 변경 이력.",
    source: "admin/data/api/v1/admin/audit-logs.json",
    fields: [
      ["PK", "audit_log_id", "varchar", "로그 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["", "actor_type", "varchar", "admin/staff/system"],
      ["", "actor_id", "varchar", "행위자 ID"],
      ["", "action", "varchar", "수행 작업"],
      ["", "created_at", "datetime", "발생 시각"],
    ],
  },
  {
    id: "ad_campaigns",
    name: "ad_campaigns",
    ko: "광고 캠페인",
    group: "platform",
    x: 1080,
    y: 150,
    desc: "플랫폼 광고 캠페인과 소재 운영.",
    source: "admin/data/api/v1/admin/ads/campaigns.json",
    fields: [
      ["PK", "campaign_id", "varchar", "캠페인 ID"],
      ["", "advertiser_name", "varchar", "광고주"],
      ["", "campaign_name", "varchar", "캠페인명"],
      ["", "status", "varchar", "집행 상태"],
      ["", "start_date", "date", "시작일"],
      ["", "end_date", "date", "종료일"],
    ],
  },
  {
    id: "ad_targeting_rules",
    name: "ad_targeting_rules",
    ko: "광고 타겟팅",
    group: "platform",
    x: 1400,
    y: 150,
    desc: "국가/도시/호텔/세그먼트별 노출 규칙.",
    source: "admin/ads/targeting.html",
    fields: [
      ["PK", "rule_id", "varchar", "타겟팅 규칙 ID"],
      ["FK", "campaign_id", "varchar", "ad_campaigns"],
      ["FK", "tenant_id", "varchar", "tenants nullable"],
      ["", "country", "varchar", "국가 조건"],
      ["", "city", "varchar", "도시 조건"],
      ["", "weight", "int", "가중치"],
    ],
  },
  {
    id: "buildings",
    name: "buildings",
    ko: "동/건물",
    group: "core",
    x: 80,
    y: 770,
    desc: "호텔 내 건물/타워 구성.",
    source: "dashboard/data/api/v1/buildings/index.json",
    fields: [
      ["PK", "building_id", "varchar", "건물 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["", "building_name", "varchar", "건물명"],
      ["", "floor_count", "int", "층수"],
      ["", "active", "boolean", "사용 여부"],
    ],
  },
  {
    id: "room_types",
    name: "room_types",
    ko: "객실 유형",
    group: "core",
    x: 420,
    y: 770,
    desc: "객실 타입, 기준 인원, 기본 요금.",
    source: "dashboard/data/api/v1/room-types/index.json",
    fields: [
      ["PK", "room_type_id", "varchar", "객실 유형 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["", "type_name", "varchar", "유형명"],
      ["", "base_occupancy", "int", "기준 인원"],
      ["", "max_occupancy", "int", "최대 인원"],
      ["", "base_rate", "decimal", "기본 요금"],
    ],
  },
  {
    id: "rooms",
    name: "rooms",
    ko: "객실",
    group: "core",
    x: 760,
    y: 770,
    desc: "객실 마스터와 현재 프론트/하우스키핑 상태.",
    source: "dashboard/data/api/v1/rooms/index.json",
    fields: [
      ["PK", "room_id", "varchar", "객실 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "building_id", "varchar", "buildings"],
      ["FK", "room_type_id", "varchar", "room_types"],
      ["", "room_no", "varchar", "객실 번호"],
      ["", "front_status", "varchar", "프론트 상태"],
      ["", "housekeeping_status", "varchar", "청소 상태"],
    ],
  },
  {
    id: "daily_rates",
    name: "daily_rates",
    ko: "일자별 요금",
    group: "core",
    x: 1080,
    y: 770,
    desc: "객실 유형별 날짜 요금, 성수기/주말 정책.",
    source: "dashboard/data/api/v1/rates/calendar.json",
    fields: [
      ["PK", "daily_rate_id", "varchar", "요금 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "room_type_id", "varchar", "room_types"],
      ["", "stay_date", "date", "숙박일"],
      ["", "rate_amount", "decimal", "요금"],
      ["", "currency", "char(3)", "통화"],
    ],
  },
  {
    id: "roles",
    name: "roles",
    ko: "권한 역할",
    group: "core",
    x: 1400,
    y: 720,
    desc: "호텔 운영 포털 기본 권한 역할.",
    source: "dashboard/data/api/v1/settings/roles.json",
    fields: [
      ["PK", "role_id", "varchar", "역할 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["", "role_name", "varchar", "Admin/GM/Desk 등"],
      ["", "permissions", "json", "메뉴/기능 권한"],
    ],
  },
  {
    id: "staff_users",
    name: "staff_users",
    ko: "호텔 직원",
    group: "core",
    x: 1400,
    y: 950,
    desc: "호텔 운영 사용자와 권한.",
    source: "dashboard/data/api/v1/settings/staff.json",
    fields: [
      ["PK", "staff_id", "varchar", "직원 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "role_id", "varchar", "roles"],
      ["", "email", "varchar", "로그인 이메일"],
      ["", "name", "varchar", "직원명"],
      ["", "department", "varchar", "부서"],
      ["", "status", "varchar", "재직 상태"],
    ],
  },
  {
    id: "guests",
    name: "guests",
    ko: "고객/투숙객",
    group: "sales",
    x: 80,
    y: 1190,
    desc: "고객 프로필, 연락처, 등급, 누적 사용액.",
    source: "dashboard/data/api/v1/crm/guests.json",
    fields: [
      ["PK", "guest_id", "varchar", "고객 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "tier_id", "varchar", "membership_tiers"],
      ["", "guest_name", "varchar", "고객명"],
      ["", "phone", "varchar", "연락처"],
      ["", "email", "varchar", "이메일"],
      ["", "status", "varchar", "고객 상태"],
    ],
  },
  {
    id: "membership_tiers",
    name: "membership_tiers",
    ko: "멤버십 등급",
    group: "sales",
    x: 420,
    y: 1190,
    desc: "VIP 멤버십 등급과 혜택/승급 기준.",
    source: "dashboard/data/api/v1/crm/membership-tiers.json",
    fields: [
      ["PK", "tier_id", "varchar", "등급 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["", "tier_name", "varchar", "등급명"],
      ["", "min_spend", "decimal", "승급 기준"],
      ["", "benefits", "json", "혜택"],
    ],
  },
  {
    id: "companies",
    name: "companies",
    ko: "B2B 업체",
    group: "sales",
    x: 760,
    y: 1190,
    desc: "기업/여행사 계정과 계약 조건.",
    source: "dashboard/data/api/v1/b2b/companies.json",
    fields: [
      ["PK", "company_id", "varchar", "업체 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["", "company_name", "varchar", "업체명"],
      ["", "company_type", "varchar", "기업/여행사"],
      ["", "payment_terms", "varchar", "후불/개별 정산"],
      ["", "status", "varchar", "거래 상태"],
    ],
  },
  {
    id: "group_events",
    name: "group_events",
    ko: "단체/행사",
    group: "sales",
    x: 1080,
    y: 1190,
    desc: "단체 행사, 객실 블록, 담당 업체.",
    source: "dashboard/data/api/v1/groups/events.json",
    fields: [
      ["PK", "group_event_id", "varchar", "행사 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "company_id", "varchar", "companies"],
      ["", "event_name", "varchar", "행사명"],
      ["", "arrival_date", "date", "도착일"],
      ["", "departure_date", "date", "출발일"],
      ["", "status", "varchar", "행사 상태"],
    ],
  },
  {
    id: "reservations",
    name: "reservations",
    ko: "예약",
    group: "sales",
    x: 420,
    y: 1510,
    desc: "개별/단체 예약의 숙박 일정과 금액.",
    source: "dashboard/data/api/v1/reservations/index.json",
    fields: [
      ["PK", "reservation_id", "varchar", "예약 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "guest_id", "varchar", "guests"],
      ["FK", "room_id", "varchar", "rooms nullable"],
      ["FK", "room_type_id", "varchar", "room_types"],
      ["FK", "group_event_id", "varchar", "group_events nullable"],
      ["", "check_in_date", "date", "체크인"],
      ["", "check_out_date", "date", "체크아웃"],
      ["", "status", "varchar", "예약 상태"],
      ["", "total_amount", "decimal", "총 금액"],
    ],
  },
  {
    id: "room_allocations",
    name: "room_allocations",
    ko: "객실 배정",
    group: "sales",
    x: 1080,
    y: 1510,
    desc: "단체 행사 룸잉 리스트와 객실 배정.",
    source: "dashboard/data/api/v1/groups/room-allocations/*.json",
    fields: [
      ["PK", "allocation_id", "varchar", "배정 ID"],
      ["FK", "group_event_id", "varchar", "group_events"],
      ["FK", "reservation_id", "varchar", "reservations"],
      ["FK", "room_id", "varchar", "rooms"],
      ["", "guest_name", "varchar", "투숙객명"],
      ["", "status", "varchar", "배정 상태"],
    ],
  },
  {
    id: "folios",
    name: "folios",
    ko: "Folio 정산",
    group: "ops",
    x: 80,
    y: 1860,
    desc: "예약/객실 기준 투숙 folio.",
    source: "dashboard/data/api/v1/folios/index.json",
    fields: [
      ["PK", "folio_id", "varchar", "Folio ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "reservation_id", "varchar", "reservations"],
      ["FK", "guest_id", "varchar", "guests"],
      ["", "folio_status", "varchar", "open/closed"],
      ["", "balance_amount", "decimal", "잔액"],
    ],
  },
  {
    id: "folio_items",
    name: "folio_items",
    ko: "Folio 항목",
    group: "ops",
    x: 420,
    y: 1860,
    desc: "객실료, POS, 부가서비스, 조정 내역.",
    source: "dashboard/data/api/v1/folios/detail/*.json",
    fields: [
      ["PK", "folio_item_id", "varchar", "항목 ID"],
      ["FK", "folio_id", "varchar", "folios"],
      ["", "item_type", "varchar", "room/pos/service/tax"],
      ["", "description", "varchar", "항목 설명"],
      ["", "amount", "decimal", "금액"],
      ["", "posted_at", "datetime", "반영 시각"],
    ],
  },
  {
    id: "payments",
    name: "payments",
    ko: "결제",
    group: "ops",
    x: 760,
    y: 1860,
    desc: "결제 수단, 승인번호, 환불 상태.",
    source: "dashboard/operations/folio.html",
    fields: [
      ["PK", "payment_id", "varchar", "결제 ID"],
      ["FK", "folio_id", "varchar", "folios"],
      ["", "method", "varchar", "cash/card/transfer"],
      ["", "amount", "decimal", "결제 금액"],
      ["", "approval_no", "varchar", "승인번호"],
      ["", "paid_at", "datetime", "결제 시각"],
    ],
  },
  {
    id: "pos_orders",
    name: "pos_orders",
    ko: "POS 주문",
    group: "ops",
    x: 1080,
    y: 1860,
    desc: "부대업장/POS 주문과 Folio 연결.",
    source: "dashboard/data/api/v1/pos/orders.json",
    fields: [
      ["PK", "pos_order_id", "varchar", "주문 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "folio_id", "varchar", "folios nullable"],
      ["", "outlet", "varchar", "업장"],
      ["", "order_status", "varchar", "주문 상태"],
      ["", "total_amount", "decimal", "주문 금액"],
    ],
  },
  {
    id: "ancillary_orders",
    name: "ancillary_orders",
    ko: "부가서비스 주문",
    group: "ops",
    x: 1400,
    y: 1860,
    desc: "골프, 렌터카, 룸서비스 등 부가서비스.",
    source: "dashboard/data/api/v1/ancillaries/*.json",
    fields: [
      ["PK", "ancillary_order_id", "varchar", "주문 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "reservation_id", "varchar", "reservations nullable"],
      ["FK", "folio_id", "varchar", "folios nullable"],
      ["", "service_type", "varchar", "golf/rentacar/room_service"],
      ["", "status", "varchar", "처리 상태"],
      ["", "amount", "decimal", "금액"],
    ],
  },
  {
    id: "housekeeping_tasks",
    name: "housekeeping_tasks",
    ko: "하우스키핑 작업",
    group: "ops",
    x: 80,
    y: 2190,
    desc: "객실 청소/점검 작업과 담당자.",
    source: "dashboard/data/api/v1/operations/housekeeping-rooms.json",
    fields: [
      ["PK", "task_id", "varchar", "작업 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "room_id", "varchar", "rooms"],
      ["FK", "assigned_staff_id", "varchar", "staff_users nullable"],
      ["", "task_status", "varchar", "대기/진행/완료"],
      ["", "due_at", "datetime", "예정 시각"],
    ],
  },
  {
    id: "maintenance_requests",
    name: "maintenance_requests",
    ko: "시설 보수 요청",
    group: "ops",
    x: 420,
    y: 2190,
    desc: "객실/시설 보수 요청과 작업 상태.",
    source: "dashboard/data/api/v1/operations/maintenance-requests.json",
    fields: [
      ["PK", "maintenance_id", "varchar", "보수 요청 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["FK", "room_id", "varchar", "rooms nullable"],
      ["FK", "assigned_staff_id", "varchar", "staff_users nullable"],
      ["", "priority", "varchar", "우선순위"],
      ["", "status", "varchar", "처리 상태"],
    ],
  },
  {
    id: "night_audits",
    name: "night_audits",
    ko: "일일 마감",
    group: "ops",
    x: 760,
    y: 2190,
    desc: "일자별 마감 체크리스트와 정산 확정.",
    source: "dashboard/data/api/v1/night-audit/preview.json",
    fields: [
      ["PK", "night_audit_id", "varchar", "마감 ID"],
      ["FK", "tenant_id", "varchar", "tenants"],
      ["", "audit_date", "date", "마감일"],
      ["", "room_revenue", "decimal", "객실 매출"],
      ["", "folio_balance", "decimal", "Folio 잔액"],
      ["", "status", "varchar", "마감 상태"],
    ],
  },
  {
    id: "notices",
    name: "notices",
    ko: "공지사항",
    group: "ops",
    x: 1080,
    y: 2190,
    desc: "호텔/플랫폼 공지 게시.",
    source: "dashboard/data/api/v1/settings/menus.json, admin/data/api/v1/admin/notices.json",
    fields: [
      ["PK", "notice_id", "varchar", "공지 ID"],
      ["FK", "tenant_id", "varchar", "tenants nullable"],
      ["", "portal_scope", "varchar", "dashboard/admin"],
      ["", "title", "varchar", "제목"],
      ["", "status", "varchar", "게시 상태"],
      ["", "published_at", "datetime", "게시 시각"],
    ],
  },
  {
    id: "support_tickets",
    name: "support_tickets",
    ko: "고객지원 티켓",
    group: "ops",
    x: 1400,
    y: 2190,
    desc: "호텔/플랫폼 문의와 처리 상태.",
    source: "admin/data/api/v1/admin/support-tickets.json",
    fields: [
      ["PK", "ticket_id", "varchar", "문의 ID"],
      ["FK", "tenant_id", "varchar", "tenants nullable"],
      ["", "requester_name", "varchar", "요청자"],
      ["", "category", "varchar", "카테고리"],
      ["", "status", "varchar", "처리 상태"],
      ["", "created_at", "datetime", "접수 시각"],
    ],
  },
];

const relationships = [
  ["tenants", "tenant_contracts", "1:N", "tenant_id"],
  ["plans", "tenant_contracts", "1:N", "plan_id"],
  ["tenants", "audit_logs", "1:N", "tenant_id"],
  ["ad_campaigns", "ad_targeting_rules", "1:N", "campaign_id"],
  ["tenants", "ad_targeting_rules", "1:N", "tenant_id optional"],
  ["tenants", "buildings", "1:N", "tenant_id"],
  ["tenants", "room_types", "1:N", "tenant_id"],
  ["buildings", "rooms", "1:N", "building_id"],
  ["room_types", "rooms", "1:N", "room_type_id"],
  ["room_types", "daily_rates", "1:N", "room_type_id"],
  ["tenants", "roles", "1:N", "tenant_id"],
  ["roles", "staff_users", "1:N", "role_id"],
  ["tenants", "guests", "1:N", "tenant_id"],
  ["membership_tiers", "guests", "1:N", "tier_id"],
  ["tenants", "companies", "1:N", "tenant_id"],
  ["companies", "group_events", "1:N", "company_id"],
  ["guests", "reservations", "1:N", "guest_id"],
  ["rooms", "reservations", "1:N", "room_id"],
  ["room_types", "reservations", "1:N", "room_type_id"],
  ["group_events", "reservations", "1:N", "group_event_id"],
  ["group_events", "room_allocations", "1:N", "group_event_id"],
  ["reservations", "room_allocations", "1:N", "reservation_id"],
  ["rooms", "room_allocations", "1:N", "room_id"],
  ["reservations", "folios", "1:1", "reservation_id"],
  ["guests", "folios", "1:N", "guest_id"],
  ["folios", "folio_items", "1:N", "folio_id"],
  ["folios", "payments", "1:N", "folio_id"],
  ["folios", "pos_orders", "1:N", "folio_id optional"],
  ["reservations", "ancillary_orders", "1:N", "reservation_id optional"],
  ["folios", "ancillary_orders", "1:N", "folio_id optional"],
  ["rooms", "housekeeping_tasks", "1:N", "room_id"],
  ["rooms", "maintenance_requests", "1:N", "room_id optional"],
  ["staff_users", "housekeeping_tasks", "1:N", "assigned_staff_id"],
  ["staff_users", "maintenance_requests", "1:N", "assigned_staff_id"],
  ["tenants", "night_audits", "1:N", "tenant_id"],
  ["tenants", "notices", "1:N", "tenant_id optional"],
  ["tenants", "support_tickets", "1:N", "tenant_id optional"],
];

const tableById = new Map(tables.map((table) => [table.id, table]));

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function center(table) {
  return { x: table.x + 140, y: table.y + 70 };
}

function sidePoint(from, to) {
  const a = center(from);
  const b = center(to);
  const width = 280;
  const height = 48 + from.fields.length * 24;
  const toWidth = 280;
  const toHeight = 48 + to.fields.length * 24;

  if (Math.abs(a.x - b.x) > Math.abs(a.y - b.y)) {
    return {
      start: { x: a.x < b.x ? from.x + width : from.x, y: a.y },
      end: { x: a.x < b.x ? to.x : to.x + toWidth, y: b.y },
    };
  }
  return {
    start: { x: a.x, y: a.y < b.y ? from.y + height : from.y },
    end: { x: b.x, y: a.y < b.y ? to.y : to.y + toHeight },
  };
}

function renderTable(table) {
  const group = groups[table.group];
  const width = 280;
  const rowH = 24;
  const headerH = 48;
  const height = headerH + table.fields.length * rowH;
  const rows = table.fields.map((field, index) => {
    const y = table.y + headerH + index * rowH;
    const [key, name, type, desc] = field;
    const fill = index % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
    const keyColor = key === "PK" ? "#B91C1C" : key === "FK" ? "#0F766E" : "#64748B";
    return `
      <rect x="${table.x}" y="${y}" width="${width}" height="${rowH}" fill="${fill}" />
      <text x="${table.x + 12}" y="${y + 16}" class="key" fill="${keyColor}">${escapeXml(key)}</text>
      <text x="${table.x + 44}" y="${y + 16}" class="field">${escapeXml(name)}</text>
      <text x="${table.x + 170}" y="${y + 16}" class="type">${escapeXml(type)}</text>`;
  }).join("");

  return `
    <g class="entity" id="${table.id}">
      <rect x="${table.x}" y="${table.y}" width="${width}" height="${height}" rx="10" fill="#fff" stroke="#CBD5E1" stroke-width="1.2" filter="url(#shadow)" />
      <rect x="${table.x}" y="${table.y}" width="${width}" height="${headerH}" rx="10" fill="${group.color}" />
      <path d="M ${table.x} ${table.y + 38} L ${table.x + width} ${table.y + 38} L ${table.x + width} ${table.y + headerH} L ${table.x} ${table.y + headerH} Z" fill="${group.color}" />
      <text x="${table.x + 14}" y="${table.y + 20}" class="entity-name">${escapeXml(table.name)}</text>
      <text x="${table.x + 14}" y="${table.y + 38}" class="entity-ko">${escapeXml(table.ko)}</text>
      ${rows}
    </g>`;
}

function renderRelationship(rel, index) {
  const [fromId, toId, cardinality, label] = rel;
  const from = tableById.get(fromId);
  const to = tableById.get(toId);
  const { start, end } = sidePoint(from, to);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const bend = Math.abs(start.x - end.x) > Math.abs(start.y - end.y)
    ? `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`
    : `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
  const color = index % 3 === 0 ? "#64748B" : index % 3 === 1 ? "#94A3B8" : "#475569";

  return `
    <g class="relationship">
      <path d="${bend}" fill="none" stroke="${color}" stroke-width="1.35" marker-end="url(#arrow)" opacity="0.78" />
      <rect x="${midX - 39}" y="${midY - 12}" width="78" height="20" rx="10" fill="#FFFFFF" stroke="#E2E8F0" opacity="0.95" />
      <text x="${midX}" y="${midY + 4}" class="rel-label">${escapeXml(cardinality)}</text>
    </g>`;
}

function renderSvg() {
  const width = 1760;
  const height = 2540;
  const groupBands = [
    ["Admin / Platform", 40, 110, 1660, 560, "#EEF2FF", "#4F46E5"],
    ["Hotel Core", 40, 690, 1660, 430, "#ECFDF5", "#0F766E"],
    ["Reservation / CRM", 40, 1140, 1660, 610, "#FFF7ED", "#B45309"],
    ["Operations / Billing", 40, 1810, 1660, 600, "#EFF6FF", "#2563EB"],
  ].map(([label, x, y, w, h, fill, stroke]) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="1" opacity="0.56" />
    <text x="${x + 20}" y="${y + 32}" class="band-title" fill="${stroke}">${label}</text>
  `).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#0F172A" flood-opacity="0.12" />
    </filter>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748B" />
    </marker>
    <style>
      .title { font: 800 30px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#0F172A; }
      .subtitle { font: 600 14px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#475569; }
      .band-title { font: 800 16px "Noto Sans KR", "Segoe UI", Arial, sans-serif; }
      .entity-name { font: 800 14px "Segoe UI", Arial, sans-serif; fill:#FFFFFF; }
      .entity-ko { font: 700 12px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:rgba(255,255,255,.88); }
      .key { font: 800 10px "Segoe UI", Arial, sans-serif; }
      .field { font: 700 11px "Segoe UI", Arial, sans-serif; fill:#1E293B; }
      .type { font: 500 10px "Segoe UI", Arial, sans-serif; fill:#64748B; }
      .rel-label { font: 800 10px "Segoe UI", Arial, sans-serif; fill:#334155; text-anchor:middle; }
      .legend { font: 700 12px "Noto Sans KR", "Segoe UI", Arial, sans-serif; fill:#334155; }
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="#F8FAFC" />
  <text x="60" y="54" class="title">Hotel PMS 운영 DB ERD</text>
  <text x="60" y="82" class="subtitle">현재 Dashboard/Admin mock API를 운영 DB로 전환하기 위한 권장 논리 모델 · 2026-06-01 기준</text>
  <g transform="translate(1170 34)">
    ${Object.values(groups).map((group, index) => `
      <rect x="${index * 138}" y="0" width="16" height="16" rx="4" fill="${group.color}" />
      <text x="${index * 138 + 24}" y="13" class="legend">${escapeXml(group.label)}</text>`).join("")}
  </g>
  ${groupBands}
  <g id="relationships">${relationships.map(renderRelationship).join("")}</g>
  <g id="entities">${tables.map(renderTable).join("")}</g>
  <text x="60" y="2480" class="subtitle">표기: PK=기본키, FK=외래키. nullable/상세 제약은 테이블 정의서에서 보완했습니다.</text>
</svg>`;
}

function renderMermaid() {
  const chunks = ["erDiagram"];
  for (const table of tables) {
    chunks.push(`  ${table.name} {`);
    for (const [key, name, type, desc] of table.fields) {
      const suffix = key ? ` ${key}` : "";
      chunks.push(`    ${type.replace(/[()]/g, "")} ${name}${suffix} "${desc}"`);
    }
    chunks.push("  }");
  }
  for (const [from, to, cardinality, label] of relationships) {
    const rel = cardinality === "1:1" ? "||--||" : "||--o{";
    chunks.push(`  ${from} ${rel} ${to} : "${label}"`);
  }
  return chunks.join("\n");
}

async function renderPng(svg) {
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>Hotel PMS ERD</title>
  <style>
    html, body { margin: 0; padding: 0; background: #f8fafc; }
    body { width: 1760px; }
    svg { display: block; }
  </style>
</head>
<body>${svg}</body>
</html>`;
  await fs.writeFile(paths.html, html, "utf8");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1760, height: 2540 }, deviceScaleFactor: 1 });
  await page.goto(`file://${paths.html.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: paths.png, fullPage: true });
  await browser.close();
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

function fitColumns(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
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

async function renderWorkbook() {
  const wb = Workbook.create();

  const overview = wb.worksheets.add("요약");
  styleTitle(overview, "Hotel PMS 운영 DB ERD 요약", "운영 DB 전환 기준 논리 모델과 현재 mock API 매핑", 8);
  const summaryRows = [
    ["총 테이블", tables.length, "Dashboard/Admin 운영 DB 대상 엔티티"],
    ["관계 수", relationships.length, "핵심 PK/FK 관계"],
    ["포털 구분", "Dashboard + Admin", "호텔 운영 포털과 플랫폼 관리 포털 분리"],
    ["저장 기준", "운영 DB", "현재 localStorage/mock JSON 쓰기를 DB API로 전환하는 설계"],
  ];
  overview.getRange("A4:C4").values = [["항목", "값", "설명"]];
  overview.getRange("A5:C8").values = summaryRows;
  applyHeader(overview.getRange("A4:C4"), "#0F766E");
  applyBody(overview.getRange("A5:C8"));
  overview.getRange("E4:H4").values = [["영역", "테이블 수", "대표 테이블", "설명"]];
  overview.getRange("E5:H8").values = Object.entries(groups).map(([key, group]) => [
    group.label,
    tables.filter((table) => table.group === key).length,
    tables.filter((table) => table.group === key).slice(0, 4).map((table) => table.name).join(", "),
    key === "platform" ? "Super Admin, 입점 호텔, 광고, 감사 로그" :
      key === "core" ? "호텔 설정, 객실, 직원, 권한" :
      key === "sales" ? "고객, 예약, 단체 행사, B2B" :
      "Folio, 결제, POS, 하우스키핑, 보수",
  ]);
  applyHeader(overview.getRange("E4:H4"), "#334155");
  applyBody(overview.getRange("E5:H8"));
  fitColumns(overview, [130, 180, 460, 28, 180, 110, 420, 380]);

  const tableSheet = wb.worksheets.add("테이블 목록");
  styleTitle(tableSheet, "테이블 목록", "운영 DB 권장 테이블과 현재 JSON/화면 출처", 9);
  tableSheet.getRange("A4:I4").values = [["영역", "테이블명", "한글명", "주요 설명", "PK", "핵심 FK", "현재 출처", "권장 포털", "비고"]];
  tableSheet.getRangeByIndexes(4, 0, tables.length, 9).values = tables.map((table) => [
    groups[table.group].label,
    table.name,
    table.ko,
    table.desc,
    table.fields.find(([key]) => key === "PK")?.[1] || "",
    table.fields.filter(([key]) => key === "FK").map((field) => field[1]).join(", "),
    table.source,
    table.group === "platform" ? "Admin" : "Dashboard",
    table.group === "platform" ? "플랫폼 공통/관리 영역" : "호텔별 tenant_id 스코프 적용",
  ]);
  applyHeader(tableSheet.getRange("A4:I4"), "#1E293B");
  applyBody(tableSheet.getRangeByIndexes(4, 0, tables.length, 9));
  fitColumns(tableSheet, [160, 210, 180, 430, 170, 300, 430, 120, 300]);
  tableSheet.freezePanes.freezeRows(4);
  const table = tableSheet.tables.add(`A4:I${tables.length + 4}`, true, "ErdTables");
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;

  const columnSheet = wb.worksheets.add("컬럼 정의");
  styleTitle(columnSheet, "컬럼 정의", "주요 컬럼, 타입, 키, 설명", 8);
  const columnRows = tables.flatMap((tableDef) => tableDef.fields.map(([key, name, type, desc]) => [
    tableDef.name,
    tableDef.ko,
    name,
    type,
    key,
    key === "FK" ? (desc.split(" ")[0] || "") : "",
    key === "PK" ? "N" : "Y",
    desc,
  ]));
  columnSheet.getRange("A4:H4").values = [["테이블", "한글명", "컬럼", "타입", "키", "참조/후보", "Null", "설명"]];
  columnSheet.getRangeByIndexes(4, 0, columnRows.length, 8).values = columnRows;
  applyHeader(columnSheet.getRange("A4:H4"), "#1E293B");
  applyBody(columnSheet.getRangeByIndexes(4, 0, columnRows.length, 8));
  fitColumns(columnSheet, [210, 170, 210, 120, 70, 190, 70, 430]);
  columnSheet.freezePanes.freezeRows(4);
  const colTable = columnSheet.tables.add(`A4:H${columnRows.length + 4}`, true, "ErdColumns");
  colTable.style = "TableStyleMedium4";
  colTable.showFilterButton = true;

  const relSheet = wb.worksheets.add("관계 정의");
  styleTitle(relSheet, "관계 정의", "ERD PK/FK 관계와 카디널리티", 6);
  relSheet.getRange("A4:F4").values = [["From", "To", "관계", "연결 컬럼", "From 한글명", "To 한글명"]];
  relSheet.getRangeByIndexes(4, 0, relationships.length, 6).values = relationships.map(([from, to, cardinality, label]) => [
    from,
    to,
    cardinality,
    label,
    tableById.get(from).ko,
    tableById.get(to).ko,
  ]);
  applyHeader(relSheet.getRange("A4:F4"), "#1E293B");
  applyBody(relSheet.getRangeByIndexes(4, 0, relationships.length, 6));
  fitColumns(relSheet, [230, 230, 90, 240, 190, 190]);
  relSheet.freezePanes.freezeRows(4);
  const relTable = relSheet.tables.add(`A4:F${relationships.length + 4}`, true, "ErdRelations");
  relTable.style = "TableStyleMedium9";
  relTable.showFilterButton = true;

  const xlsx = await SpreadsheetFile.exportXlsx(wb);
  await xlsx.save(paths.xlsx);
}

await fs.mkdir(outputDir, { recursive: true });
const svg = renderSvg();
await fs.writeFile(paths.svg, svg, "utf8");
await fs.writeFile(paths.mermaid, renderMermaid(), "utf8");
await renderPng(svg);
await renderWorkbook();

console.log(JSON.stringify({
  outputDir,
  tables: tables.length,
  relationships: relationships.length,
  files: paths,
}, null, 2));
