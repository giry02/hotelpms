# Hotel PMS 잔여 결함 탐색 테스트 결과서

- 실행일: 2026-07-22
- 테스트 대상: `https://hotelpms-eight.vercel.app`
- 기준 계획서: `PMS_DEFECT_DISCOVERY_TEST_PLAN_20260721.md`
- 테스트 브라우저: Chromium
- 화면 범위: 데스크톱 1440px, 태블릿 1024px
- 언어: 한국어, 영어
- 테스트 기준일: Asia/Seoul 실행 당일
- 수정 배포 커밋: `edaa2e8d`

## 1. 최종 결과

| 구분 | 전체 | PASS | FAIL | BLOCKED | NOT RUN | 발견 결함 | 수정 완료 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 예약·객실 상태 | 22 | 22 | 0 | 0 | 0 | 1 | 1 |
| 교차 화면·카운트 | 8 | 8 | 0 | 0 | 0 | 0 | 0 |
| 단체·부가서비스·정산 | 12 | 12 | 0 | 0 | 0 | 0 | 0 |
| 경계값 | 8 | 8 | 0 | 0 | 0 | 0 | 0 |
| 비정상 조작·복구 | 8 | 8 | 0 | 0 | 0 | 0 | 0 |
| 다국어·태블릿·시각 | 8 | 8 | 0 | 0 | 0 | 0 | 0 |
| 데이터량·성능 | 5 | 5 | 0 | 0 | 0 | 1 | 1 |
| **합계** | **71** | **71** | **0** | **0** | **0** | **2** | **2** |

판정은 페이지 로드나 버튼 클릭만으로 부여하지 않았다. 배포 페이지에서 실제 입력, 저장, 상태 변경, 재진입, 새로고침, 연결 화면 및 감사 로그를 조합해 확인했다. 테스트 데이터는 브라우저 격리 저장소와 응답 fixture를 사용해 운영 기준 데이터를 훼손하지 않도록 실행했다.

기존 63개 결과는 정상 예정일 체크아웃만 포함해 조기 체크아웃 상태 전이를 놓쳤다. 해당 `63/63 PASS`는 전체 체크아웃 상태 공간을 검증한 결과가 아니었으므로, 조기·당일·연장·단체 일부·재판매·완료 취소·레이트 완료 8개 케이스를 추가한 71개 기준으로 정정했다.

## 2. 예약·객실 상태 결과

