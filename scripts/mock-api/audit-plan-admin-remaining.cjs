const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';
const OUT = process.env.PMS_RESULT_FILE || path.join(ROOT, 'outputs', 'full-plan-20260719', '23-admin-remaining.json');
const results = [];

function assert(value, message, evidence) {
  if (value) return;
  const error = new Error(message);
  error.evidence = evidence;
  throw error;
}

async function run(ids, title, callback) {
  const caseIds = Array.isArray(ids) ? ids : [ids];
  const startedAt = Date.now();
  try {
    const evidence = await callback();
    caseIds.forEach(id => results.push({ id, title, status: 'PASS', durationMs: Date.now() - startedAt, evidence }));
  } catch (error) {
    caseIds.forEach(id => results.push({ id, title, status: 'FAIL', durationMs: Date.now() - startedAt, error: error.message, evidence: error.evidence || null }));
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ suite: 'admin-plan-remaining', total: results.length, passed: results.filter(row => row.status === 'PASS').length, failed: results.filter(row => row.status === 'FAIL').length, results }, null, 2));
  process.stderr.write(`[${results.at(-1).status}] ${caseIds.join(',')}` + '\n');
}

async function makeContext(browser, { language = 'ko', seed = {}, role = 'Platform Owner' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(({ language, seed, role }) => {
    if (!sessionStorage.getItem('pms_qa_context_initialized')) {
      localStorage.setItem('pms_lang', language);
      localStorage.setItem('pms_admin_lang', language);
      Object.entries(seed).forEach(([key, value]) => localStorage.setItem(`pms_admin_store:${key}`, JSON.stringify(value)));
      sessionStorage.setItem('pms_qa_context_initialized', '1');
    }
    sessionStorage.setItem('pms_logged_in', 'true');
    sessionStorage.setItem('admin_logged_in', 'true');
    sessionStorage.setItem('admin_session', JSON.stringify({ id: 'ADM-001', name: 'Super Admin', email: 'superadmin@platform.example', role, expiresAt: Date.now() + 3600000 }));
  }, { language, seed, role });
  return ctx;
}

async function openIn(ctx, route) {
  const page = await ctx.newPage();
  const errors = [];
  const httpErrors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !/favicon|font|ERR_ABORTED/i.test(message.text())) errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) httpErrors.push(`HTTP ${response.status()} ${response.url()}`); });
  page.on('dialog', async dialog => dialog.type() === 'confirm' ? dialog.accept() : dialog.dismiss());
  await page.goto(`${BASE}/${route}${route.includes('?') ? '&' : '?'}remaining=${Date.now()}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(450);
  return { page, errors, httpErrors };
}

async function shellCases(browser) {
  await run('ADM-AUTH-006', 'Admin shell exposes only Admin routes and highlights the active route', async () => {
    const ctx = await makeContext(browser, { language: 'en' });
    try {
      const { page, errors } = await openIn(ctx, 'admin/ads/campaigns.html');
      const state = await page.evaluate(() => ({
        active: [...document.querySelectorAll('.sidebar a.active')].map(row => row.getAttribute('href')),
        links: [...document.querySelectorAll('.sidebar a[href]')].map(row => row.getAttribute('href')),
        title: document.title
      }));
      assert(state.active.some(link => /ads\/campaigns/.test(link || '') || link === 'campaigns.html'), 'Current Admin menu was not highlighted', state);
      assert(!state.links.some(link => /^\.\.\/dashboard|\/dashboard\//.test(link || '')), 'PMS route leaked into Admin sidebar', state);
      assert(errors.length === 0, 'Admin shell raised runtime errors', errors);
      return state;
    } finally { await ctx.close(); }
  });

  await run('ADM-AUTH-007', 'Admin English cold load persists across navigation without Korean fallback', async () => {
    const ctx = await makeContext(browser, { language: 'en' });
    const routes = ['admin/admin.html', 'admin/tenants/list.html', 'admin/ads/campaigns.html', 'admin/system/profile.html'];
    const evidence = [];
    try {
      for (const route of routes) {
        const { page, errors } = await openIn(ctx, route);
        const state = await page.evaluate(() => {
          const clone = document.body.cloneNode(true);
          clone.querySelectorAll('[data-user-content], script, style').forEach(node => node.remove());
          const visibleText = clone.innerText || clone.textContent || '';
          return {
            lang: document.documentElement.lang,
            stored: localStorage.getItem('pms_admin_lang'),
            korean: (visibleText.match(/[가-힣]/g) || []).length,
            koreanLines: visibleText.split('\n').map(line => line.trim()).filter(line => /[가-힣]/.test(line)).slice(0, 30)
          };
        });
        evidence.push({ route, ...state, errors });
        await page.close();
      }
      assert(evidence.every(row => row.lang === 'en' && row.stored === 'en' && row.korean === 0 && row.errors.length === 0), 'English Admin navigation showed mixed Korean or lost language state', evidence);
      return evidence;
    } finally { await ctx.close(); }
  });
}

async function dashboardAndTenantCases(browser) {
  const tenants = [
    { id: 'TEN-PMS', code: 'PMS1', hotelName: 'PMS One', type: 'pms', pmsEnabled: true, status: 'active' },
    { id: 'PARTNER-1', code: 'PTR1', hotelName: 'Partner One', type: 'partner', pmsEnabled: false, status: 'active' }
  ];
  await run(['ADM-DASH-004', 'ADM-DASH-005'], 'Dashboard classifies PMS and partner portal properties independently', async () => {
    const ctx = await makeContext(browser, { language: 'en', seed: { tenants } });
    try {
      const { page, errors } = await openIn(ctx, 'admin/admin.html');
      const rows = await page.locator('[data-property-id]').evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.propertyId, kind: node.querySelector('.property-kind')?.textContent.trim() })));
      assert(rows.some(row => row.id === 'TEN-PMS' && row.kind === 'PMS Connected'), 'PMS property classification is incorrect', rows);
      assert(rows.some(row => row.id === 'PARTNER-1' && row.kind === 'Partner Portal'), 'Partner property classification is incorrect', rows);
      assert(errors.length === 0, 'Dashboard raised runtime errors', errors);
      return rows;
    } finally { await ctx.close(); }
  });

  await run('ADM-TEN-DETAIL-008', 'Tenant detail billing panel uses only the selected tenant records', async () => {
    const billing = [
      { id: 'INV-A', tenantId: 'TEN-PMS', hotelName: 'PMS One', periodStart: '2026-07-01', periodEnd: '2026-07-31', amount: 1000, paidAmount: 400, refundedAmount: 0, currency: 'PHP', status: 'partial' },
      { id: 'INV-B', tenantId: 'PARTNER-1', hotelName: 'Partner One', periodStart: '2026-07-01', periodEnd: '2026-07-31', amount: 9999, paidAmount: 0, refundedAmount: 0, currency: 'USD', status: 'open' }
    ];
    const ctx = await makeContext(browser, { language: 'en', seed: { tenants, billing } });
    try {
      const { page, errors, httpErrors } = await openIn(ctx, 'admin/tenants/detail.html?id=TEN-PMS');
      const state = await page.evaluate(() => ({ text: document.getElementById('tenantBillingPanel')?.innerText || '', rows: document.querySelectorAll('#tenantBillingHistoryBody tr').length }));
      assert(/INV-A/.test(state.text) && /1,000/.test(state.text) && /600/.test(state.text), 'Selected tenant invoice totals are missing', state);
      assert(!/INV-B|9,999|USD/.test(state.text), 'Another tenant invoice leaked into the detail panel', state);
      assert(errors.length === 0, 'Tenant billing panel raised runtime errors', { errors, httpErrors });
      return state;
    } finally { await ctx.close(); }
  });

  await run('ADM-TEN-APPLY-004', 'Duplicate tenant application is blocked without creating another record', async () => {
    const ctx = await makeContext(browser, { seed: { tenantApplications: [{ id: 'APP-OLD', email: 'dup@example.com', hotelName: 'Duplicate Hotel', status: 'pending' }], tenants: [] } });
    try {
      const { page } = await openIn(ctx, 'admin/tenants/apply.html');
      await page.locator('#hotelName').fill('Duplicate Hotel');
      await page.locator('#rooms').fill('10');
      await page.locator('#country').selectOption({ index: 1 });
      await page.locator('#city').fill('Manila');
      await page.locator('#contactName').fill('QA');
      await page.locator('#phone').fill('+63 900 000 0000');
      await page.locator('#email').fill('dup@example.com');
      await page.locator('#password').fill('Password123!');
      await page.locator('#passwordConfirm').fill('Password123!');
      await page.evaluate(() => submitApplication(new Event('submit', { cancelable: true })));
      const state = await page.evaluate(() => ({ error: document.getElementById('applyError').textContent, count: JSON.parse(localStorage.getItem('pms_admin_store:tenantApplications') || '[]').length }));
      assert(/처리 중|already|registered/i.test(state.error) && state.count === 1, 'Duplicate application was not blocked atomically', state);
      return state;
    } finally { await ctx.close(); }
  });
}

async function advertisementCases(browser) {
  const tenants = [
    { id: 'TEN-1', code: 'H1', hotelName: 'Hotel One', status: 'active', city: 'Manila', country: 'Philippines', type: 'pms' },
    { id: 'TEN-2', code: 'H2', hotelName: 'Hotel Two', status: 'suspended', city: 'Cebu', country: 'Philippines', type: 'partner', pmsEnabled: false }
  ];
  const campaign = { id: 'ADS-QA', name: 'QA Campaign', advertiserId: 'TEN-1', advertiser: 'Hotel One', type: 'golf', placement: 'dashboard', startDate: '2026-07-01', endDate: '2026-07-31', budget: 500, status: 'active', imageUrl: `${BASE}/missing-ad-creative.png`, views: 12, leads: 2 };

  await run(['ADM-ADS-LIST-003', 'ADM-ADS-LIST-007'], 'Campaign row opens the exact detail and broken creative has fallback', async () => {
    const ctx = await makeContext(browser, { language: 'en', seed: { adCampaigns: [campaign] } });
    try {
      const { page, errors } = await openIn(ctx, 'admin/ads/campaigns.html');
      const href = await page.locator('a.campaign-detail').getAttribute('href');
      await page.waitForTimeout(500);
      const fallback = await page.locator('.campaign-thumb').innerText();
      assert(href === 'detail.html?id=ADS-QA', 'Campaign detail link does not preserve campaign ID', { href });
      assert(/Image unavailable|이미지/.test(fallback), 'Broken image fallback was not rendered', { fallback });
      const unexpectedErrors = errors.filter(error => !/missing-ad-creative\.png|Failed to load resource/i.test(error));
      assert(unexpectedErrors.length === 0, 'Campaign list raised runtime errors', unexpectedErrors);
      return { href, fallback };
    } finally { await ctx.close(); }
  });

  await run(['ADM-ADS-NEW-001', 'ADM-ADS-NEW-005', 'ADM-ADS-NEW-006', 'ADM-ADS-NEW-009'], 'Campaign form validates advertisers, overlap, preview, and image format', async () => {
    const ctx = await makeContext(browser, { language: 'en', seed: { tenants, adCampaigns: [campaign] } });
    try {
      const { page, errors } = await openIn(ctx, 'admin/ads/new.html');
      const advertisers = await page.locator('#campaignAdvertiser option').evaluateAll(nodes => nodes.map(node => node.value).filter(Boolean));
      assert(advertisers.includes('TEN-1') && !advertisers.includes('TEN-2'), 'Inactive tenant was selectable as advertiser', advertisers);
      await page.locator('#campaignName').fill('Overlap QA');
      await page.locator('#campaignAdvertiser').selectOption('TEN-1');
      await page.locator('#campaignPlacement').selectOption('dashboard');
      await page.locator('#campaignStart').fill('2026-07-10');
      await page.locator('#campaignEnd').fill('2026-07-20');
      await page.locator('#campaignBudget').fill('100');
      await page.locator('#campaignManager').fill('QA Manager');
      await page.locator('#campaignPhone').fill('+63 900 000 0000');
      await page.locator('#campaignEmail').fill('qa@example.com');
      await page.locator('#campaignAddress').fill('Manila');
      const preview = await page.locator('#campaignPreviewTitle').innerText();
      await page.locator('#campaignBannerKo').setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('bad') });
      const imageError = await page.locator('#campaignBannerKoError').innerText();
      let confirmSeen = false;
      page.removeAllListeners('dialog');
      page.once('dialog', async dialog => { confirmSeen = true; await dialog.dismiss(); });
      const saved = await page.evaluate(() => saveCampaign());
      const count = await page.evaluate(() => AdminStore.read('adCampaigns', []).length);
      assert(preview === 'Overlap QA', 'Live preview did not reflect form text', { preview });
      assert(/PNG|JPEG|WebP/.test(imageError), 'Invalid image format was not rejected', { imageError });
      assert(confirmSeen && saved === false && count === 1, 'Overlapping placement was saved without confirmation policy', { confirmSeen, saved, count });
      assert(errors.length === 0, 'Campaign form raised runtime errors', errors);
      return { advertisers, preview, imageError, overlapBlocked: !saved };
    } finally { await ctx.close(); }
  });

  await run(['ADM-ADS-TGT-001', 'ADM-ADS-TGT-004'], 'Target preview resolves eligible hotels and excludes suspended hotels', async () => {
    const targets = [
      { id: 'TGT-ALL', campaignId: 'ADS-QA', mode: 'include', scope: 'all', weight: 1 },
      { id: 'TGT-EX', campaignId: 'ADS-QA', mode: 'exclude', scope: 'hotel', hotelId: 'TEN-2', weight: 1 }
    ];
    const ctx = await makeContext(browser, { language: 'en', seed: { tenants, adTargets: targets } });
    try {
      const { page, errors } = await openIn(ctx, 'admin/ads/targeting.html?id=ADS-QA');
      const state = await page.evaluate(() => ({ count: effectiveTargets().length, names: [...document.querySelectorAll('.target-preview-item strong')].map(node => node.textContent.trim()), saved: saveTargets() }));
      assert(state.count === 1 && state.names.join(',') === 'Hotel One' && state.saved, 'Target preview does not match eligible active hotels', state);
      assert(errors.length === 0, 'Targeting page raised runtime errors', errors);
      return state;
    } finally { await ctx.close(); }
  });

  await run('ADM-ADS-BILL-004', 'Duplicate campaign-period billing is blocked', async () => {
    const bill = { id: 'ADB-1', campaignId: 'ADS-QA', campaignName: 'QA Campaign', advertiser: 'Hotel One', startDate: '2026-07-01', endDate: '2026-07-31', amount: 500, paid: 0, refunded: 0, currency: 'PHP', status: 'pending' };
    const ctx = await makeContext(browser, { seed: { adCampaigns: [campaign], adBilling: [bill] } });
    try {
      const { page } = await openIn(ctx, 'admin/ads/billing.html');
      await page.evaluate(() => openBill());
      await page.locator('#billCampaign').selectOption('ADS-QA');
      await page.locator('#billStart').fill('2026-07-01');
      await page.locator('#billEnd').fill('2026-07-31');
      await page.locator('#billAmount').fill('500');
      const state = await page.evaluate(() => ({ saved: saveBill(), count: AdminStore.read('adBilling', []).length }));
      assert(state.saved === false && state.count === 1, 'Duplicate ad billing record was created', state);
      return state;
    } finally { await ctx.close(); }
  });
}

async function billingAndSystemCases(browser) {
  const tenants = [{ id: 'TEN-1', code: 'H1', hotelName: 'Hotel One', plan: 'Standard', currency: 'PHP', status: 'active' }];
  const invoices = [
    { id: 'INV-1', tenantId: 'TEN-1', hotelName: 'Hotel One', plan: 'Standard', currency: 'PHP', periodStart: '2026-07-01', periodEnd: '2026-07-31', dueAt: '2026-07-05', amount: 1000, paidAmount: 0, refundedAmount: 0, transactions: [], requestKeys: [], status: 'open' },
    { id: 'INV-USD', tenantId: 'TEN-1', hotelName: 'Hotel One', plan: 'Standard', currency: 'USD', periodStart: '2026-06-01', periodEnd: '2026-06-30', dueAt: '2026-07-01', amount: 50, paidAmount: 50, refundedAmount: 0, transactions: [], requestKeys: [], status: 'paid' }
  ];

  await run(['ADM-BILL-001', 'ADM-BILL-003', 'ADM-BILL-004', 'ADM-BILL-006', 'ADM-BILL-008'], 'Billing list performs partial payment/refund, overdue, currencies, and idempotency', async () => {
    const ctx = await makeContext(browser, { language: 'en', seed: { tenants, billing: invoices } });
    try {
      const { page, errors } = await openIn(ctx, 'admin/system/billing.html');
      const initial = await page.evaluate(() => ({ rows: invoices.length, statuses: invoices.map(row => computeStatus(row)), kpi: document.getElementById('billingKpis').innerText }));
      await page.evaluate(() => openPayment('INV-1', 'payment'));
      await page.locator('#paymentAmount').fill('400');
      await page.locator('#paymentRequestKey').fill('QA-PAY-1');
      const first = await page.evaluate(() => savePayment());
      await page.evaluate(() => openPayment('INV-1', 'payment'));
      await page.locator('#paymentAmount').fill('400');
      await page.locator('#paymentRequestKey').fill('QA-PAY-1');
      const retry = await page.evaluate(() => savePayment());
      await page.evaluate(() => openPayment('INV-1', 'refund'));
      await page.locator('#paymentAmount').fill('100');
      await page.locator('#paymentRequestKey').fill('QA-REF-1');
      await page.evaluate(() => savePayment());
      const state = await page.evaluate(() => {
        const row = AdminStore.read('billing', []).find(item => item.id === 'INV-1');
        return { paid: row.paidAmount, refunded: row.refundedAmount, balance: row.amount - row.paidAmount + row.refundedAmount, status: computeStatus(row), transactionCount: row.transactions.length, requestKeys: row.requestKeys.length, kpi: document.getElementById('billingKpis').innerText };
      });
      assert(initial.statuses.includes('overdue') && /PHP/.test(initial.kpi) && /USD/.test(initial.kpi), 'Overdue or currency-separated KPI was incorrect', initial);
      assert(first && retry && state.paid === 400 && state.refunded === 100 && state.balance === 700 && state.transactionCount === 2 && state.requestKeys === 2, 'Payment/refund/idempotency state is incorrect', state);
      assert(errors.length === 0, 'Billing page raised runtime errors', errors);
      return { initial, state };
    } finally { await ctx.close(); }
  });

  await run('ADM-BILL-002', 'Invoice create, edit, and cancel are persisted and audited', async () => {
    const ctx = await makeContext(browser, { seed: { tenants, billing: [] } });
    try {
      const { page } = await openIn(ctx, 'admin/system/billing.html');
      await page.evaluate(() => openInvoice());
      await page.locator('#invoiceTenant').selectOption('TEN-1');
      await page.locator('#invoicePeriodStart').fill('2026-08-01');
      await page.locator('#invoicePeriodEnd').fill('2026-08-31');
      await page.locator('#invoiceDueAt').fill('2026-08-10');
      await page.locator('#invoiceAmount').fill('1200');
      assert(await page.evaluate(() => saveInvoice()), 'Invoice create returned false');
      const id = await page.evaluate(() => AdminStore.read('billing', [])[0].id);
      await page.evaluate(id => openInvoice(id), id);
      await page.locator('#invoiceAmount').fill('1300');
      assert(await page.evaluate(() => saveInvoice()), 'Invoice update returned false');
      await page.evaluate(id => cancelInvoice(id), id);
      const state = await page.evaluate(id => ({ row: AdminStore.read('billing', []).find(item => item.id === id), logs: AdminStore.read('auditLogs', []).filter(item => item.target === id).map(item => item.action) }), id);
      assert(state.row.amount === 1300 && state.row.status === 'cancelled' && state.logs.includes('billing.invoice_create') && state.logs.includes('billing.invoice_update') && state.logs.includes('billing.invoice_cancel'), 'Invoice lifecycle or audit is incomplete', state);
      return state;
    } finally { await ctx.close(); }
  });

  await run(['ADM-INT-008', 'ADM-DASH-008'], 'Integration failure is propagated to only the dashboard warning area', async () => {
    const integrations = [{ id: 'INT-FAIL', name: 'Payment Gateway', active: true, status: 'failed', error: 'timeout', lastError: 'timeout' }];
    const ctx = await makeContext(browser, { language: 'en', seed: { tenants, integrations } });
    try {
      const { page, errors } = await openIn(ctx, 'admin/admin.html');
      const state = await page.evaluate(() => ({ warnings: [...document.querySelectorAll('.integration-warning')].map(node => node.innerText), kpis: document.querySelectorAll('.dashboard-kpi').length }));
      assert(state.warnings.some(text => /Payment Gateway/.test(text) && /timeout/.test(text)) && state.kpis === 5, 'Integration warning did not propagate or broke unrelated widgets', state);
      assert(errors.length === 0, 'Dashboard partial failure raised runtime errors', errors);
      return state;
    } finally { await ctx.close(); }
  });

  await run('ADM-HELP-005', 'Helpdesk attachments honor role visibility and audit authorized access', async () => {
    const tickets = [{ id: 'T-1', hotelName: 'Hotel One', requester: 'Guest', subject: 'Attachment QA', status: 'open', priority: 'High', assignee: '', slaDue: '2026-07-20', messages: [], attachments: [{ name: 'owner.pdf', allowedRoles: ['Platform Owner'] }, { name: 'ops.pdf', allowedRoles: ['Operations'] }] }];
    const ctx = await makeContext(browser, { language: 'en', role: 'Platform Owner', seed: { tickets } });
    try {
      const { page } = await openIn(ctx, 'admin/system/helpdesk.html');
      await page.locator('.ticket-row').click();
      const names = await page.locator('.attachment-button').evaluateAll(nodes => nodes.map(node => node.dataset.name));
      await page.locator('.attachment-button').click();
      const logs = await page.evaluate(() => AdminStore.read('auditLogs', []).filter(row => row.action === 'helpdesk.attachment_view'));
      assert(names.join(',') === 'owner.pdf' && logs.length === 1, 'Attachment role filtering or audit failed', { names, logs });
      return { names, logs };
    } finally { await ctx.close(); }
  });

  await run('ADM-NOTICE-002', 'Selected-hotel notice is visible only to its target tenant', async () => {
    const platformNotices = [{ id: 'N-QA', titleKo: '대상 공지', titleEn: 'Target Notice', contentKo: '대상 내용', contentEn: 'Target Content', audience: 'selected', hotelIds: ['TEN-1'], startDate: '2026-01-01', endDate: '2026-12-31', publicationStatus: 'published', updatedAt: '2026-07-19' }];
    const ctx = await makeContext(browser, { language: 'en', seed: { platformNotices } });
    try {
      await ctx.addInitScript(() => localStorage.setItem('pms_hotel_settings', JSON.stringify({ id: 'TEN-1' })));
      const { page, errors } = await openIn(ctx, 'dashboard/settings/notices.html');
      const target = await page.locator('#noticeList').innerText();
      await page.evaluate(() => { localStorage.setItem('pms_hotel_settings', JSON.stringify({ id: 'TEN-2' })); renderPlatformNotices(); });
      const other = await page.locator('#noticeList').innerText();
      assert(/Target Notice/.test(target) && !/Target Notice/.test(other), 'Selected notice leaked to another tenant or was hidden from target', { target, other });
      assert(errors.length === 0, 'Hotel notice page raised runtime errors', errors);
      return { target, other };
    } finally { await ctx.close(); }
  });

  await run(['ADM-LOG-001', 'ADM-LOG-002'], 'Audit page reads live CRUD records with actor, target, before/after, time, and risk', async () => {
    const logs = [{ id: 'AUD-QA', actor: 'Super Admin', action: 'billing.invoice_cancel', target: 'INV-QA', details: JSON.stringify({ before: { status: 'open' }, after: { status: 'cancelled' } }), createdAt: '2026-07-19T10:00:00Z', risk: 'High', ip: '127.0.0.1' }];
    const ctx = await makeContext(browser, { language: 'en', seed: { auditLogs: logs } });
    try {
      const { page, errors } = await openIn(ctx, 'admin/system/audit-logs.html');
      const state = await page.evaluate(() => ({ text: document.getElementById('auditTableBody').innerText, rows: document.querySelectorAll('#auditTableBody tr[data-audit-id]').length }));
      assert(state.rows === 1 && /Super Admin/.test(state.text) && /INV-QA/.test(state.text) && /open/.test(state.text) && /cancelled/.test(state.text), 'Audit log lost CRUD before/after evidence', state);
      assert(errors.length === 0, 'Audit log page raised runtime errors', errors);
      return state;
    } finally { await ctx.close(); }
  });

  await run('ADM-PROFILE-004', 'Profile language and notification settings persist after reload', async () => {
    const users = [{ id: 'ADM-001', name: 'Super Admin', email: 'superadmin@platform.example', role: 'Platform Owner', status: 'active', password: 'admin1234' }];
    const ctx = await makeContext(browser, { seed: { users } });
    try {
      const { page } = await openIn(ctx, 'admin/system/profile.html');
      await page.locator('#profileLanguage').selectOption('en');
      await page.locator('#profileNotifications').uncheck();
      await page.evaluate(() => saveProfile());
      await page.reload();
      await page.waitForTimeout(350);
      const state = await page.evaluate(() => ({ profile: AdminStore.read('profile', {}), lang: localStorage.getItem('pms_lang'), selected: document.getElementById('profileLanguage').value, notifications: document.getElementById('profileNotifications').checked }));
      assert(state.profile.language === 'en' && state.profile.notifications === false && state.lang === 'en' && state.selected === 'en' && state.notifications === false, 'Profile preferences did not persist after reload', state);
      return state;
    } finally { await ctx.close(); }
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await shellCases(browser);
    await dashboardAndTenantCases(browser);
    await advertisementCases(browser);
    await billingAndSystemCases(browser);
  } finally {
    await browser.close();
  }
  const passed = results.filter(row => row.status === 'PASS').length;
  const failed = results.length - passed;
  fs.writeFileSync(OUT, JSON.stringify({ suite: 'admin-plan-remaining', total: results.length, passed, failed, results }, null, 2));
  console.log(JSON.stringify({ total: results.length, passed, failed, output: OUT }, null, 2));
  process.exitCode = failed ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
