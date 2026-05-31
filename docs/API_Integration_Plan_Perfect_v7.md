# Hotel PMS API Integration Plan Perfect v7

작성일: 2026-05-28  
목적: 현재 `dashboard`와 `admin` 프론트 화면을 실제 백엔드 API와 연결하기 위한 페이지별 API 연동 계획서

## 1. 방향성

이 문서는 단순한 API 목록이 아니라, **각 페이지가 로딩 시 어떤 API를 호출하고, 버튼/저장/상태 변경 시 어떤 API를 호출해야 하는지**를 기준으로 작성한다.

현재 프론트는 `PmsAPI`, JSON mock 파일, `localStorage`가 섞여 있다. 실제 API 연동 시에는 아래 원칙으로 정리한다.

1. 화면은 직접 `localStorage`를 업무 데이터 저장소로 사용하지 않는다.
2. `PmsAPI`는 유지하되 내부 구현을 `ApiClient.fetch()` 기반으로 교체한다.
3. 개발/데모용 mock은 `USE_MOCK_API=true`일 때만 사용한다.
4. 날짜, 금액, 통화, 상태값, 권한, 에러 포맷은 모든 API에서 동일한 규칙을 사용한다.
5. 단체 업체, 행사, 객실 블록, 투숙객 명단은 별도 도메인으로 분리한다.
6. 예약 타임라인은 “예약”과 “단체 블록”을 모두 표현하되, 블록 상태와 실제 투숙객 배정 상태를 구분한다.

## 2. 공통 계약

### 2.1 Base URL

- Dashboard PMS: `/api/v1`
- Admin Console: `/api/v1/admin`
- Static mock fallback: `dashboard/data/**`, `admin/data/**`

### 2.2 인증

모든 업무 API는 아래 헤더를 사용한다.

| Header | 설명 |
|---|---|
| `Authorization: Bearer {accessToken}` | 로그인 후 발급 토큰 |
| `X-Tenant-Id` | 호텔/테넌트 ID |
| `X-Request-Id` | 요청 추적 ID |
| `Idempotency-Key` | POST 중복 방지. 예약 생성, 결제, 체크인, 체크아웃에 필수 |

### 2.3 응답 포맷

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "REQ-20260528-0001",
    "timezone": "Asia/Seoul",
    "currency": "KRW"
  }
}
```

목록 API는 아래 `page` 객체를 포함한다.

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": {
      "number": 1,
      "size": 20,
      "totalElements": 120,
      "totalPages": 6
    }
  }
}
```

에러는 아래 구조로 통일한다.

```json
{
  "success": false,
  "error": {
    "code": "RESERVATION_ROOM_CONFLICT",
    "message": "해당 기간에 이미 배정된 객실입니다.",
    "field": "roomId",
    "details": {}
  },
  "meta": {
    "requestId": "REQ-20260528-0002"
  }
}
```

### 2.4 공통 규칙

| 항목 | 표준 |
|---|---|
| 날짜 | `YYYY-MM-DD` |
| 일시 | ISO-8601, 예: `2026-05-28T16:45:00+09:00` |
| 통화 | 호텔 설정 통화. 기본 `KRW` |
| 금액 | 정수 minor unit 또는 `amount`, `currency` 쌍. KRW는 정수 |
| 상태값 | kebab-case 사용. 예: `checked-in`, `checked-out`, `blocked` |
| ID | 도메인 prefix 사용. 예: `RSV-`, `GRP-`, `COMP-`, `GST-` |
| 삭제 | 기본 soft delete. 응답에 `deletedAt`, `deletedBy` 기록 |
| 감사 로그 | 생성/수정/상태변경/결제/권한 변경은 audit log 필수 |

## 3. 페이지별 API 연동 맵

### 3.1 Dashboard PMS

| 페이지 | 로딩 API | 액션 API | 교체 대상 |
|---|---|---|---|
| `dashboard/login.html` | - | `POST /auth/login`, `POST /auth/password-reset/request` | 임시 로그인 |
| `dashboard/index.html`, `dashboard/dashboard.html` | `GET /dashboard/summary`, `GET /dashboard/kpis`, `GET /dashboard/revenue-chart`, `GET /dashboard/today-activities` | - | `dashboard/data/dashboard/dashboard.json`, `dashboard-dynamic.js` |
| `dashboard/notifications.html` | `GET /notifications` | `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all` | 화면 내 정적 데이터 |

### 3.2 Frontdesk

