# Hotel PMS 전체 통합 테스트 마스터 계획서

- 문서 버전: 1.0
- 작성일: 2026-07-20
- 적용 대상: Hotel PMS Dashboard 41개 페이지, Super Admin 19개 페이지
- 기준 페이지 수: 60개 HTML
- 현재 실행 상태: **계획 확정 / 전 항목 NOT TESTED**
- 실행 상세 부록 A: [PMS 1단계 프로세스 테스트 실행 계획](./PMS_PHASE1_PROCESS_TEST_EXECUTION_PLAN_20260720.md)
- 범위 카탈로그 부록 B: [PMS 전체 통합 테스트 기존 계획](./PMS_FULL_INTEGRATION_TEST_PLAN_20260718.md)

## 1. 문서 목적

이 문서는 Hotel PMS와 Super Admin의 모든 현재 화면을 대상으로 실제 사용자가 수행하는 방식의 통합 테스트 기준을 고정한다. 단순 페이지 로드, DOM 존재, 내부 함수 호출, 저장소 직접 변경만으로 PASS를 부여하지 않는다. 테스트는 실제 버튼 클릭, 입력, 선택, 저장, 재조회, 화면 간 연계, 권한, 다국어, 반응형 결과까지 확인한다.

기존 전체 계획서의 673개 케이스 ID는 범위 카탈로그로 유지한다. 다만 해당 ID만으로 실행 성공을 증명하지 않으며, 본 문서의 입력 팩·실행 계약·PASS 게이트와 연결된 결과만 유효하다. 41개 1단계 프로세스 케이스는 핵심 업무에 대한 상세 실행 사양으로 본 문서에 편입한다.

## 2. 전체 범위와 계층

| 계층 | 범위 | 필수 결과 |
|---|---|---|
| L0 인벤토리 | 60개 페이지, 메뉴, 버튼, 링크, 탭, 팝업, 입력, 풀다운 | 페이지별 제어 목록과 누락 여부 |
| L1 화면 기능 | 로드, 검색, 정렬, 필터, 탭, 페이지네이션, 팝업 | 실제 클릭 결과와 화면 증거 |
| L2 업무 기능 | 등록, 조회, 수정, 삭제, 상태 전환, 유효성, 권한 | 정상·예외·경계값 결과 |
| L3 핵심 프로세스 | P1 41개 상세 케이스 | UI·저장·새로고침·연계 화면 PASS |
| L4 교차 모듈 | 예약-객실-고객-단체-부가서비스-정산-감사-Admin | 동일 엔티티와 금액·상태 일치 |
| L5 API·데이터 | 응답 스키마, 저장 지속성, 중복, 참조 무결성 | 요청/응답 및 저장 데이터 증거 |
| L6 다국어 | 한국어·영어, 브라우저 제목, 팝업, 동적 데이터 | 혼용·깜빡임·키 노출 없음 |
| L7 반응형 | 데스크톱·태블릿·모바일, 마우스·터치 | 넘침·가림·떨림·오작동 없음 |

## 3. 결과 판정 규칙

### 3.1 상태

- `PASS`: 아래 9개 게이트를 모두 충족했다.
- `FAIL`: 실제 결과가 예상 결과와 다르거나 콘솔/API 오류가 발생했다.
- `BLOCKED`: 외부 의존성 또는 테스트 데이터 부재로 실행 자체가 불가능하다.
- `NOT TESTED`: 실행하지 않았다. 자동으로 PASS로 간주하지 않는다.
- `PARTIAL`: 일부 단계만 실행했다. 완료 집계에서 FAIL과 동일하게 취급한다.

### 3.2 PASS 필수 게이트

1. 실제 사용자가 보는 화면에서 클릭·터치·타이핑했다.
2. 입력 전, 입력 중, 저장 후 UI 상태가 예상과 일치한다.
3. 저장 API 또는 브라우저 저장소의 결과를 확인했다.
4. 새로고침 또는 재로그인 후 값과 상태가 유지된다.
5. 연계 화면의 카운트·카드·상세·금액이 동일하다.
6. 허용 역할은 성공하고 비허용 역할은 차단된다.
7. 한국어·영어에서 라벨, 동적 문구, 브라우저 제목이 일치한다.
8. 콘솔 오류와 실패 네트워크 요청이 없다.
9. 전·후 스크린샷, 요청/응답 또는 저장 증거, 결함 ID를 결과에 남겼다.

### 3.3 PASS로 인정하지 않는 방식

- 페이지가 열렸다는 사실만 확인
- 버튼의 DOM 존재나 `onclick` 문자열만 확인
- 내부 함수를 콘솔에서 직접 호출
- localStorage/sessionStorage를 직접 바꾼 뒤 화면만 확인
- 경고창에서 취소·계속 양쪽을 실행하지 않고 한쪽만 확인
- 등록 후 목록·상세·새로고침 확인 없이 토스트만 확인
- 다국어를 한 페이지에서만 바꾸고 다른 페이지의 초기 렌더를 확인하지 않음
- 모바일을 화면 폭만 줄여 확인하고 실제 터치·풀다운·날짜 선택을 생략

