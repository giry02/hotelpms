const fs = require('fs');
const http = require('http');
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
    const req = http.get(url, res => {
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

  page.on('console', msg => {
    if (!['error', 'warning'].includes(msg.type())) return;
    const text = msg.text();
    if (/ERR_NETWORK_ACCESS_DENIED|Failed to load resource|favicon|googleapis|gstatic|cdnjs|cdn\.jsdelivr/i.test(text)) return;
    consoleIssues.push(`${msg.type()}: ${text}`);
  });
  page.on('pageerror', err => consoleIssues.push(`pageerror: ${err.message}`));

  try {
    await page.addInitScript(() => {
      sessionStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('pms_lang', 'ko');
      localStorage.removeItem('pms_groups');
      localStorage.removeItem('pms_reservations');
      localStorage.removeItem('pms_companies');
    });

    await page.goto(`${base}/dashboard/frontdesk/groups_blocks.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => typeof window.renderGroups === 'function' && typeof window.filterGroups === 'function', null, { timeout: 15000 });

    const result = await page.evaluate(() => {
      const fmt = (date) => date.toISOString().slice(0, 10);
      const now = new Date();
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

    await page.evaluate(() => {
      localStorage.removeItem('pms_companies');
      localStorage.removeItem('mockapi:v1:TENANT-GRAND-SAIGON:companies');
    });
    await page.goto(`${base}/dashboard/frontdesk/groups_block_detail.html?id=GRP-260604-01`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => {
      const select = document.getElementById('detailAgencyId');
      return !!select && Array.from(select.options).some(option => option.value === 'COMP-1002');
    }, null, { timeout: 15000 });

    const hydratedCompanyResult = await page.evaluate(() => {
      const select = document.getElementById('detailAgencyId');
      const options = Array.from(select?.options || []).map(option => ({ value: option.value, text: option.textContent || '' }));
      let storedCount = 0;
      try { storedCount = JSON.parse(localStorage.getItem('pms_companies') || '[]').length; } catch (e) {}
      return {
        value: select?.value || '',
        optionValues: options.map(option => option.value),
        optionText: options.map(option => option.text).join(' | '),
        agencyId: group?.agencyId || '',
        agency: group?.agency || '',
        eventDiscountValue: document.getElementById('detailEventDiscount')?.value || '',
        storedCount,
        overviewText: document.getElementById('overview')?.innerText || ''
      };
    });

    assert(hydratedCompanyResult.storedCount >= 3, 'Group detail must hydrate registered companies from API data.', hydratedCompanyResult);
    assert(hydratedCompanyResult.optionValues.includes('COMP-1002'), 'Group detail company select must include Hana Tour company option.', hydratedCompanyResult);
    assert(hydratedCompanyResult.value === 'COMP-1002' && hydratedCompanyResult.agencyId === 'COMP-1002', 'Group detail must auto-select the event company linkage.', hydratedCompanyResult);
    assert(Number(hydratedCompanyResult.eventDiscountValue) === 15, 'Group detail must show the event-specific discount, not only the company baseline.', hydratedCompanyResult);
    assert(hydratedCompanyResult.overviewText.includes('업체 기준 할인') && hydratedCompanyResult.overviewText.includes('행사 적용 할인'), 'Group detail must distinguish company baseline discount from event discount.', hydratedCompanyResult);

    await page.goto(`${base}/dashboard/frontdesk/groups_block_detail.html?mode=new`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => typeof window.renderRooms === 'function', null, { timeout: 15000 });

    const companySelectionResult = await page.evaluate(() => {
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
      const initialText = document.getElementById('overview')?.innerText || '';
      document.getElementById('detailName').value = 'No Company Event';
      document.getElementById('detailAgencyId').value = '';
      saveBasicInfo();
      const blockedWithoutCompany = !group.id && !group.agencyId;
      document.getElementById('detailAgencyId').value = 'COMP-HANA';
      syncSelectedCompanyInfo();
      document.getElementById('detailName').value = 'Hana Linked Event';
      document.getElementById('detailCheckin').value = '2026-06-10';
      document.getElementById('detailCheckout').value = '2026-06-12';
      document.getElementById('detailEventDiscount').value = '18';
      saveBasicInfo();
      switchTabById('rooms');
      addDetailAllocationRow();
      const newAllocationDiscount = document.querySelector('.detail-discount')?.value || '';
      return {
        manualExists,
        initialText,
        blockedWithoutCompany,
        savedAgencyId: group.agencyId,
        savedAgency: group.agency,
        savedEventDiscount: group.eventDiscountPercent,
        newAllocationDiscount,
        companyInfoText: document.getElementById('detailCompanyInfo')?.innerText || ''
      };
    });

    assert(!companySelectionResult.manualExists, 'Group detail must not expose manual company input.', companySelectionResult);
    assert(!/직접 입력|미지정/.test(companySelectionResult.initialText), 'Group detail must not show direct/unassigned company options.', companySelectionResult);
    assert(companySelectionResult.blockedWithoutCompany, 'Group detail must block saving without a registered company.', companySelectionResult);
    assert(companySelectionResult.savedAgencyId === 'COMP-HANA' && companySelectionResult.savedAgency === 'Hana Tour', 'Group detail must save the selected company linkage.', companySelectionResult);
    assert(Number(companySelectionResult.savedEventDiscount) === 18, 'Group detail must save event-specific discount separately from the company baseline.', companySelectionResult);
    assert(Number(companySelectionResult.newAllocationDiscount) === 18, 'New room allocation rows must use the event-specific discount by default.', companySelectionResult);
    assert(companySelectionResult.companyInfoText.includes('Travel Agency') && companySelectionResult.companyInfoText.includes('10'), 'Group detail must show selected company metadata.', companySelectionResult);

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
    assert(consoleIssues.length === 0, 'Console warnings/errors during group event regression.', consoleIssues);

    console.log(JSON.stringify({
      ok: true,
      checks: [
        'past and settlement-needed filters can overlap',
        'past count includes paid and unsettled past events',
        'settlement-needed count excludes paid past and future pending events',
        'company card hover does not move the pointer hit area',
        'group detail hydrates company data for existing events',
        'group detail separates company baseline and event discount',
        'group detail requires registered company selection',
        'group detail avoids duplicate selected-room summary in allocation tab',
        'group detail splits room allocation and rooming list tabs'
      ]
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message, details: error.details || null, consoleIssues }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server) server.close();
  }
})();