| 페이지 | 로딩 API | 액션 API | 교체 대상 |
|---|---|---|---|
| `frontdesk/reservation-timeline.html` | `GET /rooms`, `GET /reservations/timeline`, `GET /groups/events?includeBlocks=true` | `GET /reservations/{id}`, `PATCH /reservations/{id}/status`, `GET /rooms/availability` | `PmsAPI.getAllRooms`, `PmsAPI.getTimelineReservations`, `pms_groups` |
| `frontdesk/reservation-list.html` | `GET /reservations` | `POST /reservations`, `PATCH /reservations/{id}`, `POST /reservations/{id}/cancel`, `PATCH /reservations/{id}/status` | `PmsAPI.getReservations`, `pms_reservations` |
| `frontdesk/checkin.html` | `GET /frontdesk/checkins`, `GET /frontdesk/checkouts` | `POST /reservations/{id}/check-in`, `POST /reservations/{id}/check-out`, `PATCH /rooms/{id}/guest-flag` | `PmsAPI.setGuestFlag` |
| `frontdesk/groups_companies.html` | `GET /b2b/companies`, `GET /b2b/companies/summary` | `POST /b2b/companies`, `PATCH /b2b/companies/{id}`, `DELETE /b2b/companies/{id}` | `pms_companies` |
| `frontdesk/groups_blocks.html` | `GET /groups/events`, `GET /b2b/companies`, `GET /rooms`, `GET /reservations?grouped=true` | `POST /groups/events`, `PATCH /groups/events/{id}`, `DELETE /groups/events/{id}` | `pms_groups`, `pms_companies`, `pms_daily_rates` |
| `frontdesk/groups_block_detail.html` | `GET /groups/events/{id}`, `GET /groups/events/{id}/room-allocations`, `GET /groups/events/{id}/rooming-list`, `GET /rooms/availability`, `GET /reservations?groupId={id}` | `POST/PATCH /groups/events/{id}/room-allocations`, `POST/PATCH /groups/events/{id}/rooming-list`, `POST /groups/events/{id}/sync-reservations`, `POST /reservations` | `roomAllocations`, `roomingList`, `pms_reservations` |

### 3.3 CRM

| 페이지 | 로딩 API | 액션 API | 교체 대상 |
|---|---|---|---|
| `crm/guests.html` | `GET /crm/guests` | `POST /crm/guests`, `PATCH /crm/guests/{id}`, `POST /crm/guests/{id}/documents`, `POST /crm/guests/{id}/notes` | `dashboard/data/crm/guests.json` |
| `crm/membership.html` | `GET /crm/guests?membership=true`, `GET /crm/membership/tiers` | `PATCH /crm/guests/{id}/membership`, `POST /crm/membership/tiers` | `PmsAPI.getGuests` |
| `crm/tier-history.html` | `GET /crm/guests/{id}/tier-history`, `GET /crm/tier-history` | - | `PmsAPI.getHistory` |

### 3.4 Operations

| 페이지 | 로딩 API | 액션 API | 교체 대상 |
|---|---|---|---|
| `operations/rooms.html` | `GET /rooms`, `GET /room-types` | `PATCH /rooms/{id}/status`, `PATCH /rooms/{id}/guest-flag` | `PmsAPI.getAllRooms`, `PmsAPI.saveRooms` |
| `operations/room-setup.html` | `GET /buildings`, `GET /rooms`, `GET /room-types` | `POST/PATCH/DELETE /buildings`, `POST/PATCH/DELETE /rooms` | `PmsAPI.getBuildings`, `PmsAPI.saveBuildings`, `PmsAPI.saveRooms` |
| `operations/housekeeping.html` | `GET /operations/housekeeping/rooms`, `GET /operations/tasks`, `GET /settings/maintenance-types`, `GET /settings/staff` | `POST /operations/tasks`, `PATCH /operations/tasks/{id}`, `PATCH /rooms/{id}/housekeeping-status` | `PmsAPI.getTasks`, `PmsAPI.saveTasks`, `pms_tasks` |
| `operations/maintenance.html` | `GET /operations/maintenance/requests`, `GET /settings/maintenance-types`, `GET /settings/staff` | `POST /operations/maintenance/requests`, `PATCH /operations/maintenance/requests/{id}` | `pms_maintenance` |
| `operations/rates.html` | `GET /room-types`, `GET /rates/calendar`, `GET /b2b/companies` | `PUT /rates/calendar`, `PUT /b2b/companies/{id}/rate-policy` | `pms_room_types_config`, `pms_daily_rates`, `pms_companies` |
| `operations/folio.html` | `GET /folios`, `GET /reservations/{id}/folio` | `POST /folios/{id}/charges`, `POST /folios/{id}/payments`, `POST /folios/{id}/close` | `dashboard/data/folios.json` |
| `operations/folio-chart.html` | `GET /reports/revenue/daily`, `GET /reports/revenue/monthly`, `GET /reports/revenue/yoy`, `GET /reports/revenue/departments`, `GET /reports/revenue/trend` | - | `PmsAPI.getDailyData`, `getMonthlyData`, `getYoyData`, `getDepts`, `getTrendData` |
| `operations/reports.html` | 동일 | - | 동일 |
| `operations/night-audit.html` | `GET /night-audit/preview`, `GET /reports/revenue/daily`, `GET /orders`, `GET /golf/orders`, `GET /rentacar/orders` | `POST /night-audit/run` | `PmsAPI.getOrders`, `getGolfOrders`, `getRentacarOrders` |
| `operations/golf.html` | `GET /ancillaries/golf/orders` | `POST /ancillaries/golf/orders`, `PATCH /ancillaries/golf/orders/{id}` | `PmsAPI.getGolfOrders` |
| `operations/rentacar.html` | `GET /ancillaries/rentacar/orders` | `POST /ancillaries/rentacar/orders`, `PATCH /ancillaries/rentacar/orders/{id}` | `PmsAPI.getRentacarOrders` |
| `operations/room-service.html`, `operations/pos.html`, `operations/unified-pos.html`, `operations/ancillary.html` | `GET /pos/orders`, `GET /pos/items`, `GET /ancillaries` | `POST /pos/orders`, `PATCH /pos/orders/{id}`, `POST /folios/{id}/charges` | 정적/임시 데이터 |

