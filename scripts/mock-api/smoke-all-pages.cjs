const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
  });
}

const pages = [...walk('dashboard'), ...walk('admin')]
  .map(file => `/${file.replaceAll('\\', '/')}`)
  .sort();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const pagePath of pages) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => {
      sessionStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('pms_lang', 'ko');
    });

    const issues = [];
    page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && !/favicon|ERR_NETWORK_ACCESS_DENIED|Failed to load resource|net::ERR_BLOCKED_BY_CLIENT/i.test(text)) {
        issues.push(`console: ${text}`);
      }
    });
    page.on('response', response => {
      const url = response.url();
      if (url.startsWith(base) && response.status() >= 400 && !/favicon/i.test(url)) {
        issues.push(`http ${response.status()}: ${url.replace(base, '')}`);
      }
    });

    try {
      await page.goto(`${base}${pagePath}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(650);
      const bodyText = await page.locator('body').innerText({ timeout: 3000 })
        .catch(() => page.evaluate(() => document.body?.innerText || '').catch(() => ''));
      if (!bodyText.trim()) issues.push('blank body');
      results.push({
        page: pagePath,
        ok: issues.length === 0,
        issues,
        title: await page.title().catch(() => ''),
        textLen: bodyText.trim().length
      });
    } catch (error) {
      results.push({ page: pagePath, ok: false, issues: [`navigation: ${error.message}`] });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  const failedPages = results.filter(result => !result.ok);
  console.log(JSON.stringify({
    total: results.length,
    passed: results.length - failedPages.length,
    failed: failedPages.length,
    failedPages
  }, null, 2));

  if (failedPages.length) process.exit(1);
})();
