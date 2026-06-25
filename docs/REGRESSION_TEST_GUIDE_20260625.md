# Hotel PMS 회귀 테스트 가이드 추가분

작성일: 2026-06-25  
목적: 사용자가 반복 지적한 오류를 재발 방지 테스트 케이스로 고정한다.

## 이번에 추가한 회귀 케이스

| ID | 지적/오류 내용 | 원인 | 검증 방법 | 상태 |
| --- | --- | --- | --- | --- |
| UAT-REG-005 | 예약 타임라인에서 객실 행 라인과 날짜 셀 라인이 1~2px씩 어긋남 | 행 자체 border와 내부 셀 높이가 따로 계산되어 row bottom과 cell bottom이 달라짐 | Playwright로 `.tl-row`, `.tl-room-cell`, `.tl-cell`의 top/bottom 좌표를 비교하고 mismatchCount가 0인지 확인 | 수정/자동검증 |
| UAT-REG-006 | 단체 상세 smoke 테스트가 투숙객 명단이 있는데도 실패함 | 테스트가 `객실 배정` 탭을 클릭한 뒤 투숙객명을 검사하는 잘못된 검증 절차였음 | smoke 테스트에서 `투숙객 명단` 탭을 명시적으로 열고 `#rooming` 영역의 실제 투숙객명을 확인 | 수정/자동검증 |
| UAT-REG-007 | CRM/Folio 목록의 총 건수와 실제 items 수가 다름 | mock API envelope의 `page.total`이 샘플 데이터 추가 후 갱신되지 않음 | `npm run audit:data`에서 page total과 items 길이가 일치하는지 확인 | 수정/자동검증 |
| UAT-REG-008 | closed Folio인데 잔액이 남아 정산/마감 기준이 모순됨 | 미수금 또는 완료대기 상태여야 할 Folio를 closed 상태로 둠 | closed Folio는 잔액 0이어야 하며, 체크아웃 완료 후 미수금이 있으면 `checked-out` 또는 `unpaid` 계열 상태인지 확인 | 수정/자동검증 |
| UAT-REG-009 | 체크아웃 전 Folio가 정산 목록과 KPI에 표시됨 | 정산 목록이 `open` Folio와 `closedAt` 없는 데이터를 함께 계산함 | 정산 목록 금일/주간/월간 조회 시 체크아웃 일자가 `-`인 행이 없어야 하며, 미수금 샘플은 `closedAt`이 있는 체크아웃 완료 Folio로만 표시되는지 확인 | 수정/자동검증 |

## 앞으로 타임라인 수정 시 필수 검증

1. 화면 캡처만 보지 않고 좌표 기반 검증을 함께 수행한다.
2. `.tl-header-row`와 `.tl-row`의 grid column 수와 폭이 동일한지 확인한다.
3. `.tl-row`, `.tl-room-cell`, `.tl-cell`의 top/bottom 좌표가 같은지 확인한다.
4. 동적 블록이 겹쳐 행 높이가 늘어나는 경우에도 방 번호 셀과 날짜 셀의 높이가 함께 늘어나는지 확인한다.
5. GitHub Pages 배포 후에도 cache busting URL로 같은 검증을 반복한다.

## 앞으로 데이터 수정 시 필수 검증

1. list envelope의 `page.total`은 실제 `items.length`와 맞춘다.
2. closed Folio는 잔액 0이어야 한다.
3. 체크아웃 전 Folio는 정산 목록과 KPI에서 제외한다.
4. 체크아웃 완료 후 잔액이 남은 Folio는 `checked-out` 또는 `unpaid` 계열 상태로 분리한다.
5. 시연용 데이터는 KPI, 목록, 상세, 로그 화면에서 같은 기준으로 계산되는지 확인한다.