| ID | 실제 입력·절차 | 실제 결과 | 결과 | 증거 |
|---|---|---|---|---|
| DISC-RES-001 | 당일 공실·청소 완료 카드에서 신규 예약, 저장, 재진입 | 클릭 객실 유지, 저장·재진입·목록·타임라인 객실 일치 | PASS | `critical-ui.json`, 예약 회귀 23항목 |
| DISC-RES-002 | 청소 필요 객실에서 저장 경고 취소 후 계속 | 취소 시 미생성, 계속 시 1건 생성, 청소 상태 유지 | PASS | `critical-ui.json` DIRTY-CANCEL/DIRTY-CONTINUE |
| DISC-RES-003 | 점검 중 객실 예약 시도 | 점검 사유로 차단, 예약·감사 로그 미생성 | PASS | 예약 회귀 maintenance guard |
| DISC-RES-004 | 상단 신규 예약에서 기간 변경 | 기간별 사용 가능 객실 재계산, 임의 고정 없음 | PASS | 예약 회귀 availability recalculation |
| DISC-RES-005 | 객실 카드 진입 후 날짜 변경 | 선택 객실이 가능하면 유지, 불가능할 때만 해제·안내 | PASS | `critical-ui.json` RES-DATE-ROOM |
| DISC-RES-006 | 역전 날짜, 같은 날 역전 시간, 잘못된 레이트 시간 | 필드 오류 표시, 입력 보존, 예약·로그 0건 | PASS | 예약 회귀 date/time guards |
| DISC-RES-007 | 당일 체크인 예약에서 체크인 1회 | 모달 닫힘, 투숙 중 전환, 체크아웃 동작 노출, 새로고침 유지 | PASS | 예약 회귀 check-in lifecycle |
| DISC-RES-008 | 청소 필요 체크인 경고 취소·계속 | 취소 시 상태 불변, 계속 시 투숙 중, 모달 중첩 없음 | PASS | `critical-ui.json`, 예약 회귀 |
| DISC-RES-009 | 미래 예약 및 점검 객실 체크인 시도 | 미래 예약과 점검 객실 모두 명확한 사유로 차단 | PASS | 예약 회귀 future/maintenance guards |
| DISC-RES-010 | 투숙 중·잔액 0 예약 체크아웃 | 모달 닫힘, 예약 이력 유지, 객실 공실·청소 필요 전환 | PASS | 예약 회귀 check-out lifecycle |
| DISC-RES-011 | 미수금 예약 체크아웃 후 전액 수납·재시도 | 최초 차단, 수납 후 성공, 잔액·처리 이력 일치 | PASS | `functional-frontdesk.json` |
| DISC-RES-012 | 정산 완료→미완료→완료 | 예약 배지·정산 상세가 즉시 및 재진입 후 일치 | PASS | `functional-operations.json` SETTLE-STATUS |
| DISC-RES-013 | 투숙 예약 A→B→A 이동 | 최종 객실·이동 이력·필터·감사 로그 일치 | PASS | 예약 회귀 room move |
| DISC-RES-014 | 사유 입력 후 예약 취소, 같은 기간 재검색 | 취소 사유 저장, 재고 반환, 같은 객실 재예약 가능 | PASS | 예약 회귀 cancel/reinventory |
| DISC-RES-015 | 2박 3일 예약을 첫 1박 후 조기 체크아웃 | 실제 체크아웃 일시 저장, 1216은 공실+청소 필요, 미도착·단체 필터에서 제거 | PASS | 예약 회귀 early checkout state |
| DISC-RES-016 | 당일 체크인 후 당일 체크아웃 | 완료 이력 유지, 1218은 공실+청소 필요, 운영 상태 중복 없음 | PASS | 예약 회귀 same-day checkout |
| DISC-RES-017 | 기존 종료일보다 1일 연장한 투숙 예약 | 1217은 변경 종료일까지 투숙 중 유지 | PASS | 예약 회귀 extended stay |
| DISC-RES-018 | 같은 단체 객실 중 1216만 조기 체크아웃 | 1216만 공실 전환, 1219는 투숙 중 유지 | PASS | 예약 회귀 partial-group checkout |
| DISC-RES-019 | 완료 객실과 같은 단체 placeholder가 남은 상태 | 전체·단체·미도착 필터에서 placeholder 미노출 | PASS | 예약 회귀 completed placeholder shadow |
| DISC-RES-020 | 완료 취소 후 투숙 상태 복원, 과거 실제 체크아웃 값 잔존 | 1220은 현재 `checkedin` 상태를 우선해 투숙 중 표시 | PASS | 예약 회귀 reopened stay precedence |
| DISC-RES-021 | 오전 조기 체크아웃 후 같은 호실 당일 신규 고객 도착 | 1221의 새 고객이 체크인 예정으로 표시되고 이전 완료 예약은 비노출 | PASS | 예약 회귀 same-day turnover |
| DISC-RES-022 | 레이트 체크아웃 설정 예약을 실제 완료 | 1222가 레이트 필터에서 제거되고 공실+청소 필요로 전환 | PASS | 예약 회귀 completed late checkout |

## 3. 교차 화면·카운트 결과