### 3.5 Settings

| 페이지 | 로딩 API | 액션 API | 교체 대상 |
|---|---|---|---|
| `settings/settings.html` | `GET /settings/hotel`, `GET /settings/currency` | `PUT /settings/hotel`, `PUT /settings/currency` | `pms_default_currency` |
| `settings/roles.html` | `GET /settings/menus`, `GET /settings/roles` | `POST /settings/roles`, `PATCH /settings/roles/{id}`, `DELETE /settings/roles/{id}` | `PmsAPI.getALL_MENUS`, `PmsAPI.getSYSTEM_ROLES`, `pms_custom_roles` |
| `settings/staff.html` | `GET /settings/staff`, `GET /settings/roles` | `POST /settings/staff`, `PATCH /settings/staff/{id}`, `POST /settings/staff/{id}/password-reset`, `PATCH /settings/staff/{id}/status` | `pms_staff` |
| `settings/billing.html` | `GET /settings/billing`, `GET /billing/invoices` | `PUT /settings/billing`, `POST /billing/payment-methods` | 화면 내 정적 데이터 |
| `settings/notices.html` | `GET /notices` | `POST /notices`, `PATCH /notices/{id}`, `DELETE /notices/{id}` | 화면 내 정적 데이터 |
| `settings/support.html` | `GET /support/tickets` | `POST /support/tickets`, `POST /support/tickets/{id}/messages` | 화면 내 정적 데이터 |

### 3.6 Admin Console

