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
    assert(consoleIssues.length === 0, 'Console warnings/errors during group event regression.', consoleIssues);

    console.log(JSON.stringify({
      ok: true,
      checks: [
        'past and settlement-needed filters can overlap',
        'past count includes paid and unsettled past events',
        'settlement-needed count excludes paid past and future pending events'
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