| ID | 실제 입력·절차 | 실제 결과 | 결과 | 증거 |
|---|---|---|---|---|
| DISC-CONS-001 | 전체 상태 필터 순회 | 배지 수와 렌더 카드 수 일치, 필터별 동일 예약 색상·내용 유지 | PASS | 예약 회귀 filter parity |
| DISC-CONS-002 | 이동 이력 2건 fixture 후 객실 변경 필터 | 중복 이력이 아닌 서로 다른 이동 예약 2건으로 집계 | PASS | 예약 회귀 moved-room count |
| DISC-CONS-003 | 단체 배정·예약 예정·투숙 중 비교 | 단체 여부가 운영 상태 색상을 덮어쓰지 않음 | PASS | 예약 회귀 group state precedence |
| DISC-CONS-004 | 동일 예약번호를 현황·목록·타임라인에서 조회 | 고객·객실·기간·금액·상태·단체명 일치 | PASS | 데이터 일관성 검사 105 JSON/125 예약 |
| DISC-CONS-005 | 청소 4상태 순환 | 예약 현황·객실 관리·하우스키핑 상태 일치 | PASS | `functional-groups-rooms.json` |
| DISC-CONS-006 | KPI에서 대상 필터 이동 | KPI 수와 도착 필터의 실제 카드 수 일치 | PASS | `hotel-direct-fixed.json` |
| DISC-CONS-007 | 객실·고객·단체명 검색 후 초기화 | 결과·카운트 정확, 초기화 시 전체 복원 | PASS | `functional-frontdesk.json` |
| DISC-CONS-008 | 건물·층 접기 후 필터 전환 | 숨김 여부와 무관하게 전체 배지 수 유지, 표시 구역 수 일치 | PASS | 예약 회귀 collapsed section |

## 4. 단체·부가서비스·정산 결과

| ID | 실제 입력·절차 | 실제 결과 | 결과 | 증거 |
|---|---|---|---|---|
| DISC-OPS-001 | 업체 등록·편집·이벤트 연결·삭제 차단·해제 후 삭제 | 연결 중 삭제 차단, 연결 해제 후 삭제, 재진입 값 유지 | PASS | `functional-groups-rooms.json` |
| DISC-OPS-002 | 동일 객실 중복 배정 및 할인 변경 | 중복 차단, 기준가·할인·최종가 재계산 및 저장 유지 | PASS | 단체 회귀 17항목 |
| DISC-OPS-003 | 대표·동반 등록, 대표 변경, 삭제 | 명단·예약·타임라인 대표/동반 구분 일치 | PASS | 단체 회귀, `functional-groups-rooms.json` |
| DISC-OPS-004 | 최근 1년 선택, 조회 전후 비교 | `2025-07-22~2026-07-22` 표시, 조회 전 불변·조회 후 갱신 | PASS | 단체 회귀, `performance-final.json` |
| DISC-OPS-005 | 전체·1년·사용자 지정 기간 | 요약·상세 동일 기간 사용, 항목 합계와 총액 일치 | PASS | `hotel-direct-fixed.json` GRP-COMP-008 |
| DISC-OPS-006 | 투숙객 유무 객실 비교 | 투숙객 없는 객실 미노출, 투숙객 있는 객실만 등록 가능 | PASS | `functional-operations.json` ANC-001 |
| DISC-OPS-007 | POS·골프·렌터카·음식점·기타 각 등록 | KPI·필터·상세·합계 순서와 금액 일치 | PASS | `functional-operations-extended.json` |
| DISC-OPS-008 | 부가서비스 등록→수락→완료→미완료→완료 | 상태 영속, 실행 1회당 감사 로그 1건 | PASS | `functional-operations.json` ANC-011/012 |
| DISC-OPS-009 | 골프·렌터카·음식점 미리보기·저장·인쇄 | 유형별 필드 유지, 통합 POS 인쇄 제어 미노출 | PASS | `hotel-direct-fixed.json` ANC-VND/ANC-LEG |
| DISC-OPS-010 | 수납→정산 완료→재진입→미완료→완료 | 목록 버튼은 모달을 열지 않고 상태만 변경, 상세·이력·로그 일치 | PASS | `functional-operations.json` SETTLE-STATUS |
| DISC-OPS-011 | PHP·USD·KRW 수납/환불 | 등록·처리 이력·명세서에 통화와 원금액 보존 | PASS | `functional-operations-extended.json` |
| DISC-OPS-012 | 현금·카드 지출 등록·수정·기간 조회·삭제 | KPI·목록·마감 시재 통화별 반영, 삭제 후 제거 | PASS | `functional-operations.json` EXP-004 |

## 5. 경계값 결과

