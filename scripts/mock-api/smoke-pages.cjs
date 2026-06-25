const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_BASE = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const PORT = Number(new URL(DEFAULT_BASE).port || 8765);

const pages = [
  '/dashboard/frontdesk/reservation-timeline.html',
  '/dashboard/frontdesk/groups_blocks.html',
  '/dashboard/frontdesk/groups_block_detail.html?id=GRP-260527-01',
  '/dashboard/frontdesk/reservation-list.html',
  '/dashboard/operations/rates.html',
  '/admin/tenants/list.html'
];

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

(async () => {
  let base = DEFAULT_BASE;
  let server = null;
  if (!(await httpOk(`${base}/dashboard/data/api/v1/rooms/index.json`))) {
    server = await serveStatic(PORT);
    if (!server) {
      server = await serveStatic(0);
      const address = server.address();
      base = `http://127.0.0.1:${address.port}`;
    }
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const pagePath of pages) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.addInitScript(() => {
        sessionStorage.setItem('admin_logged_in', 'true');
        localStorage.removeItem('mockapi:v1:TENANT-GRAND-SAIGON:reservations');
        localStorage.removeItem('mockapi:v1:TENANT-GRAND-SAIGON:groups-events');
      });

      const issues = [];
      page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error' && !/favicon|ERR_NETWORK_ACCESS_DENIED/i.test(text)) issues.push(`console: ${text}`);
      });
      page.on('response', response => {
        const url = response.url();
        if (url.startsWith(base) && response.status() >= 400 && !url.includes('favicon')) {
          issues.push(`http ${response.status()}: ${url.replace(base, '')}`);
        }
      });

      try {
        await page.goto(`${base}${pagePath}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1200);

        const smokeChecks = [];
        if (pagePath.includes('reservation-timeline')) {
          smokeChecks.push(['timeline has 1401', await page.locator('text=1401').first().isVisible().catch(() => false)]);
          smokeChecks.push(['timeline has group marker', await page.locator('text=단체').first().isVisible().catch(() => false)]);
        }
        if (pagePath.includes('groups_blocks')) {
          smokeChecks.push(['groups list has Samsung', await page.locator('text=Samsung Tech Conference 2026').first().isVisible().catch(() => false)]);
        }
        if (pagePath.includes('groups_block_detail')) {
          await page.locator('.local-tab').nth(1).click().catch(() => {});
          await page.waitForTimeout(300);
          const roomPanelText = await page.locator('#rooms').innerText().catch(() => '');
          smokeChecks.push(['detail has allocation room', roomPanelText.includes('1401')]);
          const roomingTab = page.locator('.local-tab').filter({ hasText: '투숙객 명단' }).first();
          await roomingTab.click().catch(() => {});
          await page.waitForTimeout(300);
          const roomingPanelText = await page.locator('#rooming').innerText().catch(() => '');
          smokeChecks.push(['detail has rooming guest', roomingPanelText.includes('Alexander Kim')]);
        }
        if (pagePath.includes('reservation-list')) {
          const bodyText = await page.locator('body').innerText().catch(() => '');
          smokeChecks.push(['reservation list has group reservation', bodyText.includes('Samsung Tech Conference 2026')]);
        }
        if (pagePath.includes('operations/rates')) {
          smokeChecks.push(['rates table rendered', await page.locator('#ratesTableBody tr').first().isVisible().catch(() => false)]);
        }
        if (pagePath.includes('/admin/tenants/list')) {
          smokeChecks.push(['admin tenants rendered', await page.locator('text=The Grand Saigon').first().isVisible().catch(() => false)]);
        }

        smokeChecks.filter(([, ok]) => !ok).forEach(([name]) => issues.push(`check failed: ${name}`));
        results.push({ page: pagePath, ok: issues.length === 0, issues });
      } catch (error) {
        results.push({ page: pagePath, ok: false, issues: [`navigation: ${error.message}`] });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    if (server) server.close();
  }

  const failed = results.filter(result => !result.ok);
  console.log(JSON.stringify({ base, results }, null, 2));
  if (failed.length) process.exit(1);
})();
