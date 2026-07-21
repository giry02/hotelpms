const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_BASE = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const PORT = Number(new URL(DEFAULT_BASE).port || 8765);

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';
}

function serveStatic(port) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const decoded = decodeURIComponent(url.pathname);
    const safePath = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
    const file = path.join(ROOT, safePath === path.sep ? 'index.html' : safePath);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType(file) });
      res.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', () => resolve(null));
  });
}

function httpOk(url) {
  return new Promise(resolve => {
    const client = new URL(url).protocol === 'https:' ? https : http;
    const req = client.get(url, res => {
      res.resume();
      resolve(res.statusCode && res.statusCode < 400);
    });
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
  });
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

(async () => {
  let base = DEFAULT_BASE;
  let server = null;
  if (!(await httpOk(`${base}/dashboard/frontdesk/groups_blocks.html`))) {
    server = await serveStatic(PORT);
    if (!server) {
      server = await serveStatic(0);
      base = `http://127.0.0.1:${server.address().port}`;
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleIssues = [];
  const timelineSource = fs.readFileSync(path.join(ROOT, 'dashboard', 'frontdesk', 'reservation-timeline.html'), 'utf8');
  const companySource = fs.readFileSync(path.join(ROOT, 'dashboard', 'frontdesk', 'groups_companies.html'), 'utf8');

  assert(
    !timelineSource.includes('[displayName, companionTitle, timeTitle]'),
    'Timeline tooltip must not append companion names after a display label that already contains the full guest roster.'
  );
  assert(
    companySource.includes('data-ko="기타" data-en="Other"') && companySource.includes('totals.other'),
    'Group usage stats must expose Other as a dedicated detail and total column.'
  );

  page.on('console', msg => {
    if (!['error', 'warning'].includes(msg.type())) return;
    const text = msg.text();
    if (/ERR_NETWORK_ACCESS_DENIED|Failed to load resource|favicon|googleapis|gstatic|cdnjs|cdn\.jsdelivr/i.test(text)) return;
    consoleIssues.push(`${msg.type()}: ${text}`);
  });
  page.on('pageerror', err => consoleIssues.push(`pageerror: ${err.message}`));

  try {
    await page.addInitScript(() => {
      sessionStorage.setItem('pms_logged_in', 'true');
      sessionStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('pms_lang', 'ko');
      localStorage.removeItem('pms_groups');
      localStorage.removeItem('pms_reservations');
      localStorage.removeItem('pms_companies');
    });

    await page.goto(`${base}/dashboard/frontdesk/groups_blocks.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => typeof window.renderGroups === 'function' && typeof window.filterGroups === 'function', null, { timeout: 15000 });
    await page.waitForSelector('.filter-left .pms-search-button', { timeout: 5000 });
    await page.waitForSelector('.filter-left .pms-search-divider', { timeout: 5000 });

    const groupFilterLayout = await page.evaluate(() => {
      const button = document.querySelector('.filter-left .pms-search-button');
      const divider = document.querySelector('.filter-left .pms-search-divider');
      const chips = document.querySelector('.filter-left .filter-chips');
      const buttonRect = button?.getBoundingClientRect();
      const dividerRect = divider?.getBoundingClientRect();
      const chipRect = chips?.getBoundingClientRect();
      return {
        hasButton: !!button,
        hasDivider: !!divider,
        hasChips: !!chips,
        buttonRight: buttonRect?.right || 0,
        dividerLeft: dividerRect?.left || 0,
        dividerRight: dividerRect?.right || 0,
        chipLeft: chipRect?.left || 0,
        gap: Math.round((chipRect?.left || 0) - (buttonRect?.right || 0))
      };
    });

    assert(groupFilterLayout.hasButton && groupFilterLayout.hasDivider && groupFilterLayout.hasChips, 'Group list filter bar must include search button, divider, and filter chips.', groupFilterLayout);
    assert(groupFilterLayout.buttonRight < groupFilterLayout.dividerLeft && groupFilterLayout.dividerRight < groupFilterLayout.chipLeft, 'Group list filter divider must sit between search and filter chips.', groupFilterLayout);
    assert(groupFilterLayout.gap >= 20, 'Group list search button and filter chips must have guest-list style separation.', groupFilterLayout);

    const result = await page.evaluate(() => {
      const fmt = (date) => date.toISOString().slice(0, 10);
      const now = window.PmsDate?.today ? window.PmsDate.today() : new Date();
      now.setHours(0, 0, 0, 0);
      const days = (offset) => {
        const date = new Date(now);
        date.setDate(date.getDate() + offset);
        return fmt(date);
      };
      const sampleGroups = [
        {
          id: 'GRP-HANA-OVERLAP',
          name: 'Hana Tour Overlap Event',
          agency: 'Hana Tour',
          status: 'departed',
          settlementStatus: 'unpaid',
          checkin: days(-5),
          checkout: days(-2),
          roomAllocations: [{ roomId: '1201', type: 'Deluxe' }],
          pax: 10
        },
        {
          id: 'GRP-PAST-PAID',
          name: 'Past Paid Event',
          agency: 'Paid Company',
          status: 'departed',
          settlementStatus: 'paid',
          checkin: days(-8),
          checkout: days(-6),
          roomAllocations: [{ roomId: '1202', type: 'Deluxe' }],
          pax: 8
        },
        {
          id: 'GRP-FUTURE-PENDING',
          name: 'Future Pending Event',
          agency: 'Future Company',
          status: 'confirmed',
          settlementStatus: 'pending',
          checkin: days(4),
          checkout: days(6),
          roomAllocations: [{ roomId: '1203', type: 'Deluxe' }],
          pax: 12
        }
      ];

      localStorage.setItem('pms_groups', JSON.stringify(sampleGroups));
      groups = sampleGroups;
      window.renderGroups('');

      const counts = Object.fromEntries(Array.from(document.querySelectorAll('.filter-chips .chip')).map(button => [
        button.dataset.filter,
        Number(button.querySelector('.chip-count')?.textContent || 0)
      ]));

      window.filterGroups('past', document.querySelector('.filter-chips .chip[data-filter="past"]'));
      const pastText = document.querySelector('#groupGrid')?.innerText || '';

      window.filterGroups('settlement', document.querySelector('.filter-chips .chip[data-filter="settlement"]'));
      const settlementText = document.querySelector('#groupGrid')?.innerText || '';

      return {
        counts,
        past: {
          overlap: pastText.includes('GRP-HANA-OVERLAP'),
          paidPast: pastText.includes('GRP-PAST-PAID'),
          futurePending: pastText.includes('GRP-FUTURE-PENDING')
        },
        settlement: {
          overlap: settlementText.includes('GRP-HANA-OVERLAP'),
          paidPast: settlementText.includes('GRP-PAST-PAID'),
          futurePending: settlementText.includes('GRP-FUTURE-PENDING')
        }
      };
    });

    assert(result.counts.all === 3, 'All events count is wrong.', result);
    assert(result.counts.upcoming === 1, 'Upcoming count is wrong.', result);
    assert(result.counts.past === 2, 'Past events must include both paid and unsettled past events.', result);
    assert(result.counts.settlement === 1, 'Settlement-needed count must include only past unsettled events.', result);
    assert(result.past.overlap && result.past.paidPast && !result.past.futurePending, 'Past filter membership is wrong.', result);
    assert(result.settlement.overlap && !result.settlement.paidPast && !result.settlement.futurePending, 'Settlement filter membership is wrong.', result);

    await page.goto(`${base}/dashboard/frontdesk/groups_companies.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForSelector('.company-card', { timeout: 15000 });
    const firstCompanyCard = page.locator('.company-card').first();
    const cardBoxBeforeHover = await firstCompanyCard.boundingBox();
    await firstCompanyCard.hover();
    await page.waitForTimeout(250);
    const cardBoxAfterHover = await firstCompanyCard.boundingBox();
    const companyHoverResult = await firstCompanyCard.evaluate(el => ({
      transform: getComputedStyle(el).transform,
      transitionProperty: getComputedStyle(el).transitionProperty,
      role: el.getAttribute('role') || '',
      tabIndexAttr: el.getAttribute('tabindex') || '',
      inlineCursor: el.getAttribute('style') || '',
      childTransforms: Array.from(el.querySelectorAll('button')).map(button => ({
        className: button.className,
        transform: getComputedStyle(button).transform,
        transitionProperty: getComputedStyle(button).transitionProperty,
        transitionDuration: getComputedStyle(button).transitionDuration
      }))
    }));
    await firstCompanyCard.locator('.btn-room-assign').first().hover();
    await page.waitForTimeout(250);
    const cardBoxAfterButtonHover = await firstCompanyCard.boundingBox();
    const stableBox = (a, b) => !!a && !!b && ['x', 'y', 'width', 'height'].every(key => Math.abs(a[key] - b[key]) < 0.5);
    const visualStyleKeys = [
      'backgroundColor',
      'color',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'boxShadow',
      'outlineStyle'
    ];
    const readButtonStyle = (index) => firstCompanyCard.locator('button').nth(index).evaluate((button, keys) => {
      const style = getComputedStyle(button);
      return Object.fromEntries(keys.map(key => [key, style[key]]));
    }, visualStyleKeys);
    const buttonHoverStyles = [];
    const buttonCount = await firstCompanyCard.locator('button').count();
    for (let index = 0; index < buttonCount; index += 1) {
      const before = await readButtonStyle(index);
      await firstCompanyCard.locator('button').nth(index).hover();
      await page.waitForTimeout(100);
      const after = await readButtonStyle(index);
      buttonHoverStyles.push({ index, before, after });
    }

    assert(
      companyHoverResult.transform === 'none' || companyHoverResult.transform === 'matrix(1, 0, 0, 1, 0, 0)',
      'Company cards must not move on hover because it can cause pointer jitter near card edges.',
      companyHoverResult
    );
    assert(!companyHoverResult.transitionProperty.split(',').map(item => item.trim()).includes('transform'), 'Company card transition must not animate transform.', companyHoverResult);
    assert(companyHoverResult.transitionProperty === 'none', 'Company card hover must not animate because it can flicker inside nested controls.', companyHoverResult);
    assert(!companyHoverResult.role && !companyHoverResult.tabIndexAttr && !companyHoverResult.inlineCursor.includes('cursor:pointer'), 'Company card itself must not be a nested clickable parent around buttons.', companyHoverResult);
    assert(companyHoverResult.childTransforms.every(item => item.transform === 'none' || item.transform === 'matrix(1, 0, 0, 1, 0, 0)'), 'Company card buttons must not move on hover or active states.', companyHoverResult);
    assert(companyHoverResult.childTransforms.every(item => item.transitionProperty === 'none' && item.transitionDuration === '0s'), 'Company card buttons must use stable, non-animated hover styles.', companyHoverResult);
    assert(stableBox(cardBoxBeforeHover, cardBoxAfterHover) && stableBox(cardBoxBeforeHover, cardBoxAfterButtonHover), 'Company card bounding box must stay stable across card and button hover.', { cardBoxBeforeHover, cardBoxAfterHover, cardBoxAfterButtonHover });
    assert(buttonHoverStyles.every(item => JSON.stringify(item.before) === JSON.stringify(item.after)), 'Company card action buttons must not visually flicker on hover.', buttonHoverStyles);

    await page.getByRole('button', { name: /신규 단체 등록/ }).click();
    await page.locator('#compName').fill('P1 Save Regression');
    await page.locator('#compCode').fill('P1-COMP-REGRESSION');
    await page.locator('#compType').selectOption('Travel Agency');
    await page.locator('#compContactName').fill('P1 Manager');
    await page.locator('#compGroupDiscount').fill('10');
    await page.locator('#companyModal .modal-footer button').filter({ hasText: '저장' }).click();
    const regressionCard = page.locator('.company-card').filter({ hasText: 'P1 Save Regression' });
    await regressionCard.waitFor({ state: 'visible', timeout: 5000 });
    assert((await regressionCard.textContent()).includes('P1-COMP-REGRESSION'), 'Entered company code must be persisted and displayed.');
    assert((await regressionCard.textContent()).includes('10%'), 'Entered company discount must be persisted and displayed.');
    await regressionCard.locator('[data-company-action="edit"]').click();
    await page.locator('#compContactName').fill('P1 Manager Updated');
    await page.locator('#companyModal .modal-footer button').filter({ hasText: '저장' }).click();
    await page.waitForFunction(() => document.querySelector('.company-card')?.ownerDocument.body.textContent.includes('P1 Manager Updated'), null, { timeout: 5000 });
    assert((await regressionCard.textContent()).includes('P1 Manager Updated'), 'Company edits must remain after asynchronous persistence completes.');

    await firstCompanyCard.locator('[data-company-action="edit"]').first().click();
    await page.waitForFunction(() => document.getElementById('companyModal')?.classList.contains('active'), null, { timeout: 5000 });
    const editActionResult = await page.evaluate(() => ({
      modalActive: document.getElementById('companyModal')?.classList.contains('active') || false,
      companyId: document.getElementById('compId')?.value || '',
      title: document.getElementById('compModalTitle')?.textContent || ''
    }));
    assert(editActionResult.modalActive && editActionResult.companyId, 'Company edit button must open the edit modal with the company loaded.', editActionResult);
    await page.evaluate(() => closeModal('companyModal'));

    await firstCompanyCard.locator('[data-company-action="performance"]').first().click();
    await page.waitForFunction(() => document.getElementById('companyPerformanceModal')?.classList.contains('active'), null, { timeout: 7000 });
    const performanceQueryResult = await page.evaluate(async () => {
      const originalRefresh = window.refreshCompanyPerformanceModal;
      let refreshCalls = 0;
      window.refreshCompanyPerformanceModal = async function(...args) {
        refreshCalls += 1;
        return originalRefresh.apply(this, args);
      };

      const period = document.getElementById('performancePeriodSelect');
      const start = document.getElementById('performanceStartDate');
      const end = document.getElementById('performanceEndDate');
      period.value = 'year';
      period.dispatchEvent(new Event('change', { bubbles: true }));
      const afterPeriodChange = refreshCalls;
      const yearStart = start.value;
      const yearEnd = end.value;

      start.dispatchEvent(new Event('change', { bubbles: true }));
      end.dispatchEvent(new Event('change', { bubbles: true }));
      const afterDateChanges = refreshCalls;

      document.querySelector('#companyPerformanceModal .company-performance-toolbar .btn-primary-sm')?.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      const afterSearch = refreshCalls;
      const rangeLabel = document.getElementById('performanceRangeLabel')?.textContent.trim() || '';

      window.refreshCompanyPerformanceModal = originalRefresh;
      closeModal('companyPerformanceModal');
      return { afterPeriodChange, afterDateChanges, afterSearch, yearStart, yearEnd, rangeLabel };
    });
    const yearEndDate = new Date(`${performanceQueryResult.yearEnd}T00:00:00`);
    const expectedYearStart = new Date(yearEndDate);
    expectedYearStart.setFullYear(expectedYearStart.getFullYear() - 1);
    const expectedYearStartIso = `${expectedYearStart.getFullYear()}-${String(expectedYearStart.getMonth() + 1).padStart(2, '0')}-${String(expectedYearStart.getDate()).padStart(2, '0')}`;
    assert(performanceQueryResult.afterPeriodChange === 0 && performanceQueryResult.afterDateChanges === 0, 'Changing group usage period inputs must not run a query before Search is pressed.', performanceQueryResult);
    assert(performanceQueryResult.afterSearch === 1, 'Group usage stats must run exactly once when Search is pressed.', performanceQueryResult);
    assert(performanceQueryResult.yearStart === expectedYearStartIso && /^\d{4}-\d{2}-\d{2}$/.test(performanceQueryResult.yearEnd), 'Recent one-year selection must populate explicit start and end dates.', performanceQueryResult);
    assert(performanceQueryResult.rangeLabel === `${performanceQueryResult.yearStart} ~ ${performanceQueryResult.yearEnd}`, 'Group usage summary must show the applied start and end dates.', performanceQueryResult);

    await firstCompanyCard.locator('[data-company-action="create"]').first().click();
    await page.waitForURL(/groups_block_detail\.html\?mode=new&companyId=/, { timeout: 7000 });
    assert(page.url().includes('groups_block_detail.html?mode=new&companyId='), 'Company event creation button must navigate to new event detail with companyId.', { url: page.url() });

    await page.evaluate(() => {
      localStorage.removeItem('pms_companies');
      localStorage.removeItem('mockapi:v1:TENANT-GRAND-SAIGON:companies');
    });
    await page.goto(`${base}/dashboard/frontdesk/groups_block_detail.html?id=GRP-260604-01`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => {
      const hidden = document.getElementById('detailAgencyId');
      let storedIds = [];
      try { storedIds = JSON.parse(localStorage.getItem('pms_companies') || '[]').map(company => company.id); } catch (e) {}
      return !!hidden && !!document.getElementById('detailAgencySearch') && hidden.value === 'COMP-1002' && storedIds.includes('COMP-1002');
    }, null, { timeout: 15000 });

    const hydratedCompanyResult = await page.evaluate(() => {
      const hidden = document.getElementById('detailAgencyId');
      const search = document.getElementById('detailAgencySearch');
      let stored = [];
      try { stored = JSON.parse(localStorage.getItem('pms_companies') || '[]'); } catch (e) {}
      return {
        value: hidden?.value || '',
        searchValue: search?.value || '',
        storedCompanyIds: stored.map(company => company.id),
        agencyId: group?.agencyId || '',
        agency: group?.agency || '',
        eventDiscountValue: document.getElementById('detailEventDiscount')?.value || '',
        storedCount: stored.length,
        pickerText: document.getElementById('detailCompanyPicker')?.innerText || '',
        overviewText: document.getElementById('overview')?.innerText || ''
      };
    });

    assert(hydratedCompanyResult.storedCount >= 3, 'Group detail must hydrate registered companies from API data.', hydratedCompanyResult);
    assert(hydratedCompanyResult.storedCompanyIds.includes('COMP-1002'), 'Group detail company picker must hydrate Hana Tour company data.', hydratedCompanyResult);
    assert(hydratedCompanyResult.value === 'COMP-1002' && hydratedCompanyResult.agencyId === 'COMP-1002', 'Group detail must auto-select the event company linkage.', hydratedCompanyResult);
    assert(hydratedCompanyResult.searchValue.includes('Hana Tour') || hydratedCompanyResult.pickerText.includes('Hana Tour'), 'Group detail must show the selected company in the searchable picker.', hydratedCompanyResult);
    assert(Number(hydratedCompanyResult.eventDiscountValue) === 15, 'Group detail must show the event-specific discount, not only the company baseline.', hydratedCompanyResult);
    assert(hydratedCompanyResult.overviewText.includes('단체 기준 할인') && hydratedCompanyResult.overviewText.includes('행사 적용 할인'), 'Group detail must distinguish group baseline discount from event discount.', hydratedCompanyResult);

    await page.goto(`${base}/dashboard/frontdesk/groups_block_detail.html?mode=new`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => typeof window.renderRooms === 'function', null, { timeout: 15000 });

    const companySelectionResult = await page.evaluate(async () => {
      const companies = [{
        id: 'COMP-HANA',
        name: 'Hana Tour',
        type: 'Travel Agency',
        groupDiscount: 10,
        billing: 'Master Folio (단체 일괄)',
        contactName: 'Kim Manager',
        phone: '010-1000-2000'
      }];
      localStorage.setItem('pms_companies', JSON.stringify(companies));
      group = createDraftGroup();
      renderOverview();
      const manualExists = !!document.getElementById('detailAgencyManual');
      const pickerExists = !!document.getElementById('detailCompanyPicker') && !!document.getElementById('detailAgencySearch');
      const initialText = document.getElementById('overview')?.innerText || '';
      document.getElementById('detailName').value = 'No Company Event';
      document.getElementById('detailAgencyId').value = '';
      saveBasicInfo();
      const blockedWithoutCompany = !group.id && !group.agencyId;
      selectDetailCompany('COMP-HANA');
      document.getElementById('detailName').value = 'Hana Linked Event';
      document.getElementById('detailCheckin').value = '2026-06-10';
      document.getElementById('detailCheckout').value = '2026-06-12';
      document.getElementById('detailEventDiscount').value = '18';
      saveBasicInfo();
      switchTabById('rooms');
      addDetailAllocationRow();
      const newAllocationDiscount = document.querySelector('.detail-discount')?.value || '';
      const companyInfoText = document.getElementById('detailCompanyInfo')?.innerText || '';
      const savedAgencyId = group.agencyId;
      const savedAgency = group.agency;
      const savedEventDiscount = group.eventDiscountPercent;
      openDetailCompanyModal('Nguyen Family Group');
      document.getElementById('detailCompanyName').value = 'Nguyen Family Group';
      document.getElementById('detailCompanyType').value = 'Individual';
      document.getElementById('detailCompanyContactName').value = 'Nguyen Thi Lan';
      document.getElementById('detailCompanyPhone').value = '+84 90 222 1144';
      document.getElementById('detailCompanyDiscount').value = '12';
      await saveDetailCompany();
      const newCompanyId = document.getElementById('detailAgencyId')?.value || '';
      const storedAfterNew = JSON.parse(localStorage.getItem('pms_companies') || '[]');
      return {
        manualExists,
        pickerExists,
        initialText,
        blockedWithoutCompany,
        savedAgencyId,
        savedAgency,
        savedEventDiscount,
        newAllocationDiscount,
        companyInfoText,
        newCompanyId,
        newCompanyCreated: storedAfterNew.some(company => company.id === newCompanyId && company.name === 'Nguyen Family Group'),
        newCompanySearchValue: document.getElementById('detailAgencySearch')?.value || ''
      };
    });

    assert(!companySelectionResult.manualExists, 'Group detail must not expose manual company input.', companySelectionResult);
    assert(companySelectionResult.pickerExists, 'Group detail must use searchable company picker controls.', companySelectionResult);
    assert(!/직접 입력|미지정/.test(companySelectionResult.initialText), 'Group detail must not show direct/unassigned company options.', companySelectionResult);
    assert(companySelectionResult.blockedWithoutCompany, 'Group detail must block saving without a registered company.', companySelectionResult);
    assert(companySelectionResult.savedAgencyId === 'COMP-HANA' && companySelectionResult.savedAgency === 'Hana Tour', 'Group detail must save the selected company linkage.', companySelectionResult);
    assert(Number(companySelectionResult.savedEventDiscount) === 18, 'Group detail must save event-specific discount separately from the company baseline.', companySelectionResult);
    assert(Number(companySelectionResult.newAllocationDiscount) === 18, 'New room allocation rows must use the event-specific discount by default.', companySelectionResult);
    assert((companySelectionResult.companyInfoText.includes('Travel Agency') || companySelectionResult.companyInfoText.includes('여행사 단체')) && companySelectionResult.companyInfoText.includes('10'), 'Group detail must show selected company metadata.', companySelectionResult);
    assert(companySelectionResult.newCompanyCreated && companySelectionResult.newCompanySearchValue.includes('Nguyen Family Group'), 'Group detail must create a new company from the picker modal and select it immediately.', companySelectionResult);

    const detailResult = await page.evaluate(() => {
      group.id = 'GRP-EMPTY-ALIGN';
      group.name = 'Empty Align Event';
      group.roomAllocations = [];
      group.allocations = [];
      group.roomingList = [];
      window.renderRooms();
      window.renderRooming();
      const roomsTab = Array.from(document.querySelectorAll('.local-tab')).find(button => (button.getAttribute('onclick') || '').includes("'rooms'"));
      const roomingTab = Array.from(document.querySelectorAll('.local-tab')).find(button => (button.getAttribute('onclick') || '').includes("'rooming'"));
      if (typeof switchTab === 'function') switchTab('rooms', roomsTab);
      const roomsPanel = document.getElementById('rooms');
      const editor = roomsPanel?.querySelector('#detailAllocationEditor');
      const duplicateTable = roomsPanel?.querySelector('.room-assignment-table');
      return {
        roomsTabText: roomsTab?.textContent.trim() || '',
        roomingTabText: roomingTab?.textContent.trim() || '',
        roomingTabVisible: !!roomingTab && getComputedStyle(roomingTab).display !== 'none',
        roomsPanelText: roomsPanel?.textContent || '',
        editorVisible: !!editor && editor.getBoundingClientRect().width > 0,
        duplicateTableExists: !!duplicateTable
      };
    });

    assert(detailResult.editorVisible, 'Group detail room allocation editor must remain visible.', detailResult);
    assert(!detailResult.duplicateTableExists, 'Group detail room allocation tab must not duplicate selected rooms in a second table.', detailResult);
    assert(detailResult.roomsTabText === '객실 배정', 'Group detail rooms tab must only represent room allocation.', detailResult);
    assert(detailResult.roomingTabText === '투숙객 명단' && detailResult.roomingTabVisible, 'Group detail rooming tab must be visible as a separate guest list.', detailResult);
    assert(!detailResult.roomsPanelText.includes('투숙객 등록'), 'Room allocation tab must not include guest registration actions.', detailResult);

    const overlapGuardResult = await page.evaluate(async () => {
      const conflictRoom = (rooms || []).map(room => roomId(room)).find(Boolean) || '';
      group.id = 'GRP-OVERLAP-GUARD';
      group.name = 'Overlap Guard Event';
      group.checkin = '2026-06-10';
      group.checkout = '2026-06-12';
      group.roomAllocations = [];
      group.allocations = [];
      group.roomingList = [];
      reservations = [{
        id: 'RSV-EXISTING-CONFLICT',
        groupId: 'GRP-OTHER-EVENT',
        room: conflictRoom,
        checkInDate: '2026-06-09',
        checkOutDate: '2026-06-13',
        status: 'in-house'
      }];
      window.reservations = reservations;
      window.renderRooms();
      window.addDetailAllocationRow();
      const row = document.querySelector('.allocation-editor-row');
      const select = row?.querySelector('.detail-room');
      const conflictOption = Array.from(select?.options || []).find(option => option.value === conflictRoom);
      const disabledInPicker = !!conflictOption?.disabled;
      if (conflictOption && select) {
        conflictOption.disabled = false;
        select.value = conflictRoom;
      }
      await window.saveRoomAllocationsFromDetail();
      const blockedOnSave = !group.roomAllocations.length;
      reservations = [];
      window.reservations = reservations;
      return { conflictRoom, disabledInPicker, blockedOnSave };
    });

    assert(overlapGuardResult.conflictRoom, 'Overlap guard regression requires at least one room fixture.', overlapGuardResult);
    assert(overlapGuardResult.disabledInPicker, 'Rooms with overlapping reservations must be disabled in the group allocation picker.', overlapGuardResult);
    assert(overlapGuardResult.blockedOnSave, 'Overlapping room assignments must be rejected again at save time.', overlapGuardResult);

    const roomMoveResult = await page.evaluate(async () => {
      const roomValues = (rooms || []).map(room => roomId(room)).filter(Boolean);
      const originalMoveRoom = roomValues.find(value => /1222|0802|1402/.test(value)) || roomValues[0] || '';
      const originalStayRoom = roomValues.find(value => value !== originalMoveRoom && /1225|0803|1403/.test(value)) || roomValues.find(value => value !== originalMoveRoom) || '';
      const replacementCandidate = roomValues.find(value => value && value !== originalMoveRoom && value !== originalStayRoom) || '';
      group.id = 'GRP-ROOM-MOVE';
      group.name = 'Room Move Event';
      group.pax = 2;
      group.roomAllocations = [
        { roomId: originalMoveRoom, roomLabel: originalMoveRoom, type: 'Deluxe', rate: 140, baseRate: 140, discountPercent: 0 },
        { roomId: originalStayRoom, roomLabel: originalStayRoom, type: 'Deluxe', rate: 140, baseRate: 140, discountPercent: 0 }
      ];
      group.allocations = group.roomAllocations.slice();
      group.roomingList = [
        { id: 'MOVE-GUEST-1', guestId: 'MOVE-GUEST-1', groupId: group.id, roomId: originalMoveRoom, role: 'primary', name: 'Move Primary', docStatus: 'pending' },
        { id: 'MOVE-GUEST-2', guestId: 'MOVE-GUEST-2', groupId: group.id, roomId: originalStayRoom, role: 'primary', name: 'Stay Primary', docStatus: 'pending' }
      ];
      window.renderRooms();
      const targetRow = Array.from(document.querySelectorAll('.allocation-editor-row')).find(row => row.dataset.originalRoomId === originalMoveRoom);
      const select = targetRow?.querySelector('.detail-room');
      const replacementRoom = Array.from(select?.options || []).map(option => option.value).find(value => value === replacementCandidate) ||
        Array.from(select?.options || []).map(option => option.value).find(value => value && value !== originalMoveRoom && value !== originalStayRoom) || '';
      if (select) {
        select.value = replacementRoom;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await saveRoomAllocationsFromDetail();
      window.renderRooming();
      const moved = roomingList().find(guest => guest.id === 'MOVE-GUEST-1');
      const stayed = roomingList().find(guest => guest.id === 'MOVE-GUEST-2');
      const panelText = document.getElementById('rooming')?.innerText || '';
      return {
        targetRowFound: !!targetRow,
        originalMoveRoom,
        originalStayRoom,
        replacementRoom,
        movedRoom: moved?.roomId || '',
        stayedRoom: stayed?.roomId || '',
        allocationRooms: group.roomAllocations.map(item => item.roomId),
        panelText,
        unassignedMoveDuplicate: panelText.includes(`Move Primary · ${originalMoveRoom}`) || panelText.includes(`Move Primary 쨌 ${originalMoveRoom}`)
      };
    });

    assert(roomMoveResult.targetRowFound, 'Room allocation editor must preserve original room identity per row.', roomMoveResult);
    assert(!!roomMoveResult.replacementRoom, 'Room allocation editor must offer an available replacement room.', roomMoveResult);
    assert(roomMoveResult.movedRoom === roomMoveResult.replacementRoom, 'Changing an assigned room must move existing rooming guests to the new room.', roomMoveResult);
    assert(roomMoveResult.stayedRoom === roomMoveResult.originalStayRoom, 'Changing one assigned room must not move guests from other room rows.', roomMoveResult);
    assert(roomMoveResult.allocationRooms.includes(roomMoveResult.replacementRoom) && !roomMoveResult.allocationRooms.includes(roomMoveResult.originalMoveRoom), 'Room allocation must save the changed room id.', roomMoveResult);
    assert(!roomMoveResult.unassignedMoveDuplicate, 'Moved rooming guest must not remain as an unassigned duplicate after room allocation change.', roomMoveResult);

    const timelineSyncResult = await page.evaluate(async () => {
      const timelineGroup = {
        id: 'GRP-TIMELINE-SYNC',
        name: 'Timeline Sync Event',
        agency: 'Timeline Company',
        checkin: '2026-08-20',
        checkout: '2026-08-22',
        currency: 'PHP',
        roomAllocations: [{
          roomId: '0802',
          roomLabel: 'FT 0802',
          type: 'Standard',
          baseRate: 100,
          discountPercent: 10,
          rate: 90
        }],
        roomingList: [{
          id: 'G-TIMELINE-SYNC',
          guestId: 'G-TIMELINE-SYNC',
          roomId: '0802',
          role: 'primary',
          name: 'Timeline Primary'
        }]
      };
      localStorage.setItem('pms_groups', JSON.stringify([timelineGroup]));
      localStorage.setItem('pms_reservations', JSON.stringify([]));
      const timelineRows = await window.PmsAPI.getTimelineReservations();
      const synced = timelineRows.find(item => item.groupId === timelineGroup.id && item.room === '0802');
      return {
        found: !!synced,
        guest: synced?.guest || '',
        groupName: synced?.groupName || '',
        cin: synced?.cin || '',
        cout: synced?.cout || '',
        rate: Number(synced?.rate?.amount || 0)
      };
    });

    assert(timelineSyncResult.found, 'Timeline reservations must include persisted group room allocations.', timelineSyncResult);
    assert(timelineSyncResult.guest === 'Timeline Primary', 'Timeline group reservation must include the persisted primary guest.', timelineSyncResult);
    assert(timelineSyncResult.groupName === 'Timeline Sync Event', 'Timeline group reservation must preserve the event name.', timelineSyncResult);
    assert(timelineSyncResult.cin === '8/20' && timelineSyncResult.cout === '8/22', 'Timeline group reservation must preserve the event dates.', timelineSyncResult);
    assert(timelineSyncResult.rate === 90, 'Timeline group reservation must preserve the discounted room rate.', timelineSyncResult);
    assert(consoleIssues.length === 0, 'Console warnings/errors during group event regression.', consoleIssues);

    console.log(JSON.stringify({
      ok: true,
      checks: [
        'past and settlement-needed filters can overlap',
        'group list search and filter controls use guest-list spacing',
        'past count includes paid and unsettled past events',
        'settlement-needed count excludes paid past and future pending events',
        'company card hover does not move the pointer hit area',
        'company card action buttons remain clickable',
        'company code, discount, and async edits persist',
        'group usage period inputs wait for Search and expose an explicit one-year date range',
        'group detail hydrates company data for existing events',
        'group detail separates company baseline and event discount',
        'group detail requires registered company selection',
        'group detail rejects overlapping room assignments in picker and save validation',
        'timeline merges persisted group rooms and rooming guests into reservations',
        'timeline tooltip lists each rooming guest once',
        'group usage stats expose Other as a dedicated totalled column',
        'group detail avoids duplicate selected-room summary in allocation tab',
        'group detail splits room allocation and rooming list tabs'
      ]
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      error: error.message,
      stack: error.stack || null,
      url: page.url(),
      details: error.details || null,
      consoleIssues
    }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server) server.close();
  }
})();