| 페이지 | 로딩 API | 액션 API | 교체 대상 |
|---|---|---|---|
| `admin/login.html` | - | `POST /admin/auth/login`, `POST /admin/auth/password-reset/request` | 임시 로그인 |
| `admin/admin.html`, `admin/index.html` | `GET /admin/dashboard/summary`, `GET /admin/tenants?limit=5`, `GET /admin/audit-logs?limit=10` | - | `admin/data/*.json` |
| `admin/tenants/apply.html` | - | `POST /admin/tenant-applications` | `admin_tenant_applications` |
| `admin/tenants/list.html` | `GET /admin/tenants`, `GET /admin/tenant-applications` | `PATCH /admin/tenant-applications/{id}/approve`, `PATCH /admin/tenant-applications/{id}/reject` | `admin_tenant_applications`, `admin/data/tenant-applications.json` |
| `admin/tenants/detail.html` | `GET /admin/tenants/{id}`, `GET /admin/tenants/{id}/users`, `GET /admin/tenants/{id}/billing`, `GET /admin/tenants/{id}/audit-logs` | `PATCH /admin/tenants/{id}`, `PATCH /admin/tenants/{id}/status`, `POST /admin/tenants/{id}/users/{userId}/password-reset` | JSON mock |
| `admin/tenants/register.html` | `GET /admin/plans` | `POST /admin/tenants`, `POST /admin/tenants/{id}/users` | JSON mock |
| `admin/system/users.html` | `GET /admin/users`, `GET /admin/roles` | `POST /admin/users`, `PATCH /admin/users/{id}`, `POST /admin/users/{id}/password-reset`, `PATCH /admin/users/{id}/status` | `admin/data/users.json` |
| `admin/system/profile.html` | `GET /admin/auth/me` | `PATCH /admin/users/me`, `PATCH /admin/users/me/password` | JSON mock |
| `admin/system/billing.html` | `GET /admin/billing/summary`, `GET /admin/billing/invoices` | `POST /admin/billing/invoices/{id}/mark-paid` | `admin/data/billing.json` |
| `admin/system/audit-logs.html` | `GET /admin/audit-logs` | `GET /admin/audit-logs/export` | `admin/data/audit-logs.json` |
| `admin/system/helpdesk.html` | `GET /admin/support/tickets` | `POST /admin/support/tickets/{id}/messages`, `PATCH /admin/support/tickets/{id}/status` | `admin/data/tickets.json` |
| `admin/system/notices.html` | `GET /admin/notices` | `POST/PATCH/DELETE /admin/notices` | JSON mock |
| `admin/system/integrations.html` | `GET /admin/integrations` | `PATCH /admin/integrations/{id}` | JSON mock |
| `admin/ads/*.html` | `GET /admin/ads/campaigns`, `GET /admin/ads/billing`, `GET /admin/ads/targeting` | `POST/PATCH/DELETE /admin/ads/campaigns`, `POST /admin/ads/campaigns/{id}/publish` | JSON mock |

## 4. 핵심 API 계약

### 4.1 Auth

| Method | URI | 설명 | 주요 Request | 주요 Response |
|---|---|---|---|---|
| POST | `/auth/login` | 호텔 PMS 로그인 | `email`, `password`, `tenantCode` | `accessToken`, `refreshToken`, `user`, `tenant` |
| POST | `/auth/logout` | 로그아웃 | - | `success` |
| GET | `/auth/me` | 현재 사용자 | - | `user`, `permissions`, `tenant` |
| POST | `/auth/password-reset/request` | 비밀번호 재설정 메일 요청 | `email` | `success` |
| POST | `/auth/password-reset/confirm` | 비밀번호 재설정 완료 | `token`, `newPassword` | `success` |

### 4.2 Reservations

| Method | URI | 설명 | 주요 Request | 주요 Response |
|---|---|---|---|---|
| GET | `/reservations` | 예약 목록 | `startDate`, `endDate`, `status`, `keyword`, `groupId`, `page`, `size` | `items`, `page` |
| GET | `/reservations/{id}` | 예약 상세 | `id` | 예약 상세, 투숙객, 결제, folio, history |
| POST | `/reservations` | 신규 예약 | `guest`, `roomId`, `checkInDate`, `checkOutDate`, `rate`, `channel`, `groupId?` | `reservationId` |
| PATCH | `/reservations/{id}` | 예약 수정 | 변경 필드 | 예약 상세 |
| POST | `/reservations/{id}/cancel` | 예약 취소 | `reason` | `status=cancelled` |
| PATCH | `/reservations/{id}/status` | 상태 변경 | `status` | 변경 상태 |
| POST | `/reservations/{id}/check-in` | 체크인 | `verifiedGuestIds`, `paymentPolicy`, `keyCards` | `status=checked-in` |
| POST | `/reservations/{id}/check-out` | 체크아웃 | `folioId`, `settlementMethod` | `status=checked-out` |
| GET | `/reservations/timeline` | 타임라인 표시용 | `startDate`, `days`, `building`, `roomType` | 객실별 예약/블록 |

### 4.3 Rooms and Rates

| Method | URI | 설명 |
|---|---|---|
| GET | `/rooms` | 객실 목록 |
| POST | `/rooms` | 객실 등록 |
| PATCH | `/rooms/{id}` | 객실 수정 |
| DELETE | `/rooms/{id}` | 객실 삭제 |
| GET | `/rooms/availability` | 기간 기준 가용 객실 |
| PATCH | `/rooms/{id}/status` | 프론트/하우스키핑 상태 변경 |
| PATCH | `/rooms/{id}/guest-flag` | DND/MUR/Away 등 플래그 |
| GET | `/buildings` | 건물 목록 |
| POST | `/buildings` | 건물 등록 |
| PATCH | `/buildings/{id}` | 건물 수정 |
| DELETE | `/buildings/{id}` | 건물 삭제 |
| GET | `/room-types` | 객실 타입 목록 |
| POST | `/room-types` | 객실 타입 등록 |
| PATCH | `/room-types/{id}` | 객실 타입 수정 |
| DELETE | `/room-types/{id}` | 객실 타입 삭제 |
| GET | `/rates/calendar` | 요금 캘린더 조회 |
| PUT | `/rates/calendar` | 일자/객실 타입별 요금 저장 |
| GET | `/rates/quote` | 객실/기간/업체 할인 반영 견적 |