## 4. 고정 실행 환경

### 4.1 계정과 역할

| 역할 | 계정 | 비밀번호 | 주요 검증 |
|---|---|---|---|
| PMS 관리자 | `kim@hotel.example` | `password123!` | 전체 메뉴, 정산/부가서비스 되돌리기 |
| 총괄 매니저 | `gm@hotel.example` | `password123!` | 운영 메뉴와 제한 기능 |
| 프런트 데스크 | `desk@hotel.example` | `password123!` | 예약·체크인·고객 기능 |
| 하우스키핑 | `housekeeping@hotel.example` | `password123!` | 청소 메뉴와 제한 접근 |
| 시설 보수 | `maintenance@hotel.example` | `password123!` | 시설 보수 메뉴와 제한 접근 |
| Super Admin | Admin fixture 계정 | 환경 설정값 | 테넌트·광고·시스템 관리 |

퇴직·휴직 계정은 로그인 실패가 예상 결과다. 테스트 중 생성하는 계정은 `qa+YYYYMMDD-NNN@hotel.example` 형식을 사용한다.

### 4.2 언어와 화면 크기

| 구분 | 값 |
|---|---|
| 언어 | `KR 한국어`, `EN English` |
| 데스크톱 | 1440×900 |
| 태블릿 가로/세로 | 1024×768, 768×1024 |
| 모바일 | 412×915, 360×800 |
| 입력 방식 | 마우스, 키보드, 터치 |
| 기준 업무일 | 2026-07-10 |

## 5. 공통 입력 데이터 팩

아래 값은 테스트 결과의 재현성을 위한 기본값이다. 이미 존재하는 데이터와 충돌하면 접미사 번호만 증가시키고 결과표에 실제 사용값을 기록한다.

| 팩 ID | 입력 데이터 | 사용 범위 |
|---|---|---|
| IP-AUTH | 근무 계정 `desk@hotel.example`, 휴직 `qa-leave@hotel.example`, 퇴직 `qa-retired@hotel.example`, 비밀번호 `Qa!20260720` | 로그인, 직원 상태, 권한 |
| IP-RES | 고객 `QA Reservation 0720`, `qa.res.0720@example.com`, `+84 90 720 0720`, 2026-07-10 14:00~2026-07-11 12:00 | 예약 CRUD, 체크인 |
| IP-ROOM | 정상 공실 `PH01`, 청소 필요 공실 `1203`, 점검/수리 `1215`, 투숙 `1201`, 금일 체크인 `1210`, 체크아웃 대상 `1206` | 객실·예약·하우스키핑 |
| IP-GROUP | 업체 `QA Integration Travel`, 코드 `QA-COMP-0720`, 이벤트 `QA Integration Group 0720`, 대표 `QA Group Lead` | 단체 업체·이벤트·객실 배정 |
| IP-HK | 객실 `1203`, 상태 `청소 필요→청소 중→청소 완료`, 담당자 `Maria Garcia` | 하우스키핑·예약 경고 |
| IP-MAINT | 객실 `1215`, 제목 `QA AC Inspection`, 우선순위 `긴급`, 상태 `신규→진행→완료` | 시설 보수·객실 차단 |
| IP-ANC | 객실 `1201`, 투숙객 `Wong Li`, 통합 POS `커플 스파 패키지`, PHP 320, 골프/렌터카/음식점 각 1건 | 부가서비스·바우처·감사 |
| IP-FOLIO | 객실 `1402`, 정산 금액 PHP 2,300, 결제 `현금`, 예치금 0 | 수납·정산·되돌리기 |
| IP-EXP | 항목 `QA Vehicle Fuel`, 구매처 `Shell Station QA`, 구매자 현재 사용자, PHP 3,200, 현금 | 비품 구매·시재·마감 |
| IP-CRM | 고객 `QA Guest 0720`, `qa.guest.0720@example.com`, 전화 `+84 90 777 0720`, 등급 `일반` | 고객 CRUD·멤버십 |
| IP-STAFF | 이름 `QA Staff 0720`, 사번 `QA0720`, 이메일 `qa.staff.0720@hotel.example`, 역할 프런트, 상태 근무 중 | 직원·역할·로그인 |
| IP-ADMIN | 호텔 `QA Partner Hotel 0720`, 공지 `QA Integration Notice`, 캠페인 `QA Hotel Benefit 0720` | Admin-PMS 연계 |

## 6. 모든 페이지 공통 실행 계약

각 페이지는 아래 절차를 빠짐없이 수행한다. 페이지별 행의 주요 제어 외에도 실행 중 발견되는 모든 활성 제어를 인벤토리에 추가한다.

