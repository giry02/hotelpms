# PMS 능동 결함 탐색 및 수정 결과

## 1. 실행 범위

- 기준일: 2026-07-22
- 수정 전 기준 URL: `https://hotelpms-eight.vercel.app`
- 수정 후 선검증: 로컬 정적 서버
- 목적: 정상 경로 클릭을 넘어 반복 조작, 권한 반대 분기, 언어 전환 중 입력 보존, 교차 도메인 데이터 연결을 검증

## 2. 신규 탐색 결과

| 구분 | 전체 | PASS | FAIL | 결함 |
|---|---:|---:|---:|---:|
| 수정 전 운영 서버 | 10 | 9 | 1 | 1 |
| 수정 후 로컬 | 10 | 10 | 0 | 0 |
| 수정 배포 후 운영 서버 | 10 | 10 | 0 | 0 |

수정 전 실패는 `STATE-010` 한 건이다. 투숙 예약의 객실을 이동하면 예약, 객실 상태와 이동 이력은 정상 변경됐지만 예약 ID에 연결된 부가서비스 주문은 이전 호실을 계속 참조했다.

## 3. 결함과 수정

### DEF-20260722-004 객실 이동 후 부가서비스 주문 호실 불일치

- 심각도: P1 데이터 연결 불일치
- 재현: 1201호 투숙 예약에 부가서비스 주문 연결 → 예약을 1202호로 이동 → 부가서비스 상세 재조회
- 수정 전: 예약은 1202호이나 `pms_ancillary_room_orders` 주문은 1201호 유지
- 원인: 객실 이동 저장 로직이 예약·객실·단체 배정만 갱신하고 예약 ID로 연결된 부가서비스 주문을 동기화하지 않음
- 수정: 객실 변경이 확정될 때 동일 `reservationId` 주문의 `room`, `roomNo`, `roomId`, `fullRoom`, `updatedAt`을 새 호실로 동기화하고 갱신 이벤트 발행
- 수정 파일: `dashboard/common/js/reservation-actions.js`
- 영구 회귀: `scripts/mock-api/audit-proactive-state-transitions.cjs`의 `STATE-010`

## 4. 인접 회귀 결과

| 테스트 묶음 | 결과 | 확인 범위 |
|---|---:|---|
| 신규 상태 전이 | 10/10 PASS | 반복 완료·미완료, 권한 차단, 언어 전환, 플랫카드, 전 필터, 객실 이동·부가서비스 연결 |
| 예약 회귀 | 26/26 PASS | 날짜 경계, 조기 체크아웃, 점검 객실, 중복 예약, 저장 재진입, 필터 상태·색상 |
| 단체 회귀 | 17/17 PASS | 검색 실행 시점, 기간 범위, 객실 중복, 통계 합계, 객실·투숙객 탭 |
| 운영 회귀 | 14/14 PASS | 하우스키핑, 시설 보수, 부가서비스 상태, 정산 상태, 현금 지출 |

수정 커밋 `43f71db`를 `main`에 푸시한 뒤 운영 정적 자산에서 `syncLinkedAncillaryOrdersToReservationRoom` 반영을 확인했다. 같은 운영 URL에서 신규 10개와 예약 회귀 26개를 재실행해 각각 `10/10 PASS`, `26/26 PASS`를 확인했다.

## 5. 증거

- 수정 전 운영: `outputs/proactive-validation-20260722/state-transitions-before-deploy.json`
- 수정 후 로컬: `outputs/proactive-validation-20260722/state-transitions-expanded-local.json`
- 수정 배포 후 운영: `outputs/proactive-validation-20260722/state-transitions-after-deploy.json`

## 6. 잔여 위험

현재 앱은 브라우저 저장소 기반 모의 운영 환경이다. 실제 서버 DB가 연결되면 객실 이동과 부가서비스 갱신을 하나의 서버 트랜잭션으로 처리하고, 부분 실패·동시 수정·네트워크 재시도 시나리오를 별도로 검증해야 한다.

## 7. 추가 연결성 및 복구 회귀

로고 교체 작업과 함께 중단된 능동 테스트를 이어서 실행했다. 기존 상태 전이 10개에 아래 4개를 추가했다.

| ID | 검증 내용 | 수정 전 | 수정 후 로컬 |
|---|---|---:|---:|
| STATE-011 | 객실 이동 후 연결 정산 원장 호실 동기화 | FAIL | PASS |
| STATE-012 | 현금 지출 삭제 후 시재 출금 역분개 | PASS | PASS |
| STATE-013 | 지출 통화 변경 후 이전 통화 집계 제거 | PASS | PASS |
| STATE-014 | 손상된 지출·시재 저장소 안전 복구 | PASS | PASS |

### DEF-20260722-005 객실 이동 후 정산 원장 호실 불일치

- 심각도: P1 데이터 연결 불일치
- 재현: 예약 ID가 연결된 Folio 생성 → 투숙 예약을 다른 객실로 이동 → 정산 상세 재조회
- 수정 전: 예약과 부가서비스는 새 호실을 표시하지만 Folio는 이전 호실을 유지
- 원인: 객실 이동 저장 로직이 예약 ID로 연결된 정산 원장을 갱신하지 않음
- 수정: 객실 변경 확정 시 동일 `reservationId` Folio의 `room`, `roomNo`, `roomId`, `updatedAt`을 동기화하고 저장 이벤트 발행
- 수정 파일: `dashboard/common/js/reservation-actions.js`
- 영구 회귀: `scripts/mock-api/audit-proactive-state-transitions.cjs`의 `STATE-011`

