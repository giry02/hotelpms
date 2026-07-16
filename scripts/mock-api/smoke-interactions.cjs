const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const maxButtonsPerPage = Number(process.env.PMS_INTERACTION_LIMIT || 90);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
  });
}

const pagePattern = process.env.PMS_PAGE_MATCH ? new RegExp(process.env.PMS_PAGE_MATCH, 'i') : null;
const pages = [...walk('dashboard'), ...walk('admin')]
  .map(file => `/${file.replaceAll('\\', '/')}`)
  .filter(page => !pagePattern || pagePattern.test(page))
  .sort();

function ignoredMessage(text) {
  return /favicon|ERR_NETWORK_ACCESS_DENIED|Failed to load resource|net::ERR_BLOCKED_BY_CLIENT|googleapis|gstatic|cdnjs|cdn\.jsdelivr/i.test(text);
}

function localHttpOk(url) {
  return new Promise(resolve => {
    const req = http.get(url, res => {
      res.resume();
      resolve({ ok: res.statusCode < 400, status: res.statusCode });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ ok: false, status: 'timeout' });
    });
    req.on('error', error => resolve({ ok: false, status: error.message }));
  });
}

async function collectButtons(page) {
  return page.evaluate((limit) => {
    const selector = [
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      '[role="button"]'
    ].join(',');
    document.querySelectorAll('[data-audit-click-id]').forEach(el => el.removeAttribute('data-audit-click-id'));
    const seen = new Set();
    const canReceiveClick = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (rect.bottom <= 0 || rect.right <= 0 || rect.top >= innerHeight || rect.left >= innerWidth) return false;
      if (style.visibility === 'hidden' || style.display === 'none' || style.pointerEvents === 'none') return false;
      if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;

      const x = Math.min(Math.max(rect.left + rect.width / 2, 1), innerWidth - 1);
      const y = Math.min(Math.max(rect.top + rect.height / 2, 1), innerHeight - 1);
      const topEl = document.elementFromPoint(x, y);
      return !!topEl && (el === topEl || el.contains(topEl));
    };
    return Array.from(document.querySelectorAll(selector))
      .filter(el => {
        if (seen.has(el)) return false;
        seen.add(el);
        return canReceiveClick(el);
      })
      .slice(0, limit)
      .map((el, index) => {
        const label = (el.innerText || el.value || el.getAttribute('aria-label') || el.title || el.id || el.className || el.tagName)
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 90);
        el.dataset.auditClickId = `audit-${index}`;
        return { id: el.dataset.auditClickId, label, tag: el.tagName.toLowerCase() };
      });
  }, maxButtonsPerPage);
}

async function collectModalButtons(page) {
  return page.evaluate(() => {
    document.querySelectorAll('[data-audit-modal-click-id]').forEach(el => el.removeAttribute('data-audit-modal-click-id'));
    const visible = el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (rect.bottom <= 0 || rect.right <= 0 || rect.top >= innerHeight || rect.left >= innerWidth) return false;
      if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none' || el.disabled) return false;
      const x = Math.min(Math.max(rect.left + rect.width / 2, 1), innerWidth - 1);
      const y = Math.min(Math.max(rect.top + rect.height / 2, 1), innerHeight - 1);
      const topEl = document.elementFromPoint(x, y);
      return !!topEl && (el === topEl || el.contains(topEl));
    };
    const roots = Array.from(document.querySelectorAll('.modal-overlay.active, .bottom-sheet.active, .guest-detail-panel.active, [role="dialog"]')).filter(visible);
    const buttons = roots.flatMap(root => Array.from(root.querySelectorAll('button,input[type="button"],input[type="submit"],[role="button"]')));
    return buttons.filter(visible).slice(0, 8).map((el, index) => {
      const label = (el.innerText || el.value || el.getAttribute('aria-label') || el.title || el.id || el.className || el.tagName)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 90);
      el.dataset.auditModalClickId = `modal-${index}`;
      return { id: el.dataset.auditModalClickId, label };
    });
  });
}

async function pageState(page) {
  return page.evaluate(() => {
    const visible = el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const html = document.body.innerHTML || '';
    let htmlHash = 2166136261;
    for (let i = 0; i < html.length; i += 1) {
      htmlHash ^= html.charCodeAt(i);
      htmlHash = Math.imul(htmlHash, 16777619);
    }
    return {
      url: location.href,
      bodyLen: (document.body.innerText || '').trim().length,
      htmlHash: `${html.length}:${htmlHash >>> 0}`,
      activeModals: Array.from(document.querySelectorAll('.modal-overlay.active, .bottom-sheet.active, .guest-detail-panel.active, [role="dialog"]')).filter(visible).length,
      toast: Array.from(document.querySelectorAll('#pms-toast, .toast, #toastContainer')).map(el => el.innerText || '').join(' ').trim()
    };
  });
}

async function closeModalOrReload(page, pageUrl) {
  const state = await pageState(page).catch(() => ({ url: page.url(), activeModals: 0 }));
  if (state.url !== pageUrl || state.activeModals > 0) {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(650);
  }
}