1. 로그인 직후 URL 직접 진입과 좌측 메뉴 진입을 각각 수행한다.
2. 한국어와 영어에서 콜드 로드하며 초기 언어 깜빡임과 키 문자열 노출을 확인한다.
3. 버튼, 아이콘 버튼, 카드, 링크, 탭, 아코디언, 행, 페이지네이션을 모두 클릭한다.
4. 검색어는 정확 일치, 부분 일치, 없는 값, 앞뒤 공백을 입력한다.
5. 입력은 정상값, 필수 공백, 형식 오류, 최소·최대·경계값을 사용한다.
6. 모든 풀다운 옵션을 선택하고 선택값이 유지되는지 확인한다.
7. 날짜·시간은 달력 선택과 키보드 입력, 시작=종료, 시작>종료를 확인한다.
8. 팝업은 열기, X, 취소, 바깥 클릭, ESC, 저장, 재열기를 확인한다.
9. CRUD는 생성→목록→상세→수정→새로고침→삭제 또는 삭제 차단 순으로 수행한다.
10. 상태 전환은 정방향과 허용된 되돌리기를 모두 실행하고 감사 로그를 확인한다.
11. 데스크톱, 태블릿, 모바일에서 가림·넘침·호버 이동·풀다운 떨림·터치 누락을 확인한다.
12. 각 단계에서 콘솔 오류, 4xx/5xx, 중복 요청, 잘못된 캐시 복원을 기록한다.

## 7. 페이지별 실행 추적표

### 7.1 PMS 인증·대시보드·CRM

| ID | 경로 | 주요 제어·팝업 | 입력 팩 | 저장 후/연계 확인 |
|---|---|---|---|---|
| PG-PMS-001 | `dashboard/index.html` | 세션 분기, 로그인 이동 | IP-AUTH | 올바른 초기 경로와 언어 |
| PG-PMS-002 | `dashboard/login.html` | 이메일, 비밀번호, 로그인 | IP-AUTH | 역할별 첫 화면, 휴직·퇴직 차단 |
| PG-PMS-003 | `dashboard/dashboard.html` | KPI, 광고 배너·상세, 일정, 알림 링크 | IP-RES, IP-ADMIN | 예약/정산 카운트와 연결 화면 |
| PG-PMS-004 | `dashboard/notifications.html` | 읽음, 전체 읽음, 필터, 링크 이동 | IP-RES, IP-ADMIN | 대상 업무 화면과 읽음 지속성 |
| PG-PMS-005 | `dashboard/crm/guests.html` | 검색, 등록, 상세, 수정, 삭제/차단, 이력 | IP-CRM | 예약 투숙객 선택과 고객 이력 |
| PG-PMS-006 | `dashboard/crm/membership.html` | 등급 기준, 혜택, 수정, 상태 | IP-CRM | 고객 상세와 멤버십 표시 |
| PG-PMS-007 | `dashboard/crm/tier-history.html` | 월 필터, 유형, 검색, 다운로드 | IP-CRM | 등급 변경 건수와 상세 이력 |

### 7.2 PMS 프런트 데스크·단체

| ID | 경로 | 주요 제어·팝업 | 입력 팩 | 저장 후/연계 확인 |
|---|---|---|---|---|
| PG-PMS-008 | `dashboard/frontdesk/reservation-board.html` | 상태 필터, 검색, 청소 선택, 신규 예약, 상세, 체크인, 플랫카드 | IP-RES, IP-ROOM | 목록·타임라인·객실·정산·감사 |
| PG-PMS-009 | `dashboard/frontdesk/reservation-list.html` | 동일 카운트 필터, 검색, 정렬, 상세 | IP-RES | 보드와 카운트·상태 일치 |
| PG-PMS-010 | `dashboard/frontdesk/reservation-timeline.html` | 날짜 이동, 오늘, 예약 블록, 그룹 블록 | IP-RES, IP-GROUP | 보드와 일정·색상·병합 일치 |
| PG-PMS-011 | `dashboard/frontdesk/checkin.html` | 금일 체크인, 투숙객, 객실, 체크인/차단 | IP-RES, IP-ROOM | 보드 투숙 상태와 객실 점유 |
| PG-PMS-012 | `dashboard/frontdesk/groups_companies.html` | 업체 등록, 편집, 삭제 제약, 이벤트, 거래 통계 | IP-GROUP | 이벤트·정산·통계 합계 |
| PG-PMS-013 | `dashboard/frontdesk/groups_blocks.html` | 검색, 상태, 이벤트 생성·상세 | IP-GROUP | 업체 카드와 이벤트 수 |
| PG-PMS-014 | `dashboard/frontdesk/groups_block_detail.html` | 개요, 객실 배정, 투숙객, 정산, 변경 이력 | IP-GROUP, IP-ROOM | 예약·타임라인·정산·감사 |

### 7.3 PMS 객실·운영·부가서비스