### 4.4 Groups, B2B, Rooming List

| Method | URI | 설명 | 주요 필드 |
|---|---|---|---|
| GET | `/b2b/companies` | 단체/업체 목록 | `keyword`, `status`, `page` |
| POST | `/b2b/companies` | 업체 등록 | `name`, `type`, `contact`, `discountPercent`, `billingPolicy` |
| PATCH | `/b2b/companies/{id}` | 업체 수정 | 업체 필드 |
| DELETE | `/b2b/companies/{id}` | 업체 삭제 | - |
| PUT | `/b2b/companies/{id}/rate-policy` | 업체 할인율/요금 정책 저장 | `discountPercent`, `rateOverrides` |
| GET | `/groups/events` | 단체 행사 목록 | `companyId`, `status`, `dateFrom`, `dateTo`, `keyword` |
| POST | `/groups/events` | 단체 행사 생성 | `companyId`, `name`, `checkInDate`, `checkOutDate`, `pax`, `salesUserId` |
| GET | `/groups/events/{id}` | 단체 행사 상세 | 행사, 업체, 객실, 투숙객, history |
| PATCH | `/groups/events/{id}` | 행사 기본정보 수정 | 변경 필드 |
| DELETE | `/groups/events/{id}` | 행사 삭제 | - |
| GET | `/groups/events/{id}/room-allocations` | 배정 객실 목록 | `roomId`, `roomType`, `baseRate`, `discountPercent`, `finalRate` |
| PUT | `/groups/events/{id}/room-allocations` | 객실 배정 저장 | 객실 배열 |
| GET | `/groups/events/{id}/rooming-list` | 투숙객 명단 | `roomId`, `guestId`, `name`, `phone`, `nationality`, `docStatus`, `specialNotes` |
| POST | `/groups/events/{id}/rooming-list` | 투숙객 등록 | 투숙객 정보 |
| PATCH | `/groups/events/{id}/rooming-list/{guestId}` | 투숙객 수정 | 변경 필드 |
| DELETE | `/groups/events/{id}/rooming-list/{guestId}` | 투숙객 제거 | - |
| POST | `/groups/events/{id}/sync-reservations` | 객실 블록을 예약/타임라인에 반영 | - |
| PATCH | `/groups/events/{id}/status` | 행사 상태 변경 | `pending`, `confirmed`, `in-house`, `departed`, `cancelled` |

단체 흐름은 아래 상태를 분리한다.

| 상태 | 의미 | 타임라인 표시 |
|---|---|---|
| `blocked` | 객실만 선점, 투숙객 미등록 | 단체 배지 + 업체/행사명 |
| `assigned` | 객실에 투숙객 이름 연결 완료 | 단체 배지 + 업체/행사명 + 투숙객명 |
| `checked-in` | 실제 체크인 완료 | 일반 예약 색상 + 단체 배지 |
| `checked-out` | 체크아웃 완료 | 과거 예약 처리 |

### 4.5 CRM Guests

| Method | URI | 설명 |
|---|---|---|
| GET | `/crm/guests` | 고객 검색/목록 |
| POST | `/crm/guests` | 신규 고객 등록 |
| GET | `/crm/guests/{id}` | 고객 상세 |
| PATCH | `/crm/guests/{id}` | 고객 수정 |
| POST | `/crm/guests/{id}/documents` | 여권/신분증 상태 저장 |
| POST | `/crm/guests/{id}/notes` | 특이사항/알러지/메모 저장 |
| GET | `/crm/guests/{id}/stay-history` | 투숙 이력 |
| GET | `/crm/guests/{id}/tier-history` | 등급 이력 |
| PATCH | `/crm/guests/{id}/membership` | 멤버십 등급 수정 |

### 4.6 Operations

