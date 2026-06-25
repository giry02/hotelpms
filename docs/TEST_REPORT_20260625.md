# Hotel PMS 사용자 테스트 / 통합 테스트 리포트

작성일: 2026-06-25  
기준 문서: `docs/USER_ACCEPTANCE_TEST_GUIDE.md`  
테스트 목적: 사용자가 반복 지적한 다국어, 데이터 적합성, 업무 로직, 화면 레이아웃 문제를 같은 기준으로 점검하고 현재 남은 리스크를 명확히 남깁니다.

## 1. 종합 결과

전체 판정: **부분 실패**

핵심 업무 E2E와 예약 회귀 테스트는 통과했지만, 데이터 적합성, 단체 상세, 관리자 index, 시각 레이아웃, 다국어 감사에서 문제가 확인되었습니다. 현재 상태를 “완료”로 판단하면 안 되며, 아래 실패 항목을 우선 수정해야 합니다.

## 2. 실행한 테스트

| 테스트 | 명령 | 결과 | 요약 |
| --- | --- | --- | --- |
| 정적 diff 검사 | `git diff --check` | 통과 | 공백/라인 오류 없음 |
| 데이터 적합성 | `npm run audit:data` | 실패 | CRM guests total, Folio total 불일치 및 닫힌 Folio 잔액 경고 |
| storage 의존성 | `npm run audit:storage` | 통과 | 57개 페이지 중 storage issue 0건 |
| 주요 페이지 smoke | `npm run smoke` | 실패 | 단체 상세 화면 rooming guest 검증 실패 |
| 전체 페이지 smoke | `npm run smoke:all` | 실패 | `/admin/index.html` blank body |
| 상호작용 smoke | `npm run smoke:interactions` | 실패 | 184초 제한 시간 초과 |
| 업무 E2E | `npm run e2e` | 통과 | 6개 업무 흐름 통과 |
| 예약 회귀 | `npm run test:reservations` | 통과 | 예약 채널 제거, 상태/단체 전환 제거 등 통과 |
| 단체 회귀 | `npm run test:groups` | 실패 | groups API fallback warning으로 실패 |
| 시각 레이아웃 | `npm run audit:visual` | 실패 | admin index 실패, dashboard/folio/timeline/maintenance overflow 경고 |
| 다국어 감사 | `node scripts/mock-api/audit-english-korean.cjs` | 실패 | 57개 중 38개 페이지에서 한국어 노출 감지 |
| 타임라인 회귀 | Playwright GitHub Pages 직접 검증 | 통과 | 객실 정렬, 회색 범례, 미래 투숙중 분리 확인 |

## 3. 데이터 적합성 실패

### 3.1 CRM 고객 총계 불일치

- 파일: `dashboard/data/api/v1/crm/guests.json`
- 문제: `page.total`은 54인데 실제 `items`는 55건입니다.
- 영향: 투숙객 관리 KPI, 페이지네이션, 필터 결과가 서로 다르게 보일 수 있습니다.
- 조치 필요: `page.total`을 실제 items 수와 맞추거나 API mock 생성 로직을 수정해야 합니다.

### 3.2 Folio 총계 불일치

- 파일: `dashboard/data/api/v1/folios/index.json`
- 문제: `page.total`은 140인데 실제 `items`는 152건입니다.
- 영향: 정산 목록의 총 건수, 페이지네이션, 금일/주간/월간 필터 검증이 흔들립니다.
- 조치 필요: Folio mock total과 실제 배열 길이를 일치시켜야 합니다.

### 3.3 닫힌 Folio 잔액 경고

닫힌 Folio인데 잔액이 0이 아닌 케이스가 있습니다.

- `FOL-260625-DEMO-KANG-ROOM`
- `FOL-260625-DEMO-PARK-DEPOSIT`
- `FOL-260625-DEMO-DAVID-GOLF`
- `FOL-260625-DEMO-GRP-SAMSUNG-ROOM`
- `FOL-260625-DEMO-GRP-SAMSUNG-GOLF`

영향:

- 정산 완료, 미수금, 예치금, 마감 판단 기준이 모순될 수 있습니다.
- “완료” 상태인데 잔액이 남아 있으면 호텔 운영자가 정산 결과를 신뢰하기 어렵습니다.

조치 필요:

- closed folio는 잔액 0으로 맞추거나, 잔액이 남는 업무 상태라면 상태명을 `미수금 존재`, `완료 대기` 등으로 분리해야 합니다.

## 4. 화면 / 흐름 테스트 실패

### 4.1 단체 상세 rooming guest 검증 실패

- 명령: `npm run smoke`
- 화면: `/dashboard/frontdesk/groups_block_detail.html?id=GRP-260527-01`
- 문제: `detail has rooming guest` 체크 실패
- 영향: 단체/행사 상세에서 등록 투숙객이 제대로 보이지 않거나 테스트 기준 데이터가 부족할 수 있습니다.
- 조치 필요: 단체 상세 화면의 rooming list 데이터 연결과 시연 데이터를 다시 검증해야 합니다.

### 4.2 관리자 index blank body

- 명령: `npm run smoke:all`, `npm run audit:visual`
- 화면: `/admin/index.html`
- 문제: desktop/mobile 모두 body text가 비어 있거나 layout 평가 중 null 오류 발생
- 영향: GitHub Pages에서 관리자 메인 진입 시 빈 화면으로 보일 수 있습니다.
- 조치 필요: admin index 라우팅, 스크립트 초기화, DOM 렌더링 순서를 우선 확인해야 합니다.

