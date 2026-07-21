const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_BASE = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const PORT = Number(new URL(DEFAULT_BASE).port || 8765);
const BASE_HOST = new URL(DEFAULT_BASE).hostname;
const IS_LOCAL_BASE = BASE_HOST === '127.0.0.1' || BASE_HOST === 'localhost';
const NAV_TIMEOUT = Number(process.env.PMS_NAV_TIMEOUT || 15000);
const NAV_ATTEMPTS = Number(process.env.PMS_NAV_ATTEMPTS || 2);
const INITIAL_GOLF_FIELDS = ['guest', 'room', 'date', 'item', 'people', 'teeTime', 'course'];
const CUSTOM_GOLF_FIELDS = ['guest', 'room', 'date', 'item', 'amount', 'partnerContact'];

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
    const client = new URL(url).protocol === 'https:' ? https : http;
    const req = client.get(url, res => {
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

function sameFields(left, right) {
  return JSON.stringify(left || []) === JSON.stringify(right || []);
}

async function gotoWithRetry(page, url, attempts = NAV_ATTEMPTS) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await page.waitForTimeout(1000 * attempt);
    }
  }
  throw lastError;
}

async function resetStorage(page) {
  await page.evaluate(() => {
    const apiVersion = localStorage.getItem('pms_api_version');
    localStorage.clear();
    if (apiVersion) localStorage.setItem('pms_api_version', apiVersion);
  });
}

async function seedCustomGolfStorage(page) {
  await page.evaluate(customFields => {
    const apiVersion = localStorage.getItem('pms_api_version');
    localStorage.clear();
    if (apiVersion) localStorage.setItem('pms_api_version', apiVersion);
    localStorage.setItem('pms_ancillary_vendors', JSON.stringify([
      {
        id: 'GOLF-SUNVALLEY',
        type: 'golf',
        name: 'Sunvalley CC',
        contact: 'Kim Manager',
        address: 'Clark Freeport Zone, Pampanga',
        commission: 15,
        voucherFields: customFields,
        logoDataUrl: '',
        items: [{ name: '18홀 그린피', price: 450, desc: 'old local value' }]
      },
      {
        id: 'GOLF-SKY72',
        type: 'golf',
        name: 'Sky72',
        contact: 'Lee Manager',
        address: 'Andrews Ave, Pasay, Metro Manila',
        commission: 12,
        voucherFields: customFields,
        logoDataUrl: '',
        items: [{ name: '18홀 패키지', price: 520, desc: 'old local value' }]
      }
    ]));
  }, CUSTOM_GOLF_FIELDS);
}

async function auditVendorManagementPage(page, baseUrl) {
  const url = `${baseUrl}/dashboard/operations/ancillary-vendors.html?type=golf`;
  console.error('[ancillary-audit] vendor page: initial navigation');
  await gotoWithRetry(page, url);
  await resetStorage(page);
  console.error('[ancillary-audit] vendor page: navigation after reset');
  await gotoWithRetry(page, url);
  await page.waitForSelector('.voucher-field input', { timeout: 10000 });
  console.error('[ancillary-audit] vendor page: fields ready');

  const initialState = await page.evaluate(() => {
    const common = window.PmsPartnerVendors;
    const stored = JSON.parse(localStorage.getItem('pms_ancillary_vendors') || '[]')
      .filter(vendor => vendor.type === 'golf')
      .map(vendor => ({ id: vendor.id, fields: vendor.voucherFields }));
    const inputs = Array.from(document.querySelectorAll('.voucher-field input')).map(input => ({
      value: input.value,
      checked: input.checked,
      disabled: input.disabled
    }));
    return {
      commonExports: {
        load: typeof common?.load,
        save: typeof common?.save,
        initialVoucherFields: typeof common?.initialVoucherFields,
        hasInitialVoucherFields: typeof common?.hasInitialVoucherFields
      },
      commonGolfFields: common?.load?.().filter(vendor => vendor.type === 'golf').map(vendor => vendor.voucherFields) || [],
      commonGolfItems: common?.load?.().filter(vendor => vendor.type === 'golf').flatMap(vendor => vendor.items || []) || [],
      commonRentacarItems: common?.load?.().filter(vendor => vendor.type === 'rentacar').flatMap(vendor => vendor.items || []) || [],
      stored,
      checked: inputs.filter(input => input.checked).map(input => input.value),
      unchecked: inputs.filter(input => !input.checked).map(input => input.value),
      disabledCount: inputs.filter(input => input.disabled).length
    };
  });

  assert(initialState.commonExports.initialVoucherFields === 'function', 'common module does not export initialVoucherFields', initialState.commonExports);
  assert(initialState.commonExports.hasInitialVoucherFields === 'function', 'common module does not export hasInitialVoucherFields', initialState.commonExports);
  assert(initialState.commonGolfFields.every(fields => sameFields(fields, INITIAL_GOLF_FIELDS)), 'common module did not apply initial golf fields', initialState.commonGolfFields);
  assert(initialState.commonGolfItems.length >= 5, 'common module did not restore all default golf items', initialState.commonGolfItems);
  assert(initialState.commonGolfItems.every(item => item.holes && item.basePeople), 'common module did not restore golf item metadata', initialState.commonGolfItems);
  assert(initialState.commonRentacarItems.length >= 5, 'common module did not restore all default rentacar items', initialState.commonRentacarItems);
  assert(initialState.commonRentacarItems.every(item => item.vehicleClass && item.pickupBase), 'common module rentacar item metadata is incomplete', initialState.commonRentacarItems);
  assert(initialState.stored.every(vendor => sameFields(vendor.fields, INITIAL_GOLF_FIELDS)), 'vendor management did not initialize golf fields', initialState.stored);
  assert(sameFields(initialState.checked, INITIAL_GOLF_FIELDS), 'checkbox state does not match initial golf fields', initialState.checked);
  assert(['amount', 'partnerContact', 'address', 'memo'].every(field => initialState.unchecked.includes(field)), 'excluded fields should be unchecked initially', initialState.unchecked);
  assert(initialState.disabledCount === 0, 'golf voucher inputs should be editable', initialState);

  await page.locator('.voucher-field input[value="amount"]').check();
  await page.locator('.voucher-field input[value="people"]').uncheck();
  await page.evaluate(() => window.saveVoucherFields());
  console.error('[ancillary-audit] vendor page: fields saved');

  const editedState = await page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem('pms_ancillary_vendors') || '[]')
      .filter(vendor => vendor.type === 'golf')
      .map(vendor => ({ id: vendor.id, fields: vendor.voucherFields }));
    const checked = Array.from(document.querySelectorAll('.voucher-field input:checked')).map(input => input.value);
    return { stored, checked };
  });
  const expectedEdited = ['guest', 'room', 'date', 'item', 'amount', 'teeTime', 'course'];
  assert(sameFields(editedState.checked, expectedEdited), 'edited golf fields were not reflected in UI', editedState);
  assert(editedState.stored.some(vendor => sameFields(vendor.fields, expectedEdited)), 'edited golf fields were not saved', editedState);

  return { initialState, editedState };
}