| ID | 경로 | 주요 제어·팝업 | 입력 팩 | 저장 후/연계 확인 |
|---|---|---|---|---|
| PG-PMS-015 | `dashboard/operations/rooms.html` | 객실 필터, 상태, 상세, 점유 정보 | IP-ROOM | 예약·청소·시설 상태 일치 |
| PG-PMS-016 | `dashboard/operations/room-setup.html` | 객실/유형/건물 등록·편집·삭제 | IP-ROOM | 객실 관리와 예약 선택 목록 |
| PG-PMS-017 | `dashboard/operations/housekeeping.html` | 보기 전환, 우선순위, 담당자, 상태 변경 | IP-HK | 예약 보드 청소 색상·체크인 경고 |
| PG-PMS-018 | `dashboard/operations/maintenance.html` | 등록, 우선순위, 담당자, 수정, 완료, 삭제 | IP-MAINT | 예약 차단·객실 점검 상태 |
| PG-PMS-019 | `dashboard/operations/ancillary.html` | 카테고리, 투숙객 필터, 상세, 등록, 완료/미완료 | IP-ANC | 정산·바우처·감사 로그 |
| PG-PMS-020 | `dashboard/operations/ancillary-vendors.html` | 업체·항목 카테고리, 등록·수정·삭제, 바우처 양식 | IP-ANC | 부가서비스 등록 선택값 |
| PG-PMS-021 | `dashboard/operations/unified-pos.html` | POS 주문, 항목, 수량, 투숙객, 완료/취소 | IP-ANC | 부가서비스·정산·감사 |
| PG-PMS-022 | `dashboard/operations/pos.html` | POS 업체·메뉴·주문 | IP-ANC | 통합 POS와 정산 분류 |
| PG-PMS-023 | `dashboard/operations/golf.html` | 골프 업체·항목·바우처 | IP-ANC | 부가서비스 골프 필터와 출력 |
| PG-PMS-024 | `dashboard/operations/rentacar.html` | 렌터카 업체·차종·바우처 | IP-ANC | 부가서비스 렌터카 필터와 출력 |
| PG-PMS-025 | `dashboard/operations/room-service.html` | 메뉴, 주문, 객실/투숙객, 상태 | IP-ANC | 부가서비스·정산 반영 |
| PG-PMS-026 | `dashboard/operations/events.html` | 이벤트 목록·상세·기간·상태 | IP-ADMIN | 대시보드 광고/이벤트 상세 |
| PG-PMS-027 | `dashboard/operations/rates.html` | 객실 유형, 기간, 요금, 저장 | IP-ROOM | 신규 예약 기본 금액 |

### 7.4 PMS 정산·마감·분석

| ID | 경로 | 주요 제어·팝업 | 입력 팩 | 저장 후/연계 확인 |
|---|---|---|---|---|
| PG-PMS-028 | `dashboard/operations/settlement-status.html` | 상태 필터, 카드/행, 수납, 완료, 상세, 미완료 전환 | IP-FOLIO | Folio·객실 청소·감사 로그 |
| PG-PMS-029 | `dashboard/operations/folio.html` | 검색, 목록, 상세, 결제·환불·정산 | IP-FOLIO | 정산 현황과 처리 이력 |
| PG-PMS-030 | `dashboard/operations/folio-chart.html` | 기간, 통화, 카테고리, 차트 | IP-FOLIO, IP-EXP | Folio·지출 합계 |
| PG-PMS-031 | `dashboard/operations/expense-purchases.html` | 기간, 검색, 등록, 수정, 삭제, 통화 | IP-EXP | KPI·시재·마감·감사 |
| PG-PMS-032 | `dashboard/operations/night-audit.html` | 마감일, 시작 시재, 입금, 출금, 시재 내역, 마감 | IP-EXP, IP-FOLIO | closing log·지출·정산 합계 |
| PG-PMS-033 | `dashboard/operations/closing-log.html` | 기간, 마감 상세, 재조회 | IP-EXP, IP-FOLIO | night audit 결과 지속성 |
| PG-PMS-034 | `dashboard/operations/reports.html` | 기간, 보고서 종류, 다운로드 | 전체 팩 | 원천 화면 합계와 파일 값 |

### 7.5 PMS 설정·관리

| ID | 경로 | 주요 제어·팝업 | 입력 팩 | 저장 후/연계 확인 |
|---|---|---|---|---|
| PG-PMS-035 | `dashboard/settings/settings.html` | 호텔 정보, 통화, 언어, 로고, 저장 | IP-ADMIN | 헤더·출력물·통화 선택 |
| PG-PMS-036 | `dashboard/settings/staff.html` | 직원 등록, 편집, 역할, 상태, 비밀번호, 삭제 | IP-STAFF | 로그인·권한·구매자 목록 |
| PG-PMS-037 | `dashboard/settings/roles.html` | 역할, 메뉴 권한, 기능 권한, 저장 | IP-STAFF | 역할별 메뉴·정산/부가 되돌리기 |
| PG-PMS-038 | `dashboard/settings/billing.html` | 결제 설정, 수단, 저장 | IP-ADMIN | 결제/정산 기본 설정 |
| PG-PMS-039 | `dashboard/settings/audit-logs.html` | 검색, 유형, 기간, 페이지네이션 | 전체 팩 | 모든 변경 작업의 행·화면명 |
| PG-PMS-040 | `dashboard/settings/notices.html` | 공지 목록, 상세, 읽음 | IP-ADMIN | Admin 공지와 표시 일치 |
| PG-PMS-041 | `dashboard/settings/support.html` | 문의 등록, 검색, 상태, 상세 | IP-ADMIN | Admin helpdesk 연계 |

