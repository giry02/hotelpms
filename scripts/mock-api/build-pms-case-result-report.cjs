const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PLAN = path.join(ROOT, 'docs', 'PMS_FULL_INTEGRATION_TEST_PLAN_20260718.md');
const OUTPUT = path.join(ROOT, 'docs', 'PMS_FULL_INTEGRATION_TEST_CASE_RESULT_20260719.md');

const evidence = {
  'RES-BOARD-001': ['PASS', 'test-reservations-final-20260718.log', '10개 필터의 칩 수와 실제 카드 수, 상태·색상·hover 안정성을 비교했다.'],
  'RES-BOARD-005': ['PASS', 'audit-critical-ui.cjs 재실행(2026-07-19)', '1203 카드 선택, 팝업 값 1203, 저장 예약 room 1203을 모두 확인했다.'],
  'CHECKIN-001': ['PASS', 'test-e2e-final2-20260718.log', '예약 검색 후 체크인하고 상태가 checkedin으로 저장되는 흐름을 확인했다.'],
  'CHECKIN-002': ['PASS', 'test-e2e-final2-20260718.log', '체크아웃 후 completed 상태와 후속 상태 전환을 확인했다.'],
  'GRP-DETAIL-005': ['PASS', 'test-e2e-final2-20260718.log', '단체 객실 배정 저장 후 예약 타임라인 반영을 확인했다.'],
  'GRP-DETAIL-007': ['PASS', 'test-e2e-final2-20260718.log', '단체 객실의 대표 투숙객 등록과 예약 연결을 확인했다.'],
  'GRP-DETAIL-008': ['PASS', 'test-e2e-final2-20260718.log', '동반 투숙객 명단과 객실 연결을 확인했다.'],
  'ANC-001': ['PASS', 'test-e2e-final2-20260718.log', '28개 카드 모두 투숙 중이고 투숙객 없는 카드가 0건임을 확인했다.'],
  'ANC-VND-001': ['PASS', 'test-e2e-final2-20260718.log', '통합 POS→골프장→렌터카→음식점→기타 순서를 확인했다.'],
  'ANC-VND-009': ['PASS', 'test-audit-ancillary-final-20260718.log', '저장된 골프 바우처 초기 필드와 사용 가능 상태를 확인했다.'],
  'ANC-VND-010': ['PASS', 'test-audit-ancillary-final-20260718.log', '필드 변경 저장 후 저장소와 선택 상태가 갱신됨을 확인했다.'],
  'ANC-VND-011': ['PASS', 'test-e2e-final2-20260718.log', '골프 바우처 선택 필드와 절취 확인 영역을 실제 미리보기에서 확인했다.'],
  'ANC-VND-012': ['PASS', 'test-e2e-final2-20260718.log', '렌터카 업체·주소·픽업·차량 정보가 미리보기에 표시됨을 확인했다.'],
  'EXP-001': ['PASS', 'audit-critical-ui.cjs 재실행(2026-07-19)', '신규 등록이 팝업으로 열리고 목록 영역이 유지되는지 확인했다.'],
  'STAFF-002': ['PASS', 'audit-critical-ui.cjs 재실행(2026-07-19)', '편집 버튼 단일 클릭으로 해당 편집 팝업이 한 번 열림을 확인했다.'],

  'DASH-001': ['PARTIAL', 'test-e2e-final2-20260718.log', '오늘 체크인 KPI만 원천 목록과 비교했다. 정산·청소·알림 KPI는 미검증이다.'],
  'DASH-002': ['PARTIAL', 'test-e2e-final2-20260718.log', '오늘 체크인 KPI 이동과 필터·건수만 확인했다. 다른 KPI 이동은 미검증이다.'],
  'DASH-007': ['PARTIAL', 'test-e2e-final2-20260718.log', '정상 업체 광고 상세 연결은 확인했으나 업체 없음 fallback은 미검증이다.'],
  'RES-BOARD-002': ['PARTIAL', 'audit-critical-ui.cjs 재실행(2026-07-19)', '클릭 객실과 팝업 기본값 일치는 확인했다. 이 ID에서 저장 후 카드 표시는 별도로 완결하지 않았다.'],
  'RES-BOARD-003': ['PARTIAL', 'audit-critical-ui.cjs 재실행(2026-07-19)', '청소 미완료 경고와 취소 시 미저장은 확인했다. 계속 선택 저장은 미검증이다.'],
  'RES-BOARD-004': ['PARTIAL', 'test-reservations-final-20260718.log', '점검 객실 차단 상태와 정상 객실 체크인 성공을 회귀 검사했으나 신규 예약 저장 양쪽 흐름은 미검증이다.'],
  'RES-BOARD-007': ['PARTIAL', 'test-e2e-final2-20260718.log', '체크인 상태 전환은 확인했으나 모든 KPI·필터·타임라인·목록 동기화를 한 케이스에서 전부 비교하지 않았다.'],
  'RES-BOARD-008': ['PARTIAL', 'test-reservations-final-20260718.log', '정상 객실의 날짜 오차 차단 회귀는 확인했으나 경과 미도착 전용 데이터로 완결하지 않았다.'],
  'RES-BOARD-010': ['PARTIAL', 'test-e2e-final2-20260718.log', '체크아웃과 completed 전환을 확인했으나 정산·청소 상태를 모두 단일 assertion으로 비교하지 않았다.'],
  'RES-BOARD-016': ['PARTIAL', 'test-reservations-final-20260718.log', 'select와 hover 스타일 안정성을 확인했으나 하우스키핑 교차 화면 동기화는 미검증이다.'],
  'RES-BOARD-017': ['PARTIAL', 'test-reservations-final-20260718.log', 'hover 전후 transform·색상을 비교했으나 30초 지속 관찰은 수행하지 않았다.'],
  'RES-BOARD-018': ['PARTIAL', 'test-reservations-final-20260718.log', '1203 카드의 필터별 색상·상태를 비교했으나 모든 표시 필드를 일괄 비교하지 않았다.'],
  'RES-TIME-003': ['PARTIAL', 'test-e2e-final2-20260718.log', '체크인·체크아웃 타임라인 class는 확인했으나 모든 상태 색상은 미검증이다.'],
  'RES-TIME-004': ['PARTIAL', 'test-e2e-final2-20260718.log', '타임라인에서 업무 동작을 수행했으나 모든 예약 유형의 팝업 대상 일치는 미검증이다.'],
  'RES-TIME-006': ['PARTIAL', 'test-e2e-final2-20260718.log', '단체 대표·동반 투숙객 타임라인 반영은 확인했으나 미배정 상태는 미검증이다.'],
  'RES-LIST-004': ['PARTIAL', 'test-e2e-final2-20260718.log', '개인 예약 등록과 타임라인 반영은 확인했으나 필수값·객실 경고·재진입 전체 조합은 미검증이다.'],
  'RES-LIST-006': ['PARTIAL', 'test-e2e-final2-20260718.log', '체크인·체크아웃은 확인했으나 취소와 상태별 버튼 전체 조합은 미검증이다.'],
  'GRP-LIST-001': ['PARTIAL', 'test-groups-final-20260718.log', '과거·정산 필요 필터 중첩과 건수를 확인했으나 전체 상태 필터 순회는 미검증이다.'],
  'GRP-LIST-009': ['PARTIAL', 'test-groups-final-20260718.log', '과거 행사와 진행 상태 분리를 회귀 검사했으나 모든 완료 표본은 미검증이다.'],
  'GRP-DETAIL-001': ['PARTIAL', 'test-groups-final-20260718.log', '기존 행사 단체 데이터 hydration은 확인했으나 개요 전체 필드의 원천 대조는 미검증이다.'],
  'GRP-DETAIL-004': ['PARTIAL', 'test-groups-final-20260718.log', '단체 기본 할인과 행사 할인 분리를 확인했으나 모든 요금 계산 조합은 미검증이다.'],
  'GRP-COMP-002': ['PARTIAL', 'test-groups-final-20260718.log', '업체 카드 편집 액션 클릭 가능 여부만 확인했다. 전체 값 저장은 미검증이다.'],
  'GRP-COMP-004': ['PARTIAL', 'test-groups-final-20260718.log', '업체 카드 삭제 액션 클릭 가능 여부만 확인했다. 삭제 후 저장소 제거는 미검증이다.'],
  'MAINT-001': ['PARTIAL', 'test-e2e-final2-20260718.log', '하우스키핑에서 보수 요청을 생성하고 요청 ID·객실을 확인했으나 모든 입력 필드는 미검증이다.'],
  'MAINT-011': ['PARTIAL', 'test-reservations-final-20260718.log', '점검이 아닌 일반 객실의 체크인 성공을 확인했으나 여러 객실 상태 조합은 미검증이다.'],
  'EXP-003': ['PARTIAL', 'audit-critical-ui.cjs 재실행(2026-07-19)', 'PHP 호텔의 PHP/USD/KRW 노출과 VND 미노출을 확인했다. VND 호텔 설정은 미검증이다.'],
  'EXP-006': ['PARTIAL', 'audit-critical-ui.cjs 재실행(2026-07-19)', '기존 값 로드와 별도 임시 건 수정 저장을 확인했다. 동일 기존 건의 전체 필드 갱신은 미검증이다.'],
  'EXP-007': ['PARTIAL', 'audit-critical-ui.cjs 재실행(2026-07-19)', '확인 후 목록 제거를 확인했다. KPI·시재·마감 영향은 미검증이다.'],
  'EXP-009': ['PARTIAL', 'audit-critical-ui.cjs 재실행(2026-07-19)', '직접 기간 입력값 유지까지만 확인했다. KPI와 목록 범위 동시 갱신은 미검증이다.'],
  'AUDIT-004': ['PARTIAL', 'test-e2e-final2-20260718.log', '닫힌 마감 fixture의 출금 다건과 통화 내역은 확인했으나 실제 등록부터 상세까지 수행하지 않았다.'],
  'AUDIT-008': ['PARTIAL', 'test-e2e-final2-20260718.log', '마감 완료 상태·담당자·통화 잔액 렌더링은 확인했으나 UI에서 정상 마감을 실행하지 않았다.'],
  'STAFF-004': ['PARTIAL', 'audit-critical-ui.cjs 재실행(2026-07-19)', '신규·편집 필드 구성과 영어 라벨은 확인했으나 실제 스크롤 높이 비교는 미검증이다.'],
  'STAFF-016': ['PARTIAL', 'audit-critical-ui.cjs 재실행(2026-07-19)', '영문 데스크톱 팝업은 확인했으나 KO와 모바일 날짜 picker까지 한 케이스로 실행하지 않았다.']
};

