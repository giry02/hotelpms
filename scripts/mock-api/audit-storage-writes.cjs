const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const allow = new Set(['pms_lang', 'pms_api_version']);
const pagePattern = process.env.PMS_PAGE_MATCH ? new RegExp(process.env.PMS_PAGE_MATCH, 'i') : null;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return full.endsWith('.html') ? [full] : [];
  });
}

const pages = [...walk('dashboard'), ...walk('admin')]
  .map(file => `/${file.replaceAll('\\', '/')}`)
  .filter(page => !pagePattern || pagePattern.test(page))
  .sort();

async function gotoWithRetry(page, url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await page.waitForTimeout(1000 * attempt);
    }
  }
  throw lastError;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const pagePath of pages) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      await context.addInitScript(() => {
        sessionStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('pms_lang', 'ko');
      });
      const page = await context.newPage();
      const issues = [];
      page.on('pageerror', error => issues.push(error.message));
      page.on('console', msg => {
        if (msg.type() === 'error' && !/favicon|Failed to load resource|ERR_NETWORK_ACCESS_DENIED|net::ERR_BLOCKED_BY_CLIENT/i.test(msg.text())) {
          issues.push(msg.text());
        }
      });

      try {
        await gotoWithRetry(page, `${base}${pagePath}`);
        await page.waitForTimeout(650);
        const keys = await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('pms_')).sort());
        const createdKeys = keys.filter(key => !allow.has(key));
        if (createdKeys.length || issues.length) results.push({ page: pagePath, createdKeys, issues });
      } catch (error) {
        results.push({ page: pagePath, createdKeys: [], issues: [`navigation: ${error.message}`] });
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const report = {
    pages: pages.length,
    pagesWithPmsWrites: results.filter(result => result.createdKeys.length).length,
    pagesWithIssues: results.filter(result => result.issues.length).length,
    results
  };
  console.log(JSON.stringify(report, null, 2));
  if (results.some(result => result.issues.length)) process.exit(1);
})();