| Method | URI | 설명 |
|---|---|---|
| GET | `/operations/housekeeping/rooms` | 청소 상태 객실 조회 |
| GET | `/operations/tasks` | 운영 태스크 목록 |
| POST | `/operations/tasks` | 태스크 생성 |
| PATCH | `/operations/tasks/{id}` | 태스크 수정/완료 |
| GET | `/operations/maintenance/requests` | 시설보수 요청 목록 |
| POST | `/operations/maintenance/requests` | 시설보수 등록 |
| PATCH | `/operations/maintenance/requests/{id}` | 시설보수 상태/담당자 변경 |
| GET | `/pos/orders` | POS/룸서비스 주문 목록 |
| POST | `/pos/orders` | 주문 등록 |
| PATCH | `/pos/orders/{id}` | 주문 상태 변경 |
| GET | `/ancillaries/golf/orders` | 골프 주문 |
| POST | `/ancillaries/golf/orders` | 골프 주문 등록 |
| PATCH | `/ancillaries/golf/orders/{id}` | 골프 주문 수정 |
| GET | `/ancillaries/rentacar/orders` | 렌터카 주문 |
| POST | `/ancillaries/rentacar/orders` | 렌터카 주문 등록 |
| PATCH | `/ancillaries/rentacar/orders/{id}` | 렌터카 주문 수정 |

### 4.7 Folio, Settlement, Reports

| Method | URI | 설명 |
|---|---|---|
| GET | `/folios` | folio 목록 |
| GET | `/folios/{id}` | folio 상세 |
| POST | `/folios/{id}/charges` | 요금 추가 |
| POST | `/folios/{id}/payments` | 결제 등록 |
| POST | `/folios/{id}/close` | folio 마감 |
| GET | `/settlements/open-items` | 미정산 항목 |
| POST | `/settlements/batch-close` | 일괄 정산 |
| GET | `/reports/revenue/daily` | 일별 매출 |
| GET | `/reports/revenue/monthly` | 월별 매출 |
| GET | `/reports/revenue/yoy` | 전년 대비 |
| GET | `/reports/revenue/departments` | 부서별 매출 |
| GET | `/reports/revenue/trend` | 추이 테이블 |
| GET | `/night-audit/preview` | 야간마감 사전 점검 |
| POST | `/night-audit/run` | 야간마감 실행 |

### 4.8 Settings

| Method | URI | 설명 |
|---|---|---|
| GET | `/settings/hotel` | 호텔 설정 |
| PUT | `/settings/hotel` | 호텔 설정 저장 |
| GET | `/settings/currency` | 통화 설정 |
| PUT | `/settings/currency` | 통화 설정 저장 |
| GET | `/settings/menus` | 메뉴/권한 매트릭스 |
| GET | `/settings/roles` | 역할 목록 |
| POST | `/settings/roles` | 역할 생성 |
| PATCH | `/settings/roles/{id}` | 역할 수정 |
| DELETE | `/settings/roles/{id}` | 역할 삭제 |
| GET | `/settings/staff` | 직원 목록 |
| POST | `/settings/staff` | 직원 등록 |
| PATCH | `/settings/staff/{id}` | 직원 수정 |
| PATCH | `/settings/staff/{id}/status` | 직원 활성/비활성 |
| POST | `/settings/staff/{id}/password-reset` | 직원 비밀번호 초기화 메일 |
| GET | `/settings/maintenance-types` | 시설보수 유형 |

### 4.9 Admin

| Method | URI | 설명 |
|---|---|---|
| POST | `/admin/auth/login` | 어드민 로그인 |
| GET | `/admin/auth/me` | 어드민 현재 사용자 |
| POST | `/admin/auth/password-reset/request` | 어드민 비밀번호 초기화 요청 |
| GET | `/admin/dashboard/summary` | 어드민 대시보드 |
| GET | `/admin/tenant-applications` | 입점 신청 목록 |
| POST | `/admin/tenant-applications` | 호텔 입점 신청 |
| PATCH | `/admin/tenant-applications/{id}/approve` | 입점 승인 |
| PATCH | `/admin/tenant-applications/{id}/reject` | 입점 반려 |
| GET | `/admin/tenants` | 호텔 목록 |
| POST | `/admin/tenants` | 관리자 직접 호텔 등록 |
| GET | `/admin/tenants/{id}` | 호텔 상세 |
| PATCH | `/admin/tenants/{id}` | 호텔 수정 |
| PATCH | `/admin/tenants/{id}/status` | 호텔 활성/비활성 |
| GET | `/admin/tenants/{id}/users` | 호텔 사용자 목록 |
| POST | `/admin/tenants/{id}/users` | 호텔 사용자 생성 |
| POST | `/admin/tenants/{id}/users/{userId}/password-reset` | 호텔 사용자 비밀번호 초기화 |
| GET | `/admin/users` | 어드민 사용자 목록 |
| POST | `/admin/users` | 어드민 사용자 생성 |
| PATCH | `/admin/users/{id}` | 어드민 사용자 수정 |
| POST | `/admin/users/{id}/password-reset` | 어드민 사용자 비밀번호 초기화 |
| GET | `/admin/billing/summary` | 전체 과금 요약 |
| GET | `/admin/billing/invoices` | 청구서 목록 |
| GET | `/admin/audit-logs` | 감사 로그 |
| GET | `/admin/support/tickets` | 고객지원 티켓 |
| GET | `/admin/ads/campaigns` | 광고 캠페인 |
| POST | `/admin/ads/campaigns` | 광고 캠페인 생성 |
| PATCH | `/admin/ads/campaigns/{id}` | 광고 캠페인 수정 |

