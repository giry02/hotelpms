const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const outDir = path.join('outputs', 'i18n-audit');
const pagePattern = process.env.PMS_PAGE_MATCH ? new RegExp(process.env.PMS_PAGE_MATCH, 'i') : null;
const outFile = path.join(outDir, 'english-korean-visible.json');

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
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const pagePath of pages) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.addInitScript(() => {
      sessionStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('pms_lang', 'en');
      localStorage.setItem('pms_admin_lang', 'en');
    });

    const issues = [];
    page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));

    try {
      await gotoWithRetry(page, `${base}${pagePath}`);
      if (pagePath === '/admin/index.html') {
        await page.waitForURL(/\/admin\/(admin|login)\.html(?:[?#].*)?$/, { timeout: 30000 });
        await page.waitForLoadState('domcontentloaded');
      }
      await page.waitForTimeout(1200);
      await page.evaluate(() => {
        localStorage.setItem('pms_lang', 'en');
        localStorage.setItem('pms_admin_lang', 'en');
        if (typeof window.changeLang === 'function') window.changeLang('en');
        if (typeof window.setLanguage === 'function') window.setLanguage('en');
      }).catch(() => {});
      await page.waitForTimeout(350);

      const matches = await page.evaluate(() => {
        if (!document.body) return [];
        function isVisible(el) {
          if (!el) return false;
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }

        function shortSelector(el) {
          if (!el) return '';
          const parts = [];
          let node = el;
          while (node && node.nodeType === 1 && parts.length < 4) {
            let part = node.tagName.toLowerCase();
            if (node.id) {
              part += `#${node.id}`;
              parts.unshift(part);
              break;
            }
            const cls = String(node.className || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
            if (cls.length) part += `.${cls.join('.')}`;
            parts.unshift(part);
            node = node.parentElement;
          }
          return parts.join(' > ');
        }

        function isUserOrSampleData(el) {
          return !!el?.closest?.([
            '.company-card',
            '#mtTableBody',
            '.guest-name',
            '.event-name',
            '.event-company',
            '.company-name',
            '.data-row',
            '[data-user-content]',
            '[data-i18n-data]'
          ].join(','));
        }

        const allowed = new Set(['🇰🇷 한국어', '한국어']);
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            const text = node.nodeValue.replace(/\s+/g, ' ').trim();
            if (!text || !/[가-힣]/.test(text) || allowed.has(text)) return NodeFilter.FILTER_REJECT;
            if (!isVisible(node.parentElement)) return NodeFilter.FILTER_REJECT;
            if (isUserOrSampleData(node.parentElement)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        });

        const rows = [];
        let node;
        while ((node = walker.nextNode())) {
          const text = node.nodeValue.replace(/\s+/g, ' ').trim();
          rows.push({
            text,
            selector: shortSelector(node.parentElement),
            tag: node.parentElement.tagName.toLowerCase(),
            classes: String(node.parentElement.className || '')
          });
        }
        return rows;
      });

      const unique = [];
      const seen = new Set();
      for (const match of matches) {
        const key = `${match.text}::${match.selector}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(match);
      }

      results.push({
        page: pagePath,
        title: await page.title().catch(() => ''),
        issueCount: unique.length,
        issues,
        matches: unique
      });
    } catch (error) {
      results.push({
        page: pagePath,
        title: '',
        issueCount: 1,
        issues: [`navigation: ${error.message}`],
        matches: []
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  const failed = results.filter(result => result.issueCount || result.issues.length);
  const summary = {
    checkedAt: new Date().toISOString(),
    total: results.length,
    pagesWithVisibleKorean: failed.filter(result => result.matches.length).length,
    pagesWithErrors: failed.filter(result => result.issues.length).length,
    results
  };
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify({
    total: summary.total,
    pagesWithVisibleKorean: summary.pagesWithVisibleKorean,
    pagesWithErrors: summary.pagesWithErrors,
    outFile
  }, null, 2));

  if (summary.pagesWithVisibleKorean || summary.pagesWithErrors) process.exit(1);
})();
