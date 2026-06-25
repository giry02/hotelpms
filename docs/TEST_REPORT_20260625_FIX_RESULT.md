# Hotel PMS 수정 후 테스트 리포트

작성일: 2026-06-25  
범위: 예약 타임라인 라인 정렬, 데이터 정합성 오류, smoke 테스트 오류, 단체 상세 검증 오류

## 수정 내용

| 구분 | 수정 파일 | 내용 |
| --- | --- | --- |
| 예약 타임라인 라인 정렬 | `dashboard/frontdesk/reservation-timeline.html` | 타임라인 header/row를 동일한 grid column으로 고정하고, row border 대신 각 cell border를 사용하도록 변경 |
| 동적 행 높이 | `dashboard/frontdesk/reservation-timeline.html` | 겹치는 예약 블록으로 행 높이가 늘어날 때 CSS 변수 `--tl-row-height`로 방 번호 셀과 날짜 셀이 함께 늘어나도록 변경 |
| 단체 상세 smoke 검증 | `scripts/mock-api/smoke-pages.cjs` | 잘못된 탭 검사 대신 `투숙객 명단` 탭을 열고 `#rooming` 영역을 확인하도록 수정 |
| groups API fallback | `dashboard/common/js/api/api-frontdesk.js` | fallback을 오류성 warning으로 보지 않도록 정리하고 저장된 group mock 데이터를 반환 |
| admin index blank body | `admin/index.html` | 리다이렉트 전에도 화면 본문이 비어 보이지 않도록 안내 문구 추가 |
| CRM total 정합성 | `dashboard/data/api/v1/crm/guests.json` | `page.total`을 실제 items 수와 일치하도록 수정 |
| Folio total/상태 정합성 | `dashboard/data/api/v1/folios/index.json` | `page.total`을 실제 items 수와 일치시키고, 잔액이 남은 closed Folio를 open/unpaid로 조정 |

## 재검증 결과

| 테스트 | 명령 | 결과 | 비고 |
| --- | --- | --- | --- |
| 데이터 정합성 | `npm run audit:data` | 통과 | errors 0, warnings 0 |
| storage 의존성 | `npm run audit:storage` | 통과 | pagesWithIssues 0 |
| 주요 페이지 smoke | `npm run smoke` | 통과 | 이전 단체 상세 실패 수정 |
| 전체 페이지 smoke | `npm run smoke:all` | 통과 | 57/57 통과 |
| 상호작용 smoke | `npm run smoke:interactions` | 통과 | failures 0, brokenLinks 0 |
| 업무 E2E | `npm run e2e` | 통과 | 6/6 통과 |
| 예약 회귀 | `npm run test:reservations` | 통과 | 예약 상태/채널/단체 전환 회귀 통과 |
| diff 공백 검사 | `git diff --check` | 통과 | CRLF 경고만 있음 |
| 시각 레이아웃 감사 | `npm run audit:visual` | 통과 | failed 0, overflow warning 일부 남음 |
| 영문 화면 내 한글 감사 | `node scripts/mock-api/audit-english-korean.cjs` | 실패 유지 | 57개 중 38개 페이지에서 visible Korean 감지. 데이터/라벨 분리 추가 점검 필요 |

## 타임라인 좌표 검증

Playwright로 예약 타임라인의 `.tl-row`, `.tl-room-cell`, `.tl-cell` top/bottom 좌표를 비교했다.

결과:

- mismatchCount: 0
- header cell left positions: `[409, 515, 621, 727, 832]`
- first row cell left positions: `[409, 515, 621, 727, 832]`

판정: 사용자가 지적한 행 라인 어긋남은 로컬 검증 기준 수정 완료.

GitHub Pages 배포 후 cache busting URL로 다시 확인했다.

- URL: `https://giry02.github.io/hotelpms/dashboard/frontdesk/reservation-timeline.html?cb=d43d810a245cb4256d14496350cf26e9388d4504`
- rowDisplay: `grid`
- mismatchCount: 0

판정: GitHub Pages 기준으로도 행 라인 어긋남 수정 반영 완료.

## 남은 주의 항목

1. `audit:visual`은 실패는 없지만 dashboard carousel, reservation-board mobile chip, timeline mobile legend, folio-chart label, maintenance mobile filter에서 overflow warning이 남아 있다.
2. `smoke:interactions`는 실패는 없지만 dashboard `주간`, closing-log `오늘` 버튼을 noEffectCandidates로 감지했다. 의도된 탭 토글인지 실제 미동작인지 후속 확인이 필요하다.
3. 영어 화면에서 한글이 보이는 항목은 여전히 많다. 고객 입력 데이터와 시스템 라벨을 분리해서 i18n 기준을 다시 잡아야 한다.

## 이번 오류를 테스트 케이스에 추가한 이유

이번 문제는 단순 CSS 문제가 아니라, 화면 캡처 확인만으로는 놓칠 수 있는 좌표 정렬 문제였다. 앞으로 타임라인, 테이블, 그리드 화면은 시각 확인과 함께 좌표 기반 검증을 같이 수행한다.