## 5. 주요 데이터 모델

### 5.1 Reservation

| 필드 | 설명 |
|---|---|
| `id` | 예약 ID |
| `tenantId` | 호텔 ID |
| `guestId` | 대표 투숙객 ID |
| `roomId` | 실제 호실 ID |
| `roomTypeId` | 객실 타입 ID |
| `checkInDate`, `checkOutDate` | 숙박 기간 |
| `status` | `reserved`, `confirmed`, `blocked`, `checked-in`, `checked-out`, `cancelled`, `no-show` |
| `channel` | `direct`, `ota`, `corporate`, `group`, `walk-in` |
| `groupEventId` | 단체 행사 연결 |
| `roomingGuestId` | 단체 rooming list 투숙객 연결 |
| `rate` | 1박 최종 단가 |
| `baseRate` | 기준 단가 |
| `discountPercent` | 할인율 |
| `currency` | 통화 |
| `isGroupPlaceholder` | 단체 블록 placeholder 여부 |

### 5.2 Group Event

| 필드 | 설명 |
|---|---|
| `id` | 행사 ID |
| `companyId` | 업체 ID |
| `name` | 행사명 |
| `type` | 행사 유형 |
| `checkInDate`, `checkOutDate` | 기간 |
| `pax` | 총 인원 |
| `status` | `draft`, `pending`, `confirmed`, `in-house`, `departed`, `cancelled` |
| `roomAllocations` | 실제 호실 배정 배열 |
| `roomingList` | 투숙객 명단 |
| `salesUserId` | 담당 영업 직원 |
| `billingPolicy` | master folio, individual, split |

### 5.3 Room Allocation

| 필드 | 설명 |
|---|---|
| `roomId` | 실제 호실 |
| `roomLabel` | 표시명 |
| `building` | 건물 |
| `floor` | 층 |
| `roomTypeId` | 객실 타입 |
| `baseRate` | 기준 단가 |
| `discountPercent` | 업체/행사 할인율 |
| `finalRate` | 최종 단가 |
| `reservationId` | 생성된 예약/블록 ID |
| `status` | `blocked`, `assigned`, `checked-in`, `checked-out` |

### 5.4 Guest

| 필드 | 설명 |
|---|---|
| `id` | 고객 ID |
| `name` | 이름 |
| `phone`, `email` | 연락처 |
| `nationality` | 국적 |
| `passportNo` | 여권 번호. 마스킹/암호화 필요 |
| `documentStatus` | `pending`, `verified`, `expired`, `missing` |
| `membershipTier` | 멤버십 등급 |
| `allergies` | 알러지 |
| `specialNotes` | 특이사항 |
| `groupEventId` | 단체 행사 연결 |

## 6. Enum 표준

| Enum | 값 |
|---|---|
| ReservationStatus | `reserved`, `confirmed`, `blocked`, `checked-in`, `checked-out`, `cancelled`, `no-show` |
| GroupEventStatus | `draft`, `pending`, `confirmed`, `in-house`, `departed`, `cancelled` |
| RoomStatus | `vacant-clean`, `vacant-dirty`, `occupied`, `out-of-service`, `maintenance` |
| HousekeepingStatus | `clean`, `dirty`, `inspect`, `in-progress` |
| GuestFlag | `none`, `dnd`, `mur`, `away` |
| DocumentStatus | `pending`, `verified`, `expired`, `missing` |
| BillingPolicy | `master-folio`, `individual`, `split` |
| PaymentStatus | `unpaid`, `partial`, `paid`, `refunded` |
| TaskStatus | `open`, `in-progress`, `done`, `cancelled` |
| TenantStatus | `pending`, `active`, `suspended`, `cancelled` |

## 7. 프론트 교체 순서

### Phase 1. 공통 기반