### 4.3 상호작용 smoke 타임아웃

- 명령: `npm run smoke:interactions`
- 문제: 184초 제한 시간 초과
- 영향: 특정 버튼/팝업/테이블 상호작용이 멈춰 있을 가능성이 있습니다.
- 조치 필요: 스크립트가 어느 화면에서 멈추는지 로그를 세분화해야 합니다.

### 4.4 단체 회귀 fallback warning

- 명령: `npm run test:groups`
- 문제: groups API fetch 실패 후 fallback warning 발생
- 영향: 실제 화면은 fallback으로 보일 수 있으나 테스트와 운영 기준에서는 API 연결 실패로 보입니다.
- 조치 필요: mock API path, fallback warning 처리 기준, 테스트 환경 fetch 경로를 정리해야 합니다.

## 5. 시각 레이아웃 경고

시각 감사 결과 114개 체크 중 실패 2건, overflow 경고 다수 발생.

우선 확인 대상:

- `/dashboard/dashboard.html`
  - 광고/이벤트 carousel track이 화면 밖으로 overflow.
  - desktop/mobile 모두 경고.
- `/dashboard/frontdesk/reservation-board.html`
  - mobile에서 `레이트 2` chip overflow.
- `/dashboard/frontdesk/reservation-timeline.html`
  - mobile에서 `단체 블록` 범례 overflow.
- `/dashboard/operations/folio-chart.html`
  - desktop/mobile 매출 차트 bar/label overflow.
- `/dashboard/operations/maintenance.html`
  - mobile에서 `긴급 대기 2` 버튼 overflow.

조치 필요:

- carousel 계열은 transform 기반 이동 요소가 audit에서 overflow로 잡히는지, 실제 시각 문제인지 구분해야 합니다.
- 버튼/chip overflow는 실제 모바일 레이아웃 깨짐 가능성이 높으므로 우선 수정 대상입니다.

## 6. 다국어 감사 결과

- 총 57개 페이지 검사.
- 38개 페이지에서 한국어 노출 감지.
- 결과 파일: `outputs/i18n-audit/english-korean-visible.json`

주의:

- 이 테스트는 “영어 화면에서 한국어가 보이는지”를 잡는 목적이라 고객 입력 데이터와 시스템 라벨을 구분해 후속 판정이 필요합니다.
- 단순히 한국어가 보인다고 모두 오류는 아니지만, 시스템 라벨이 한국어로 남은 경우는 수정 대상입니다.

상위 감지 예시:

| 페이지 | 감지 수 | 샘플 |
| --- | --- | --- |
| `/admin/tenants/detail.html` | 86 | 체크인/체크아웃 정책, PMS 운영 적용 현황 |
| `/dashboard/dashboard.html` | 50 | 공항 픽업부터, 장기 렌트까지 |
| `/admin/admin.html` | 27 | PMS 운영 적용 현황, 호텔별 확인 |
| `/admin/index.html` | 27 | PMS 운영 적용 현황, 호텔별 확인 |
| `/dashboard/crm/guests.html` | 21 | 우수 고객, 다이아몬드, 플래티넘 |

추가 주의:

- 사용자가 이미 롤백했다고 말한 `제휴 광고/추천`, `골프장 추천`, `렌터카 추천` 문구가 admin 감사 결과에 보입니다. 실제 화면/데이터에서 남아 있는지 재확인이 필요합니다.

## 7. 타임라인 회귀 검증

GitHub Pages에서 직접 검증했습니다.

검증 URL:

```text
https://giry02.github.io/hotelpms/dashboard/frontdesk/reservation-timeline.html?cb=c489e1c
```

검증 결과:

- 객실 순서 상위 12개: `PH01`, `PH02`, `1401`, `1402`, `1403`, `1405`, `1201`, `1202`, `1203`, `1205`, `1206`, `1207`
- 범례: `예약 확정`, `투숙 중`, `체크아웃 대상`, `체크아웃 완료 / 점검`, `단체 블록`
- 표시 기간: `6월 25일 — 7월 8일`
- today header: `25 목`
- 초록색 투숙중 블록: 4개
- 다일 초록색 블록: 0개

판정:

- 사용자가 지적한 “미래 날짜 투숙중 표시” 문제는 현재 GitHub Pages 기준 재현되지 않습니다.

## 8. 우선 수정 권장 순서

1. `admin/index.html` blank body 해결.
2. CRM/Folio `page.total` 불일치 수정.
3. closed Folio 잔액과 상태명 정합성 정리.
4. 단체 상세 rooming guest 데이터 연결 확인.
5. `smoke:interactions` 타임아웃 원인 화면 추적.
6. mobile overflow 경고 중 버튼/chip부터 수정.
7. 다국어 감사 결과에서 시스템 라벨과 고객 입력 데이터를 분리 판정.

## 9. 앞으로의 운영 약속

사용자가 새로 지적한 실수는 다음 방식으로 관리합니다.

- `docs/USER_ACCEPTANCE_TEST_GUIDE.md`의 `사용자 지적 회귀 테스트 케이스`에 누적합니다.
- 가능하면 mock-api 테스트 또는 Playwright 직접 검증으로 자동화합니다.
- 자동화가 어려운 경우 완료 보고서에 수동 검증 결과를 남깁니다.
- GitHub Pages에서 새 커밋 기준으로 확인하지 않으면 완료로 보고하지 않습니다.