### 7.6 Super Admin

| ID | 경로 | 주요 제어·팝업 | 입력 팩 | 저장 후/연계 확인 |
|---|---|---|---|---|
| PG-ADM-001 | `admin/index.html` | 초기 세션 분기 | IP-ADMIN | 로그인 또는 대시보드 이동 |
| PG-ADM-002 | `admin/login.html` | 계정, 비밀번호, 로그인 | IP-ADMIN | Admin 권한과 첫 화면 |
| PG-ADM-003 | `admin/admin.html` | KPI, 테넌트·광고·문의 링크 | IP-ADMIN | 각 관리 목록 카운트 |
| PG-ADM-004 | `admin/tenants/list.html` | 검색, 상태, 상세, 등록 | IP-ADMIN | 호텔 등록·상태·PMS 연결 |
| PG-ADM-005 | `admin/tenants/register.html` | 호텔·관리자·계약 입력, 저장 | IP-ADMIN | 목록·상세·PMS 로그인 |
| PG-ADM-006 | `admin/tenants/apply.html` | 입점 신청, 검증, 제출 | IP-ADMIN | 테넌트 목록 신청 상태 |
| PG-ADM-007 | `admin/tenants/detail.html` | 기본정보, 상태, 계약, 사용자, 수정 | IP-ADMIN | PMS 호텔 정보·접근 상태 |
| PG-ADM-008 | `admin/ads/campaigns.html` | 검색, 상태, 기간, 신규, 상세 | IP-ADMIN | Dashboard 광고 노출 |
| PG-ADM-009 | `admin/ads/new.html` | 제목, 호텔, 이미지, 기간, 상세 콘텐츠, 저장 | IP-ADMIN | 캠페인 목록·PMS 상세 팝업 |
| PG-ADM-010 | `admin/ads/detail.html` | 보기, 편집, 상태, 삭제 | IP-ADMIN | PMS 이벤트 상세와 변경 반영 |
| PG-ADM-011 | `admin/ads/targeting.html` | 대상 호텔, 조건, 저장 | IP-ADMIN | 대상/비대상 PMS 노출 |
| PG-ADM-012 | `admin/ads/billing.html` | 광고 청구, 기간, 상태 | IP-ADMIN | 캠페인 비용·정산 합계 |
| PG-ADM-013 | `admin/system/users.html` | 사용자 등록, 편집, 역할, 상태 | IP-ADMIN | 로그인·메뉴 권한 |
| PG-ADM-014 | `admin/system/profile.html` | 내 정보, 이메일, 비밀번호 | IP-ADMIN | 재로그인과 표시 정보 |
| PG-ADM-015 | `admin/system/notices.html` | 공지 등록, 수정, 삭제, 대상 | IP-ADMIN | PMS 공지 목록·읽음 |
| PG-ADM-016 | `admin/system/helpdesk.html` | 문의 검색, 상세, 답변, 상태 | IP-ADMIN | PMS 지원 문의 상태 |
| PG-ADM-017 | `admin/system/integrations.html` | 연동 설정, 활성화, 키 검증 | IP-ADMIN | 저장 지속성·오류 처리 |
| PG-ADM-018 | `admin/system/billing.html` | 플랫폼 청구, 수수료, 결제 상태 | IP-ADMIN | 테넌트 상세·광고 청구 |
| PG-ADM-019 | `admin/system/audit-logs.html` | 검색, 유형, 기간, 상세 | IP-ADMIN | Admin 주요 변경 로그 |

## 8. 41개 핵심 프로세스 상세 케이스 편입표

아래 케이스의 입력·단계·예상 결과·증거 기준은 부록 A의 본문을 그대로 본 계획의 필수 실행 사양으로 사용한다. 결과는 페이지 테스트 결과와 별도로 기록하되 동일 실행의 중복 PASS는 허용한다.