| ID | 실제 입력 | 실제 결과 | 결과 | 증거 |
|---|---|---|---|---|
| DISC-BND-001 | 월말·연말·2028-02-29 기간 | 숙박일수와 포함 범위 정확 | PASS | `hotel-direct-fixed.json` |
| DISC-BND-002 | 당일·1박·30박·365박 및 초과 | 허용 범위 계산, 초과 입력 차단 | PASS | `hotel-direct-fixed.json` |
| DISC-BND-003 | 0·음수·소수·최대 초과 금액 | 유효 금액만 저장, 통화별 표시 일치 | PASS | EXP-008, ROOM-SETUP-008, ANC-VND-005 |
| DISC-BND-004 | 인원 0·1·최대·최대+1 | 범위 밖 차단, 단복수 표시 정상 | PASS | ANC-VND-006 |
| DISC-BND-005 | 한글·영문·베트남어·혼합 장문 | 저장 손실 없음, 카드·표·팝업 겹침 없음 | PASS | 입력 253필드 검사, `visual.json` |
| DISC-BND-006 | 앞뒤·연속 공백·특수문자 | 검색 정규화 일관, 누락·중복 없음 | PASS | `hotel-direct-fixed.json` |
| DISC-BND-007 | 중복 이메일·사번·예약번호 | 중복 저장 차단 또는 명시적 연결, 무음 덮어쓰기 없음 | PASS | `admin-remaining.json`, `functional-auth.json` |
| DISC-BND-008 | 호텔 기준 통화 PHP | PHP/USD/KRW 기본 노출, VND 기본 목록 미노출 | PASS | `functional-operations-extended.json` |

## 6. 비정상 조작·복구 결과

| ID | 실제 조작 | 실제 결과 | 결과 | 증거 |
|---|---|---|---|---|
| DISC-RSL-001 | 예약·직원·단체·지출 저장 빠른 2회 클릭 | 중복 생성 0건, 처리 중 재진입 차단 | PASS | `hotel-direct-fixed.json`, `admin-remaining.json` |
| DISC-RSL-002 | 저장 직후 닫기·ESC | 반쪽 저장·중복 모달 없음 | PASS | `critical-ui.json` |
| DISC-RSL-003 | 체크인·체크아웃·정산 처리 중 새로고침 | 최종 상태 단일 수렴, 재실행 중복 없음 | PASS | 예약/정산 회귀 |
| DISC-RSL-004 | 필터·상세·등록 화면 뒤로/앞으로 | 모달 중첩·이전 데이터 재저장·언어 역전 없음 | PASS | `hotel-direct-fixed.json` |
| DISC-RSL-005 | 두 탭에서 동일 예약 순차 수정 | 후행 저장 정책에 따라 최종 저장 1건 유지, 중간 상태 혼합 없음 | PASS | 직접 브라우저 동시 컨텍스트 검사 |
| DISC-RSL-006 | 권한 제거 후 열린 탭에서 되돌리기 실행 | 저장 계층에서 차단, 상태 무변경 | PASS | `admin-remaining.json` 권한 검사 |
| DISC-RSL-007 | 언어 변경 중 예약·단체 팝업 저장 | 팝업 전체 언어 갱신, 입력값 보존 | PASS | i18n 감사 60페이지 |
| DISC-RSL-008 | 오프라인 저장 후 재연결·재시도 | 실패를 성공으로 표시하지 않고 중복 생성 없음 | PASS | 직접 브라우저 네트워크 격리 검사 |

## 7. 다국어·태블릿·시각 결과

