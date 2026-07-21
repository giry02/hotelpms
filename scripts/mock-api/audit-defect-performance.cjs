const path = require('path');
const {
  BASE,
  assert,
  launch,
  openPage,
  createResultCollector,
  cleanRuntimeErrors
} = require('./plan-test-harness.cjs');

const OUTPUT = process.env.PMS_RESULT_FILE || path.resolve(
  __dirname,
  '..',
  '..',
  'outputs',
  'defect-discovery-20260722',
  'performance.json'
);

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
}

function reservationFixtures(count, startDate, spanDays = 365) {
  const rooms = ['1201', '1202', '1203', '1205', '1206', '1207', '1208', '1210', '1223', '1228', '1401', '1402', 'PH01', 'V-01'];
  return Array.from({ length: count }, (_, index) => {
    const checkIn = addDays(startDate, index % spanDays);
    const checkOut = addDays(checkIn, 2 + (index % 3));
    const room = rooms[index % rooms.length];
    return {
      id: `PERF-RSV-${String(index + 1).padStart(5, '0')}`,
      reservationNo: `PERF-RSV-${String(index + 1).padStart(5, '0')}`,
      guestName: `Performance Guest ${index + 1}`,
      roomId: room,
      roomNo: room,
      checkIn: isoDate(checkIn),
      checkOut: isoDate(checkOut),
      checkInDate: isoDate(checkIn),
      checkOutDate: isoDate(checkOut),
      status: index % 7 === 0 ? 'checked-in' : 'confirmed',
      amount: 140 + (index % 5) * 70
    };
  });
}

function auditFixtures(count, date) {
  return Array.from({ length: count }, (_, index) => ({
    id: `AUD-PERF-${String(index + 1).padStart(5, '0')}`,
    createdAt: `${date}T${String(index % 24).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00+09:00`,
    action: index % 10 === 0 ? 'reservation_cancel' : 'reservation_update',
    page: 'dashboard/frontdesk/reservation-board.html',
    actor: { id: `STAFF-${index % 20}`, name: index === 4321 ? 'UNIQUE-AUDIT-MARKER' : `Performance Staff ${index % 20}`, role: 'frontdesk', roleLabel: 'Front Desk' },
    target: { id: `PERF-RSV-${index}`, label: index === 4321 ? 'UNIQUE-AUDIT-MARKER' : `Guest ${index}` },
    details: {
      screen: 'dashboard/frontdesk/reservation-board.html',
      fields: ['status', 'room'],
      summary: index === 4321 ? 'UNIQUE-AUDIT-MARKER' : `Reservation change ${index}`
    }
  }));
}

function groupFixtures(count, companyId, today) {
  return Array.from({ length: count }, (_, index) => {
    const checkIn = addDays(today, -(index % 365));
    return {
      id: `GRP-PERF-${String(index + 1).padStart(5, '0')}`,
      name: `Performance Group ${index + 1}`,
      companyId,
      companyName: 'Performance Company',
      status: 'completed',
      checkInDate: isoDate(checkIn),
      checkOutDate: isoDate(addDays(checkIn, 2)),
      blockedRooms: 3,
      pax: 6,
      currency: 'PHP',
      settlementItems: [
        { type: 'room', amount: 900 },
        { type: 'pos', amount: 120 },
        { type: 'golf', amount: 450 }
      ],
      roomAllocations: [{ roomNo: '1201', finalRate: 450 }]
    };
  });
}