| 상세 케이스 ID | 검증 목적 | 연결 페이지 |
|---|---|---|
| P1-AUTH-001 | 근무 중 계정 로그인 | PG-PMS-002 |
| P1-AUTH-002 | 휴직·퇴직 계정 로그인 차단 | PG-PMS-002, PG-PMS-036 |
| P1-STAFF-001 | 직원 신규 등록·편집·역할·상태·삭제 | PG-PMS-036, PG-PMS-037 |
| P1-DASH-001 | KPI에서 예약 현황 필터로 이동 | PG-PMS-003, PG-PMS-008 |
| P1-RES-VIEW-001 | 전체·상태별 필터의 동일 카드 표현 | PG-PMS-008~010 |
| P1-RES-VIEW-002 | 객실 변경 카운트와 실제 카드 수 | PG-PMS-008~010 |
| P1-RES-NEW-001 | 청소 완료 공실의 정상 예약 | PG-PMS-008, PG-PMS-015 |
| P1-RES-NEW-002 | 청소 필요 1203 예약 경고 취소·계속·저장 유지 | PG-PMS-008, PG-PMS-017 |
| P1-RES-NEW-003 | 점검/수리 중 객실 예약 차단 | PG-PMS-008, PG-PMS-018 |
| P1-RES-NEW-004 | 중복 일정 예약 차단 | PG-PMS-008~010 |
| P1-RES-NEW-005 | 날짜·시간 유효성 검증 | PG-PMS-008 |
| P1-RES-EDIT-001 | 일정·금액·메모 수정과 연계 화면 반영 | PG-PMS-008~010, PG-PMS-039 |
| P1-RES-CANCEL-001 | 예약 취소와 객실 반환 | PG-PMS-008~010, PG-PMS-015 |
| P1-CHECKIN-001 | 금일 정상 체크인 | PG-PMS-008, PG-PMS-011, PG-PMS-015 |
| P1-CHECKIN-002 | 청소 필요 객실 체크인 경고 | PG-PMS-008, PG-PMS-011, PG-PMS-017 |
| P1-CHECKIN-003 | 점검 객실과 미래 예약 체크인 차단 | PG-PMS-008, PG-PMS-011, PG-PMS-018 |
| P1-STAY-001 | 객실 이동 | PG-PMS-008~010, PG-PMS-015 |
| P1-STAY-002 | 동반 투숙객 추가·대표 변경·삭제 | PG-PMS-008, PG-PMS-005 |
| P1-STAY-003 | 플랫카드 저장·미리보기·인쇄 | PG-PMS-008 |
| P1-CHECKOUT-001 | 미수금 수납 후 체크아웃 | PG-PMS-008, PG-PMS-028~029 |
| P1-CHECKOUT-002 | 미수금이 남은 체크아웃 차단 | PG-PMS-008, PG-PMS-028~029 |
| P1-CHECKOUT-003 | 체크아웃 완료와 공실의 역할 분리 | PG-PMS-008, PG-PMS-015, PG-PMS-017 |
| P1-GROUP-001 | 단체 업체 등록·편집·삭제 제약 | PG-PMS-012 |
| P1-GROUP-002 | 단체 이벤트 생성·객실 배정·저장 | PG-PMS-012~014 |
| P1-GROUP-003 | 투숙객 명단 등록과 객실 연결 | PG-PMS-014, PG-PMS-008~010 |
| P1-GROUP-004 | 단체 통계 기간 필터와 합계 | PG-PMS-012, PG-PMS-028 |
| P1-HK-001 | 청소 상태 변경의 전 화면 동기화 | PG-PMS-008, PG-PMS-015, PG-PMS-017 |
| P1-MAINT-001 | 시설 보수 생성·수정·완료·삭제와 객실 차단 | PG-PMS-008, PG-PMS-015, PG-PMS-018 |
| P1-ANC-001 | 투숙객 없는 객실의 부가서비스 미노출 | PG-PMS-019 |
| P1-ANC-002 | 카테고리별 등록과 필터 | PG-PMS-019~025 |
| P1-ANC-003 | 완료→미완료→완료 상태 저장과 감사 로그 | PG-PMS-019, PG-PMS-039 |
| P1-ANC-004 | 골프·렌터카·음식점 바우처/쿠폰 | PG-PMS-019~024 |
| P1-FOLIO-001 | 수납 등록·정산 완료·상세 재조회 | PG-PMS-028~029 |
| P1-FOLIO-002 | 정산 미완료 전환과 감사 로그 | PG-PMS-028~029, PG-PMS-039 |
| P1-EXP-001 | 비품 구매 등록·수정·삭제와 KPI·시재 반영 | PG-PMS-031~033 |
| P1-EXP-002 | 통화별 지출과 호텔 기준 통화 | PG-PMS-031, PG-PMS-035 |
| P1-NIGHT-001 | 시재 내역·현금 흐름·마감 | PG-PMS-032~033 |
| P1-GUEST-001 | 고객 등록·수정·예약 연결 | PG-PMS-005, PG-PMS-008 |
| P1-PERM-001 | 역할별 메뉴 권한과 기능 권한 | PG-PMS-002, PG-PMS-037 |
| P1-AUDIT-001 | 주요 변경 감사 로그 완전성 | PG-PMS-039 |
| P1-ADMIN-001 | PMS와 Admin 호텔·공지·이벤트 연결 | PG-PMS-003, PG-PMS-035, PG-PMS-040, PG-ADM-003~019 |

상세 케이스는 총 41개이며 실행 결과에는 위 ID를 한 행씩 기록한다. `PG-PMS-008~010`처럼 페이지 범위에 사용된 `~` 표기는 해당 구간의 모든 페이지를 의미한다.

## 9. 교차 모듈 통합 시나리오

