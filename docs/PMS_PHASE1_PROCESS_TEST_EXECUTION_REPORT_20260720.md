# Hotel PMS 1단계 프로세스 테스트 실행 보고서

## 1. 실행 결론

- 실행일: 2026-07-20
- 로컬 환경: `http://127.0.0.1:8765`
- 부록 A 판정 대상: 41건
- `PASS-LOCAL`: 4건
- `PARTIAL`: 37건
- `FAIL`: 0건
- `BLOCKED`: 0건
- 배포 환경 최종 `PASS`: 0건
- 전체 테스트 완료 선언: **불가**

자동 회귀 스위트가 통과해도 실제 입력, 오류 분기, 저장, 새로고침, 연계 화면, 권한, 콘솔/API, 증거의 8개 게이트가 케이스별로 모두 확인되지 않으면 `PASS`로 올리지 않았다.

## 2. 이번 수정

| 결함 ID | 구분 | 원인 | 수정 내용 | 결과 |
|---|---|---|---|---|
| TC-DOC-001 | 테스트 기준 | `P1-RES-NEW-002`가 1203호를 고정 fixture로 가정하지만 현재 기준 데이터에서 1203은 사용 중 | 청소 필요 공실 fixture를 실행 직전 초기화하고, 다른 객실을 사용하면 `PARTIAL`로 판정하도록 규칙 추가 | 문서 수정 완료 |
| TC-RULE-001 | 보고 규칙 | 요약 결과만으로 개별 케이스가 PASS처럼 보일 수 있음 | 부록 A 41개 행을 최종 판정 원본으로 지정하고 모든 후속 보고서에 개별 판정 의무화 | 문서 수정 완료 |

제품 코드에서 이번 실행으로 재현된 실패는 없었다. 재현되지 않은 항목을 추측으로 수정하지 않았다.

## 3. 실제 UI 실행

| 케이스 | 입력 및 조작 | 결과 | 증거 |
|---|---|---|---|
| P1-AUTH-001 | `desk@hotel.example`, 로그인 버튼, 새로고침 | 세션 유지 | `outputs/process-phase1-20260720/P1-AUTH-001/after-reload.png` |
| P1-DASH-001 | 금일 체크인 KPI 4 클릭 | `filter=checkin`, 카드 4건 | `manual-ui-results.json` |
| P1-RES-VIEW-001 | 전체와 체크아웃 필터에서 1203 비교 | 상태·카드 class·청소 class/value 동일 | `manual-ui-results.json` |
| P1-RES-VIEW-002 | 객실 변경 필터 클릭 | 배지 1, 카드 1, 대상 1202 일치 | `manual-ui-results.json` |
| P1-RES-NEW-002 | 1212, DirtyCase Tester 입력, 경고 취소 후 재승인 | 취소 시 입력 유지, 승인 시 1212에 1건 저장 | `manual-ui-results.json` |

`P1-RES-NEW-002`는 동작 자체는 기대와 일치했지만 계획 입력 1203 대신 1212를 사용했으므로 `PASS-LOCAL`이 아니라 `PARTIAL`이다.

## 4. 지원 회귀 실행

아래 13개 스위트는 모두 종료 코드 0이다. 이 결과는 개별 케이스 판정의 보조 증거다.

| 스위트 | 결과 | 로그 |
|---|---|---|
| 예약 회귀 | PASS | `support-reservation.log` |
| 단체 회귀 | PASS | `support-groups.log` |
| 업무 E2E | PASS | `support-e2e.log` |
| 부가서비스 | PASS | `support-ancillary.log` |
| 다국어 60페이지 | PASS | `support-i18n.log` |
| 레이아웃 60페이지·240검사 | PASS | `support-visual.log` |
| API 계약 | PASS | `support-api.log` |
| 데이터 일관성 | PASS | `support-data.log` |
| 저장 지속성 | PASS | `support-storage.log` |
| 핵심 UI | PASS | `support-critical-ui.log` |
| 컨트롤 상호작용 | PASS | `support-interactions.log` |
| 한국어 입력 | PASS | `support-inputs-ko.log` |
| 영어 입력 | PASS | `support-inputs-en.log` |

## 5. 부록 A 41개 개별 판정

