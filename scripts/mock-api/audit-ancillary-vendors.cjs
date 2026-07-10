const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_BASE = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const PORT = Number(new URL(DEFAULT_BASE).port || 8765);
const EXPECTED_GOLF_FIELDS = ['guest', 'room', 'date', 'item', 'people', 'teeTime', 'course'];
const OLD_GOLF_FIELDS = ['guest', 'room', 'date', 'people', 'teeTime', 'course', 'item', 'amount', 'partnerContact', 'address'];

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

function sameFields(fields) {
  return JSON.stringify(fields || []) === JSON.stringify(EXPECTED_GOLF_FIELDS);
}

async function poisonGolfVendorStorage(page) {
  await page.evaluate(oldFields => {
    localStorage.clear();
    localStorage.setItem('pms_api_version', 'v2.19');
    localStorage.setItem('pms_ancillary_vendors', JSON.stringify([
      {
        id: 'GOLF-SUNVALLEY',
        type: 'golf',
        name: '썬밸리 CC',
        contact: 'Kim Manager',
        address: 'Clark Freeport Zone, Pampanga',
        commission: 15,
        voucherFields: oldFields,
        logoDataUrl: '',
        items: [{ name: '18홀 그린피', price: 450, desc: 'old local value' }]
      },
      {
        id: 'GOLF-SKY72',
        type: 'golf',
        name: '스카이72',
        contact: 'Lee Manager',
        address: 'Andrews Ave, Pasay, Metro Manila',
        commission: 12,
        voucherFields: oldFields,
        logoDataUrl: '',
        items: [{ name: '18홀 패키지', price: 520, desc: 'old local value' }]
      }
    ]));
  }, OLD_GOLF_FIELDS);
}

async function auditVendorManagementPage(page, baseUrl) {
  await page.goto(`${baseUrl}/dashboard/operations/ancillary-vendors.html?type=golf`, { waitUntil: 'domcontentloaded' });
  await poisonGolfVendorStorage(page);
  await page.goto(`${baseUrl}/dashboard/operations/ancillary-vendors.html?type=golf`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.voucher-field input', { timeout: 10000 });

  const state = await page.evaluate(() => {
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
        fixedVoucherFields: typeof common?.fixedVoucherFields,
        isVoucherFieldsLocked: typeof common?.isVoucherFieldsLocked
      },
      commonGolfFields: common?.load?.().filter(vendor => vendor.type === 'golf').map(vendor => vendor.voucherFields) || [],
      commonGolfItems: common?.load?.().filter(vendor => vendor.type === 'golf').flatMap(vendor => vendor.items || []) || [],
      commonRentacarItems: common?.load?.().filter(vendor => vendor.type === 'rentacar').flatMap(vendor => vendor.items || []) || [],
      stored,
      checked: inputs.filter(input => input.checked).map(input => input.value),
      unchecked: inputs.filter(input => !input.checked).map(input => input.value),
      disabledCount: inputs.filter(input => input.disabled).length,
      inputCount: inputs.length
    };
  });

  assert(state.commonExports.fixedVoucherFields === 'function', 'common vendor module does not export fixedVoucherFields', state.commonExports);
  assert(state.commonExports.isVoucherFieldsLocked === 'function', 'common vendor module does not export isVoucherFieldsLocked', state.commonExports);
  assert(state.commonGolfFields.every(sameFields), 'common module did not normalize golf voucher fields', state.commonGolfFields);
  assert(state.commonGolfItems.length >= 5, 'common module did not restore all default golf items', state.commonGolfItems);
  assert(state.commonGolfItems.every(item => item.holes && item.basePeople), 'common module did not restore golf item metadata', state.commonGolfItems);
  assert(state.commonRentacarItems.length >= 5, 'common module did not restore all default rentacar items', state.commonRentacarItems);
  assert(state.commonRentacarItems.every(item => item.vehicleClass && item.pickupBase), 'common module rentacar item metadata is incomplete', state.commonRentacarItems);
  assert(state.stored.every(vendor => sameFields(vendor.fields)), 'vendor management page persisted stale golf fields', state.stored);
  assert(sameFields(state.checked), 'vendor management checkbox state does not match fixed golf fields', state.checked);
  assert(['amount', 'partnerContact', 'address', 'memo'].every(field => state.unchecked.includes(field)), 'excluded golf fields are checked', state.unchecked);
  assert(state.disabledCount === state.inputCount, 'locked golf voucher inputs are editable', state);
  return state;
}

async function auditAncillaryPage(page, baseUrl) {
  await page.goto(`${baseUrl}/dashboard/operations/ancillary.html?service=golf`, { waitUntil: 'domcontentloaded' });
  await poisonGolfVendorStorage(page);
  await page.goto(`${baseUrl}/dashboard/operations/ancillary.html?service=golf`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.service-room-card', { timeout: 15000 });

  const orderId = await page.evaluate(() => {
    const orders = JSON.parse(localStorage.getItem('pms_ancillary_room_orders') || '[]');
    return orders.find(order => order.service === 'golf' && order.room === '0801')?.id || orders.find(order => order.service === 'golf')?.id || '';
  });
  assert(orderId, 'no golf order found for voucher audit');

  await page.evaluate(id => window.openOrderVoucherModal(id), orderId);
  await page.waitForSelector('.voucher-sheet .voucher-row', { timeout: 5000, state: 'attached' });

  const state = await page.evaluate(expectedCount => {
    const stored = JSON.parse(localStorage.getItem('pms_ancillary_vendors') || '[]')
      .filter(vendor => vendor.type === 'golf')
      .map(vendor => ({ id: vendor.id, fields: vendor.voucherFields }));
    const sheets = document.querySelectorAll('.voucher-sheet').length;
    const rows = document.querySelectorAll('.voucher-sheet .voucher-row').length;
    return { stored, sheets, rows, expectedRows: sheets * expectedCount };
  }, EXPECTED_GOLF_FIELDS.length);

  assert(state.stored.every(vendor => sameFields(vendor.fields)), 'ancillary page persisted stale golf fields', state.stored);
  assert(state.rows === state.expectedRows, 'ancillary voucher rendered stale field count', state);
  return { orderId, ...state };
}

(async () => {
  const server = (await httpOk(DEFAULT_BASE)) ? null : await serveStatic(PORT);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    const vendorManagement = await auditVendorManagementPage(page, DEFAULT_BASE);
    const page2 = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    const ancillary = await auditAncillaryPage(page2, DEFAULT_BASE);
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