| E2E ID | 시작 | 처리 | 최종 검증 |
|---|---|---|---|
| E2E-001 | 신규 고객 | 예약→체크인→부가서비스→수납→체크아웃 | 고객 이력·객실·Folio·감사 로그 |
| E2E-002 | 청소 필요 공실 | 예약 경고→예약→청소 완료→체크인 | 경고 분기와 상태 동기화 |
| E2E-003 | 점검 객실 | 예약/체크인 차단→보수 완료→재시도 | 차단 해제와 로그 |
| E2E-004 | 단체 업체 | 이벤트→객실 배정→명단→부가서비스→정산 | 단체 통계와 각 객실 합계 |
| E2E-005 | 부가서비스 완료 | 미완료 전환→새로고침→완료 | 상태 지속성과 감사 로그 2건 |
| E2E-006 | 정산 완료 | 미완료 전환→재수납→완료 | 카드·상세·이력·감사 로그 |
| E2E-007 | 현금 지출 | 비품 구매→시재 내역→일일 마감 | 지출 음수 반영과 마감 보유액 |
| E2E-008 | Admin 공지 | 공지 등록→PMS 조회→읽음 | 대상 호텔·언어·읽음 상태 |
| E2E-009 | Admin 광고 | 캠페인 등록→PMS 배너→상세 | 이미지·내용·기간·대상 일치 |
| E2E-010 | 역할 변경 | 기능 권한 저장→재로그인→작업 시도 | 메뉴와 기능 권한 동시 적용 |

기존 부록 B의 E2E-001~025는 모두 유지한다. 위 10개는 가장 위험한 경로의 실행 순서를 고정한 것이며, 나머지 15개도 동일 PASS 게이트로 실행한다.

## 10. API·데이터 검증 계약

1. 목록 API와 상세 API의 ID, 상태, 금액, 통화, 날짜가 일치한다.
2. 등록 응답의 ID가 목록·상세·감사 로그에서 동일하다.
3. 수정은 대상 한 건만 변경하며 다른 fixture를 훼손하지 않는다.
4. 삭제 제한 엔티티는 참조 관계를 설명하는 오류를 반환하고 화면 데이터가 유지된다.
5. 상태 전환은 허용 전이만 성공하며 중복 클릭은 중복 이력을 만들지 않는다.
6. 금액은 PHP·USD·KRW 또는 호텔 기준 통화 규칙을 따르고 통화 간 합산하지 않는다.
7. 날짜·시간은 업무일과 타임존을 유지하며 새로고침 후 하루 밀림이 없다.
8. PMS 사용 호텔 데이터와 Admin 테넌트 데이터의 연결 키가 일치한다.
9. 실패 응답은 토스트/팝업으로 설명되고 성공 메시지를 동시에 표시하지 않는다.
10. 캐시·기본 데이터 보정이 저장된 최신 값을 덮어쓰지 않는다.

## 11. 다국어 전수 계약

모든 60개 페이지에서 다음을 한국어와 영어로 각각 확인한다.

- 브라우저 탭 제목, 헤더 제목, 좌측 메뉴, KPI, 검색 안내, 빈 상태
- 모든 버튼, 아이콘 툴팁, 탭, 풀다운 옵션, 날짜 placeholder
- 팝업 제목, 필드 라벨, 도움말, 유효성 오류, 토스트, 확인창
- 동적 상태, 감사 로그 화면명·동작명, 다운로드 파일 헤더
- 언어 변경 후 메뉴 이동 시 이전 언어가 먼저 나타나는 깜빡임 없음
- `filter.reserved` 같은 번역 키 원문 노출 없음
- 사용자 입력 이름·업체명·메모는 번역하지 않음
- 날짜 로케일은 언어에 맞되 저장값과 업무일은 변하지 않음
- 영어 긴 라벨은 겹치거나 카드 밖으로 넘지 않음

## 12. 반응형·상호작용 전수 계약

각 페이지는 1440×900에서 기능 실행 후 1024×768, 768×1024, 412×915, 360×800에서 핵심 기능을 재실행한다.

- 카드, 표, KPI, 팝업, 고정 푸터가 서로 가리지 않는다.
- 필요한 표만 명시적으로 스크롤하며 페이지 전체에 불필요한 가로 스크롤이 없다.
- 호버 시 버튼·카드·풀다운이 이동하거나 반복 점멸하지 않는다.
- 모바일 터치 한 번에 버튼이 실행되고 행 클릭과 내부 버튼 이벤트가 충돌하지 않는다.
- 풀다운이 열렸다 닫히기를 반복하지 않으며 선택 후 포커스가 안정적이다.
- 날짜 선택기와 네이티브 입력이 실제로 열리고 선택값이 표시된다.
- 긴 영어 버튼은 두 줄 또는 적절한 레이아웃으로 수용하고 글자 크기를 임의 축소하지 않는다.
- 팝업 내용은 세로 스크롤 가능하며 저장·닫기 버튼에 접근할 수 있다.

## 13. 실행 순서와 중단 기준