function escapeCell(value) {
  return String(value || '-').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function parsePlan(source) {
  const sections = [];
  let current = null;
  for (const line of source.split(/\r?\n/)) {
    const heading = line.match(/^### (7\.\d+) (.+)$/);
    if (heading) {
      current = { number: heading[1], title: heading[2], cases: [] };
      sections.push(current);
      continue;
    }
    if (/^## 8\./.test(line)) break;
    if (!current || !/^\| [A-Z]/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    const priorityIndex = cells.findIndex(cell => /^P[01]$/.test(cell));
    if (priorityIndex < 1 || cells.length < priorityIndex + 3) continue;
    current.cases.push({
      id: cells[0],
      scope: cells.slice(1, priorityIndex).join(' / ') || '-',
      priority: cells[priorityIndex],
      scenario: cells[priorityIndex + 1],
      expected: cells[priorityIndex + 2]
    });
  }
  return sections;
}

function resultFor(testCase) {
  const mapped = evidence[testCase.id];
  if (mapped) return { status: mapped[0], evidence: mapped[1], note: mapped[2] };
  return {
    status: 'NOT RUN',
    evidence: '공통 페이지/입력/상호작용 감사만 수행',
    note: '계획서의 기대 결과를 끝까지 검증하는 전용 업무 시나리오는 실행하지 않았다.'
  };
}

const sections = parsePlan(fs.readFileSync(PLAN, 'utf8'));
const allCases = sections.flatMap(section => section.cases);
if (allCases.length !== 416) throw new Error(`Expected 416 Hotel PMS cases, found ${allCases.length}`);
const uniqueIds = new Set(allCases.map(testCase => testCase.id));
if (uniqueIds.size !== allCases.length) {
  throw new Error(`Hotel PMS case IDs must be unique: ${allCases.length - uniqueIds.size} duplicate(s) found`);
}

const rows = allCases.map(testCase => ({ ...testCase, ...resultFor(testCase) }));
const count = status => rows.filter(row => row.status === status).length;
const lines = [
  '# Hotel PMS 페이지별 기능 테스트 상세 결과',
  '',
  '- 기준 계획서: `docs/PMS_FULL_INTEGRATION_TEST_PLAN_20260718.md`의 `7. Hotel PMS 페이지별 기능 테스트 케이스`',
  '- 판정일: 2026-07-19',
  '- 총 케이스: 416건',
  `- 결과: **PASS ${count('PASS')} / PARTIAL ${count('PARTIAL')} / NOT RUN ${count('NOT RUN')}**`,
  '',
  '## 판정 기준',
  '',
  '- `PASS`: 해당 케이스의 핵심 입력, 상태 변경, 저장 결과와 기대 결과를 전용 assertion으로 확인했다.',
  '- `PARTIAL`: 일부 단계, 일부 환경 또는 한쪽 상태만 확인했다. 자동화 자체가 성공했어도 계획서 기대 결과 전체를 확인하지 못하면 PARTIAL이다.',
  '- `NOT RUN`: 페이지 로드·기본 입력·버튼 감사는 통과했지만 해당 업무 시나리오를 시작부터 결과까지 실행하지 않았다.',
  '- 공통 스모크 60페이지 PASS와 케이스별 기능 PASS는 서로 다른 지표다.',
  '',
  '## 섹션별 요약',
  '',
  '| 구분 | 전체 | PASS | PARTIAL | NOT RUN |',
  '|---|---:|---:|---:|---:|'
];

for (const section of sections) {
  const sectionRows = rows.filter(row => section.cases.some(testCase => testCase.id === row.id));
  lines.push(`| ${section.number} ${escapeCell(section.title)} | ${sectionRows.length} | ${sectionRows.filter(row => row.status === 'PASS').length} | ${sectionRows.filter(row => row.status === 'PARTIAL').length} | ${sectionRows.filter(row => row.status === 'NOT RUN').length} |`);
}

lines.push('', '## 전체 결과', '');
for (const section of sections) {
  const sectionRows = rows.filter(row => section.cases.some(testCase => testCase.id === row.id));
  lines.push(`### ${section.number} ${section.title}`, '');
  lines.push(`- 결과: PASS ${sectionRows.filter(row => row.status === 'PASS').length} / PARTIAL ${sectionRows.filter(row => row.status === 'PARTIAL').length} / NOT RUN ${sectionRows.filter(row => row.status === 'NOT RUN').length}`, '');
  lines.push('| ID | 우선순위 | 범위 | 시나리오 | 기대 결과 | 판정 | 증적 | 비고 |');
  lines.push('|---|---|---|---|---|---:|---|---|');
  for (const row of sectionRows) {
    lines.push(`| ${row.id} | ${row.priority} | ${escapeCell(row.scope)} | ${escapeCell(row.scenario)} | ${escapeCell(row.expected)} | **${row.status}** | ${escapeCell(row.evidence)} | ${escapeCell(row.note)} |`);
  }
  lines.push('');
}

lines.push(
  '## 결론',
  '',
  `416건 중 전용 시나리오로 완결된 케이스는 ${count('PASS')}건이다. ${count('PARTIAL')}건은 추가 assertion 또는 환경 조합이 필요하고, ${count('NOT RUN')}건은 계획서 기준의 업무 흐름 자동화가 아직 없다.`,
  '',
  '따라서 기존 공통 자동화 묶음의 성공은 유지되지만, 계획서 7장 전체에 대한 최종 판정은 `완료`가 아니라 `부분 실행`이다.'
);

const outputText = `${lines.join('\n')}\n`;
const renderedIds = [...outputText.matchAll(/^\| ([A-Z][A-Z0-9-]+) \| P[01] \|/gm)].map(match => match[1]);
if (renderedIds.length !== allCases.length || new Set(renderedIds).size !== allCases.length) {
  throw new Error(`Expected 416 unique rendered result rows, found ${renderedIds.length}/${new Set(renderedIds).size}`);
}

fs.writeFileSync(OUTPUT, outputText, 'utf8');
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT), total: rows.length, pass: count('PASS'), partial: count('PARTIAL'), notRun: count('NOT RUN') }, null, 2));
