# Hotel PMS 전체 통합 테스트 실행 결과

> 이 문서는 2026-07-19 중간 집계입니다. 최신 재실행 결과는 `PMS_FULL_INTEGRATION_TEST_FINAL_20260720.md`를 기준으로 합니다.

- 실행 기준: `docs/PMS_FULL_INTEGRATION_TEST_PLAN_20260718.md`
- 실행 환경: Playwright Chromium, 1440×900 / 1024×1366 / 412×915 / 360×800, KO/EN
- 총 케이스: **673**
- 판정: **PASS 614 / FAIL 47 / BLOCKED 12 / NOT RUN 0**
- 주의: 페이지 로드나 버튼 클릭만으로 업무 케이스를 성공 처리하지 않았다. 상태 변경은 전용 회귀 assertion 또는 실제 persistence handler가 확인된 경우만 PASS다.

## 실행 묶음

| 검사 | 증적 | 판정 |
|---|---|---:|
| smoke | `outputs/full-plan-20260719/01-smoke-all-pages.log` | PASS |
| interactions | `outputs/full-plan-20260719/02-smoke-interactions.log` | PASS |
| inputsKo | `outputs/full-plan-20260719/03-smoke-inputs-ko.log` | PASS |
| inputsEn | `outputs/full-plan-20260719/04-smoke-inputs-en.log` | PASS |
| i18n | `outputs/full-plan-20260719/05-audit-i18n.log` | PASS |
| visual | `outputs/full-plan-20260719/16-audit-visual-4vp.log` | PASS |
| api | `outputs/full-plan-20260719/07-audit-api-contracts.log` | PASS |
| data | `outputs/full-plan-20260719/08-audit-data-consistency.log` | PASS |
| fixtures | `outputs/full-plan-20260719/09-validate-mock-data.log` | PASS |
| reservation | `outputs/full-plan-20260719/10-reservation-regression.log` | PASS |
| critical | `outputs/full-plan-20260719/11-critical-ui.log` | PASS |
| groups | `outputs/full-plan-20260719/12-group-event-regression.log` | PASS |
| ancillary | `outputs/full-plan-20260719/13-ancillary-vendors.log` | PASS |
| storage | `outputs/full-plan-20260719/14-storage-writes.log` | PASS |
| e2e | `outputs/full-plan-20260719/15-e2e-business-flows.log` | PASS |

## 영역별 결과

| 영역 | 전체 | PASS | FAIL | BLOCKED |
|---|---:|---:|---:|---:|
| 6. 모든 페이지 공통 테스트 케이스 | 20 | 20 | 0 | 0 |
| 7.1 로그인 및 공통 내비게이션 | 12 | 9 | 3 | 0 |
| 7.2 대시보드 및 알림 | 16 | 16 | 0 | 0 |
| 7.3 예약 현황 | 22 | 21 | 0 | 1 |
| 7.4 예약 타임라인 | 10 | 10 | 0 | 0 |
| 7.5 예약 목록 및 체크인 호환 화면 | 17 | 15 | 0 | 2 |
| 7.6 단체/행사 목록 | 12 | 12 | 0 | 0 |
| 7.7 단체 행사 상세 | 25 | 25 | 0 | 0 |
| 7.8 단체 업체 관리 및 거래 통계 | 15 | 15 | 0 | 0 |
| 7.9 객실 유형 및 객실 관리 | 15 | 15 | 0 | 0 |
| 7.10 요금 캘린더 | 10 | 10 | 0 | 0 |
| 7.11 하우스키핑 | 12 | 12 | 0 | 0 |
| 7.12 시설 보수 | 12 | 12 | 0 | 0 |
| 7.13 부가서비스 등록 | 22 | 22 | 0 | 0 |
| 7.14 업체/항목 관리 및 바우처 | 18 | 16 | 0 | 2 |
| 7.15 부가서비스 호환 화면 | 10 | 10 | 0 | 0 |
| 7.16 정산 현황 | 18 | 17 | 0 | 1 |
| 7.17 정산 목록 | 15 | 14 | 0 | 1 |
| 7.18 비품 구매 | 14 | 13 | 1 | 0 |
| 7.19 일일 마감 및 마감 로그 | 18 | 17 | 0 | 1 |
| 7.20 매출 분석 | 8 | 8 | 0 | 0 |
| 7.21 투숙객 CRM | 15 | 15 | 0 | 0 |
| 7.22 우수 고객 멤버십 | 20 | 20 | 0 | 0 |
| 7.23 호텔 및 일반 설정 | 20 | 20 | 0 | 0 |
| 7.24 직원 목록 및 계정 | 16 | 16 | 0 | 0 |
| 7.25 역할 및 기능 권한 | 14 | 14 | 0 | 0 |
| 7.26 운영 감사 로그 | 12 | 12 | 0 | 0 |
| 7.27 공지사항 및 고객지원 | 18 | 18 | 0 | 0 |
| 8.1 로그인 및 공통 셸 | 8 | 6 | 2 | 0 |
| 8.2 플랫폼 대시보드 | 10 | 8 | 2 | 0 |
| 8.3 호텔사 목록 및 상세 | 27 | 26 | 1 | 0 |
| 8.4 호텔사 등록 및 입점 신청 | 22 | 20 | 1 | 1 |
| 8.5 광고 캠페인 | 52 | 43 | 9 | 0 |
| 8.6 Admin 사용자 및 시스템 설정 | 28 | 18 | 8 | 2 |
| 8.7 Admin 헬프데스크, 공지, 감사, 프로필 | 21 | 16 | 5 | 0 |
| 9. 교차 모듈 통합 프로세스 테스트 | 25 | 10 | 15 | 0 |
| 10. API, 데이터 및 저장소 통합 테스트 | 20 | 20 | 0 | 0 |
| 11. 다국어 전수 테스트 | 12 | 11 | 0 | 1 |
| 12. 반응형 및 상호작용 전수 테스트 | 12 | 12 | 0 | 0 |

## 결함 및 수정 현황

| 결함 | Case ID | 페이지 | 원인 | 수정 | 재검증 |
|---|---|---|---|---|---:|
| DEF-AUTH-003 | AUTH-003 | dashboard/login.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-AUTH-004 | AUTH-004 | dashboard/login.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-AUTH-005 | AUTH-005 | dashboard/login.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-EXP-008 | EXP-008 | dashboard/operations/expense-purchases.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-AUTH-006 | ADM-AUTH-006 | admin/login.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-AUTH-007 | ADM-AUTH-007 | admin/login.html | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-DASH-004 | ADM-DASH-004 | admin/admin.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-DASH-005 | ADM-DASH-005 | admin/admin.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-TEN-DETAIL-008 | ADM-TEN-DETAIL-008 | admin/tenants/detail.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-TEN-APPLY-004 | ADM-TEN-APPLY-004 | admin/tenants/apply.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-LIST-003 | ADM-ADS-LIST-003 | admin/ads/campaigns.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-LIST-007 | ADM-ADS-LIST-007 | admin/ads/campaigns.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-NEW-001 | ADM-ADS-NEW-001 | admin/ads/new.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-NEW-005 | ADM-ADS-NEW-005 | admin/ads/new.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-NEW-006 | ADM-ADS-NEW-006 | admin/ads/new.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-NEW-009 | ADM-ADS-NEW-009 | admin/ads/new.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-TGT-001 | ADM-ADS-TGT-001 | admin/ads/targeting.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-TGT-004 | ADM-ADS-TGT-004 | admin/ads/targeting.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-ADS-BILL-004 | ADM-ADS-BILL-004 | admin/ads/billing.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-USER-008 | ADM-USER-008 | admin/system/users.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-BILL-001 | ADM-BILL-001 | admin/system/billing.html | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-BILL-002 | ADM-BILL-002 | admin/system/billing.html | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-BILL-003 | ADM-BILL-003 | admin/system/billing.html | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-BILL-004 | ADM-BILL-004 | admin/system/billing.html | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-BILL-006 | ADM-BILL-006 | admin/system/billing.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-BILL-008 | ADM-BILL-008 | admin/system/billing.html | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-INT-008 | ADM-INT-008 | admin/system/integrations.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-HELP-005 | ADM-HELP-005 | admin/system/helpdesk.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-NOTICE-002 | ADM-NOTICE-002 | admin/system/notices.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-LOG-001 | ADM-LOG-001 | admin/system/audit-logs.html | 기대하는 상태 변경을 저장할 persistence handler를 페이지에서 찾지 못함 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-LOG-002 | ADM-LOG-002 | admin/system/audit-logs.html | 기대하는 상태 변경을 저장할 persistence handler를 페이지에서 찾지 못함 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-ADM-PROFILE-004 | ADM-PROFILE-004 | admin/system/profile.html | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-006 | E2E-006 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-008 | E2E-008 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-009 | E2E-009 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-010 | E2E-010 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-011 | E2E-011 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-013 | E2E-013 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-015 | E2E-015 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-016 | E2E-016 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-017 | E2E-017 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-018 | E2E-018 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-019 | E2E-019 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-020 | E2E-020 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-021 | E2E-021 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-022 | E2E-022 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| DEF-E2E-023 | E2E-023 | - | 대상 제품 페이지 또는 라우트 매핑이 없음 | 미수정: 전용 업무 흐름 구현 또는 전용 assertion 추가 후 재검증 필요 | FAIL |
| - | RES-BOARD-019 | dashboard/frontdesk/reservation-board.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | RES-LIST-007 | dashboard/frontdesk/reservation-list.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | RES-LIST-008 | dashboard/frontdesk/reservation-list.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | ANC-VND-014 | dashboard/operations/ancillary-vendors.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | ANC-VND-015 | dashboard/operations/ancillary-vendors.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | SETTLE-STATUS-014 | dashboard/operations/settlement-status.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | FOLIO-011 | dashboard/operations/folio.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | AUDIT-010 | dashboard/operations/night-audit.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | ADM-TEN-REG-007 | admin/tenants/register.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | ADM-INT-003 | admin/system/integrations.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | ADM-INT-005 | admin/system/integrations.html | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |
| - | I18N-012 | - | 테스트 환경에 외부 장치 또는 서비스가 연결되지 않음 | 실서비스 스테이징에서 장치/서비스를 연결한 뒤 동일 Case ID로 재실행 | BLOCKED |

## 673개 케이스별 결과

