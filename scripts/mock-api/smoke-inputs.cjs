const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const maxFieldsPerPage = Number(process.env.PMS_INPUT_LIMIT || 80);
const pagePattern = process.env.PMS_PAGE_MATCH ? new RegExp(process.env.PMS_PAGE_MATCH, 'i') : null;
const lang = process.env.PMS_LANG || 'ko';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
  });
}

const pages = [...walk('dashboard'), ...walk('admin')]
  .map(file => `/${file.replaceAll('\\', '/')}`)
  .filter(page => !pagePattern || pagePattern.test(page))
  .sort();

function ignoredMessage(text) {
  return /favicon|ERR_NETWORK_ACCESS_DENIED|Failed to load resource|net::ERR_BLOCKED_BY_CLIENT|googleapis|gstatic|cdnjs|cdn\.jsdelivr/i.test(text);
}

async function collectFields(page) {
  return page.evaluate((limit) => {
    document.querySelectorAll('[data-audit-input-id]').forEach(el => el.removeAttribute('data-audit-input-id'));
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (rect.bottom <= 0 || rect.right <= 0 || rect.top >= innerHeight || rect.left >= innerWidth) return false;
      if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') return false;
      if (el.disabled || el.readOnly || el.type === 'hidden' || el.type === 'file') return false;
      const x = Math.min(Math.max(rect.left + Math.min(rect.width / 2, 12), 1), innerWidth - 1);
      const y = Math.min(Math.max(rect.top + rect.height / 2, 1), innerHeight - 1);
      const topEl = document.elementFromPoint(x, y);
      return !!topEl && (el === topEl || el.contains(topEl));
    };
    return Array.from(document.querySelectorAll('input, select, textarea'))
      .filter(visible)
      .slice(0, limit)
      .map((el, index) => {
        el.dataset.auditInputId = `input-${index}`;
        const label = (
          el.getAttribute('aria-label') ||
          document.querySelector(`label[for="${el.id}"]`)?.innerText ||
          el.placeholder ||
          el.name ||
          el.id ||
          el.tagName
        ).replace(/\s+/g, ' ').trim().slice(0, 90);
        return {
          id: el.dataset.auditInputId,
          label,
          tag: el.tagName.toLowerCase(),
          type: (el.getAttribute('type') || '').toLowerCase(),
          value: el.value,
          optionCount: el.tagName.toLowerCase() === 'select' ? el.options.length : 0
        };
      });
  }, maxFieldsPerPage);
}

async function pageState(page) {
  return page.evaluate(() => ({
    activeModals: Array.from(document.querySelectorAll('.modal-overlay.active, .bottom-sheet.active, [role="dialog"]')).filter(el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    }).length,
    url: location.href
  }));
}

async function auditPage(browser, pagePath) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript((language) => {
    sessionStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('pms_lang', language);
  }, lang);
  const page = await context.newPage();
  const pageUrl = `${base}${pagePath}`;
  const failures = [];
  const consoleIssues = [];
  page.on('pageerror', error => consoleIssues.push(`pageerror: ${error.message}`));
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !ignoredMessage(text)) consoleIssues.push(`console: ${text}`);
  });

  try {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(700);
    const initialFields = await collectFields(page);

    for (let index = 0; index < initialFields.length; index += 1) {
      const state = await pageState(page).catch(() => ({ activeModals: 0, url: page.url() }));
      if (state.url !== pageUrl || state.activeModals > 0) {
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(500);
      }
      const fields = await collectFields(page);
      const field = fields[index];
      if (!field) continue;
      const locator = page.locator(`[data-audit-input-id="${field.id}"]`);
      try {
        if (field.tag === 'select') {
          if (field.optionCount > 1) {
            const values = await locator.evaluate(el => Array.from(el.options).map(opt => opt.value));
            const currentIndex = values.indexOf(field.value);
            const nextValue = values[(currentIndex + 1 + values.length) % values.length] || values[0];
            await locator.selectOption(nextValue, { timeout: 2500 });
            await page.waitForTimeout(80);
            await locator.selectOption(field.value, { timeout: 2500 }).catch(() => {});
          } else {
            await locator.focus({ timeout: 2500 });
          }
        } else if (field.type === 'checkbox' || field.type === 'radio') {
          await locator.click({ timeout: 2500 });
          await page.waitForTimeout(80);
          await locator.click({ timeout: 2500 }).catch(() => {});
        } else {
          const value = field.type === 'date'
            ? '2026-07-10'
            : field.type === 'time'
              ? '12:00'
              : ['number', 'range'].includes(field.type)
                ? '1'
                : 'test';
          await locator.fill(value, { timeout: 2500 });
          await page.waitForTimeout(80);
          await locator.fill(field.value || '', { timeout: 2500 }).catch(() => {});
        }
      } catch (error) {
        failures.push({ page: pagePath, label: field.label, tag: field.tag, type: field.type, issue: error.message });
      }
    }

    if (consoleIssues.length) failures.push({ page: pagePath, label: 'page console', issue: consoleIssues.join('\n') });
    return { page: pagePath, fields: initialFields.length, failures };
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const pagePath of pages) {
      results.push(await auditPage(browser, pagePath));
    }
  } finally {
    await browser.close();
  }

  const failures = results.flatMap(result => result.failures);
  const summary = {
    lang,
    pages: results.length,
    fieldsTested: results.reduce((sum, result) => sum + result.fields, 0),
    failures,
    pageSummaries: results.map(result => ({
      page: result.page,
      fields: result.fields,
      failures: result.failures.length
    }))
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = failures.length ? 1 : 0;
})();