| ID | 실제 절차 | 실제 결과 | 결과 | 증거 |
|---|---|---|---|---|
| DISC-UI-001 | 영어 저장 후 60개 페이지 순회 | 첫 렌더부터 영어, 한국어 잔류 0건 | PASS | i18n 감사 60페이지 |
| DISC-UI-002 | KO↔EN 입력·셀렉트·날짜·시간 전환 | label·placeholder·option·시간 언어 일치 | PASS | 입력 253필드 검사 |
| DISC-UI-003 | 예약·단체·직원·정산·부가서비스 팝업 순회 | 정적·동적 문자열 혼용 없음 | PASS | `hotel-direct-fixed.json`, `admin-remaining.json` |
| DISC-UI-004 | 변경 이력·감사 로그 언어 전환 | 시스템 라벨만 번역, 사용자 입력 고유명사 유지 | PASS | `hotel-direct-fixed.json` |
| DISC-UI-005 | 1024px 태블릿에서 주요 CRUD | 핵심 제어 접근 가능, 팝업 하단 가림·가로 스크롤 없음 | PASS | `visual.json` 120화면 |
| DISC-UI-006 | 카드·편집 버튼·셀렉트 hover 반복 | 위치·크기·색상 진동 없음 | PASS | `critical-ui.json`, 시각 감사 |
| DISC-UI-007 | 긴 영문 정산·예약·필터·직원 버튼 | 카드 밖 넘침 없이 축약 또는 의도된 배치 | PASS | 시각 감사 데스크톱/태블릿 |
| DISC-UI-008 | PMS/Admin 전체 페이지 제목 검사 | 선택 언어 화면명 + Hotel PMS 규칙 일치 | PASS | i18n 감사 60페이지 |

## 8. 데이터량·성능 결과

| ID | 실제 데이터·측정 | 실제 결과 | 기준 | 결과 |
|---|---|---|---|---|
| DISC-PERF-001 | 예약 1,000건, 예약 현황 5회 | `1080/1048/1159/1187/1065ms`, 중앙값 `1080ms`, p95·최대 `1187ms` | 중앙 3초, p95 5초, 최대 7초 이하 | PASS |
| DISC-PERF-002 | 예약 이력 10,000건, 14일 이동 | `2026-07-29~2026-08-11` 요청 1회, 20행, `39.3ms` | 선택 기간만 요청 | PASS |
| DISC-PERF-003 | 감사 로그 10,000건 | 12행 페이지 1·2, 검색 결과 1건, `260.2ms` | 페이지·카운트 일치, 5초 이하 | PASS |
| DISC-PERF-004 | 단체 행사 1,000건, 최근 1년 | 조회 전 결과 불변, 조회 후 1,000행, 상세 API `0회`, `224.9ms` | 조회 후 집계, 5초 이하 | PASS |
| DISC-PERF-005 | 예약 현황↔타임라인 10회 | 활성 상세 모달 1개, 클릭 1회당 모달 1개, heap 증가 없음 | 핸들러·모달 누적 없음 | PASS |

## 9. 발견 결함 및 수정 조치

### DEF-20260722-001 단체 거래 통계 N+1 상세 조회

- 등급: P2 성능
- 재현: 단체 행사 1,000건을 가진 업체의 거래 통계 조회
- 수정 전: 목록에 정산·객실 배정 요약이 있어도 행사별 상세 API를 다시 호출해 `1,000회` 요청
- 원인: `companyPerformanceRows()`가 모든 행사에 무조건 `fetchGroupDetail()`을 실행
- 수정: 행사 목록에 `settlementItems`, `roomAllocations`, `allocations` 중 하나가 있으면 이미 보유한 요약을 사용하고, 요약이 없는 행사만 상세 조회
- 수정 파일: `dashboard/frontdesk/groups_companies.html`
- 수정 커밋: `ea40278d`
- 재시험: 상세 API `1,000회 → 0회`, 1,000행 집계 `224.9ms`, 기능 회귀 17항목 PASS

### DEF-20260722-002 조기 체크아웃 후 단체 객실이 미도착으로 복원

- 등급: P1 예약 상태 불일치
- 재현: 7/21~7/23 단체 예약 객실에서 7/22 조기 체크아웃
- 수정 전: 예약 상태는 완료됐지만 실제 체크아웃 일시가 저장되지 않아 예정 종료일을 기준으로 남은 단체 placeholder가 선택되고 `미도착`으로 표시
- 원인: 체크아웃 처리와 정산 완료 처리에서 예정 체크아웃일만 유지했고, 예약 현황이 완료 예약과 동일 호실의 잔여 placeholder 우선순위를 구분하지 못함
- 수정: `actualCheckOutDate`, `actualCheckOutAt`, `checkedOutAt`, `completedAt`을 저장하고 실제 완료일~예정 종료일에는 동일 단체 placeholder를 숨김. 현재 상태가 복원됐거나 같은 호실에 새 예약이 있으면 현재 예약을 우선함
- 수정 파일: `dashboard/common/js/reservation-actions.js`, `dashboard/operations/settlement-status.html`, `dashboard/frontdesk/reservation-board.html`
- 재시험: 조기·당일·연장·단체 일부·placeholder·완료 취소·당일 재판매·레이트 완료 8개 상태 전이 PASS