1. `dashboard/common/js/common/api-client.js`를 인증/에러/토큰 갱신 지원 구조로 확장한다.
2. `PmsAPI` 함수명은 유지하고 내부만 REST API로 교체한다.
3. `USE_MOCK_API` 플래그를 두고 mock JSON fallback을 분리한다.
4. 공통 enum과 formatter를 만든다.

### Phase 2. 설정/마스터 데이터

1. 호텔 설정, 통화 설정, 직원, 역할, 메뉴 권한 API를 연결한다.
2. 건물, 객실, 객실 타입, 요금 캘린더 API를 연결한다.
3. 업체 할인율과 요금 캘린더의 할인 정책을 연결한다.

### Phase 3. 예약/타임라인

1. 예약 목록과 예약 상세 API를 연결한다.
2. 신규 예약 모달은 고객 검색/신규 등록/객실 가용성/요금 견적 API를 순차 호출하도록 바꾼다.
3. 타임라인은 `/reservations/timeline` 응답 하나로 렌더링한다.
4. 단체 블록은 일반 예약과 상태/배지를 구분한다.

### Phase 4. 단체/B2B

1. 업체 관리 API를 연결한다.
2. 행사 생성/목록/상세 API를 연결한다.
3. 객실 배정은 실제 호실 기준으로 저장한다.
4. rooming list 투숙객 등록은 기존 고객 검색 + 신규 고객 등록을 재사용한다.
5. 객실 배정 저장 후 `/groups/events/{id}/sync-reservations`로 타임라인 블록을 동기화한다.

### Phase 5. 운영/정산/리포트

1. 하우스키핑/시설보수 task API를 연결한다.
2. Folio/정산 API를 연결한다.
3. POS, 룸서비스, 골프, 렌터카 주문을 folio charge와 연결한다.
4. 리포트는 API 집계 결과를 사용하고, 프론트 계산을 최소화한다.

### Phase 6. Admin

1. 어드민 로그인과 현재 사용자 API를 연결한다.
2. 호텔 입점 신청, 승인/반려, 테넌트 생성 흐름을 연결한다.
3. 사용자 비밀번호 초기화는 이메일 기반 요청 API로 연결한다.
4. 감사 로그와 과금 API를 연결한다.

## 8. 우선순위

| 우선순위 | 영역 | 이유 |
|---|---|---|
| P0 | Auth, Settings, Rooms, Room Types, Rates | 모든 화면의 기반 데이터 |
| P0 | Reservations, Timeline | PMS 핵심 업무 |
| P0 | Groups/B2B/Rooming List | 현재 화면 로직에서 가장 복잡하고 깨지기 쉬운 영역 |
| P1 | CRM Guests | 예약/rooming list와 직접 연결 |
| P1 | Housekeeping/Maintenance | 객실 상태와 운영 task 연결 |
| P1 | Folio/Settlement | 체크아웃과 정산 연결 |
| P2 | POS/Golf/Rentacar | 부대매출 연결 |
| P2 | Admin Ads/Helpdesk | PMS 본업 이후 확장 |

## 9. v6 대비 보강된 점

1. `admin` 전체 페이지 API 추가
2. 호텔 입점 신청, 승인, 계정 생성, 비밀번호 초기화 흐름 추가
3. 단체 업체, 행사, 객실 배정, rooming list API 추가
4. 실제 호실 배정과 타임라인 표시 API 추가
5. 업체별 할인율, 요금 캘린더, 통화 기준 추가
6. 투숙객 문서 상태, 알러지, 특이사항 추가
7. Settings, 직원, 역할, 권한 API 추가
8. 객실/건물/객실타입 CRUD API 추가
9. Folio, 정산, POS, 골프, 렌터카, 야간마감 API 추가
10. 공통 응답/에러/enum/권한/감사로그 규칙 추가

## 10. 백엔드 구현 시 주의사항

1. `roomId`는 실제 호실 기준의 유니크 키로 사용한다. 화면 표시용 `roomLabel`과 분리한다.
2. 단체 블록은 투숙객 미등록 상태를 허용하지만, 체크인은 반드시 `guestId` 또는 rooming guest 정보가 있어야 한다.
3. 업체 할인율은 기본값이고, 행사/객실별 최종 단가는 마지막에 수정 가능해야 한다.
4. 예약 생성, 체크인, 체크아웃, 결제는 idempotency key를 받는다.
5. 여권/신분증 정보는 암호화 또는 마스킹 정책을 적용한다.
6. 모든 상태 변경은 audit log를 남긴다.
7. 프론트 페이지네이션과 서버 페이지네이션을 맞춘다.
8. Admin과 PMS Dashboard는 인증 realm을 분리한다.