async function auditAncillaryPage(page, baseUrl) {
  const url = `${baseUrl}/dashboard/operations/ancillary.html?service=golf`;
  console.error('[ancillary-audit] ancillary page: initial navigation');
  await gotoWithRetry(page, url);
  await seedCustomGolfStorage(page);
  console.error('[ancillary-audit] ancillary page: navigation after seed');
  await gotoWithRetry(page, url);
  await page.waitForSelector('.service-room-card', { timeout: 15000 });
  console.error('[ancillary-audit] ancillary page: room cards ready');

  const printableOrder = await page.evaluate(() => {
    const orders = JSON.parse(localStorage.getItem('pms_ancillary_room_orders') || '[]');
    const golfOrders = orders.filter(order => order.service === 'golf');
    const printable = golfOrders.find(order => order.room === '0801' && window.orderHasAssignedGuest?.(order))
      || golfOrders.find(order => window.orderHasAssignedGuest?.(order));
    return {
      id: printable?.id || '',
      golfOrderCount: golfOrders.length,
      printableOrderCount: golfOrders.filter(order => window.orderHasAssignedGuest?.(order)).length
    };
  });
  assert(printableOrder.id, 'no printable golf order with an assigned guest found for voucher audit', printableOrder);
  const orderId = printableOrder.id;

  await page.evaluate(id => window.openOrderVoucherModal(id), orderId);
  await page.waitForSelector('.voucher-sheet .voucher-row', { timeout: 5000, state: 'attached' });
  console.error('[ancillary-audit] ancillary page: voucher ready');

  const state = await page.evaluate(expectedCount => {
    const stored = JSON.parse(localStorage.getItem('pms_ancillary_vendors') || '[]')
      .filter(vendor => vendor.type === 'golf')
      .map(vendor => ({ id: vendor.id, fields: vendor.voucherFields }));
    const sheets = document.querySelectorAll('.voucher-sheet').length;
    const rows = document.querySelectorAll('.voucher-sheet .voucher-row').length;
    return { stored, sheets, rows, expectedRows: sheets * expectedCount };
  }, CUSTOM_GOLF_FIELDS.length);

  assert(state.stored.every(vendor => sameFields(vendor.fields, CUSTOM_GOLF_FIELDS)), 'ancillary page should preserve saved golf fields', state.stored);
  assert(state.rows === state.expectedRows, 'ancillary voucher did not render saved custom field count', state);
  return { orderId, ...state };
}

(async () => {
  const server = IS_LOCAL_BASE && !(await httpOk(DEFAULT_BASE)) ? await serveStatic(PORT) : null;
  const browser = await chromium.launch({ headless: true });
  console.error('[ancillary-audit] browser ready');
  try {
    const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
    await context.addInitScript(() => {
      sessionStorage.setItem('pms_logged_in', 'true');
      sessionStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('pms_lang', 'ko');
    });
    const page = await context.newPage();
    const vendorManagement = await auditVendorManagementPage(page, DEFAULT_BASE);
    console.error('[ancillary-audit] vendor audit complete');
    const page2 = await context.newPage();
    const ancillary = await auditAncillaryPage(page2, DEFAULT_BASE);
    console.error('[ancillary-audit] ancillary audit complete');
    console.log(JSON.stringify({ ok: true, vendorManagement, ancillary }, null, 2));
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error.stack || error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  process.exit(1);
});