### 테스트 도구 보정

| 항목 | 원인 | 수정 내용 |
|---|---|---|
| 배포 URL 실행 | 일부 스크립트가 HTTP 전용 | HTTPS 프로토콜 처리 추가 |
| 객실 선택 검사 | 비활성 option을 선택해 제품 결함으로 오판 가능 | 첫 번째 활성 객실 option만 선택 |
| Admin→PMS 교차 검사 | Admin 세션으로 PMS 화면을 열어 권한 오판 가능 | 호텔 역할 세션으로 컨텍스트 전환 |
| 반복 이동 모달 계수 | 실제 모달 ID와 비동기 표시 시점을 누락 | `#unifiedResModal` 활성화 대기 및 overlay 계수 포함 |

테스트 도구 보정은 제품 PASS를 만들기 위한 우회가 아니라, 잘못된 계정·비활성 선택·잘못된 DOM 선택자로 발생한 거짓 FAIL을 제거한 것이다.

## 10. 실행한 보조 회귀 스위트

| 스위트 | 결과 |
|---|---:|
| 전체 페이지 로드 | 60/60 PASS |
| 상호작용 탐색 | 60페이지, 169회 조작, 오류 0 |
| 입력 필드 검사 | 60페이지, 253필드, 오류 0 |
| 예약 회귀 | 24/24 PASS, 체크아웃 상태 전이 하위 케이스 8/8 PASS |
| 단체 회귀 | 17/17 PASS |
| 업무 E2E | 12/12 PASS |
| 인증 | 4/4 PASS |
| 프런트 데스크 | 7/7 PASS |
| 단체·객실 | 15/15 PASS |
| 운영 | 14/14 PASS |
| 운영 확장 | 12/12 PASS |
| Admin 직접 | 23/23 PASS |
| Admin 잔여 | 28/28 PASS |
| 시각 감사 | 120/120 PASS |
| 성능 | 5/5 PASS |

보조 스모크의 페이지 로드와 클릭 수는 업무 케이스 PASS 판정에 단독으로 사용하지 않았다.

운영 배포 후 `PMS_BASE_URL=https://hotelpms-eight.vercel.app`로 예약 회귀를 다시 실행했다. 실행 당일 `2026-07-22` 기준으로 24개 회귀 항목과 조기·당일·연장·단체 일부·placeholder·완료 취소·당일 재판매·레이트 완료 8개 하위 상태 전이가 모두 PASS했다.

## 11. 증거 파일

- `outputs/defect-discovery-20260722/critical-ui.json`
- `outputs/defect-discovery-20260722/hotel-direct-fixed.json`
- `outputs/defect-discovery-20260722/admin-direct.json`
- `outputs/defect-discovery-20260722/admin-remaining.json`
- `outputs/defect-discovery-20260722/functional-auth.json`
- `outputs/defect-discovery-20260722/functional-frontdesk.json`
- `outputs/defect-discovery-20260722/functional-groups-rooms.json`
- `outputs/defect-discovery-20260722/functional-operations.json`
- `outputs/defect-discovery-20260722/functional-operations-extended.json`
- `outputs/defect-discovery-20260722/performance-pre-fix.json`
- `outputs/defect-discovery-20260722/performance-final.json`
- `outputs/defect-discovery-20260722/visual.json`

## 12. 잔여 위험

현재 배포본은 정적 프런트엔드와 브라우저 저장소 기반 데모 환경이다. 두 탭 충돌, 권한 제거, 오프라인 재연결은 배포 브라우저의 격리 컨텍스트와 저장 계층을 대상으로 검증했다. 향후 실제 서버 DB와 인증 API가 연결되면 서버 트랜잭션, 동시성 잠금, 네트워크 재시도, 권한 재검증은 동일 케이스로 다시 실행해야 한다.
