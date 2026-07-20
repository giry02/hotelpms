const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const pagePattern = process.env.PMS_PAGE_MATCH ? new RegExp(process.env.PMS_PAGE_MATCH, 'i') : null;
const resultFile = process.env.PMS_RESULT_FILE || '';
const screenshotDir = path.join(process.cwd(), 'scripts', 'mock-api', 'visual-audit-output');

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900, touch: false },
  { name: 'tablet-1024', width: 1024, height: 1366, touch: true },
  { name: 'mobile-412', width: 412, height: 915, touch: true },
  { name: 'mobile-360', width: 360, height: 800, touch: true }
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return full.endsWith('.html') ? [full] : [];
  });
}

function ignoredMessage(text) {
  return /favicon|ERR_NETWORK_ACCESS_DENIED|Failed to load resource|net::ERR_BLOCKED_BY_CLIENT|googleapis|gstatic|cdnjs|cdn\.jsdelivr/i.test(text);
}

function safeFileName(pagePath, viewport) {
  return `${viewport}-${pagePath.replace(/^\/+/, '').replace(/[\\/:*?"<>|]+/g, '_')}.png`;
}

const pages = [...walk('dashboard'), ...walk('admin')]
  .map(file => `/${file.replaceAll('\\', '/')}`)
  .filter(page => !pagePattern || pagePattern.test(page))
  .sort();

async function evaluateLayout(page) {
  return page.evaluate(() => {
    const visible = el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.width > 0
        && rect.height > 0
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) !== 0;
    };

    const body = document.body;
    const text = (body?.innerText || '').trim();
    const doc = document.scrollingElement || document.documentElement;
    const pageOverflowX = Math.max(0, doc.scrollWidth - innerWidth);
    const activeOverlays = Array.from(document.querySelectorAll('.modal-overlay.active, .bottom-sheet.active, .guest-detail-panel.active, [role="dialog"]'))
      .filter(visible)
      .map(el => {
        const label = (el.innerText || el.id || el.className || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 100);
        return label;
      });

    const overflowWhitelist = [
      'table', '.table-wrapper', '.calendar-wrapper', '.timeline-grid', '.timeline-scroll',
      '.rate-table', '.data-table', '.chart-container', '.kanban-board',
      '.ad-hero-carousel', '.ad-event-showcase', '.carousel', '.slider',
      '.filter-scroll', '.filter-chips', '.ops-tabs', '.tabs-scroll',
      '[class*="scroll"]', '[class*="carousel"]', '[class*="track"]'
    ];
    const isInsideWhitelistedOverflow = el => overflowWhitelist.some(selector => el.closest(selector));
    const isInsideIntentionalHorizontalFlow = el => {
      let current = el;
      while (current && current !== body) {
        const style = getComputedStyle(current);
        const overflowX = style.overflowX;
        if ((overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden')
          && current.scrollWidth > current.clientWidth + 4) return true;
        current = current.parentElement;
      }
      return false;
    };

    const overflowingElements = Array.from((body || document).querySelectorAll('*'))
      .filter(visible)
      .filter(el => !isInsideWhitelistedOverflow(el) && !isInsideIntentionalHorizontalFlow(el))
      .map(el => {
        const rect = el.getBoundingClientRect();
        const offCanvas = rect.right <= 0 || rect.left >= innerWidth;
        const overLeft = rect.left < -2;
        const overRight = rect.right > innerWidth + 2;
        return { el, rect, offCanvas, overLeft, overRight };
      })
      .filter(item => !item.offCanvas && (item.overLeft || item.overRight))
      .slice(0, 12)
      .map(({ el, rect }) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        cls: String(el.className || '').split(/\s+/).slice(0, 4).join('.'),
        text: (el.innerText || el.value || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width)
      }));

    const clippedTextElements = Array.from(document.querySelectorAll('button, a, label, .chip, .status-badge'))
      .filter(visible)
      .filter(el => !isInsideWhitelistedOverflow(el) && !isInsideIntentionalHorizontalFlow(el))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        const intersectsViewport = rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
        return intersectsViewport && el.scrollWidth - el.clientWidth > 4 && (el.innerText || '').trim().length > 0;
      })
      .slice(0, 12)
      .map(el => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        cls: String(el.className || '').split(/\s+/).slice(0, 4).join('.'),
        text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight
      }));

    return {
      title: document.title,
      bodyTextLength: text.length,
      replacementChars: (text.match(/\uFFFD/g) || []).length,
      pageOverflowX,
      activeOverlays,
      overflowingElements,
      clippedTextElements
    };
  });
}

async function auditOne(browser, pagePath, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.name.startsWith('mobile'),
    hasTouch: viewport.touch
  });
  await context.addInitScript(() => {
    sessionStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('pms_lang', 'ko');
  });

  const page = await context.newPage();
  const issues = [];
  const warnings = [];

  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !ignoredMessage(text)) issues.push(`console: ${text}`);
  });
  page.on('response', response => {
    const url = response.url();
    if (url.startsWith(base) && response.status() >= 400 && !/favicon/i.test(url)) {
      issues.push(`http ${response.status()}: ${url.replace(base, '')}`);
    }
  });

  let layout = null;
  try {
    await page.goto(`${base}${pagePath}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(900);
    layout = await evaluateLayout(page);
    if (layout.bodyTextLength < 20) issues.push('blank or near-blank body');
    if (layout.activeOverlays.length) issues.push(`unexpected active overlay: ${layout.activeOverlays.join(' | ')}`);
    if (layout.pageOverflowX > 24) warnings.push(`page horizontal overflow ${layout.pageOverflowX}px`);
    if (layout.overflowingElements.length) warnings.push(`overflowing elements: ${JSON.stringify(layout.overflowingElements)}`);
    if (layout.clippedTextElements.length) warnings.push(`clipped text elements: ${JSON.stringify(layout.clippedTextElements)}`);
    if (layout.replacementChars > 0) warnings.push(`replacement characters in visible text: ${layout.replacementChars}`);
  } catch (error) {
    issues.push(`navigation/layout: ${error.message}`);
  }

  if (issues.length || warnings.length) {
    fs.mkdirSync(screenshotDir, { recursive: true });
    const screenshotPath = path.join(screenshotDir, safeFileName(pagePath, viewport.name));
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  await context.close();
  return {
    page: pagePath,
    viewport: viewport.name,
    ok: issues.length === 0,
    issues,
    warnings,
    screenshot: issues.length || warnings.length ? path.relative(process.cwd(), path.join(screenshotDir, safeFileName(pagePath, viewport.name))).replaceAll('\\', '/') : null,
    layout
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const pagePath of pages) {
      for (const viewport of viewports) {
        results.push(await auditOne(browser, pagePath, viewport));
      }
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter(result => !result.ok);
  const warned = results.filter(result => result.warnings.length);
  const report = {
    pages: pages.length,
    checks: results.length,
    failedCount: failed.length,
    warningCount: warned.length,
    failed,
    warned: warned.map(result => ({
      page: result.page,
      viewport: result.viewport,
      warnings: result.warnings,
      screenshot: result.screenshot
    }))
  };

  if (resultFile) {
    fs.mkdirSync(path.dirname(resultFile), { recursive: true });
    fs.writeFileSync(resultFile, JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) process.exit(1);
})();