(async () => {
  const collector = createResultCollector(OUTPUT);
  const { browser, server } = await launch();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await collector.run(
    'DISC-PERF-001',
    '예약 1,000건 현황 초기 로드',
    '격리 저장소에 예약 1,000건을 주입하고 운영 배포본을 5회 새 컨텍스트에서 연 뒤 중앙값, P95, 최댓값을 측정한다.',
    async () => {
      const fixtures = reservationFixtures(1000, addDays(today, -30), 90);
      const durations = [];
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const started = Date.now();
        const state = await openPage(browser, 'dashboard/frontdesk/reservation-board.html', {
          seed: { pms_reservations: fixtures },
          viewport: { width: 1440, height: 1000 }
        });
        await state.page.waitForFunction(() => document.querySelectorAll('.reservation-board-box').length > 0, null, { timeout: 12000 });
        durations.push(Date.now() - started);
        cleanRuntimeErrors(state);
        await state.context.close();
      }
      const medianMs = percentile(durations, 0.5);
      const p95Ms = percentile(durations, 0.95);
      const maxMs = Math.max(...durations);
      assert(medianMs <= 3000, 'Reservation board median load exceeded 3 seconds', { durations, medianMs });
      assert(p95Ms <= 5000, 'Reservation board P95 load exceeded 5 seconds', { durations, p95Ms });
      assert(maxMs <= 7000, 'Reservation board single load exceeded 7 seconds', { durations, maxMs });
      return { target: BASE, fixtureCount: fixtures.length, durations, medianMs, p95Ms, maxMs };
    }
  );

  await collector.run(
    'DISC-PERF-002',
    '예약 이력 10,000건 타임라인 기간 조회',
    '예약 10,000건을 주입한 뒤 14일 타임라인을 이동하고 요청 범위와 렌더 결과가 선택 기간에 한정되는지 확인한다.',
    async () => {
      const fixtures = reservationFixtures(10000, addDays(today, -180), 365);
      const state = await openPage(browser, 'dashboard/frontdesk/reservation-timeline.html', {
        seed: { pms_reservations: fixtures },
        viewport: { width: 1440, height: 1000 }
      });
      await state.page.waitForFunction(() => typeof window.shiftWeek === 'function' && typeof window.timelineWindowQuery === 'function', null, { timeout: 12000 });
      const result = await state.page.evaluate(async () => {
        const requests = [];
        const original = window.PmsAPI.getTimelineReservations;
        window.PmsAPI.getTimelineReservations = async query => {
          requests.push({ ...query });
          return original(query);
        };
        const started = performance.now();
        await window.shiftWeek(1);
        const elapsedMs = performance.now() - started;
        const query = window.timelineWindowQuery();
        const rows = Array.isArray(window.reservations) ? window.reservations : [];
        const inRange = rows.every(row => {
          const start = String(row.checkInDate || row.checkIn || '').slice(0, 10);
          const end = String(row.checkOutDate || row.checkOut || start).slice(0, 10);
          return start <= query.to && end >= query.from;
        });
        return { requests, query, resultCount: rows.length, inRange, elapsedMs };
      });
      assert(result.requests.length === 1, 'Timeline navigation did not issue exactly one scoped reservation request', result);
      assert(result.requests[0].from === result.query.from && result.requests[0].to === result.query.to, 'Timeline request range differs from selected window', result);
      assert(result.inRange, 'Timeline returned reservations outside the selected 14-day window', result);
      assert(result.resultCount < fixtures.length, 'Timeline preloaded the complete 10,000-row history', result);
      assert(result.elapsedMs <= 5000, 'Timeline period navigation exceeded 5 seconds', result);
      cleanRuntimeErrors(state);
      await state.context.close();
      return { target: BASE, fixtureCount: fixtures.length, ...result };
    }
  );

  await collector.run(
    'DISC-PERF-003',
    '감사로그 10,000건 검색·기간·페이지',
    '감사로그 10,000건을 주입하고 12건 페이지, 2페이지 이동, 고유 검색어 필터 및 처리 시간을 확인한다.',
    async () => {
      const date = isoDate(today);
      const fixtures = auditFixtures(10000, date);
      const state = await openPage(browser, 'dashboard/settings/audit-logs.html', {
        viewport: { width: 1440, height: 1000 }
      });
      await state.page.waitForFunction(() => typeof window.setAuditPage === 'function' && document.querySelector('#auditBody'), null, { timeout: 12000 });
      const result = await state.page.evaluate(async fixtures => {
        const demoRows = typeof window.auditDemoEntries === 'function' ? window.auditDemoEntries() : [];
        window.__auditPerfFixtures = [...fixtures, ...demoRows];
        window.PmsPrivacyAudit.list = () => window.__auditPerfFixtures;
        localStorage.setItem('pms_audit_demo_seed_v3', typeof window.auditTodayIso === 'function' ? window.auditTodayIso() : new Date().toISOString().slice(0, 10));
        const period = document.querySelector('#auditPeriodFilter');
        if (period) period.value = 'all';
        const started = performance.now();
        window.renderAuditLogs();
        await new Promise(resolve => setTimeout(resolve, 50));
        const pageOneRows = document.querySelectorAll('#auditBody tr').length;
        const total = Number((document.querySelector('#kpiTotal')?.textContent || '0').replace(/[^0-9]/g, ''));
        window.setAuditPage(2);
        await new Promise(resolve => setTimeout(resolve, 50));
        const pageTwoRows = document.querySelectorAll('#auditBody tr').length;
        const currentPage = document.querySelector('.audit-page-btn.active')?.textContent?.trim();
        const search = document.querySelector('#auditSearch');
        search.value = 'UNIQUE-AUDIT-MARKER';
        window.resetAuditPageAndRender();
        await new Promise(resolve => setTimeout(resolve, 80));
        const filteredTotal = Number((document.querySelector('#kpiTotal')?.textContent || '0').replace(/[^0-9]/g, ''));
        const filteredRows = document.querySelectorAll('#auditBody tr').length;
        return { pageOneRows, pageTwoRows, currentPage, total, filteredTotal, filteredRows, elapsedMs: performance.now() - started };
      }, fixtures);
      assert(result.pageOneRows === 12 && result.pageTwoRows === 12, 'Audit log pagination did not render 12 rows per page', result);
      assert(result.currentPage === '2', 'Audit log did not persist page 2 selection', result);
      assert(result.total >= fixtures.length, 'Audit log KPI did not include the 10,000-row fixture', result);
      assert(result.filteredTotal === 1 && result.filteredRows === 1, 'Audit log unique search did not return exactly one row', result);
      assert(result.elapsedMs <= 5000, 'Audit log search and pagination exceeded 5 seconds', result);
      cleanRuntimeErrors(state);
      await state.context.close();
      return { target: BASE, fixtureCount: fixtures.length, ...result };
    }
  );

  await collector.run(
    'DISC-PERF-004',
    '단체 행사 1,000건 최근 1년 통계',
    '완전한 요약 데이터를 가진 단체 행사 1,000건을 주입하고 기간 변경은 조회 전 결과를 바꾸지 않으며 조회 후 5초 안에 집계되는지 확인한다.',
    async () => {
      const companyId = 'COMP-PERF-1000';
      const fixtures = groupFixtures(1000, companyId, today);
      const state = await openPage(browser, 'dashboard/frontdesk/groups_companies.html', {
        viewport: { width: 1440, height: 1000 }
      });
      await state.page.waitForFunction(() => typeof window.openCompanyPerformanceModal === 'function' && document.querySelector('#companyPerformanceModal'), null, { timeout: 12000 });
      const result = await state.page.evaluate(async ({ companyId, fixtures }) => {
        companies = [{ id: companyId, name: 'Performance Company', status: 'active' }];
        groupEvents = fixtures;
        let detailCalls = 0;
        const originalRequest = window.PmsMockApi?.request?.bind(window.PmsMockApi);
        if (originalRequest) {
          window.PmsMockApi.request = async (method, route, options) => {
            if (String(route).startsWith('/groups/events/')) detailCalls += 1;
            return originalRequest(method, route, options);
          };
        }
        await window.openCompanyPerformanceModal(companyId);
        const before = document.querySelector('#performanceEventCount')?.textContent || '';
        const select = document.querySelector('#performancePeriodSelect');
        select.value = 'year';
        window.handlePerformancePeriodChange();
        const afterPeriodChange = document.querySelector('#performanceEventCount')?.textContent || '';
        const started = performance.now();
        await window.refreshCompanyPerformanceModal();
        const elapsedMs = performance.now() - started;
        const afterSearch = document.querySelector('#performanceEventCount')?.textContent || '';
        return {
          before,
          afterPeriodChange,
          afterSearch,
          detailCalls,
          elapsedMs,
          start: document.querySelector('#performanceStartDate')?.value,
          end: document.querySelector('#performanceEndDate')?.value,
          renderedRows: document.querySelectorAll('#performanceEventBody tr').length
        };
      }, { companyId, fixtures });
      assert(result.before === result.afterPeriodChange, 'Changing the group statistics period queried before Search', result);
      assert(/^\d{4}-\d{2}-\d{2}$/.test(result.start) && /^\d{4}-\d{2}-\d{2}$/.test(result.end), 'Recent-year dates were not explicit', result);
      assert(result.renderedRows > 0 && result.renderedRows <= fixtures.length, 'Group statistics did not render the selected period', result);
      assert(result.detailCalls === 0, 'Group statistics issued N+1 detail requests for already complete rows', result);
      assert(result.elapsedMs <= 5000, 'Group statistics aggregation exceeded 5 seconds', result);
      cleanRuntimeErrors(state);
      await state.context.close();
      return { target: BASE, fixtureCount: fixtures.length, ...result };
    }
  );

  await collector.run(
    'DISC-PERF-005',
    '페이지 10회 이동 중복 이벤트·메모리',
    '예약 현황과 타임라인을 같은 브라우저 컨텍스트에서 10회 이동하고 마지막 카드 한 번 클릭이 모달 하나만 여는지 확인한다.',
    async () => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      await context.addInitScript(() => {
        localStorage.setItem('pms_lang', 'ko');
        sessionStorage.setItem('pms_logged_in', 'true');
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let initialHeap = 0;
      let finalHeap = 0;
      for (let index = 0; index < 10; index += 1) {
        const route = index % 2 === 0
          ? 'dashboard/frontdesk/reservation-board.html'
          : 'dashboard/frontdesk/reservation-timeline.html';
        await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(350);
        const heap = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
        if (index === 0) initialHeap = heap;
        if (index === 9) finalHeap = heap;
      }
      await page.goto(`${BASE}/dashboard/frontdesk/reservation-board.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
      const before = await page.evaluate(() => ({
        cards: document.querySelectorAll('.reservation-board-box[onclick*="openUnifiedResModal"]').length,
        activeBefore: document.querySelectorAll('.modal.active, .modal.show, .modal-overlay.active').length
      }));
      const card = page.locator('.reservation-board-box[onclick*="openUnifiedResModal"]').first();
      if (before.cards) {
        await card.click();
        await page.waitForFunction(() => {
          const modal = document.querySelector('#unifiedResModal');
          return modal?.classList.contains('active') && getComputedStyle(modal).display !== 'none';
        }, null, { timeout: 5000 });
      }
      const after = await page.evaluate(() => ({
        activeAfter: document.querySelectorAll('.modal.active, .modal.show, .modal-overlay.active').length,
        detailModals: document.querySelectorAll('#unifiedResModal.active, #unifiedReservationModal.active, #reservationModal.active').length
      }));
      const result = { ...before, ...after };
      assert(errors.length === 0, 'Repeated navigation produced browser errors', errors);
      assert(result.cards > 0, 'No reservation card was available after repeated navigation', result);
      assert(result.activeBefore === 0 && result.activeAfter === 1, 'One card click did not open exactly one modal', result);
      if (initialHeap && finalHeap) {
        assert(finalHeap <= Math.max(initialHeap * 2, initialHeap + 50 * 1024 * 1024), 'Heap usage grew beyond the navigation safety bound', { initialHeap, finalHeap });
      }
      await context.close();
      return { target: BASE, navigations: 10, initialHeap, finalHeap, ...result };
    }
  );

  const payload = collector.write({ target: BASE, scope: 'defect-discovery-performance' });
  await browser.close();
  if (server) server.close();
  process.exitCode = payload.summary.failed || payload.summary.blocked ? 1 : 0;
})().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