## 8. 이번 로컬 재검증 결과

| 테스트 묶음 | 결과 | 비고 |
|---|---:|---|
| 상태 전이 확장 | 14/14 PASS | 객실 이동 연결성, 반복 전이, 권한, 지출 복구 포함 |
| 예약 회귀 | PASS | 날짜 경계, 조기 체크아웃, 점검 객실, 중복 예약, 저장 재진입 포함 |
| 전체 페이지 스모크 | 60/60 PASS | Hotel PMS 및 Admin 정적 페이지 로딩·런타임 오류 검사 |

## 9. 운영 배포본 최종 검증

커밋 `a1e97f7` 배포 후 `https://hotelpms-eight.vercel.app`에서 아래 항목을 다시 실행했다.

| 테스트 묶음 | 운영 결과 | 증빙 |
|---|---:|---|
| 상태 전이 확장 | 14/14 PASS | `outputs/proactive-validation-20260722/state-transitions-production-a1e97f7.json` |
| 예약 회귀 | PASS | `outputs/proactive-validation-20260722/reservation-production-a1e97f7.log` |
| 전체 페이지 스모크 | 60/60 PASS | `outputs/proactive-validation-20260722/smoke-production-a1e97f7.log` |

## 10. 추가 상태 전이 탐색과 수정

기존 14개 상태 전이에 아래 5개를 추가해 단순 버튼 동작이 아니라 예약, 객실, 하우스키핑, 저장소, 감사 로그의 최종 상태를 함께 검증했다.

| ID | 검증 내용 | 수정 전 | 수정 후 운영 |
|---|---|---:|---:|
| STATE-015 | 예정일 전 조기 체크아웃 완료 상태 유지 | PASS | PASS |
| STATE-016 | 체크아웃 청소 완료 후 객실 상태 필드 일치 | FAIL | PASS |
| STATE-017 | 예약 현황에서 선택한 객실의 날짜 변경 보존 | PASS | PASS |
| STATE-018 | 동시 체크아웃 요청의 멱등성 | PASS | PASS |
| STATE-019 | 청소 필요 객실 체크인 취소·확인 분기 | PASS | PASS |

### DEF-20260722-006 체크아웃 청소 완료 후 객실 상태 필드 불일치

- 심각도: P1 상태 불일치
- 재현: 체크아웃으로 공실·청소 필요가 된 객실의 하우스키핑 작업 완료 → 저장값 및 새로고침 후 상태 확인
- 수정 전: `status`는 `vacant-clean`이지만 `frontStatus`는 `vacant-dirty`로 남아 화면마다 객실 상태 판정이 달라질 수 있음
- 원인: 청소 완료 후 비동기 후속 저장에서 `status`만 변경했고, 해당 비동기 저장도 완료를 기다리지 않음
- 수정: 비투숙 청소 완료 시 `status`, `frontStatus`, `housekeepingStatus`, `cleaningStatus`를 한 번에 갱신한 뒤 한 번의 awaited 저장으로 영속화
- 수정 파일: `dashboard/operations/housekeeping.html`
- 영구 회귀: `scripts/mock-api/audit-proactive-state-transitions.cjs`의 `STATE-016`

## 11. 운영 서버 최종 통합 결과

커밋 `13931e3` 배포 후 `https://hotelpms-eight.vercel.app`에서 실행했다.

| 테스트 묶음 | 결과 |
|---|---:|
| 상태 전이 | 19/19 PASS |
| 연결형 예약→부가서비스→정산→지출→최종 정산 | 1/1 PASS |
| 예약 회귀 | PASS |
| 운영 기능 | 14/14 PASS |
| 운영 확장 | 12/12 PASS |
| 전체 통합 실행기 | 101 PASS / 0 FAIL / 1 BLOCKED |

`BLOCKED` 1건은 Admin과 PMS가 별도 브라우저 localStorage를 사용하는 정적 배포 구조라 실제 서버 DB를 통한 Admin 승인 데이터 전파를 검증할 수 없는 아키텍처 항목이다. 구현된 사용자 프로세스의 실패나 미실행 항목은 아니다.

증빙은 `outputs/process-validation-20260722/state-transitions-production-13931e3.json`, `connected-cycle-production-13931e3.json`, `operations-production-13931e3.json`, `operations-extended-production-13931e3.json`, `reservation-production-13931e3.log`, `full-cycle-production-13931e3/summary.json`에 저장했다.

## 12. 로그인 브랜딩 단순화 검증

로그인 배경 5종(`golf`, `beach`, `resort`, `green`, `night`)을 각각 직접 열어 공통 UI를 확인했다.

| 검증 항목 | 결과 |
|---|---:|
| PMS 건물 아이콘 표시 | 5/5 PASS |
| 배경 종류 라벨 미표시 | 5/5 PASS |
| 비동작 배경 전환 표시 미표시 | 5/5 PASS |
| 영어 전환 후 동일 상태 유지 | PASS |
| 브라우저 콘솔 오류 | 0건 |
| 로그인 상태·입력 방어 회귀 | 3/3 PASS |

로그인 회귀 증빙은 `outputs/process-validation-20260722/login-branding-critical-local.json`에 저장했다.