| 단계 | 범위 | 진입 조건 | 종료 조건 |
|---|---|---|---|
| W1 | L0 인벤토리·로그인·공통 셸 | 환경 준비 | 60개 페이지 접근 확인 |
| W2 | PMS 예약·객실 핵심 P1 | W1 PASS | P1 예약/체크인/객실 케이스 PASS |
| W3 | 단체·부가서비스·정산·마감 | W2 PASS | 상태·금액·로그 일치 |
| W4 | CRM·설정·권한 | W2 PASS | 역할별 허용/차단 PASS |
| W5 | Super Admin와 PMS 연계 | W1 PASS | 테넌트·공지·광고 연계 PASS |
| W6 | 다국어·반응형 전수 | W2~W5 결함 수정 | 60개 페이지 KO/EN·5뷰포트 PASS |
| W7 | 전체 회귀 | 모든 결함 수정 | NOT TESTED/PARTIAL/BLOCKED 0건 |

다음 결함이 발생하면 해당 단계의 후속 실행을 중단한다: 로그인 불가, 데이터 초기화, 저장 성공 오표시, 다른 객실/예약 수정, 정산·시재 금액 훼손, 권한 우회. 원인 수정과 해당 단계 재시험 후 진행한다.

## 14. 페이지별 결과 기록표

각 PG ID마다 아래 형식으로 한 행을 작성한다. 초기값은 모두 `NOT TESTED`다.

| 페이지 ID | 언어/뷰포트 | 실행 제어 수/전체 제어 수 | 정상 입력 | 오류·경계 입력 | CRUD/상태 | 새로고침 | 연계 화면 | 권한 | 콘솔/API | 결과 | 결함 ID | 수정 내용 | 재시험 | 증거 링크 |
|---|---|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| PG-PMS-001 | KR/1440×900 | 0/미집계 | NOT TESTED | NOT TESTED | N/A | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | - | - | NOT TESTED | - |

결과 파일에는 PG-PMS-001~041과 PG-ADM-001~019를 모두 생성한다. `실행 제어 수/전체 제어 수`가 같지 않으면 페이지 PASS를 부여하지 않는다.

## 15. 프로세스 결과 기록표

| 케이스 ID | 실제 입력 데이터 | 예상 결과 | 실제 결과 | 결과 | 결함 ID | 원인 | 수정 파일/내용 | 재시험 결과 | UI 증거 | API·저장 증거 |
|---|---|---|---|---|---|---|---|---|---|---|
| P1-AUTH-001 | 부록 A 기준 | 부록 A 기준 | 미실행 | NOT TESTED | - | - | - | NOT TESTED | - | - |

41개 P1 케이스와 E2E-001~025를 각각 한 행으로 기록한다. 케이스가 같은 페이지를 사용하더라도 정상·예외 입력과 예상 결과가 다르면 별도 실행한다.

## 16. 결함 수정 및 재시험 규칙

1. FAIL 즉시 스크린샷, 재현 단계, 입력값, 콘솔, 네트워크, 저장값을 기록한다.
2. 원인을 UI, 상태 계산, 데이터 fixture, API, 캐시, 권한, 번역, 반응형으로 분류한다.
3. 수정 파일과 변경 로직을 결과표에 적는다. “수정함”만 기록하지 않는다.
4. 실패 케이스를 동일 입력으로 재시험한다.
5. 동일 공통 모듈을 쓰는 모든 페이지를 영향 범위 회귀한다.
6. 정상 경로와 반대 경로를 모두 재시험한다. 예: 완료→미완료 수정 후 미완료→완료도 확인한다.
7. 수정 전 증거와 수정 후 증거를 함께 보관한다.

## 17. 완료 기준

- 60개 페이지의 결과 행이 모두 존재한다.
- 모든 활성 제어의 실행 수와 전체 수가 일치한다.
- 41개 P1 상세 케이스와 E2E-001~025가 모두 실행됐다.
- `NOT TESTED`, `PARTIAL`, `BLOCKED`, 미재시험 FAIL이 0건이다.
- 한국어·영어, 5개 뷰포트, 역할별 권한 결과가 모두 기록됐다.
- 등록·수정·삭제·상태 전환은 새로고침과 연계 화면까지 검증됐다.
- 모든 수정은 결함 ID, 원인, 수정 내용, 재시험 증거를 가진다.
- 테스트 생성 데이터는 식별 가능하며 실행 종료 후 정리 또는 초기화된다.

## 18. 문서 우선순위

1. 본 문서는 전체 범위, 실행 순서, PASS 게이트의 최상위 기준이다.
2. 부록 A는 41개 핵심 업무의 상세 입력·단계·예상 결과 기준이다.
3. 부록 B의 673개 ID는 화면과 기능의 누락 방지 카탈로그다.
4. 서로 충돌하면 더 구체적인 입력과 더 엄격한 PASS 조건을 적용한다.
5. 과거 결과는 본 문서의 증거 요건을 충족할 때만 이관하며, 그렇지 않으면 `NOT TESTED`에서 다시 실행한다.
