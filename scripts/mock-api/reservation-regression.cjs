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

function countValues(values) {
  return values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

(async () => {
  let base = DEFAULT_BASE;
  let server = null;
  if (!(await httpOk(`${base}/dashboard/frontdesk/reservation-list.html`))) {
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
    });

    await page.goto(`${base}/dashboard/frontdesk/reservation-list.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => typeof renderTable === 'function' && typeof openUnifiedResModal === 'function', null, { timeout: 15000 });

    const koList = await page.evaluate(() => {
      currentLang = 'ko';
      window.currentLang = 'ko';
      reservations = [
        { id: 'RSV-001', room: '1201', type: 'Deluxe', channel: 'Direct', guest: 'Kim One', cin: '6/8', cout: '6/9', nights: 1, status: 'confirmed', amount: 100 },
        { id: 'RSV-002', room: '1202', type: 'Deluxe', channel: 'OTA', guest: 'Lee Two', cin: '6/8', cout: '6/9', nights: 1, status: 'confirmed', amount: 100 },
        { id: 'RSV-003', room: '1203', type: 'Deluxe', channel: 'Agoda', guest: 'Park Three', groupId: 'GRP-1', groupName: 'Conference A', cin: '6/8', cout: '6/9', nights: 1, status: 'confirmed', amount: 100 }
      ];
      currentPeriodFilter = 'all';
      currentFilter = 'all';
      currentPage = 1;
      document.getElementById('searchInput').value = '';
      renderTable();
      const tableText = document.querySelector('#resTable')?.innerText || '';
      const mobileText = document.querySelector('#resMobileCards')?.innerText || '';
      const desktopBadges = Array.from(document.querySelectorAll('#resBody .reservation-kind-tag')).map(el => el.innerText.trim());
      const mobileBadges = Array.from(document.querySelectorAll('#resMobileCards .reservation-kind-tag')).map(el => el.innerText.trim());
      document.getElementById('searchInput').value = 'OTA';
      renderTable();
      return {
        headers: Array.from(document.querySelectorAll('#resTable thead th')).map(th => th.innerText.trim()),
        desktopBadges,
        mobileBadges,
        channelLeaks: ['Direct', 'OTA', 'Agoda', 'Booking.com', 'Walk-in', 'Channel', '채널', '직접', '방문'].filter(word => tableText.includes(word) || mobileText.includes(word)),
        otaSearchText: document.querySelector('#resBody')?.innerText || ''
      };
    });

    assert(koList.headers.includes('구분'), 'Reservation list must show 구분 header in Korean.', koList.headers);
    assert(!koList.headers.includes('채널'), 'Reservation list must not show 채널 header.', koList.headers);
    assert(koList.channelLeaks.length === 0, 'Reservation list leaked channel labels.', koList.channelLeaks);
    assert(!koList.otaSearchText.includes('RSV-002'), 'Reservation search must not match hidden channel values.');
    assert(JSON.stringify(countValues(koList.desktopBadges)) === JSON.stringify({ '단체': 1, '개인': 2 }), 'Desktop reservation kind badges are wrong.', koList.desktopBadges);
    assert(JSON.stringify(countValues(koList.mobileBadges)) === JSON.stringify({ '단체': 1, '개인': 2 }), 'Mobile reservation kind badges are wrong.', koList.mobileBadges);

    const enList = await page.evaluate(() => {
      document.getElementById('searchInput').value = '';
      changeLang('en');
      renderTable();
      return {
        headers: Array.from(document.querySelectorAll('#resTable thead th')).map(th => th.innerText.trim()),
        badges: Array.from(document.querySelectorAll('#resBody .reservation-kind-tag')).map(el => el.innerText.trim())
      };
    });

    const enHeaders = enList.headers.map(header => header.toLowerCase());
    assert(enHeaders.includes('guest type'), 'Reservation list must show Guest Type header in English.', enList.headers);
    assert(!enHeaders.includes('channel'), 'Reservation list must not show Channel header in English.', enList.headers);
    assert(JSON.stringify(countValues(enList.badges)) === JSON.stringify({ Group: 1, Individual: 2 }), 'English reservation kind badges are wrong.', enList.badges);

    const modalResult = await page.evaluate(async () => {
      currentLang = 'ko';
      window.currentLang = 'ko';
      window.rooms = [{ id: 'T-901', number: '901', fullRoom: 'T-901', type: 'Standard', building: 'Test Tower', status: 'vacant-clean', housekeepingStatus: 'clean', frontStatus: 'vacant' }];
      window.reservations = [];
      reservations = window.reservations;
      window.PmsMockApi = { request: async () => ({ data: { items: [] } }), items: () => [], toLegacyGroup: item => item };
      await openUnifiedResModal();
      const statusEl = document.getElementById('unifiedStatus');
      const statusSelectExists = !!document.querySelector('#unifiedResModal select#unifiedStatus');
      const groupCheckboxExists = !!document.getElementById('unifiedIsB2B');
      const groupSelectExists = !!document.getElementById('unifiedGroupSelect');
      const initialActionBarDisplay = getComputedStyle(document.getElementById('unifiedGuestCandidateActions')).display;
      await window._editGuestWidget.showNewForm();
      const newFormActionBarDisplay = getComputedStyle(document.getElementById('unifiedGuestCandidateActions')).display;
      document.getElementById('nrGuestEdit').value = 'Direct Test Guest';
      document.getElementById('nrPhoneEdit').value = '+84 90 000 0901';
      document.getElementById('unifiedRoom').value = 'T-901';
      await saveUnifiedRes();
      return {
        statusType: statusEl?.getAttribute('type') || null,
        statusVisible: statusEl ? !!(statusEl.offsetWidth || statusEl.offsetHeight || statusEl.getClientRects().length) : null,
        statusSelectExists,
        groupCheckboxExists,
        groupSelectExists,
        initialActionBarDisplay,
        newFormActionBarDisplay,
        created: window.reservations[0]
      };
    });

    assert(modalResult.statusType === 'hidden' && modalResult.statusVisible === false, 'Reservation status must be hidden in the modal.', modalResult);
    assert(!modalResult.statusSelectExists, 'Reservation modal must not expose a status select.', modalResult);
    assert(!modalResult.groupCheckboxExists && !modalResult.groupSelectExists, 'Reservation modal must not expose group conversion controls.', modalResult);
    assert(modalResult.initialActionBarDisplay === 'none', 'New reservation must keep representative/companion action buttons hidden before a guest candidate is active.', modalResult);
    assert(modalResult.newFormActionBarDisplay === 'flex', 'New reservation must show representative/companion action buttons after opening a guest candidate form.', modalResult);
    assert(modalResult.created?.status === 'confirmed', 'New reservation must default to confirmed.', modalResult.created);
    assert(!modalResult.created?.groupId && modalResult.created?.isB2B === false, 'New reservation must default to individual.', modalResult.created);

    const editSearchState = await page.evaluate(async () => {
      window.rooms = [{ id: 'T-902', number: '902', fullRoom: 'T-902', type: 'Standard', building: 'Test Tower', status: 'vacant-clean', housekeepingStatus: 'clean', frontStatus: 'vacant' }];
      window.reservations = [{
        id: 'RSV-DETAIL',
        room: 'T-902',
        fullRoom: 'T-902',
        type: 'Standard',
        status: 'confirmed',
        guest: 'Alexander Kim',
        guestName: 'Alexander Kim',
        roomingGuestName: 'Alexander Kim',
        guestId: 'G-DETAIL',
        roomingGuestId: 'G-DETAIL',
        phone: '+82 10 9900 1401',
        email: 'alexander.kim@example.com',
        cin: '6/8',
        cout: '6/9',
        checkin: '2026-06-08',
        checkout: '2026-06-09',
        checkInDate: '2026-06-08',
        checkOutDate: '2026-06-09',
        nights: 1,
        len: 1
      }];
      reservations = window.reservations;
      await openUnifiedResModal('RSV-DETAIL');
      return {
        selectedCardDisplay: getComputedStyle(document.getElementById('selectedGuestCardEdit')).display,
        searchResultsDisplay: getComputedStyle(document.getElementById('guestSearchResultsEdit')).display,
        actionBarDisplay: getComputedStyle(document.getElementById('unifiedGuestCandidateActions')).display,
        rosterText: document.getElementById('unifiedStayGuestList')?.innerText || '',
        privacyText: document.getElementById('unifiedGuestPrivacyBody')?.innerText || ''
      };
    });

    assert(editSearchState.selectedCardDisplay === 'none', 'Edit detail must not show the selected guest search card until a search result is chosen.', editSearchState);
    assert(editSearchState.searchResultsDisplay === 'none', 'Edit detail must keep guest search results hidden until searching.', editSearchState);
    assert(editSearchState.actionBarDisplay === 'none', 'Edit detail must keep representative/companion action buttons hidden until a guest candidate is active.', editSearchState);
    assert(editSearchState.rosterText.includes('Alexander Kim'), 'Edit detail must still show the reservation guest roster.', editSearchState);
    assert(editSearchState.privacyText.includes('Alexander Kim'), 'Edit detail must still show guest detail information below.', editSearchState);

    const blockResult = await page.evaluate(async () => {
      window.reservations = [{
        id: 'BLK-901',
        room: 'T-901',
        fullRoom: 'T-901',
        type: 'Standard',
        status: 'confirmed',
        isGroupPlaceholder: true,
        guest: 'Preserved Block Name',
        groupId: 'GRP-1',
        groupName: 'Test Group',
        channel: 'Agoda',
        cin: '6/8',
        cout: '6/9',
        checkin: '2026-06-08',
        checkout: '2026-06-09',
        checkInDate: '2026-06-08',
        checkOutDate: '2026-06-09',
        nights: 1,
        len: 1
      }];
      reservations = window.reservations;
      await openUnifiedResModal('BLK-901');
      const before = {
        hiddenStatus: document.getElementById('unifiedStatus')?.value,
        guestSectionDisplay: getComputedStyle(document.getElementById('unifiedGuestSection')).display,
        blockNoticeDisplay: getComputedStyle(document.getElementById('unifiedBlockNotice')).display
      };
      await saveUnifiedRes();
      return { before, after: window.reservations[0] };
    });

    assert(blockResult.before.hiddenStatus === 'blocked', 'Group block modal must keep blocked status internally.', blockResult);
    assert(blockResult.before.guestSectionDisplay === 'block', 'Group block modal must allow guest entry from the timeline.', blockResult);
    assert(blockResult.before.blockNoticeDisplay === 'block', 'Group block modal must show block notice.', blockResult);
    assert(blockResult.after.status === 'blocked', 'Saving a group block must preserve blocked status.', blockResult.after);
    assert(blockResult.after.guest === 'Preserved Block Name', 'Saving a group block must preserve the existing guest/group label.', blockResult.after);

    assert(consoleIssues.length === 0, 'Console warnings/errors during reservation regression.', consoleIssues);

    console.log(JSON.stringify({
      ok: true,
      checks: [
        'reservation list uses personal/group only',
        'channel labels do not render or search',
        'Korean/English headers stay consistent',
        'new reservation has no manual status/group conversion controls',
        'edit detail keeps guest search idle until user searches',
        'representative/companion buttons only show for active guest candidates',
        'group block timeline modal allows guest entry without forcing conversion'
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