async function auditPage(browser, pagePath) {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    sessionStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('pms_lang', 'ko');
  });
  const page = await context.newPage();
  const pageUrl = `${base}${pagePath}`;
  const failures = [];
  const dialogs = [];
  const downloads = [];
  const noEffectCandidates = [];
  const popupOpeners = [];
  const localLinks = new Set();
  let loadIssues = [];

  page.on('dialog', async dialog => {
    dialogs.push({ page: pagePath, type: dialog.type(), message: dialog.message().slice(0, 160) });
    await dialog.dismiss().catch(() => {});
  });
  page.on('download', async download => {
    downloads.push({ page: pagePath, suggestedFilename: download.suggestedFilename() });
    await download.delete().catch(() => {});
  });
  page.on('pageerror', error => loadIssues.push(`pageerror: ${error.message}`));
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !ignoredMessage(text)) loadIssues.push(`console: ${text}`);
  });
  page.on('response', response => {
    const url = response.url();
    if (url.startsWith(base) && response.status() >= 400 && !/favicon/i.test(url)) {
      loadIssues.push(`http ${response.status()}: ${url.replace(base, '')}`);
    }
  });

  try {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(650);
    await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'))).then(hrefs => {
      hrefs.filter(Boolean).forEach(href => {
        if (/^(#|javascript:|mailto:|tel:)/i.test(href)) return;
        try {
          const url = new URL(href, location.href).href;
          if (url.startsWith(location.origin)) localLinks.add(url);
        } catch {}
      });
    });
    const initialButtons = await collectButtons(page);
    const pageLoadIssues = loadIssues.slice();
    loadIssues = [];

    for (let index = 0; index < initialButtons.length; index += 1) {
      await closeModalOrReload(page, pageUrl);
      loadIssues = [];
      const buttons = await collectButtons(page);
      const button = buttons[index];
      if (!button) continue;
      const before = await pageState(page);
      const downloadCountBefore = downloads.length;

      try {
        await page.locator(`[data-audit-click-id="${button.id}"]`).click({ timeout: 3000 });
        await page.waitForTimeout(160);
      } catch (error) {
        failures.push({ page: pagePath, label: button.label, issues: [`click: ${error.message}`] });
        continue;
      }

      const after = await pageState(page).catch(() => ({ url: page.url(), bodyLen: 0, activeModals: 0, toast: '' }));
      const clickIssues = loadIssues.slice();
      if (clickIssues.length) failures.push({ page: pagePath, label: button.label, issues: clickIssues });

      const effect = {
        navigated: before.url !== after.url,
        modalOpened: after.activeModals > before.activeModals,
        modalClosed: after.activeModals < before.activeModals,
        dialog: dialogs.length > 0,
        download: downloads.length > downloadCountBefore,
        textChanged: before.bodyLen !== after.bodyLen,
        domChanged: before.htmlHash !== after.htmlHash,
        toast: !!after.toast
      };

      if (effect.modalOpened) {
        popupOpeners.push({ page: pagePath, label: button.label });
        const modalButtons = await collectModalButtons(page);
        const closeLike = modalButtons.filter(item => /닫|취소|close|cancel|xmark|no|아니오/i.test(item.label));
        const labelsToCheck = (closeLike.length ? closeLike : modalButtons).slice(0, 2).map(item => item.label);
        for (const modalLabel of labelsToCheck) {
          const currentModalButtons = await collectModalButtons(page);
          const modalButton = currentModalButtons.find(item => item.label === modalLabel) || currentModalButtons[0];
          if (!modalButton) break;
          loadIssues = [];
          try {
            await page.locator(`[data-audit-modal-click-id="${modalButton.id}"]`).click({ timeout: 2500 });
            await page.waitForTimeout(220);
          } catch (error) {
            failures.push({ page: pagePath, label: `${button.label} > ${modalLabel}`, issues: [`click: ${error.message}`] });
          }
          if (loadIssues.length) failures.push({ page: pagePath, label: `${button.label} > ${modalLabel}`, issues: loadIssues.slice() });
          await closeModalOrReload(page, pageUrl);

          const reopenButtons = await collectButtons(page);
          const reopen = reopenButtons[index];
          if (!reopen) break;
          await page.locator(`[data-audit-click-id="${reopen.id}"]`).click({ timeout: 2500 }).catch(() => {});
          await page.waitForTimeout(220);
        }
      }

      if (!Object.values(effect).some(Boolean)
        && !/close|닫|취소|cancel|xmark|menu|filter|검색|search|언어|한국어|english|전체|all|prev|next|page-btn|^\d+$|이전|다음/i.test(button.label)) {
        noEffectCandidates.push({ page: pagePath, label: button.label });
      }
    }

    return {
      page: pagePath,
      buttons: initialButtons.length,
      failures: [...(pageLoadIssues.length ? [{ page: pagePath, label: 'page load', issues: pageLoadIssues }] : []), ...failures],
      popupOpeners,
      noEffectCandidates,
      dialogs,
      localLinks: Array.from(localLinks)
    };
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pageResults = [];

  try {
    for (const pagePath of pages) {
      pageResults.push(await auditPage(browser, pagePath));
    }
  } finally {
    await browser.close();
  }

  const linkTargets = new Set(pageResults.flatMap(result => result.localLinks));
  const brokenLinks = [];
  for (const url of linkTargets) {
    const result = await localHttpOk(url);
    if (!result.ok) brokenLinks.push({ url: url.replace(base, ''), status: result.status });
  }

  const failures = pageResults.flatMap(result => result.failures);
  const popupOpeners = pageResults.flatMap(result => result.popupOpeners);
  const noEffectCandidates = pageResults.flatMap(result => result.noEffectCandidates);
  const dialogs = pageResults.flatMap(result => result.dialogs);
  const report = {
    pages: pageResults.length,
    buttonsClicked: pageResults.reduce((sum, result) => sum + result.buttons, 0),
    popupOpeners: popupOpeners.length,
    dialogs: dialogs.length,
    failures,
    brokenLinks,
    noEffectCandidates: noEffectCandidates.slice(0, 120),
    pageSummaries: pageResults.map(result => ({
      page: result.page,
      buttons: result.buttons,
      popups: result.popupOpeners.length,
      failures: result.failures.length,
      noEffectCandidates: result.noEffectCandidates.length
    }))
  };

  console.log(JSON.stringify(report, null, 2));
  if (failures.length || brokenLinks.length) process.exit(1);
})();