### 6. 모든 페이지 공통 테스트 케이스

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| COM-PAGE-001 | P0 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 빈 화면, 리다이렉트 반복, 4xx/5xx 없이 페이지 로드 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-002 | P0 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 로딩 후 목록/KPI/빈 상태 중 하나가 명확히 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-003 | P0 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 클릭 무반응, 잘못된 팝업, 잘못된 대상 선택이 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-004 | P0 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 입력, 선택, 날짜, 숫자 제약이 의도대로 작동 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-005 | P0 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 팝업 재오픈, 메뉴 이동, 새로고침 후 결과 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-006 | P0 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 저장되지 않고 해당 필드 근처에 이해 가능한 오류 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-007 | P0 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 권한 없는 역할은 버튼 미노출 또는 실행 차단 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-008 | P0 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 예상하지 않은 pageerror, console error, 4xx/5xx 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-009 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 영어 원문, 번역 키, 깨진 문자열 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-010 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 한글 UI, 번역 키, 한국어 날짜 placeholder 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-011 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 한글/영어 순간 노출 없이 선택 언어가 계속 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-012 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 현재 언어와 화면 메뉴명으로 즉시 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-013 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 카운트, 실제 카드/행 수, 빈 상태가 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-014 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | backdrop 클릭으로 임의 닫힘 없음, 토스트가 팝업 위에 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-015 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 버튼/카드/드롭다운이 떨리거나 위치/크기가 바뀌지 않음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-016 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 가로 스크롤 없이 핵심 기능 사용 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-017 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 터치, modal, dropdown, 날짜 선택, 목록 상세 진입 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-018 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 안내 문구와 재시도 경로가 있고 잘못된 데이터가 표시되지 않음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-019 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 취소 시 상태 유지, 확인 시 삭제/취소 및 관련 재고/로그 반영 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| COM-PAGE-020 | P1 | - | 60개 제품 페이지에서 직접 URL, 526개 버튼, 350개 KO/EN 입력 필드, 저장소 쓰기를 전수 검사 | 각 조건의 교집합만 표시되고 초기화 시 원래 목록 복원 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.1 로그인 및 공통 내비게이션

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| AUTH-001 | P0 | login | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 역할에 맞는 첫 화면으로 이동하고 세션 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUTH-002 | P0 | login | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 로그인 차단, 원인 안내, 세션 미생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUTH-003 | P0 | login | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 로그인 차단 및 휴직 상태 안내 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| AUTH-004 | P0 | login | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 로그인 차단 및 퇴직 상태 안내 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| AUTH-005 | P0 | login | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 필드 오류 후 로그인 요청 미전송 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| AUTH-006 | P1 | login | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 선택 언어가 다음 페이지까지 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUTH-007 | P0 | common | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 허용 메뉴만 노출되고 직접 URL도 차단 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| AUTH-008 | P1 | common | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 한 번에 의도한 메뉴만 열리고 active 위치 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUTH-009 | P1 | common | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | overlay와 본문 스크롤이 안정적이고 메뉴 선택 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| AUTH-010 | P0 | common | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 인증 화면으로 이동하고 보호 페이지 재진입 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUTH-011 | P1 | index | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 올바른 로그인 또는 대시보드 경로로 1회 리다이렉트 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| AUTH-012 | P1 | common | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 본인 정보 팝업에서 이메일/비밀번호 수정 및 재로그인 확인 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.2 대시보드 및 알림

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| DASH-001 | P0 | dashboard | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 오늘 체크인, 정산, 청소, 알림 수가 대상 화면과 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| DASH-002 | P0 | dashboard | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 대상 화면의 같은 필터가 활성화되고 건수가 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| DASH-003 | P1 | dashboard | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 날짜 이동 시 객실 데이터와 선택 날짜가 함께 변경 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| DASH-004 | P1 | dashboard | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 기본 건수와 전체 건수가 정확하고 레이아웃 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| DASH-005 | P1 | dashboard | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 해당 예약/정산/부가서비스/단체 화면으로 이동 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| DASH-006 | P1 | dashboard | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 올바른 광고가 표시되고 자동/수동 전환 충돌 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| DASH-007 | P1 | dashboard | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 업체가 있으면 상세, 없으면 잘못된 빈 팝업 대신 명확한 fallback | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| DASH-008 | P1 | dashboard | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 이벤트명, 이미지, 기간, 업체 정보가 동일하게 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| DASH-009 | P1 | dashboard | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 광고/활동/체크인 각각 독립 빈 상태 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| DASH-010 | P1 | dashboard | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | KPI와 알림 목록이 동시에 증가 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| NOTI-001 | P0 | notifications | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 읽음 처리되고 KPI/배지 감소 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| NOTI-002 | P1 | notifications | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 예약, 정산, 객실, 부가서비스 유형별 정확한 목록 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| NOTI-003 | P1 | notifications | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 존재하는 대상 상세로 이동하고 잘못된 ID는 안내 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| NOTI-004 | P1 | notifications | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 전체 상태 저장 및 새로고침 후 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| NOTI-005 | P1 | notifications | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 모바일 포함 잘림/가로 넘침 없이 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| NOTI-006 | P1 | notifications | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 시간순과 표시 시간이 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.3 예약 현황

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| RES-BOARD-001 | P0 | dashboard/frontdesk/reservation-board.html | 예약 필터 10종의 카운트와 카드 상태를 원천 예약 데이터와 비교 | 필터별 카드 상태, 색상, 카운트, 실제 개수가 일치 | 기대 결과와 일치 | **PASS** | 10-reservation-regression.log |
| RES-BOARD-002 | P0 | dashboard/frontdesk/reservation-board.html | 클릭한 객실이 신규 예약 팝업 기본값으로 유지됨을 확인 | 선택한 객실이 팝업 기본값이며 저장 후 같은 객실에 예약 표시 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| RES-BOARD-003 | P0 | dashboard/frontdesk/reservation-board.html | 청소 미완료 경고 취소 시 예약이 저장되지 않음을 확인 | 청소 미완료 경고 후 취소/계속 선택 가능, 확인 시에만 저장 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| RES-BOARD-004 | P0 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 예약 저장 차단, 일반 객실에는 같은 오류가 발생하지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-BOARD-005 | P0 | dashboard/frontdesk/reservation-board.html | 1203 선택, 팝업 1203, 저장 예약 1203을 연속 확인 | 팝업 객실과 저장 객실이 모두 1203으로 유지 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| RES-BOARD-006 | P0 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 변경 선택이 저장되고 원래 카드에는 예약이 생기지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-BOARD-007 | P0 | dashboard/frontdesk/reservation-board.html | 오늘 예약 체크인 후 투숙 중 상태와 목록 KPI 동기화 확인 | 투숙 중 전환, KPI/필터/타임라인/목록 동기화 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| RES-BOARD-008 | P0 | dashboard/frontdesk/reservation-board.html | 일자 경과 예약이 점검 상태로 오인되지 않는 회귀 assertion 실행 | 미도착 표시지만 체크인 가능, 날짜 로직으로 잘못 차단하지 않음 | 기대 결과와 일치 | **PASS** | 10-reservation-regression.log |
| RES-BOARD-009 | P0 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 정책에 따른 확인 또는 차단, 상태 오변경 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-BOARD-010 | P0 | dashboard/frontdesk/reservation-board.html | 투숙 중 예약 체크아웃 후 completed 상태 전환 확인 | 투숙 종료, 객실 청소 필요, 정산 상태 반영 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| RES-BOARD-011 | P0 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 예약 이력은 유지하되 현재 객실 가용 상태와 분리 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-BOARD-012 | P0 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 원 객실/신 객실, 이동 이력, 카운트가 모두 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-BOARD-013 | P0 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 카운트가 변경 이력 건수인지 현재 카드 수인지 정의와 일치하고 목록 누락 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-BOARD-014 | P0 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 카드 제거/취소 상태, 객실 재고, 취소 필터, 로그 동기화 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-BOARD-015 | P0 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 노쇼 필터와 객실 재고가 정확히 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-BOARD-016 | P1 | dashboard/frontdesk/reservation-board.html | 청소 select와 hover 전후 레이아웃 안정성 비교 | 상태별 동일 스타일, hover 떨림 없음, 하우스키핑 동기화 | 기대 결과와 일치 | **PASS** | 10-reservation-regression.log |
| RES-BOARD-017 | P1 | dashboard/frontdesk/reservation-board.html | 카드 hover 전후 transform/색상/크기 불변 확인 | 위치/크기/색상이 반복 전환하지 않음 | 기대 결과와 일치 | **PASS** | 10-reservation-regression.log |
| RES-BOARD-018 | P1 | dashboard/frontdesk/reservation-board.html | 동일 예약의 필터별 상태/색상 일치 확인 | 이름, 날짜, 금액, 배지, 카드 색상이 동일 | 기대 결과와 일치 | **PASS** | 10-reservation-regression.log |
| RES-BOARD-019 | P1 | dashboard/frontdesk/reservation-board.html | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 체크인 대상에서만 노출, 실시간 미리보기, 가로 인쇄 레이아웃 일치 | 실제 OS 프린터 출력 장치 확인은 현재 headless 환경에서 수행할 수 없음 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| RES-BOARD-020 | P1 | dashboard/frontdesk/reservation-board.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 축약 라벨로 한 줄 유지하거나 정상 줄바꿈, 버튼 겹침 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| RES-BOARD-021 | P1 | dashboard/frontdesk/reservation-board.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 객실/이름/단체 검색과 필터 교집합만 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| RES-BOARD-022 | P1 | dashboard/frontdesk/reservation-board.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 필터 변경 후 대상이 있는 층만 정확히 표시하고 카운트 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.4 예약 타임라인

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| RES-TIME-001 | P0 | dashboard/frontdesk/reservation-timeline.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 날짜 헤더와 예약 막대가 정확히 이동 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-TIME-002 | P0 | dashboard/frontdesk/reservation-timeline.html | 개인/단체 연속 투숙이 단일 타임라인 막대로 저장되는지 확인 | 하나의 예약은 날짜별로 쪼개지지 않고 단일 연속 막대 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| RES-TIME-003 | P0 | dashboard/frontdesk/reservation-timeline.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 예약 현황과 같은 상태 및 색상 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-TIME-004 | P0 | dashboard/frontdesk/reservation-timeline.html | Case ID 전용 Playwright 시나리오 실행: Timeline click opens the exact reservation and room | 정확한 예약/객실 상세 팝업 열림 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"before":{"key":"RSV-0016","room":"PH01","text":"VIPRodriguez Van입실 14:00 · 퇴실 12:00"},"after":{"room":"PH01","reservationId":"RSV-0016","title":"PH01호   우수 고객\n                     플랫카드 인쇄"}} |
| RES-TIME-005 | P0 | dashboard/frontdesk/reservation-timeline.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 이동 전후 객실과 기간이 이력 기준으로 정확히 표현 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-TIME-006 | P1 | dashboard/frontdesk/reservation-timeline.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 단체명, 대표/동반 투숙객, 미배정 상태가 구분 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-TIME-007 | P1 | dashboard/frontdesk/reservation-timeline.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 행 높이와 막대가 잘리지 않음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| RES-TIME-008 | P1 | dashboard/frontdesk/reservation-timeline.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 헤더와 객실 행이 어긋나지 않고 스크롤 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-TIME-009 | P1 | dashboard/frontdesk/reservation-timeline.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 미래 예약이 체크인 완료나 투숙 중으로 표시되지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-TIME-010 | P1 | dashboard/frontdesk/reservation-timeline.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 날짜, 상태, 이름, 색상, 금액이 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.5 예약 목록 및 체크인 호환 화면

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| RES-LIST-001 | P0 | reservation-list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 예약 현황과 동일 정의/카운트 사용 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| RES-LIST-002 | P0 | reservation-list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 실제 오늘 도착 가능한 예약만 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-LIST-003 | P0 | reservation-list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 조건 교집합과 초기화 정상 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-LIST-004 | P0 | reservation-list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 필수값, 객실 상태 경고, 저장, 재진입 확인 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-LIST-005 | P0 | reservation-list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 고객, 일정, 객실, 요금, 예치금 변경 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-LIST-006 | P0 | reservation-list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태별 가능한 버튼만 표시하고 교차 화면 동기화 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-LIST-007 | P1 | reservation-list | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 선택 목록을 다시 요구하지 않고 즉시 미리보기/출력 | 실제 OS 프린터 출력 장치 확인은 현재 headless 환경에서 수행할 수 없음 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| RES-LIST-008 | P1 | reservation-list | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 선택 개수/대상/인쇄 페이지 정확 | 실제 OS 프린터 출력 장치 확인은 현재 headless 환경에서 수행할 수 없음 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| RES-LIST-009 | P1 | reservation-list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 총 건수, 현재 범위, 필터 후 페이지 초기화 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-LIST-010 | P1 | reservation-list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 현재 필터와 표시 컬럼 기준 파일 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RES-LIST-011 | P1 | reservation-list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 한 줄/두 줄 규칙대로 카드나 테이블 넘침 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| RES-LIST-012 | P1 | reservation-list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 고객 상세, 요금/예치, 시간 select까지 단일 언어 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CHECKIN-001 | P0 | checkin | 예약 검색 후 체크인 완료와 저장 상태 확인 | 예약 현황과 동일 체크인 결과 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| CHECKIN-002 | P0 | checkin | 체크아웃 처리와 후속 상태 전환 확인 | 정산/청소 상태와 연결 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| CHECKIN-003 | P0 | checkin | 점검 객실만 차단하고 일반 객실은 허용하는 상태 판정 확인 | 점검 객실만 차단하고 정상 객실은 허용 | 기대 결과와 일치 | **PASS** | 10-reservation-regression.log |
| CHECKIN-004 | P1 | checkin | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 예약 고객 명단과 CRM에 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CHECKIN-005 | P1 | checkin | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 재실행 차단 및 명확한 현재 상태 안내 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.6 단체/행사 목록

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| GRP-LIST-001 | P0 | dashboard/frontdesk/groups_blocks.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태별 행사와 카운트 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-LIST-002 | P0 | dashboard/frontdesk/groups_blocks.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 단체 선택, 기간, 인원, 할인, 결제 조건 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-LIST-003 | P0 | dashboard/frontdesk/groups_blocks.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장 차단 및 필드 오류 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-LIST-004 | P0 | dashboard/frontdesk/groups_blocks.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 입력한 행사명 같은 사용자 데이터는 번역하지 않고 그대로 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-LIST-005 | P0 | dashboard/frontdesk/groups_blocks.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태, 객실 재고, 예약, 정산 영향이 정책대로 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-LIST-006 | P0 | dashboard/frontdesk/groups_blocks.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 선택한 행사 ID와 상세 데이터 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-LIST-007 | P1 | dashboard/frontdesk/groups_blocks.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 조건 교집합만 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-LIST-008 | P1 | dashboard/frontdesk/groups_blocks.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 동일 데이터와 선택 상태 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-LIST-009 | P1 | dashboard/frontdesk/groups_blocks.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 과거 행사가 진행 중으로 표시되지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-LIST-010 | P1 | dashboard/frontdesk/groups_blocks.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 카드/행 전체 및 명시 버튼 모두 안정적으로 동작 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-LIST-011 | P1 | dashboard/frontdesk/groups_blocks.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 현재 기간/필터 기준 행사 데이터 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-LIST-012 | P1 | dashboard/frontdesk/groups_blocks.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | select option, placeholder, modal이 모두 영어 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.7 단체 행사 상세

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| GRP-DETAIL-001 | P0 | dashboard/frontdesk/groups_block_detail.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 행사/단체/기간/인원/상태/정산 요약 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-DETAIL-002 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장 후 목록과 상세에 즉시 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-003 | P0 | dashboard/frontdesk/groups_block_detail.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 선택 가능한 객실만 표시되고 중복 선택 차단 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-DETAIL-004 | P0 | dashboard/frontdesk/groups_block_detail.html | Case ID 전용 Playwright 시나리오 실행: Room base rate, discount, and final rate recalculate together | 기본요금, 할인율, 최종요금 계산 정확 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"base":650,"discount":15,"final":553} |
| GRP-DETAIL-005 | P0 | dashboard/frontdesk/groups_block_detail.html | 단체 객실 배정 저장 후 타임라인 반영 확인 | 재진입 후 객실과 요금 유지, 예약 현황/타임라인 반영 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| GRP-DETAIL-006 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 연결 투숙객/정산 여부에 따른 차단 또는 안전한 해제 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-007 | P0 | dashboard/frontdesk/groups_block_detail.html | 단체 대표 투숙객 등록과 예약 연결 확인 | 선택 객실에 대표 1명만 설정되고 CRM/예약 연결 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| GRP-DETAIL-008 | P0 | dashboard/frontdesk/groups_block_detail.html | 단체 동반 투숙객 명단과 객실 연결 확인 | 인원수, 명단, 객실 연결 정확 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| GRP-DETAIL-009 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 명단/예약/CRM 동기화, 대표 삭제 제한 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-010 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 부가서비스 및 금액 미노출/등록 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-011 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 배정된 투숙객 객실이 모두 투숙 중으로 전환 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-012 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 성공/실패 객실과 원인을 구분하고 중간 상태 손상 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-013 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 정산 조건 확인 후 객실 청소 상태 전환 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-014 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 동일 업체/항목을 선택 객실/투숙객에 일괄 등록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-015 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 대상별 주문과 금액이 정확히 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-016 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 카테고리/업체/메뉴/설명/금액 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-017 | P1 | dashboard/frontdesk/groups_block_detail.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 투숙객/객실/업체별 출력 대상과 페이지 수 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-DETAIL-018 | P0 | dashboard/frontdesk/groups_block_detail.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 객실/부가서비스/결제/잔액 합계 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-DETAIL-019 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 통화별 수납과 처리 이력 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-020 | P0 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 완료 상태가 정산 현황/목록/단체 목록에 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-021 | P1 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 객실/투숙객/요금/상태 변경이 사용자 언어로 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-022 | P1 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 단체명, 행사명, 메모는 언어 전환 시 자동 번역하지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-023 | P1 | dashboard/frontdesk/groups_block_detail.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 한국어 년/월/일, 오전/오후 문자열 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-DETAIL-024 | P1 | dashboard/frontdesk/groups_block_detail.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 탭, 명단, 객실 배정, 등록 팝업이 가로 넘침 없이 동작 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-DETAIL-025 | P1 | dashboard/frontdesk/groups_block_detail.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 선택 행사와 활성 탭이 안전하게 복원 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.8 단체 업체 관리 및 거래 통계

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| GRP-COMP-001 | P0 | dashboard/frontdesk/groups_companies.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 기본정보, 담당자, 할인, 결제 조건 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-COMP-002 | P0 | dashboard/frontdesk/groups_companies.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 같은 폼 구조로 열리고 모든 값 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-COMP-003 | P0 | dashboard/frontdesk/groups_companies.html | Case ID 전용 Playwright 시나리오 실행: User-entered group name remains unchanged after language switching | 입력한 한글/영문 이름을 임의 번역하지 않음 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"marker":"한나투어 QA 1784434292533","actual":"한나투어 QA 1784434292533"} |
| GRP-COMP-004 | P0 | dashboard/frontdesk/groups_companies.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 확인 후 목록/저장소에서 제거 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-COMP-005 | P0 | dashboard/frontdesk/groups_companies.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 삭제 차단과 연결 건수/사유 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-COMP-006 | P0 | dashboard/frontdesk/groups_companies.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 과거 이력 보존 정책에 따라 비활성 또는 삭제 가능 여부 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-COMP-007 | P0 | dashboard/frontdesk/groups_companies.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 선택한 단체만 팝업에 표시하고 단체 재선택 UI 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-COMP-008 | P0 | dashboard/frontdesk/groups_companies.html | Case ID 전용 Playwright 시나리오 실행: Performance period controls update summary and history together | 기간 요약과 상세 거래 이력이 함께 갱신 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: [{"mode":"all","start":"","end":"","hasSummary":true,"hasDetails":true},{"mode":"year","start":"","end":"","hasSummary":true,"hasDetails":true},{"mode":"custom","start":"2026-07-01","end":"2026-07-31","hasSummary":true,"hasDetails":true}] |
| GRP-COMP-009 | P0 | dashboard/frontdesk/groups_companies.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 상단 KPI, 기간 요약, 상세 합계가 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-COMP-010 | P0 | dashboard/frontdesk/groups_companies.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | POS/골프/렌터카/음식점/기타 합계와 총합 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-COMP-011 | P1 | dashboard/frontdesk/groups_companies.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 역전/빈 날짜 차단, 기간 preset 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| GRP-COMP-012 | P1 | dashboard/frontdesk/groups_companies.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 열 정렬, 합계 행, 긴 행사명 넘침 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-COMP-013 | P1 | dashboard/frontdesk/groups_companies.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 실제 업체 수와 카드 수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-COMP-014 | P1 | dashboard/frontdesk/groups_companies.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 가로 스크롤 없이 요약과 상세 확인 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| GRP-COMP-015 | P1 | dashboard/frontdesk/groups_companies.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | YYYY-MM-DD` 또는 영어 locale, 한글 년/월/일 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.9 객실 유형 및 객실 관리

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ROOM-SETUP-001 | P0 | room-setup | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 명칭, 설명, 기준 인원, 최대 인원, 기본요금 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROOM-SETUP-002 | P0 | room-setup | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 연결 객실의 표시명/요금 정책에 안전하게 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROOM-SETUP-003 | P0 | room-setup | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 연결 객실이 있으면 차단 및 사유 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROOM-SETUP-004 | P0 | room-setup | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 건물, 층, 호실, 유형, 상태 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROOM-SETUP-005 | P0 | room-setup | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 중복 차단 및 기존 객실 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROOM-SETUP-006 | P0 | room-setup | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 예약/투숙/정산 연결 여부에 따라 안전하게 처리 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROOM-SETUP-007 | P1 | room-setup | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 숫자/PH/Villa 호실이 정의한 순서로 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ROOM-SETUP-008 | P1 | room-setup | Case ID 전용 Playwright 시나리오 실행: Room type rejects zero, negative, excessive price and capacity | 음수, 0, 과도한 수치 차단 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: [{"price":"0","capacity":"2","before":1,"after":1},{"price":"-1","capacity":"2","before":1,"after":1},{"price":"100000001","capacity":"2","before":1,"after":1},{"price":"1000","capacity":"0","before":1,"after":1},{"price":"1000","capacity":"-1","before":1,"after":1},{"price":"1000","capacity":"21","before":1,"after":1}] |
| ROOM-SETUP-009 | P1 | room-setup | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 유형, 건물, 층 조건 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ROOM-SETUP-010 | P1 | room-setup | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 전체 입력 라벨/option/오류 메시지 단일 언어 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ROOMS-001 | P0 | rooms | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 예약 현황/하우스키핑/시설 보수 상태와 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ROOMS-002 | P0 | rooms | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 선택 객실 정보, 현재 투숙객, 다음 예약 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ROOMS-003 | P0 | rooms | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 공실/점검/판매중지 정책과 예약 차단 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROOMS-004 | P1 | rooms | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 카운트와 목록 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ROOMS-005 | P1 | rooms | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 터치 시 정확한 객실 팝업 열림 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.10 요금 캘린더

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| RATE-001 | P0 | dashboard/operations/rates.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 선택 월과 요금 셀 데이터 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RATE-002 | P0 | dashboard/operations/rates.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장 후 재진입 및 예약 요금 계산 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RATE-003 | P0 | dashboard/operations/rates.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 해당 날짜만 override되고 다른 날짜 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RATE-004 | P0 | dashboard/operations/rates.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 시작/종료 포함 범위만 갱신 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RATE-005 | P0 | dashboard/operations/rates.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 음수, 빈 값, 역전 기간 저장 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RATE-006 | P1 | dashboard/operations/rates.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 적용 규칙과 최종 표시 요금 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RATE-007 | P1 | dashboard/operations/rates.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 취소 시 원본 유지, 초기화 정책대로 복원 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| RATE-008 | P1 | dashboard/operations/rates.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 같은 객실/날짜의 계산 금액 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| RATE-009 | P1 | dashboard/operations/rates.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 한국어 월/요일 문자열 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| RATE-010 | P1 | dashboard/operations/rates.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 날짜/요금 셀과 헤더 정렬, 입력 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.11 하우스키핑

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| HK-001 | P0 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 담당자/우선순위/메모 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-002 | P0 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태가 진행 중으로 변경되고 예약 현황 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-003 | P0 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 객실이 청소 완료/체크인 가능으로 전환 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-004 | P0 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 권한/로그 정책에 따라 상태 복원 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-005 | P0 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 담당자, 우선순위, 메모 재진입 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-006 | P0 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 진행/완료 상태에 따른 제한과 확인 정상 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-007 | P1 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 같은 작업과 상태/카운트 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-008 | P1 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 실제 작업 수와 카운트 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-009 | P1 | dashboard/operations/housekeeping.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | EN/KO option과 정렬 정확, 모바일 떨림 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| HK-010 | P1 | dashboard/operations/housekeeping.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 카드와 테이블 넘침 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| HK-011 | P1 | dashboard/operations/housekeeping.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 명확한 validation 후 저장 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| HK-012 | P1 | dashboard/operations/housekeeping.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 청소 select 색상/값/카운트가 동일 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.12 시설 보수

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| MAINT-001 | P0 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 객실, 유형, 우선순위, 내용 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-002 | P0 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 예약/체크인 차단과 상태 배지 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-003 | P0 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 파랑 계열 액션과 진행 상태 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-004 | P0 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 초록 계열 액션과 완료 상태 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-005 | P0 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 완료 후 객실 상태/예약 가능 여부 복원 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-006 | P0 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 내용/담당자/우선순위 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-007 | P0 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 진행 상태 제한과 확인 정상 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-008 | P1 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 같은 요청/카운트/상태 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-009 | P1 | dashboard/operations/maintenance.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 실제 목록과 카운트 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| MAINT-010 | P1 | dashboard/operations/maintenance.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 떨림/자동 닫힘 없이 선택 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| MAINT-011 | P1 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 점검이 아닌 객실이 잘못 차단되지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| MAINT-012 | P1 | dashboard/operations/maintenance.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 객실 점검 상태 변경 기록 확인 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.13 부가서비스 등록

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ANC-001 | P0 | dashboard/operations/ancillary.html | 부가서비스 화면의 모든 카드가 투숙 중이며 투숙객 미배정 카드가 0건인지 확인 | 투숙객이 배정된 투숙 중 객실만 표시 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| ANC-002 | P0 | dashboard/operations/ancillary.html | 투숙객 없는 객실이 부가서비스 보드에서 제외되는지 확인 | 부가서비스/금액/등록 버튼 미노출 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| ANC-003 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 해당 서비스가 실제 등록된 객실만 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-004 | P0 | dashboard/operations/ancillary.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 각 카테고리 KPI, 카드 수, 합계가 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ANC-005 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 업체/항목/수량/금액/메모/투숙객 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-006 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 업체, 이용 항목, 홀 숫자/범위, 인원, 티오프, 코스 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-007 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 차종, 픽업, 인수 시간, 위치, 연락처 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-008 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 업체 위치, 메뉴, 수량, 금액, 쿠폰/바우처 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-009 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 동적 업체/항목, 설명, 비용 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-010 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 투숙객 있는 대상만 선택 가능하고 주문별 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-011 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 단계별 버튼/배지/목록/KPI 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-012 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태가 수락/미완료로 저장되고 버튼은 다시 완료로 변경 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-013 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상세 닫기/재오픈/새로고침 후 미완료 상태 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-014 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 주문/객실/투숙객/항목/금액/이전·변경 상태 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-015 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 버튼 미노출 또는 실행 차단, 로그 오기록 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-016 | P0 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 완료 상태 제한, 합계/KPI/정산 재계산 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-017 | P1 | dashboard/operations/ancillary.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 통합 POS/골프/렌터카/음식점/기타/합산이 한 줄 규칙으로 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ANC-018 | P1 | dashboard/operations/ancillary.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 스크롤, 정렬, 상태 액션이 안정적 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ANC-019 | P1 | dashboard/operations/ancillary.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 객실/고객/단체명 조건과 필터 교집합 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ANC-020 | P1 | dashboard/operations/ancillary.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 통합 POS → 골프 → 렌터카 → 음식점 → 기타 순서 고정 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ANC-021 | P1 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 필터 후 언어 전환해도 카드/주문이 사라지지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-022 | P1 | dashboard/operations/ancillary.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 카드 터치, 추가 등록, 완료/미완료 액션 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.14 업체/항목 관리 및 바우처

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ANC-VND-001 | P0 | dashboard/operations/ancillary-vendors.html | 카테고리 순서를 통합 POS, 골프, 렌터카, 음식점, 기타로 확인 | 통합 POS → 골프 → 렌터카 → 음식점 → 기타 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| ANC-VND-002 | P0 | dashboard/operations/ancillary-vendors.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 카테고리별 필수 기본정보 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-VND-003 | P0 | dashboard/operations/ancillary-vendors.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 주문 연결 여부에 따른 안전한 수정/삭제 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-VND-004 | P0 | dashboard/operations/ancillary-vendors.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 항목명, 금액, 설명, 기준 인원/수량 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-VND-005 | P0 | dashboard/operations/ancillary-vendors.html | Case ID 전용 Playwright 시나리오 실행: Item price respects configured currency and rejects invalid amounts | 호텔 설정 통화 기본값, 음수/비숫자/과다값 차단 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"state":[{"amount":"0","before":3,"after":3},{"amount":"-1","before":3,"after":3},{"amount":"100000001","before":3,"after":3},{"amount":"not-a-number","before":3,"after":3}],"input":{"min":"1","max":"100000000","step":"0.01"},"currency":"PHP"} |
| ANC-VND-006 | P0 | dashboard/operations/ancillary-vendors.html | Case ID 전용 Playwright 시나리오 실행: Golf holes and people accept numeric values only within range | 고정 select가 아닌 숫자 입력, 허용 범위 검증 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"holes":{"type":"number","min":"1","max":"72"},"people":{"type":"number","min":"1","max":"100"}} |
| ANC-VND-007 | P0 | dashboard/operations/ancillary-vendors.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 위치와 각 메뉴 금액/설명 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ANC-VND-008 | P0 | dashboard/operations/ancillary-vendors.html | Case ID 전용 Playwright 시나리오 실행: Other category vendor and item can be created dynamically | 향후 유형과 무관하게 동적 업체/메뉴 관리 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"vendor":true,"item":true,"type":"other"} |
| ANC-VND-009 | P0 | dashboard/operations/ancillary-vendors.html | 저장된 골프 바우처 초기 필드 로드 확인 | 저장된 초기값이 로드되며 사용자가 변경 가능 | 기대 결과와 일치 | **PASS** | 13-ancillary-vendors.log |
| ANC-VND-010 | P0 | dashboard/operations/ancillary-vendors.html | 바우처 양식 변경 저장과 재조회 반영 확인 | 변경 후 상세 출력/미리보기에 반영 | 기대 결과와 일치 | **PASS** | 13-ancillary-vendors.log |
| ANC-VND-011 | P0 | dashboard/operations/ancillary-vendors.html | 골프 바우처 선택 필드와 절취 영역 렌더링 확인 | 선택 필드, 내용 일반 굵기, 절취선 영역 정확 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| ANC-VND-012 | P0 | dashboard/operations/ancillary-vendors.html | 렌터카 업체/주소/픽업/차량 정보 렌더링 확인 | 렌터카 업체/주소/픽업/차량 정보 정확 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| ANC-VND-013 | P0 | dashboard/operations/ancillary-vendors.html | Case ID 전용 Playwright 시나리오 실행: Restaurant voucher includes vendor, location, menu, benefit, and terms | 업체/위치/메뉴/혜택/사용 조건 정확 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"preview":"HOTEL PMS 음식점 쿠폰 리버사이드 비스트로 · Minh Nguyen / +84 90 118 2233 투숙객명 Lee Hannah 객실번호 0801 이용일시 2026-07-02 14:30 이용 항목 디너 세트 2인 금액 ₱260 업체 연락처 Minh Nguyen / +84 90 118 2233 업체 위치 호텔 도보 6분 / Nguyen Hue St 업체 주소 12 Nguyen Hue St, District 1, Ho Chi Minh City 혜택 호텔 투숙객 디저트 2개 무료 사용 조건 방문 전 예약 필수, 쿠폰 1매당 1회 사용 쿠폰 사용 확인 객실 0801 담당 Minh Nguyen / +84 90 118 2233","required":["리버사이드 비스트로","호텔 도보 6분 / Nguyen Hue St","디너 세트 2인","호텔 투숙객 디저트 2개 무료","방문 전 예약 필수, 쿠폰 1매당 1회 사용"]} |
| ANC-VND-014 | P1 | dashboard/operations/ancillary-vendors.html | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 목록 재선택 없이 바로 미리보기/출력 | 실제 OS 프린터 출력 장치 확인은 현재 headless 환경에서 수행할 수 없음 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| ANC-VND-015 | P1 | dashboard/operations/ancillary-vendors.html | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 미리보기와 브라우저 인쇄 레이아웃 일치 | 브라우저 인쇄 미리보기 이후 실제 프린터 결과는 장치 연결이 필요함 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| ANC-VND-016 | P1 | dashboard/operations/ancillary-vendors.html | 통합 POS에서 바우처 설정과 미리보기가 노출되지 않음을 확인 | 미리보기/바우처 기능 미노출 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| ANC-VND-017 | P1 | dashboard/operations/ancillary-vendors.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 설정 라벨만 번역하고 업체/항목 사용자 입력은 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-VND-018 | P1 | dashboard/operations/ancillary-vendors.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 탭/폼/미리보기 접근 가능, 가로 넘침 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.15 부가서비스 호환 화면

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ANC-LEG-001 | P0 | unified-pos | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 통합 부가서비스 주문과 정산에 동일 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-LEG-002 | P1 | unified-pos | Case ID 전용 Playwright 시나리오 실행: Unified POS has no voucher preview or print controls | 통합 POS에서는 미리보기/출력 미노출 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"controls":[],"functions":[]} |
| ANC-LEG-003 | P0 | pos | Case ID 전용 Playwright 시나리오 실행: Unified POS order is linked to an in-house guest and Folio | 현재 투숙객과 Folio 연결 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"selected":{"value":"RSV-GRP-260527-01-1401","reservationId":"RSV-GRP-260527-01-1401","roomNo":"1401","guestName":"Alexander Kim","guestId":"G-1013","folioId":"FOL-260119"},"saved":{"id":"ORD-MANUAL-1784434304518","reservationId":"RSV-GRP-260527-01-1401","folioId":"FOL-260119","roomNo":"1401","guestId":"G-1013","guestName":"Alexander Kim"},"afterReload":{"id":"ORD-MANUAL-1784434304518","reservationId":"RSV-GRP-260527-01-1401","folioId":"FOL-260119","roomNo":"1401","guestId":"G-1013","guestName":"Alexander Kim"}} |
| ANC-LEG-004 | P0 | golf | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 통합 부가서비스와 중복 없이 동기화 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-LEG-005 | P1 | golf | Case ID 전용 Playwright 시나리오 실행: golf screen retains type-specific voucher data | 현재 업체 설정 사용 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"pageTypeFields":true,"vendorTemplateFields":true,"configuredVendorData":true} |
| ANC-LEG-006 | P0 | rentacar | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 통합 부가서비스와 동기화 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-LEG-007 | P1 | rentacar | Case ID 전용 Playwright 시나리오 실행: rentacar screen retains type-specific voucher data | 렌터카 전용 양식 사용 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"pageTypeFields":true,"vendorTemplateFields":true,"configuredVendorData":true} |
| ANC-LEG-008 | P0 | room-service | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 객실/투숙객/Folio 연결 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ANC-LEG-009 | P1 | events | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 카테고리별 이미지/내용/담당자 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ANC-LEG-010 | P1 | events | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 적용 기간/주소 줄바꿈, 잘못된 빈 상세 팝업 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.16 정산 현황

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| SETTLE-STATUS-001 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태 정의, 카드 수, KPI 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-002 | P0 | dashboard/operations/settlement-status.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 데스크톱/태블릿/모바일에서 정확한 상세 팝업 열림 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SETTLE-STATUS-003 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 팝업에서 통화/금액/결제수단/메모 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-004 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상세 팝업을 자동으로 띄우지 않고 상태만 변경 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-005 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 완료됨, 완료일시/담당자/처리이력, 미완료 전환 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-006 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 재완료 차단, 중복 이력 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-007 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태가 미완료로 저장되고 완료 버튼으로 변경 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-008 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | Folio/객실/대상/금액/이전·변경 상태 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-009 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 버튼 미노출/차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-010 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 자동 완료 정책과 수동 완료 정책이 정의대로 동작 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-011 | P0 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 객실 청소 필요 전환과 현재 공실 가용 상태 분리 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-012 | P1 | dashboard/operations/settlement-status.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | Complete/Reopen/Details 등이 카드 폭을 넘지 않음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SETTLE-STATUS-013 | P1 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 페소/달러/원화가 등록 통화대로 모두 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTLE-STATUS-014 | P1 | dashboard/operations/settlement-status.html | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 운영 인쇄와 고객 영수증이 구분되어 열림 | 실제 프린터 출력 결과는 장치 연결이 필요함 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| SETTLE-STATUS-015 | P1 | dashboard/operations/settlement-status.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 버튼과 카드 클릭이 충돌하지 않고 상세 진입 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SETTLE-STATUS-016 | P1 | dashboard/operations/settlement-status.html | Case ID 전용 Playwright 시나리오 실행: Settlement floor and group counts match rendered actionable cards | 층별 객실 수와 단체 섹션이 정확 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"cards":17,"sections":[{"label":"객실 정산 16건","cards":16},{"label":"단체 정산 1건","cards":1}],"chipCounts":[]} |
| SETTLE-STATUS-017 | P1 | dashboard/operations/settlement-status.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 객실/고객/단체/정산번호 검색과 상태 필터 교집합 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SETTLE-STATUS-018 | P1 | dashboard/operations/settlement-status.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 목록에는 미완료 전환 버튼이 없고 상세에서만 제공 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.17 정산 목록

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| FOLIO-001 | P0 | dashboard/operations/folio.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 객실, 고객, 단체, 기간, 청구, 수납, 잔액 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| FOLIO-002 | P0 | dashboard/operations/folio.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 페소/달러/원화 입력 및 정산 반영 금액 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| FOLIO-003 | P0 | dashboard/operations/folio.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 잔액/처리 이력/예약 상세 동기화 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| FOLIO-004 | P0 | dashboard/operations/folio.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 잔액, 상태, 감사 로그 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| FOLIO-005 | P0 | dashboard/operations/folio.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 완료 기록 1건, 상태/버튼/청소 연계 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| FOLIO-006 | P0 | dashboard/operations/folio.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 권한 확인, 상태 저장, 감사 로그 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| FOLIO-007 | P0 | dashboard/operations/folio.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 객실, POS, 골프, 렌터카, 음식점, 기타 합계 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| FOLIO-008 | P0 | dashboard/operations/folio.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 관련 지출이 정책에 따라 마이너스 항목으로 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| FOLIO-009 | P1 | dashboard/operations/folio.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 날짜, 처리자, 결제수단, 통화, 금액, 메모 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| FOLIO-010 | P1 | dashboard/operations/folio.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 목록과 KPI/합계 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| FOLIO-011 | P1 | dashboard/operations/folio.html | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 데이터와 통화, 인쇄 레이아웃 정확 | 실제 프린터 출력 결과는 장치 연결이 필요함 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| FOLIO-012 | P1 | dashboard/operations/folio.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 카드/행 넘침 없이 명확한 라벨 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| FOLIO-013 | P1 | dashboard/operations/folio.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 메뉴 이동/새로고침 후 상태 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| FOLIO-014 | P1 | dashboard/operations/folio.html | Case ID 전용 Playwright 시나리오 실행: Group Folio exposes room, ancillary, discount, and billing terms | 객실/부가서비스/단체 할인/결제 조건 반영 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"evidence":{"groupVisible":true,"room":true,"ancillary":true,"discount":true,"billingTerms":true},"row":" 정산 상세 총 청구액 ₱3,300 수납액 ₱1,200 예치금 ₱1,000 미수금 ₱1,100 환불금 ₱0 정산 기본 정보 정산 번호 FOL-DEMO-TODAY-GRP-ALL-SVC 체크아웃일 2026-07-10 정산 대상 Samsung Tech Conference 2026 객실/단체 단체 포함 항목 객실 · 통합 POS · 골프장 · 렌터카 상태 미수금 존재 업체 Samsung Electronics 정산 방식 단체 일괄 후불 정산 단체 할인 15% 청구 조건 단체 일괄 후불 정산 원천 Folio FOL-DEMO-TODAY-GRP-ALL-SVC 청구 항목 요약 객실 ₱1,360 통합 POS ₱620 골프장 ₱900 렌터카 ₱420 처리 이력 2026. 07. 10. 10:20 정산 수납 계좌이체 / Nguyen Kim 메모법인 계좌이체 일부 수납 ₱1,200.00 2026. 07. 09. 16:30 예치금 수납 기타 / Sarah Connor 메모단체 예약 예치금 수납 ₱1,000.00 닫기 고객용 명세서 수납 등록 정산 완료"} |
| FOLIO-015 | P1 | dashboard/operations/folio.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 청구 합계와 수납+잔액 불일치 시 경고 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.18 비품 구매

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| EXP-001 | P0 | dashboard/operations/expense-purchases.html | 신규 등록이 목록이 아닌 팝업으로 열리는지 확인 | 목록은 넓게 유지되고 등록은 팝업에서 수행 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| EXP-002 | P0 | dashboard/operations/expense-purchases.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 로그인 본인이 기본이고 등록된 근무 중 직원만 선택 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| EXP-003 | P0 | dashboard/operations/expense-purchases.html | PHP 호텔에서 PHP/USD/KRW만 선택되고 VND가 제외되는지 확인 | 호텔 기본 PHP, 추가 USD/KRW; VND 호텔일 때만 VND 표시 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| EXP-004 | P0 | dashboard/operations/expense-purchases.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 목록/KPI/시재/일일 마감 출금에 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| EXP-005 | P0 | dashboard/operations/expense-purchases.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 현금 시재에는 영향 없고 지출 합계에는 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| EXP-006 | P0 | dashboard/operations/expense-purchases.html | 기존 값을 편집 팝업에 로드하고 수정 저장 후 목록 갱신 확인 | 모든 기존 값이 팝업에 로드되고 저장 후 갱신 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| EXP-007 | P0 | dashboard/operations/expense-purchases.html | 삭제 확인 후 목록에서 제거되는지 확인 | 확인 후 목록/KPI/시재/마감에서 제거 또는 취소 이력 처리 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| EXP-008 | P0 | dashboard/operations/expense-purchases.html | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 날짜 선택 가능, 음수/0/문자 금액 차단 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| EXP-009 | P1 | dashboard/operations/expense-purchases.html | 직접 기간 시작일/종료일 입력값 유지 확인 | KPI와 목록이 동시에 같은 범위로 갱신 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| EXP-010 | P1 | dashboard/operations/expense-purchases.html | 통화별 금액을 별도 KPI 행으로 표시하는지 확인 | 통화별 금액을 합산하지 않고 구분 표시 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| EXP-011 | P1 | dashboard/operations/expense-purchases.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 항목/구매처/구매자/메모 검색 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| EXP-012 | P1 | dashboard/operations/expense-purchases.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 현재 언어로 즉시 표시, 혼용 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| EXP-013 | P1 | dashboard/operations/expense-purchases.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 팝업 스크롤과 날짜 picker, 액션 정상 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| EXP-014 | P1 | dashboard/operations/expense-purchases.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 등록/수정/삭제 주체와 금액 변경 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 7.19 일일 마감 및 마감 로그

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| AUDIT-001 | P0 | night-audit | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 통화별 전일 잔액과 원천 마감 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUDIT-002 | P0 | night-audit | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 통화별 숫자 검증 및 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUDIT-003 | P0 | night-audit | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 정산/예치금 내역과 합계 일치, 내부 스크롤 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| AUDIT-004 | P0 | night-audit | 마감 fixture의 다중 통화 출금 내역과 상세 렌더링 확인 | 비품 구매 현금 지출 포함, 시간순 세로 목록 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| AUDIT-005 | P0 | night-audit | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 버튼 클릭 시 통화별 입출금 상세 팝업 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| AUDIT-006 | P0 | night-audit | Case ID 전용 Playwright 시나리오 실행: Night audit shows expected, actual, and variance by currency | 차액이 통화별 정확히 계산 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"expected":{"PHP":100,"USD":20,"KRW":3000},"actual":{"PHP":90,"USD":25,"KRW":3000},"difference":{"PHP":-10,"USD":5,"KRW":0}} |
| AUDIT-007 | P0 | night-audit | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 미체크인/미정산/점검 등 정책에 따른 경고/차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUDIT-008 | P0 | night-audit | 정상 마감 상태/담당자/시간/통화 잔액 저장 상태 확인 | 마감 상태/담당자/시간/통화 잔액 저장 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| AUDIT-009 | P0 | night-audit | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 같은 영업일 중복 처리 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| AUDIT-010 | P1 | night-audit | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 화면 합계와 파일/인쇄 합계 일치 | 실제 프린터 출력 결과는 장치 연결이 필요함 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| AUDIT-011 | P1 | night-audit | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 호텔 기본 통화와 지원 통화만 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| AUDIT-012 | P1 | night-audit | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 모바일 포함 하단 잘림 없이 확인 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CLOSE-001 | P0 | closing-log | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 영업일, 담당자, 상태, 통화별 잔액 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CLOSE-002 | P0 | closing-log | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 선택 행의 시재/수납/출금/차액 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CLOSE-003 | P1 | closing-log | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 목록/건수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CLOSE-004 | P1 | closing-log | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 목록 최대 2줄, 전체 내용은 상세에서 확인 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CLOSE-005 | P1 | closing-log | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 현재 필터와 합계 기준 출력 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CLOSE-006 | P1 | closing-log | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 날짜/상태/메모 UI가 영어, 사용자 메모는 원문 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.20 매출 분석

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| REPORT-001 | P0 | reports | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | KPI/표/차트가 같은 데이터 범위 사용 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| REPORT-002 | P0 | reports | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 원천 정산과 합계 일치, 지출은 마이너스 반영 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| REPORT-003 | P1 | reports | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 0과 빈 상태가 구분되고 차트 오류 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| REPORT-004 | P1 | reports | Case ID 전용 Playwright 시나리오 실행: Revenue report does not add mixed currencies without conversion | 통화 혼합 합산 금지 또는 기준환율 명시 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"currency":"PHP","kpis":["₱324,350","₱246,600","₱77,750","+187.2%"]} |
| REPORT-005 | P1 | reports | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 현재 필터/통화/기간 기준 파일 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| REPORT-006 | P1 | reports | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 핵심 값이 잘리지 않고 상세 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| REPORT-007 | P1 | folio-chart | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | reports와 동일 원천/합계 사용 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| REPORT-008 | P1 | folio-chart | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 선택 언어와 메뉴명 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.21 투숙객 CRM

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| CRM-GUEST-001 | P0 | dashboard/crm/guests.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 정확한 고객만 표시되고 건수와 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-GUEST-002 | P0 | dashboard/crm/guests.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 조건의 교집합이 표시되고 초기화 정상 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-GUEST-003 | P0 | dashboard/crm/guests.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 기본정보, 누적 투숙, 금액, 노쇼/취소, 상세 이력 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-GUEST-004 | P0 | dashboard/crm/guests.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 필수값과 전화/이메일 형식 검증 후 중복 없이 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-GUEST-005 | P0 | dashboard/crm/guests.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 변경값이 예약 검색/상세/CRM에 동기화 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-GUEST-006 | P0 | dashboard/crm/guests.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 물리 삭제 차단 또는 비활성화 정책 안내 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-GUEST-007 | P0 | dashboard/crm/guests.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 사유 필수, 예약 시 경고, 감사 로그 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-GUEST-008 | P0 | dashboard/crm/guests.html | Case ID 전용 Playwright 시나리오 실행: Guest tier change persists and synchronizes on re-entry | 카드/예약/멤버십 화면에 동일 반영 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"id":"G-1001","expected":"standard","memory":"standard","reloaded":"standard"} |
| CRM-GUEST-009 | P0 | dashboard/crm/guests.html | Case ID 전용 Playwright 시나리오 실행: Privacy detail view creates actor/time/target/field audit evidence | 열람자/일시/대상/항목이 감사 로그에 기록 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: [{"id":"AUD-1784434314860-oj8ql0","action":"guest.detail.view","createdAt":"2026-07-10T13:11:54+09:00","actor":{"id":"s1","name":"Nguyen Kim","role":"sys_admin","roleLabel":"관리자"},"page":"/dashboard/crm/guests.html","details":{"screen":"guest-crm","guestId":"G-1001","guestName":"Tran Linh","fields":["phone","email","specialNotes","stayHistory"]}}] |
| CRM-GUEST-010 | P1 | dashboard/crm/guests.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 전체 건수, 기간, 금액 합계가 원천 예약과 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-GUEST-011 | P1 | dashboard/crm/guests.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 전화/이메일/여권 중복 경고와 병합 또는 취소 선택 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-GUEST-012 | P1 | dashboard/crm/guests.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 현재 필터와 열 순서, 개인정보 마스킹 정책 준수 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-GUEST-013 | P1 | dashboard/crm/guests.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | UI만 번역하고 고객명/메모/식별자는 원문 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-GUEST-014 | P1 | dashboard/crm/guests.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 지표와 폼, 이력이 겹치거나 잘리지 않음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-GUEST-015 | P1 | dashboard/crm/guests.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 빈 상태와 로드 실패를 구분해 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.22 우수 고객 멤버십

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| CRM-MEM-001 | P0 | membership | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 등급별 숙박/금액/횟수/기간 기준 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-MEM-002 | P0 | membership | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 중복·역전 구간 차단 후 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-MEM-003 | P0 | membership | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 다음 산정부터 적용되고 기존 이력은 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-MEM-004 | P0 | membership | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 사용 중인 등급이면 삭제 차단 또는 대체 등급 요구 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-MEM-005 | P0 | membership | Case ID 전용 Playwright 시나리오 실행: Automatic tier calculation uses the configured source thresholds | 예약/정산 원천과 계산 결과 일치 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"gold":{"stays":5,"spend":2000},"platinum":{"stays":10,"spend":5000},"diamond":{"stays":20,"spend":10000},"guestCount":53,"below":"standard","equal":"gold","above":"gold"} |
| CRM-MEM-006 | P0 | membership | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 권한 확인, 사유 필수, 감사 로그 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-MEM-007 | P1 | membership | Case ID 전용 Playwright 시나리오 실행: Tier boundaries classify below, equal, and above values consistently | 기준값 직전/동일/초과 결과 정확 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"stays":5,"spend":2000,"below":false,"equal":true,"above":true} |
| CRM-MEM-008 | P1 | membership | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 완료 투숙만 산정하고 취소·노쇼 제외 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-MEM-009 | P1 | membership | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 라벨 혼용과 카드 넘침 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-MEM-010 | P1 | membership | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 기존 등급을 훼손하지 않고 재시도 안내 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-TIER-001 | P0 | tier-history | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 해당 월 변경 데이터와 KPI가 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-TIER-002 | P0 | tier-history | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 표/KPI/페이지 수가 선택 월과 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-TIER-003 | P0 | tier-history | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 유형별 결과와 건수 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-TIER-004 | P0 | tier-history | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 고객별 등급 변경 이력 전체 확인 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-TIER-005 | P1 | tier-history | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 이전/변경 등급, 방식, 사유, 처리자 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-TIER-006 | P1 | tier-history | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 선택 월·필터와 파일 내용 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-TIER-007 | P1 | tier-history | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 월 선택은 유지되고 명확한 빈 상태 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-TIER-008 | P1 | tier-history | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 선택 언어와 기본 월 정책 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| CRM-TIER-009 | P1 | tier-history | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 한글 월/일 표기 없이 로케일에 맞게 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| CRM-TIER-010 | P1 | tier-history | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 핵심 열 우선 표시, 상세로 전체 내용 확인 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.23 호텔 및 일반 설정

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| SETTING-001 | P0 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 호텔명/주소/연락처/시간대 저장 후 전체 헤더 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-002 | P0 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 허용 통화 세트와 금액 표기 정책 갱신 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-003 | P0 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 신규 예약 기본값에 반영, 기존 예약 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-004 | P0 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 전체 화면 표시 형식 일관 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-005 | P0 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 미리보기/인쇄/헤더에 정확히 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-006 | P1 | settings | Case ID 전용 Playwright 시나리오 실행: Invalid image type and oversized logo are rejected | 형식·용량 검증과 오류 안내 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"invalidType":false,"oversized":false,"validPng":true,"accept":"image/png,image/jpeg,image/webp","hasDelete":true} |
| SETTING-007 | P1 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 변경사항 이탈 경고 또는 정책대로 폐기 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-008 | P1 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장값 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-009 | P1 | settings | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 직접 URL 포함 차단 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SETTING-010 | P1 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 입력 데이터는 유지하고 설명/버튼만 번역 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-011 | P1 | settings | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 필드와 저장 버튼 접근 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SETTING-012 | P1 | settings | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 낙관적 성공 표시 없이 원래 값 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| BILLSET-001 | P0 | billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 현금/카드/계좌 등 활성 상태 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| BILLSET-002 | P0 | billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 정산 입력 선택지에 즉시 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| BILLSET-003 | P0 | billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 참조 데이터 보존을 위해 차단/비활성 처리 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| BILLSET-004 | P0 | billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장값에 따라 입력/표시/정산 계산 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| BILLSET-005 | P1 | billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 검증 후 저장 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| BILLSET-006 | P1 | billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 결제 팝업 표시 순서 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| BILLSET-007 | P1 | billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 버튼 미노출과 API 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| BILLSET-008 | P1 | billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 라벨 혼용, 넘침, 터치 오류 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.24 직원 목록 및 계정

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| STAFF-001 | P0 | dashboard/settings/staff.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 조건과 건수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| STAFF-002 | P0 | dashboard/settings/staff.html | 직원 편집 버튼 단일 클릭으로 정확한 팝업이 한 번 열리는지 확인 | 단일 클릭으로 정확한 직원 편집 팝업 열림 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| STAFF-003 | P0 | dashboard/settings/staff.html | 편집 버튼 hover 전후 위치/색상 안정성 확인 | 색상이 안정적으로 유지되고 깜박임/이동 없음 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log |
| STAFF-004 | P0 | dashboard/settings/staff.html | 신규 직원과 편집 팝업의 필드 구조를 비교 | 편집과 동일한 2열 폼 구조, 과도한 세로 스크롤 없음 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| STAFF-005 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 이름/사번/이메일/전화/주소/입사일/역할/상태 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-006 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 중복 안내 후 저장 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-007 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장 차단, 일치 시 로그인 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-008 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 전화/주소/입사일/퇴사일/이메일 변경 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-009 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 메뉴·기능 권한이 재로그인 후 정확히 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-010 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 해당 계정 로그인 차단, 기존 세션 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-011 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 권한과 비밀번호가 유효하면 로그인 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-012 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 슈퍼관리자 제외 사용자가 이메일/비밀번호 등 허용 항목 변경 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-013 | P0 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 본인/최종 관리자/이력 보유 계정 정책에 따라 차단 또는 비활성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-014 | P1 | dashboard/settings/staff.html | Case ID 전용 Playwright 시나리오 실행: Termination date before hire date is rejected | 입사일 이전 퇴사일 차단, 퇴직 상태와 정책 일치 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"before":6,"after":6} |
| STAFF-015 | P1 | dashboard/settings/staff.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 팝업 유지, 입력값 보존, 중복 제출 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| STAFF-016 | P1 | dashboard/settings/staff.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 전체 폼과 상태명 번역, 날짜 picker/버튼 정상 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.25 역할 및 기능 권한

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ROLE-001 | P0 | dashboard/settings/roles.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 역할별 메뉴·기능 권한 현재값 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ROLE-002 | P0 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 이름 중복 검증 후 기본 권한으로 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-003 | P0 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 사이드바와 직접 URL 접근이 동시에 제어 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-004 | P0 | dashboard/settings/roles.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 상위 그룹은 표시되며 허용 화면만 접근 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ROLE-005 | P0 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 허용자만 상세 버튼과 API 사용 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-006 | P0 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 허용자만 상세 버튼과 API 사용 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-007 | P0 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 미허용 사용자는 계정·권한 수정 불가 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-008 | P0 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 권한 캐시가 갱신되고 이전 권한이 남지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-009 | P0 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 관리자 잠금 방지 정책 또는 명확한 경고 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-010 | P0 | dashboard/settings/roles.html | Case ID 전용 Playwright 시나리오 실행: Final administrator role cannot be removed | 시스템 관리자 부재 상태 차단 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"systemRoleVisible":true,"protected":true,"protectionGuidance":true} |
| ROLE-011 | P1 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 의도한 범위만 변경, 저장 전 상태 확인 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-012 | P1 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 체크 상태 롤백 또는 미저장 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-013 | P1 | dashboard/settings/roles.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 사용 중 역할 삭제 차단/대체 역할 요구 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ROLE-014 | P1 | dashboard/settings/roles.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 권한명이 모두 번역되고 긴 항목도 겹치지 않음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.26 운영 감사 로그

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| LOG-001 | P0 | dashboard/settings/audit-logs.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 화면명·동작·대상·변경 전후·처리자 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| LOG-002 | P0 | dashboard/settings/audit-logs.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | Folio/객실/금액/상태 변경이 1건 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| LOG-003 | P0 | dashboard/settings/audit-logs.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 주문/객실/서비스/금액/상태 변경이 1건 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| LOG-004 | P0 | dashboard/settings/audit-logs.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 개인정보 열람 및 민감 변경 이력 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| LOG-005 | P0 | dashboard/settings/audit-logs.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 계정과 권한 변경 주체·전후값 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| LOG-006 | P0 | dashboard/settings/audit-logs.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | URL 경로가 아닌 현재 언어 메뉴명으로 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| LOG-007 | P0 | dashboard/settings/audit-logs.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장된 로그가 시간 역순으로 즉시 조회 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| LOG-008 | P0 | dashboard/settings/audit-logs.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 동일 요청에 중복 로그가 생성되지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| LOG-009 | P1 | dashboard/settings/audit-logs.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 표와 총건수/페이지 수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| LOG-010 | P1 | dashboard/settings/audit-logs.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 떨림·반복 개폐 없이 선택 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| LOG-011 | P1 | dashboard/settings/audit-logs.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 시스템 화면명/동작은 번역, 사용자 입력은 원문 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| LOG-012 | P1 | dashboard/settings/audit-logs.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 현재 필터와 감사 필수 열 포함, 민감값 마스킹 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 7.27 공지사항 및 고객지원

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| NOTICE-001 | P0 | notices | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 제목, 기간, 상태, 대상, 내용 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| NOTICE-002 | P0 | notices | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 필수값/기간 검증 후 대상 사용자에게 노출 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| NOTICE-003 | P0 | notices | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 목록/대시보드 알림에 즉시 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| NOTICE-004 | P0 | notices | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 확인 후 비노출, 감사 이력 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| NOTICE-005 | P1 | notices | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 시작 전 비노출, 기간 중 노출, 만료 후 종료 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| NOTICE-006 | P1 | notices | Case ID 전용 Playwright 시나리오 실행: Notice attachment/link has safe handling and failure guidance | 안전하게 열리고 실패 시 안내 | 기대 결과와 일치 | **PASS** | 19-hotel-direct-full.json: {"unsafeBlocked":true,"guidance":"첨부 또는 링크를 열지 못했습니다. 주소를 확인한 뒤 다시 시도해 주세요.","safeLink":true,"href":"support.html"} |
| NOTICE-007 | P1 | notices | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 지정 언어 콘텐츠 또는 fallback 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| NOTICE-008 | P1 | notices | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 목록/상세/편집 액션 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SUPPORT-001 | P0 | support | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태, 우선순위, 요청자, 내용, 답변 이력 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SUPPORT-002 | P0 | support | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 분류/제목/내용/첨부 검증 후 접수번호 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SUPPORT-003 | P0 | support | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상태와 알림이 갱신되고 이력 보존 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SUPPORT-004 | P0 | support | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 허용 전이만 가능하고 담당자/시간 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SUPPORT-005 | P1 | support | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 결과와 건수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SUPPORT-006 | P1 | support | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 권한 확인, 원본명/형식 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SUPPORT-007 | P1 | support | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 입력 보존, 중복 문의/답변 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SUPPORT-008 | P1 | support | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 정확한 문의 상세로 연결 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| SUPPORT-009 | P1 | support | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | UI 라벨 번역, 사용자 문의 원문 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| SUPPORT-010 | P1 | support | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 입력/첨부/답변/상태 변경 정상 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 8.1 로그인 및 공통 셸

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ADM-AUTH-001 | P0 | admin/login.html | Case ID 전용 Playwright 시나리오 실행: Valid admin login creates an expiring session | Admin 대시보드 진입, 세션 생성 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"loggedIn":"true","session":{"id":"ADM-001","name":"Super Admin","email":"superadmin@platform.example","role":"Platform Owner","expiresAt":1784464001140}} |
| ADM-AUTH-002 | P0 | admin/login.html | Case ID 전용 Playwright 시나리오 실행: Invalid credentials are rejected without a session | 일반화된 오류, 세션 미생성 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"error":true,"session":null,"logs":[{"id":"AUD-1784435203401","actor":"superadmin@platform.example","action":"Failed Login","target":"superadmin@platform.example","details":"invalid credentials","ip":"127.0.0.1","createdAt":"2026-07-19T04:26:43.401Z","risk":"High"}]} |
| ADM-AUTH-003 | P0 | admin/login.html | Case ID 전용 Playwright 시나리오 실행: Inactive admin is blocked and audited | 로그인 차단과 감사 로그 기록 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"error":true,"loggedIn":null,"logs":[{"id":"AUD-1784435205174","actor":"inactive@example.com","action":"Blocked Access","target":"inactive@example.com","details":"status=inactive","ip":"127.0.0.1","createdAt":"2026-07-19T04:26:45.174Z","risk":"High"}]} |
| ADM-AUTH-004 | P0 | admin/login.html | Case ID 전용 Playwright 시나리오 실행: Protected URL redirects and retains return URL | 로그인으로 이동 후 인증 시 원래 경로 복귀 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"url":"http://127.0.0.1:8765/admin/login.html","returnTo":"http://127.0.0.1:8765/admin/system/profile.html?admin-direct=1784435205256"} |
| ADM-AUTH-005 | P0 | admin/login.html | Case ID 전용 Playwright 시나리오 실행: Expired session is removed and redirected | Admin 보호 화면 재접근 차단 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"loggedIn":null,"session":null} |
| ADM-AUTH-006 | P1 | admin/login.html | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 현재 메뉴 강조, 잘못된 PMS 메뉴 없음 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-AUTH-007 | P1 | admin/login.html | 실제 페이지에서 관련 액션 버튼을 클릭하고 소스의 연결 handler를 대조 | 언어 깜박임/혼용 없이 유지 | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | **FAIL** | 02-smoke-interactions.log + admin/login.html |
| ADM-AUTH-008 | P1 | admin/login.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 메뉴, 헤더, 알림, 프로필 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 8.2 플랫폼 대시보드

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ADM-DASH-001 | P0 | admin/admin.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 입점/활성/신청/매출/광고 값이 원천 데이터와 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-DASH-002 | P0 | admin/admin.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 대응 목록과 같은 필터로 이동 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-DASH-003 | P0 | admin/admin.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | KPI와 최근 활동 즉시 갱신 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-DASH-004 | P0 | admin/admin.html | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | Tenant와 Property 연결 상태 정확 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-DASH-005 | P0 | admin/admin.html | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 별도 Partner 유형으로 구분 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-DASH-006 | P1 | admin/admin.html | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 모든 차트/KPI가 같은 기간 사용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-DASH-007 | P1 | admin/admin.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 0/빈 상태 구분, 레이아웃 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-DASH-008 | P1 | admin/admin.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 실패 위젯만 오류 표시하고 나머지 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-DASH-009 | P1 | admin/admin.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 타이틀/축/툴팁/필터 모두 현재 언어 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-DASH-010 | P1 | admin/admin.html | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 카드/차트 겹침과 가로 넘침 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 8.3 호텔사 목록 및 상세

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ADM-TEN-LIST-001 | P0 | tenants/list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 호텔명/코드/상태/요금제/연동/최근접속 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-LIST-002 | P0 | tenants/list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 결과/건수/페이지 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-LIST-003 | P0 | tenants/list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 정확한 호텔 상세로 이동 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-LIST-004 | P0 | tenants/list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 확인·사유 후 상태 저장, 접근 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-LIST-005 | P0 | tenants/list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 연결 데이터가 있으면 차단/비활성 정책 안내 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-LIST-006 | P1 | tenants/list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 정렬 유지, 중복/누락 없음 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-LIST-007 | P1 | tenants/list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 현재 필터 데이터와 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-LIST-008 | P1 | tenants/list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 필터 정책대로 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-LIST-009 | P1 | tenants/list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 명확히 구분 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-LIST-010 | P1 | tenants/list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 데이터 원문 유지, UI 번역 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-LIST-011 | P1 | tenants/list | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 핵심 열과 액션 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-LIST-012 | P1 | tenants/list | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 최종 상태와 감사 로그 1:1 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-DETAIL-001 | P0 | tenants/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 목록에서 선택한 호텔과 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-DETAIL-002 | P0 | tenants/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | PMS 헤더/설정과 연결 데이터 갱신 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-DETAIL-003 | P0 | tenants/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 대상 호텔 계정만 변경, 감사 로그 생성 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-DETAIL-004 | P0 | tenants/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 적용일/과금 정책/기능 권한 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-DETAIL-005 | P0 | tenants/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | PMS 로그인 및 데이터 보존 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-DETAIL-006 | P0 | tenants/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 실제 연결 성공/실패와 마지막 동기화 표시 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-DETAIL-007 | P0 | tenants/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 객실/예약/직원/저장량 원천과 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-DETAIL-008 | P1 | tenants/detail | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 계약기간/요금/미수/결제 이력 일치 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-TEN-DETAIL-009 | P1 | tenants/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 호텔 직원 목록과 동기화 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-DETAIL-010 | P1 | tenants/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | Admin 변경과 호텔 주요 변경 구분 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-DETAIL-011 | P1 | tenants/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 입력 보존, 부분 저장 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-DETAIL-012 | P1 | tenants/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 호텔 ID 혼선 없이 정확한 상세 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-DETAIL-013 | P1 | tenants/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 사용자 입력 원문, 시스템 라벨 번역 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-DETAIL-014 | P1 | tenants/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 탭/액션/폼 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-DETAIL-015 | P1 | tenants/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 민감 탭과 변경 API 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 8.4 호텔사 등록 및 입점 신청

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ADM-TEN-REG-001 | P0 | tenants/register | Case ID 전용 Playwright 시나리오 실행: PMS tenant creates tenant, admin invitation, and audit atomically | Tenant/관리자/기본 설정이 원자적으로 생성 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"tenants":[{"id":"TENANT-PMS1784435208144","code":"PMS1784435208144","hotelName":"QA pms PMS1784435208144","type":"pms","pmsEnabled":true,"country":"Philippines","city":"Manila","timezone":"Asia/Manila (UTC+8)","currency":"PHP","roomCount":25,"email":"pms1784435208144@example.com","plan":"Free","status":"active","contractStart":"2026-07-01","contractEnd":"2027-06-30","createdAt":"2026-07-19T04:26:50.376Z"}],"users":[{"id":"ADM-1784435210376","tenantId":"TENANT-PMS1784435208144","name":"QA pms PMS1784435208144 Admin","email":"pms1784435208144@example.com","role":"Tenant Admin","status":"invited","inviteExpiresAt":"2026-07-22T04:26:50.376Z"}],"logs":[{"id":"AUD-1784435210376","actor":"Super Admin","actorId":"ADM-001","action":"tenant.create","target":"TENANT-PMS1784435208144","details":"QA pms PMS1784435208144 / Free","ip":"127.0.0.1","createdAt":"2026-07-19T04:26:50.376Z","risk":"Low"},{"id":"AUD-1001","actor":"Super Admin","action":"tenant.approve","target":"APP-20260526-002","ip":"10.0.0.12","createdAt":"2026-05-26T15:10:00+09:00"},{"id":"AUD-1002","actor":"Ops Manager","action":"user.password_reset","target":"TENANT-GRAND-SAIGON","ip":"10.0.0.14","createdAt":"2026-05-27T12:00:00+09:00"}],"last":"TENANT-PMS1784435208144"} |
| ADM-TEN-REG-002 | P0 | tenants/register | Case ID 전용 Playwright 시나리오 실행: Non-PMS partner is created without PMS dependency | 파트너 계정/숙소만 생성, PMS Tenant 의존 없음 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"tenants":[{"id":"PARTNER-PTR1784435210632","code":"PTR1784435210632","hotelName":"QA partner PTR1784435210632","type":"partner","pmsEnabled":false,"country":"Philippines","city":"Manila","timezone":"Asia/Manila (UTC+8)","currency":"PHP","roomCount":25,"email":"ptr1784435210632@example.com","plan":"Free","status":"active","contractStart":"2026-07-01","contractEnd":"2027-06-30","createdAt":"2026-07-19T04:26:52.581Z"}],"users":[{"id":"ADM-1784435212581","tenantId":"PARTNER-PTR1784435210632","name":"QA partner PTR1784435210632 Admin","email":"ptr1784435210632@example.com","role":"Tenant Admin","status":"invited","inviteExpiresAt":"2026-07-22T04:26:52.582Z"}],"logs":[{"id":"AUD-1784435212582","actor":"Super Admin","actorId":"ADM-001","action":"partner.create","target":"PARTNER-PTR1784435210632","details":"QA partner PTR1784435210632 / Free","ip":"127.0.0.1","createdAt":"2026-07-19T04:26:52.582Z","risk":"Low"},{"id":"AUD-1001","actor":"Super Admin","action":"tenant.approve","target":"APP-20260526-002","ip":"10.0.0.12","createdAt":"2026-05-26T15:10:00+09:00"},{"id":"AUD-1002","actor":"Ops Manager","action":"user.password_reset","target":"TENANT-GRAND-SAIGON","ip":"10.0.0.14","createdAt":"2026-05-27T12:00:00+09:00"}],"last":"PARTNER-PTR1784435210632"} |
| ADM-TEN-REG-003 | P0 | tenants/register | Case ID 전용 Playwright 시나리오 실행: Duplicate tenant code is blocked without partial records | 저장 차단 및 중복 항목 안내 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"saved":false,"tenants":[{"id":"TENANT-DUP","code":"DUP","hotelName":"Existing"}],"users":[],"validation":"이미 사용 중인 호텔 코드입니다."} |
| ADM-TEN-REG-004 | P0 | tenants/register | Case ID 전용 Playwright 시나리오 실행: Required fields and reversed contract period are rejected | 누락 필드로 이동하고 부분 생성 없음 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"empty":false,"reversed":{"saved":false,"tenants":[],"validation":"계약 종료일은 시작일 이후여야 합니다."}} |
| ADM-TEN-REG-005 | P0 | tenants/register | Case ID 전용 Playwright 시나리오 실행: Country selection initializes currency and timezone | 국가별 기본 통화와 지원 통화 초기화 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"Philippines":{"currency":"PHP","timezone":"Asia/Manila (UTC+8)"},"Vietnam":{"currency":"VND","timezone":"Asia/Ho_Chi_Minh (UTC+7)"},"South Korea":{"currency":"KRW","timezone":"Asia/Seoul (UTC+9)"}} |
| ADM-TEN-REG-006 | P0 | tenants/register | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 생성 후 해당 기능만 접근 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-REG-007 | P0 | tenants/register | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 초대 상태/만료/재발송 정상 | 실제 메일 발송/수신 확인은 메일 서비스 연결이 필요함 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| ADM-TEN-REG-008 | P1 | tenants/register | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 미완성 Tenant가 남지 않음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-REG-009 | P1 | tenants/register | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 중복 생성 없이 재시도 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-REG-010 | P1 | tenants/register | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 폼/검증문구/placeholder 모두 번역 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-REG-011 | P1 | tenants/register | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 단계와 저장 액션 접근 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-REG-012 | P1 | tenants/register | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 새 호텔 데이터와 상태 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-APPLY-001 | P0 | tenants/apply | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 신청사/담당자/호텔/상태/제출일 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-APPLY-002 | P0 | tenants/apply | Admin 입점 신청 승인 후 호텔 목록 생성 확인 | 호텔/파트너 생성, 승인 이력과 알림 발송 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| ADM-TEN-APPLY-003 | P0 | tenants/apply | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 사유 필수, 상태/알림/재신청 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-APPLY-004 | P0 | tenants/apply | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 기존 호텔/신청과 중복 경고 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-TEN-APPLY-005 | P0 | tenants/apply | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 호텔 중복 생성 방지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-APPLY-006 | P1 | tenants/apply | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 건수와 결과 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-APPLY-007 | P1 | tenants/apply | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 권한 확인 후 열기/다운로드 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-APPLY-008 | P1 | tenants/apply | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장 후 목록/상세 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-TEN-APPLY-009 | P1 | tenants/apply | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 시스템 라벨 번역, 신청 입력 원문 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-TEN-APPLY-010 | P1 | tenants/apply | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 승인/반려 확인 절차와 상세 접근 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 8.5 광고 캠페인

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ADM-ADS-LIST-001 | P0 | ads/campaigns | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 광고주/이벤트명/기간/상태/노출/비용 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-LIST-002 | P0 | ads/campaigns | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 결과와 건수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-LIST-003 | P0 | ads/campaigns | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 정확한 캠페인 상세 열림 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-LIST-004 | P0 | ads/campaigns | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 유효한 상태 전이만 허용하고 노출에 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-LIST-005 | P0 | ads/campaigns | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 집행 이력이 있으면 비활성/보관 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-LIST-006 | P1 | ads/campaigns | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 목록 데이터와 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-LIST-007 | P1 | ads/campaigns | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 대체 이미지와 상태 안내 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-LIST-008 | P1 | ads/campaigns | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 이벤트명 원문 유지, 시스템 라벨 번역 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-LIST-009 | P1 | ads/campaigns | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 핵심 정보와 액션 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-LIST-010 | P1 | ads/campaigns | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 명확히 구분 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-NEW-001 | P0 | ads/new | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 실제 Tenant/Partner만 선택 가능 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-NEW-002 | P0 | ads/new | Case ID 전용 Playwright 시나리오 실행: Campaign save persists campaign and audit | 이벤트명/기간/예산/상태 저장 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"id":"ADS-1784435228101","name":"QA Campaign 1784435228039","advertiser":"QA Hotel","type":"golf","placement":"dashboard","startDate":"2026-08-01","endDate":"2026-08-31","budget":1000,"status":"draft","manager":"QA Manager","phone":"+63 900 000 0000","email":"ads@example.com","address":"Manila","hours":"","settlement":"","contentHtml":"<h4>광고 제안</h4><p>프런트 직원이 골프 문의를 받을 때 업체 담당자, 연락처, 이메일, 위치와 대표 상품을 한 화면에서 확인하고 계약 여부를 판단할 수 있게 노출합니다.</p><h4>계약 후 사용 흐름</h4><ol><li>호텔 담당자가 업체 연락처로 조건과 티타임 운영 방식을 확인합니다.</li><li>계약이 확정되면 업체/항목 관리에 골프장 업체와 판매 항목을 등록합니다.</li><li>예약 또는 부가서비스 등록 화면에서 실제 투숙객/단체에 연결해 사용합니다.</li></ol><h4>대표 상품 예시</h4><ul><li>9홀 라운딩 ₱180 / 오전 9홀</li><li>18홀 패키지 ₱520 / 그린피+카트</li></ul><h4>호텔 확인사항</h4><p>조조 라운드 제공 시간, 카트비 포함 여부, 취소 마감 시간, 바우처 출력 필드, 긴급 연락처를 업체와 먼저 확인해야 합니다.</p><figure><figcaption>이미지는 웹에디터 본문 안에 삽입될 수 있습니다.</figcaption></figure>","createdAt":"2026-07-19T04:27:08.101Z","views":0,"leads":0} |
| ADM-ADS-NEW-003 | P0 | ads/new | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 골프/렌터카/음식점/기타에 맞는 이미지와 상세 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-NEW-004 | P0 | ads/new | Case ID 전용 Playwright 시나리오 실행: Campaign invalid period and budget are blocked | 저장 차단과 필드 오류 표시 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"saved":false,"campaigns":[]} |
| ADM-ADS-NEW-005 | P0 | ads/new | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 정책에 따라 경고/차단 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-NEW-006 | P0 | ads/new | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 고객 대시보드 실제 노출과 내용/비율 일치 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-NEW-007 | P0 | ads/new | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 목록/상세/대상 대시보드에 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-NEW-008 | P1 | ads/new | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 게시 전 비노출, 재진입 시 값 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-NEW-009 | P1 | ads/new | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 검증과 미리보기 오류 처리 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-NEW-010 | P1 | ads/new | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 캠페인 중복 생성 없음 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-NEW-011 | P1 | ads/new | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 폼/검증문구 번역, 입력 콘텐츠 원문 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-NEW-012 | P1 | ads/new | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 폼과 이미지 미리보기 정상 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-DETAIL-001 | P0 | ads/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 목록에서 선택한 캠페인과 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-DETAIL-002 | P0 | ads/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 대상 대시보드에 즉시 또는 예약 반영 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-DETAIL-003 | P0 | ads/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 빈 상세 팝업 대신 원인/복구 안내 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-DETAIL-004 | P0 | ads/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 허용 대상에만 노출 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-DETAIL-005 | P0 | ads/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 기간·승인 상태와 일치하는 전이만 허용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-DETAIL-006 | P1 | ads/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 노출/클릭/전환 집계 원천과 일치 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-DETAIL-007 | P1 | ads/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 변경자/시간/전후값 기록 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-DETAIL-008 | P1 | ads/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 캐시 갱신 후 새 이미지 표시 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-DETAIL-009 | P1 | ads/detail | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 기존 게시 콘텐츠 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-DETAIL-010 | P1 | ads/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 다른 광고주 정보 노출 방지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-DETAIL-011 | P1 | ads/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | UI만 번역, 입력 콘텐츠 유지 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-DETAIL-012 | P1 | ads/detail | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 탭/폼/미리보기 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-TGT-001 | P0 | ads/targeting | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 선택 대상 수와 실제 노출 대상 일치 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-TGT-002 | P0 | ads/targeting | Case ID 전용 Playwright 시나리오 실행: Exclude targeting overrides include and inactive hotels | 포함 조건보다 우선 적용 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: [] |
| ADM-ADS-TGT-003 | P0 | ads/targeting | Case ID 전용 Playwright 시나리오 실행: Zero eligible target save is blocked | 경고 후 게시 차단 또는 명시적 확인 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"saved":false,"stored":"[]"} |
| ADM-ADS-TGT-004 | P0 | ads/targeting | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 호텔명/코드/유형 정확 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-TGT-005 | P1 | ads/targeting | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 현재 검색 범위와 전체 범위가 구분 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-TGT-006 | P1 | ads/targeting | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 광고 노출 제외 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-TGT-007 | P1 | ads/targeting | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 이전 타겟 유지 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-TGT-008 | P1 | ads/targeting | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 조건명과 건수 단위 번역 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-TGT-009 | P1 | ads/targeting | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 선택 목록/저장 버튼 접근 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-TGT-010 | P1 | ads/targeting | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 성능 저하와 중복 없이 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-BILL-001 | P0 | ads/billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 캠페인/광고주/기간/금액/상태 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-BILL-002 | P0 | ads/billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 계약/집행량 기준 금액 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-BILL-003 | P0 | ads/billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 잔액과 상태, 이력 정확 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-ADS-BILL-004 | P0 | ads/billing | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 동일 캠페인·기간 중복 차단 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-ADS-BILL-005 | P1 | ads/billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 합계와 목록 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-BILL-006 | P1 | ads/billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 필터/통화/세부 항목 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-BILL-007 | P1 | ads/billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 통화/상태/버튼 번역 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-ADS-BILL-008 | P1 | ads/billing | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 상세/수납 액션 접근 가능 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |

### 8.6 Admin 사용자 및 시스템 설정

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ADM-USER-001 | P0 | system/users | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 결과/건수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-USER-002 | P0 | system/users | Case ID 전용 Playwright 시나리오 실행: Admin create and edit persist after rerender | 이메일/역할/상태 저장 및 로그인 반영 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"id":"ADM-1784435220498","name":"QA Admin Edited","email":"qa-admin@example.com","role":"Operations","status":"active","password":"Password123!"} |
| ADM-USER-003 | P0 | system/users | Case ID 전용 Playwright 시나리오 실행: Inactive and locked status persist for login policy | 로그인 차단과 세션 정책 적용 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"id":"ADM-QA","name":"QA","email":"qa@example.com","password":"Password123!","role":"Operations","status":"locked"} |
| ADM-USER-004 | P0 | system/users | Case ID 전용 Playwright 시나리오 실행: Password reset creates one-hour token and audit entry | 만료 토큰/재사용 차단 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"user":{"id":"ADM-OWNER","name":"Owner","email":"owner@example.com","password":"OwnerPass123!","role":"Platform Owner","status":"active","resetToken":"RST-1784435224208","resetExpiresAt":"2026-07-19T05:27:04.208Z"},"logs":[{"id":"AUD-1784435224208","actor":"Super Admin","actorId":"ADM-001","action":"user.password_reset","target":"ADM-OWNER","details":"owner@example.com","ip":"127.0.0.1","createdAt":"2026-07-19T04:27:04.208Z","risk":"Medium"},{"id":"AUD-1001","actor":"Super Admin","action":"tenant.approve","target":"APP-20260526-002","ip":"10.0.0.12","createdAt":"2026-05-26T15:10:00+09:00"},{"id":"AUD-1002","actor":"Ops Manager","action":"user.password_reset","target":"TENANT-GRAND-SAIGON","ip":"10.0.0.14","createdAt":"2026-05-27T12:00:00+09:00"}]} |
| ADM-USER-005 | P0 | system/users | Case ID 전용 Playwright 시나리오 실행: Last platform owner cannot be deleted or demoted | 삭제/권한 제거 차단 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: [{"id":"ADM-OWNER","name":"Owner","email":"owner@example.com","password":"OwnerPass123!","role":"Platform Owner","status":"active"}] |
| ADM-USER-006 | P1 | system/users | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 감사 이력 보존 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-USER-007 | P1 | system/users | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 혼용/넘침 없이 CRUD 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-USER-008 | P1 | system/users | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 서버 권한 검증으로 차단 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-BILL-001 | P0 | system/billing | 실제 페이지에서 관련 액션 버튼을 클릭하고 소스의 연결 handler를 대조 | 계약/요금제/기간/금액 일치 | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | **FAIL** | 02-smoke-interactions.log + admin/system/billing.html |
| ADM-BILL-002 | P0 | system/billing | 실제 페이지에서 관련 액션 버튼을 클릭하고 소스의 연결 handler를 대조 | 상태 전이와 감사 이력 정확 | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | **FAIL** | 02-smoke-interactions.log + admin/system/billing.html |
| ADM-BILL-003 | P0 | system/billing | 실제 페이지에서 관련 액션 버튼을 클릭하고 소스의 연결 handler를 대조 | 잔액과 상태 정확 | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | **FAIL** | 02-smoke-interactions.log + admin/system/billing.html |
| ADM-BILL-004 | P0 | system/billing | 실제 페이지에서 관련 액션 버튼을 클릭하고 소스의 연결 handler를 대조 | 기준일에 맞게 경고/상태 적용 | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | **FAIL** | 02-smoke-interactions.log + admin/system/billing.html |
| ADM-BILL-005 | P1 | system/billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 목록/KPI/합계 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-BILL-006 | P1 | system/billing | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 통화별 구분 또는 환율 기준 명시 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-BILL-007 | P1 | system/billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 화면과 항목/합계 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-BILL-008 | P1 | system/billing | 실제 페이지에서 관련 액션 버튼을 클릭하고 소스의 연결 handler를 대조 | 중복 청구/수납 없음 | 업무 저장/상태 전이 대신 안내 alert만 실행되는 placeholder 구현 | **FAIL** | 02-smoke-interactions.log + admin/system/billing.html |
| ADM-BILL-009 | P1 | system/billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 상태/통화/날짜 번역 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-BILL-010 | P1 | system/billing | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 핵심 합계와 상세 액션 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-INT-001 | P0 | system/integrations | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 호텔/서비스/최근 동기화/오류 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-INT-002 | P0 | system/integrations | Case ID 전용 Playwright 시나리오 실행: Integration key is masked and can be revoked | 비밀값 재노출 금지, 기존 키 정책 적용 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"id":"INT-1784435233894","name":"QA API","type":"payment","endpoint":"https://api.example.com","secretMasked":"Revoked","active":false,"status":"error","lastSync":"-","latencyMs":0,"error":"키 폐기됨"} |
| ADM-INT-003 | P0 | system/integrations | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 실제 성공/실패와 응답시간 표시 | 실제 외부 서비스 연결 성공/실패 검증은 연동 endpoint가 필요함 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| ADM-INT-004 | P0 | system/integrations | Case ID 전용 Playwright 시나리오 실행: Integration test and retry persist status without duplicate records | 중복 데이터 없이 재처리 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"test":true,"retry":true,"rows":[{"id":"INT-QA","name":"QA","type":"channel","endpoint":"https://api.example.com","secretMasked":"qa••••1234","active":true,"status":"connected","error":"","latencyMs":137,"lastSync":"2026-07-19T04:27:14.797Z"}],"logs":[{"id":"AUD-1784435234797","actor":"Super Admin","actorId":"ADM-001","action":"integration.sync_retry","target":"INT-QA","details":"QA / connected","ip":"127.0.0.1","createdAt":"2026-07-19T04:27:14.797Z","risk":"Medium"},{"id":"AUD-1784435234797","actor":"Super Admin","actorId":"ADM-001","action":"integration.connection_test","target":"INT-QA","details":"QA / connected","ip":"127.0.0.1","createdAt":"2026-07-19T04:27:14.797Z","risk":"Medium"},{"id":"AUD-1001","actor":"Super Admin","action":"tenant.approve","target":"APP-20260526-002","ip":"10.0.0.12","createdAt":"2026-05-26T15:10:00+09:00"},{"id":"AUD-1002","actor":"Ops Manager","action":"user.password_reset","target":"TENANT-GRAND-SAIGON","ip":"10.0.0.14","createdAt":"2026-05-27T12:00:00+09:00"}]} |
| ADM-INT-005 | P0 | system/integrations | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 순서/멱등성/최대 재시도 정책 적용 | 실제 webhook 재시도는 외부 endpoint가 필요함 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |
| ADM-INT-006 | P1 | system/integrations | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 대상/상태/기간과 건수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-INT-007 | P1 | system/integrations | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 화면/다운로드/감사로그에서 마스킹 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-INT-008 | P1 | system/integrations | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 관련 대시보드에 경고 전파 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-INT-009 | P1 | system/integrations | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 상태/오류 설명 번역 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-INT-010 | P1 | system/integrations | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 상태와 재시도 액션 접근 가능 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 8.7 Admin 헬프데스크, 공지, 감사, 프로필

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| ADM-HELP-001 | P0 | system/helpdesk | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 호텔/요청자/상태/우선순위/이력 정확 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-HELP-002 | P0 | system/helpdesk | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 호텔 지원 화면과 알림 동기화 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-HELP-003 | P0 | system/helpdesk | Case ID 전용 Playwright 시나리오 실행: Helpdesk allowed status transition, assignee, and reply persist | 허용 전이와 SLA 시간 정확 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"ticket":{"id":"TCK-QA","subject":"QA ticket","hotelName":"QA Hotel","requester":"Guest","status":"in_progress","priority":"High","slaDue":"2026-07-20","assignee":"Ops Manager","messages":[{"id":"MSG-1784435235754","author":"Super Admin","role":"admin","text":"We are checking.","createdAt":"2026-07-19T04:27:15.754Z"}],"updatedAt":"2026-07-19T04:27:15.754Z"},"logs":[{"id":"AUD-1784435235754","actor":"Super Admin","actorId":"ADM-001","action":"helpdesk.update","target":"TCK-QA","details":"open->in_progress / Ops Manager / reply=true","ip":"127.0.0.1","createdAt":"2026-07-19T04:27:15.754Z","risk":"Low"},{"id":"AUD-1001","actor":"Super Admin","action":"tenant.approve","target":"APP-20260526-002","ip":"10.0.0.12","createdAt":"2026-05-26T15:10:00+09:00"},{"id":"AUD-1002","actor":"Ops Manager","action":"user.password_reset","target":"TENANT-GRAND-SAIGON","ip":"10.0.0.14","createdAt":"2026-05-27T12:00:00+09:00"}]} |
| ADM-HELP-004 | P1 | system/helpdesk | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 건수와 결과 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-HELP-005 | P1 | system/helpdesk | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 허용 사용자만 접근 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-HELP-006 | P1 | system/helpdesk | Case ID 전용 Playwright 시나리오 실행: Helpdesk ticket detail is usable on mobile and EN | 시스템 UI 번역, 사용자 문의 원문 유지 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"open":true,"text":"SUPER ADMIN\nPlatform Management\nMAIN\nPlatform Status\nTENANT HOTEL MANAGEMENT\nHotel List\nDirect Admin Registration\nAD NETWORK\nCampaigns\nNew Campaign\nAd Billing\nSYSTEM MANAGEMENT\nAdmin Accounts\nSubscription & Billing\nIntegrations\nCustomer Support\nNotice Management\nAudit Logs\nSA\nSuper Admin\nPlatform Operator\nHelpdesk Tickets\n한국어\nEnglish\nSearch\nAll Statuses\nOpen\nIn Progress\nResolved\nClosed\nTicket List\n1 tickets\nOriginal user text\nOpen\nTCK-M · QA Hotel\nGuest · High\nOriginal user text\nTCK-M · QA Hotel · Guest\nStatus\nOpen\nIn Progress\nResolved\nClosed\nAssignee\nUnassigned\nOps Manager\nSuper Admin\nSLA: 2026-07-20 · Priority: High\nConversation\nNo messages.\nReply\nSave & Reply","overflow":false} |
| ADM-NOTICE-001 | P0 | system/notices | Case ID 전용 Playwright 시나리오 실행: Notice CRUD persists audience, period, and content | 대상/기간/상태/콘텐츠 정확 | 기대 결과와 일치 | **PASS** | 20-admin-direct.json: {"created":"NTC-1784435232931","edited":"QA Notice Edited","remaining":1} |
| ADM-NOTICE-002 | P0 | system/notices | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 지정 호텔에만 노출 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-NOTICE-003 | P0 | system/notices | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 기간에 맞게 노출 전환 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-NOTICE-004 | P1 | system/notices | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 지정 언어/fallback 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-NOTICE-005 | P1 | system/notices | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | CRUD와 미리보기 정상 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-LOG-001 | P0 | system/audit-logs | 액션 버튼 클릭 후 저장 handler와 저장소/API 호출을 추적 | 변경자/대상/전후값/시간 기록 | 기대하는 상태 변경을 저장할 persistence handler를 페이지에서 찾지 못함 | **FAIL** | 02-smoke-interactions.log + 14-storage-writes.log + admin/system/audit-logs.html |
| ADM-LOG-002 | P0 | system/audit-logs | 액션 버튼 클릭 후 저장 handler와 저장소/API 호출을 추적 | 민감 동작 유형으로 조회 가능 | 기대하는 상태 변경을 저장할 persistence handler를 페이지에서 찾지 못함 | **FAIL** | 02-smoke-interactions.log + 14-storage-writes.log + admin/system/audit-logs.html |
| ADM-LOG-003 | P1 | system/audit-logs | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 결과/총건수 일치 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-LOG-004 | P1 | system/audit-logs | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 필터 기준과 민감값 마스킹 준수 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-LOG-005 | P1 | system/audit-logs | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | UI 번역과 필터 안정성 확보 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| ADM-PROFILE-001 | P0 | system/profile | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 이름/이메일 등 허용 항목 저장 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-PROFILE-002 | P0 | system/profile | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 현재 비밀번호/확인 검증, 기존 세션 정책 적용 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-PROFILE-003 | P0 | system/profile | 관련 페이지에서 액션 버튼을 클릭하고 KO/EN 입력값 변경, handler 실행, 저장소 쓰기 오류 여부를 검사 | 저장 차단 | 기대 결과와 일치 | **PASS** | 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log, 14-storage-writes.log |
| ADM-PROFILE-004 | P1 | system/profile | 대상 페이지를 로드하고 관련 제어를 탐색해 계획서 기대 결과를 시도 | 재로그인 후 유지 | 기대 결과 전체를 증명하는 전용 assertion 또는 구현 신호가 없음 | **FAIL** | 01-smoke-all-pages.log, 02-smoke-interactions.log |
| ADM-PROFILE-005 | P1 | system/profile | 대상 페이지를 실제 로드하고 조회/필터/탭/팝업/입력 제어를 실행해 오류와 잘못된 이동을 검사 | 폼/검증문구/버튼 정상 | 기대 결과와 일치 | **PASS** | 01-smoke-all-pages.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |

### 9. 교차 모듈 통합 프로세스 테스트

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| E2E-001 | P0 | - | 개인 예약 생성, 타임라인, 체크인까지 실제 저장 흐름 실행 | 객실 카드 선택 → 신규 개인 예약 → 투숙객 등록 → 저장 → 체크인 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| E2E-002 | P0 | - | 청소 미완료 객실 예약 시 경고 취소 후 미저장 확인 | 객실 카드 선택 → 신규 예약 저장 시도 | 기대 결과와 일치 | **PASS** | 11-critical-ui.log |
| E2E-003 | P0 | - | 점검 객실 차단과 정상 객실 허용을 함께 검증 | 신규 예약/체크인 시도 | 기대 결과와 일치 | **PASS** | 10-reservation-regression.log |
| E2E-004 | P0 | - | 경과 미도착 날짜 로직 회귀 검증 | 예약 상세 → 체크인 | 기대 결과와 일치 | **PASS** | 10-reservation-regression.log |
| E2E-005 | P0 | - | 오늘 예약 체크인과 투숙 중 전환 실행 | 고객 확인 → 체크인 → 객실 카드 확인 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| E2E-006 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 부가서비스 다건 등록 → 완료 → Folio 확인 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-007 | P0 | - | 체크인 후 체크아웃까지 상태 전이 실행 | 수납 → 정산 완료 → 체크아웃 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| E2E-008 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 상세에서 미완료 전환 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-009 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 상세에서 미완료 전환 → 다시 완료 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-010 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 1201 → 다른 청소 완료 공실로 객실 이동 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-011 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 예약 취소/노쇼 처리 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-012 | P0 | - | 단체 객실 배정과 대표 투숙객 등록 후 타임라인 반영 실행 | 행사 생성 → 객실 배정 → 대표/동반 투숙객 → 체크인 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| E2E-013 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 동일 골프 바우처 다건 + 렌터카/음식점 등록 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-014 | P0 | - | 투숙객 없는 단체 객실의 부가서비스 노출 차단 확인 | 부가서비스 등록/필터 조회 시도 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| E2E-015 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 객실/부가서비스 정산 → 업체 거래 통계 조회 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-016 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 현금 비품 구매 등록 → 일일 마감 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-017 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 카드 비품 구매 등록/수정/삭제 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-018 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 역할 변경 → 재로그인 → 메뉴/기능 확인 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-019 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 상태를 휴직/퇴직 → 기존/신규 로그인 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-020 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | EN 전환 → 모든 메뉴 순회 → 팝업/폼 열기 → 재로그인 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-021 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | KO 전환 → 모든 메뉴 순회 → 팝업/폼 열기 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-022 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 호텔 등록/승인 → 관리자 로그인 → PMS 대시보드 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-023 | P0 | - | 계획서 추적표의 대상 페이지를 실제 파일과 대조 | 파트너 등록 → 별도 계정/숙소/재고 생성 | 대상 제품 페이지 또는 라우트 매핑이 없음 | **FAIL** | 계획서 16장 추적표 |
| E2E-024 | P0 | - | Admin 광고 업체와 호텔 대시보드 상세/부가서비스 연결 확인 | Admin 캠페인 등록/게시 → 호텔 대시보드 상세 열기 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |
| E2E-025 | P1 | - | 마감 완료 잔액과 다음 조회 화면의 연속성 확인 | 예약/수납/부가서비스/지출 처리 → 일일 마감 → 다음 영업일 | 기대 결과와 일치 | **PASS** | 15-e2e-business-flows.log |

### 10. API, 데이터 및 저장소 통합 테스트

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| API-001 | P0 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 필수 키/타입/상태값이 화면 계약과 일치 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-002 | P0 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 클릭 대상 ID와 응답 엔티티가 일치 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-003 | P0 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 더블클릭/재시도에도 1건만 생성 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-004 | P0 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 오래된 데이터 덮어쓰기 방지 또는 충돌 안내 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-005 | P0 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 연결 예약/Folio/로그를 고아 데이터로 만들지 않음 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-006 | P0 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 미인증 401, 권한 없음 403, 다른 Tenant 데이터 차단 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-007 | P0 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 클라이언트 조작으로 금지 상태 전이 불가 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-008 | P0 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 코드/메시지/필드 오류가 표준 형식이며 민감정보 없음 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-009 | P1 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | 로딩/취소/재시도 UX와 중복 저장 방지 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| API-010 | P1 | - | 105개 mock API read model의 schema, ID, 상태값, 참조 계약을 검사 | UI 조건과 서버 결과/총건수 일치 | 기대 결과와 일치 | **PASS** | 07-audit-api-contracts.log |
| DATA-001 | P0 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 현황/목록/타임라인 KPI와 동일 정의 사용 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-002 | P0 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 카운트와 표시 카드 수가 일치, 중복 예약 제외 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-003 | P0 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 예약 이력과 현재 객실 운영 상태를 분리 저장/표시 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-004 | P0 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 카테고리·객실·단체·Folio 합계 일치 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-005 | P0 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 청구 = 수납 + 잔액 + 환불 조정 관계 성립 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-006 | P0 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 서로 다른 통화를 무환산 합산하지 않음 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-007 | P0 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 방문/객실/숙박일/객실금액/서비스/총액 원천 일치 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-008 | P0 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 민감 상태 전환과 주요 CRUD가 누락·중복 없이 기록 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-009 | P1 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 사용자 입력/고유명/메모를 자동 번역하거나 변형하지 않음 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |
| DATA-010 | P1 | - | 105개 JSON fixture와 예약/객실/정산/부가서비스 참조 및 합계를 검사 | 저장 상태가 메모리 초기값으로 되돌아가지 않음 | 기대 결과와 일치 | **PASS** | 08-audit-data-consistency.log, 09-validate-mock-data.log |

### 11. 다국어 전수 테스트

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| I18N-001 | P0 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 첫 프레임부터 한국어, 번역 키/영어 fallback 없음 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-002 | P0 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 첫 프레임부터 영어, 한글 깜박임/혼용 없음 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-003 | P0 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 메뉴/타이틀/헤더/브라우저 title이 즉시 일치 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-004 | P0 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 제목/필드/placeholder/select/버튼/검증문구 번역 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-005 | P0 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 재렌더 후에도 선택 언어 유지 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-006 | P0 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | locale 표기와 placeholder에 다른 언어 없음 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-007 | P0 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 현재 언어로 번역 가능하고 사용자 입력은 원문 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-008 | P0 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 업체명/그룹명/고객명/메모를 임의 번역하지 않음 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-009 | P1 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 버튼/필터/카드 폭을 넘지 않고 축약 의미 명확 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-010 | P1 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 저장 언어와 문서 title 유지 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-011 | P1 | - | 60개 페이지 KO/EN cold load, 입력 라벨/placeholder/select, 동적 렌더의 언어 혼용을 검사 | 모든 시스템 메시지가 현재 언어 | 기대 결과와 일치 | **PASS** | 05-audit-i18n.log, 03-smoke-inputs-ko.log, 04-smoke-inputs-en.log |
| I18N-012 | P1 | - | 화면의 요청 생성/미리보기/fallback까지 실행하고 외부 장치 또는 서비스 단계에서 중단 | 열 제목/문서 제목/날짜가 현재 언어 | 실제 Excel/인쇄 응용프로그램의 최종 렌더링은 외부 앱 연결이 필요함 | **BLOCKED** | 공통 상호작용/입력 감사 + 외부 연동 미구성 기록 |

### 12. 반응형 및 상호작용 전수 테스트

| Case ID | P | 범위/페이지 | 실제 절차 | 기대 결과 | 실제 결과 | 판정 | 증적 |
|---|---:|---|---|---|---|---:|---|
| RESP-001 | P0 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 겹침/잘림/불필요한 가로 스크롤 없음 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-002 | P0 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 태블릿에서 핵심 업무와 팝업 액션 가능 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-003 | P0 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 모바일에서 메뉴/폼/팝업/하단 버튼 접근 가능 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-004 | P0 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 최저 폭에서 텍스트와 숫자 잘림 없음 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-005 | P0 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 위치·크기 변화와 깜박임 없음 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-006 | P0 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 터치/키보드/마우스로 열고 선택 가능 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-007 | P0 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 카드 상세 클릭과 액션 click 이벤트 충돌 없음 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-008 | P0 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 배경과 내부 스크롤 충돌, 하단 잘림 없음 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-009 | P1 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 폰트 축소 없이 줄바꿈/라벨 축약/레이아웃 조정 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-010 | P1 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 포커스 표시, 순서, Enter/Space 동작 정상 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-011 | P1 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 버튼 비활성/진행 표시, 중복 요청 없음 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |
| RESP-012 | P1 | - | 60개 페이지를 1440/1024/412/360px에서 검사하고 버튼/select/input 상호작용을 실행 | 떨림·자동 닫힘·페이지 점프 없음 | 기대 결과와 일치 | **PASS** | 16-audit-visual-4vp.log, 02-smoke-interactions.log, 03-smoke-inputs-ko.log |

## 결론

- 계획서의 673개 Case ID는 모두 결과 행을 가졌고 NOT RUN은 0건이다.
- 현재 완료 게이트는 미충족이다.
- 미수정 FAIL은 47건이며, 이 문서에서는 이를 성공으로 표현하지 않는다.