| 케이스 ID | 판정 | 직접 UI | 지원 회귀 | 미충족 항목 |
|---|---|---|---|---|
| P1-AUTH-001 | PASS-LOCAL | 완료 | 완료 | 배포 재시험 |
| P1-AUTH-002 | PARTIAL | 미완료 | 완료 | 휴직·퇴직 실제 로그인 |
| P1-STAFF-001 | PARTIAL | 미완료 | 완료 | 전체 CRUD·역할·상태 연속 증거 |
| P1-DASH-001 | PASS-LOCAL | 완료 | 완료 | 배포 재시험 |
| P1-RES-VIEW-001 | PASS-LOCAL | 완료 | 완료 | 배포 재시험 |
| P1-RES-VIEW-002 | PASS-LOCAL | 완료 | 완료 | 배포 재시험 |
| P1-RES-NEW-001 | PARTIAL | 미완료 | 완료 | PH01 지정 입력 8게이트 |
| P1-RES-NEW-002 | PARTIAL | 대체 fixture 완료 | 완료 | 계획 객실 1203 재시험 |
| P1-RES-NEW-003 | PARTIAL | 미완료 | 완료 | 점검 객실 지정 입력 |
| P1-RES-NEW-004 | PARTIAL | 미완료 | 완료 | 중복 일정 지정 입력 |
| P1-RES-NEW-005 | PARTIAL | 미완료 | 완료 | 날짜·시간 오류 각 분기 |
| P1-RES-EDIT-001 | PARTIAL | 미완료 | 완료 | 수정·새로고침·연계화면 |
| P1-RES-CANCEL-001 | PARTIAL | 미완료 | 완료 | 취소·객실 반환 직접 증거 |
| P1-CHECKIN-001 | PARTIAL | 미완료 | 완료 | 정상 체크인 직접 증거 |
| P1-CHECKIN-002 | PARTIAL | 미완료 | 완료 | 경고 취소·계속 두 분기 |
| P1-CHECKIN-003 | PARTIAL | 미완료 | 완료 | 점검·미래 예약 두 차단 |
| P1-STAY-001 | PARTIAL | 미완료 | 완료 | 객실 이동 전 화면 재조회 |
| P1-STAY-002 | PARTIAL | 미완료 | 완료 | 명단 CRUD·대표 변경 |
| P1-STAY-003 | PARTIAL | 미완료 | 완료 | 저장·미리보기·인쇄 |
| P1-CHECKOUT-001 | PARTIAL | 미완료 | 완료 | 수납 후 체크아웃 직접 증거 |
| P1-CHECKOUT-002 | PARTIAL | 미완료 | 완료 | 미수금 차단 직접 증거 |
| P1-CHECKOUT-003 | PARTIAL | 미완료 | 완료 | 완료·공실 역할 분리 |
| P1-GROUP-001 | PARTIAL | 미완료 | 완료 | 업체 CRUD·삭제 제약 |
| P1-GROUP-002 | PARTIAL | 미완료 | 완료 | 이벤트·객실 배정 지정 입력 |
| P1-GROUP-003 | PARTIAL | 미완료 | 완료 | 명단과 3화면 연결 |
| P1-GROUP-004 | PARTIAL | 미완료 | 완료 | 기간 합계 수기 대조 |
| P1-HK-001 | PARTIAL | 미완료 | 완료 | 3화면 청소 상태 동기화 |
| P1-MAINT-001 | PARTIAL | 미완료 | 완료 | 보수 전체 CRUD·예약 차단 |
| P1-ANC-001 | PARTIAL | 미완료 | 완료 | 빈 객실 지정 화면 |
| P1-ANC-002 | PARTIAL | 미완료 | 완료 | 5개 카테고리 실제 등록 |
| P1-ANC-003 | PARTIAL | 미완료 | 완료 | 상태 왕복·감사 로그 |
| P1-ANC-004 | PARTIAL | 미완료 | 완료 | 3종 바우처/쿠폰 인쇄 |
| P1-FOLIO-001 | PARTIAL | 미완료 | 완료 | 수납·완료·상세 재조회 |
| P1-FOLIO-002 | PARTIAL | 미완료 | 완료 | 미완료 전환·감사 로그 |
| P1-EXP-001 | PARTIAL | 미완료 | 완료 | CRUD·KPI·시재 |
| P1-EXP-002 | PARTIAL | 미완료 | 완료 | 기준 통화별 UI |
| P1-NIGHT-001 | PARTIAL | 미완료 | 완료 | 시재 수식·마감 재진입 |
| P1-GUEST-001 | PARTIAL | 미완료 | 완료 | 고객 CRUD·예약 연결 |
| P1-PERM-001 | PARTIAL | 미완료 | 완료 | 역할별 재로그인 |
| P1-AUDIT-001 | PARTIAL | 미완료 | 완료 | 주요 변경 로그 수기 대조 |
| P1-ADMIN-001 | PARTIAL | 미완료 | 완료 | PMS/Admin 양방향 UI |

## 6. 후속 실행 기준

남은 37건은 부록 A의 입력값 그대로 실제 UI에서 수행하고, 각 케이스별 화면 캡처와 저장·새로고침·연계 화면 증거가 확보된 경우에만 `PASS-LOCAL`로 변경한다. 배포 주소에서 같은 케이스를 재실행하기 전에는 최종 `PASS`로 집계하지 않는다.
