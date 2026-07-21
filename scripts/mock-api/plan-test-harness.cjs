const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.env.PMS_BASE_URL || 'http://127.0.0.1:8765';

function assert(condition, message, details = null) {
  if (condition) return;
  const error = new Error(message);
  error.details = details;
  throw error;
}

function httpOk(url) {
  return new Promise(resolve => {
    const client = new URL(url).protocol === 'https:' ? https : http;
    const request = client.get(url, response => {
      response.resume();
      resolve(response.statusCode < 400);
    });
    request.setTimeout(2500, () => {
      request.destroy();
      resolve(false);
    });
    request.on('error', () => resolve(false));
  });
}

function contentType(file) {
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
  }[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function serveStatic(port) {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);
    const safePath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = path.join(ROOT, safePath === path.sep ? 'index.html' : safePath);
    if (!file.startsWith(ROOT)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      response.writeHead(200, { 'Content-Type': contentType(file) });
      response.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', () => resolve(null));
  });
}

async function ensureServer() {
  if (await httpOk(`${BASE}/dashboard/login.html`)) return null;
  if (new URL(BASE).protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(new URL(BASE).hostname)) {
    throw new Error(`Production test target is unavailable: ${BASE}`);
  }
  const port = Number(new URL(BASE).port || 8765);
  return serveStatic(port);
}

async function launch() {
  const server = await ensureServer();
  const browser = await chromium.launch({ headless: true });
  return { browser, server };
}

async function openPage(browser, route, options = {}) {
  const {
    language = 'ko',
    authenticated = true,
    admin = route.startsWith('admin/'),
    viewport = { width: 1440, height: 1000 },
    seed = {},
    beforeLoad = null,
    routes = []
  } = options;
  const context = await browser.newContext({ viewport });
  await context.addInitScript(({ language, authenticated, admin, seed }) => {
    if (sessionStorage.getItem('__pms_test_seeded') === 'true' || localStorage.getItem('__pms_test_seeded') === 'true') return;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('pms_lang', language);
    localStorage.setItem('pms_admin_lang', language);
    localStorage.setItem('pms_default_currency', 'PHP');
    localStorage.setItem('pms_currency', 'PHP');
    if (authenticated) {
      sessionStorage.setItem('pms_logged_in', 'true');
      sessionStorage.setItem('admin_logged_in', 'true');
      if (admin) {
        sessionStorage.setItem('admin_session', JSON.stringify({
          userId: 'ADM-SUPER',
          name: 'Super Admin',
          role: 'Platform Owner',
          expiresAt: Date.now() + 60 * 60 * 1000
        }));
      }
    }
    for (const [key, value] of Object.entries(seed)) {
      const storageKey = key.startsWith('raw:') ? key.slice(4) : (admin ? `pms_admin_store:${key}` : key);
      localStorage.setItem(storageKey, typeof value === 'string' ? value : JSON.stringify(value));
    }
    sessionStorage.setItem('__pms_test_seeded', 'true');
    localStorage.setItem('__pms_test_seeded', 'true');
  }, { language, authenticated, admin, seed });
  if (beforeLoad) await context.addInitScript(beforeLoad);
  for (const route of routes) {
    await context.route(route.url, route.handler);
  }
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const responseErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(BASE).origin) {
      responseErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(350);
  return { context, page, pageErrors, consoleErrors, responseErrors };
}

function createResultCollector(outputFile) {
  const results = [];
  async function run(id, title, procedure, callback) {
    const startedAt = new Date().toISOString();
    try {
      const details = await callback();
      results.push({ id, title, procedure, status: 'PASS', startedAt, finishedAt: new Date().toISOString(), details });
      process.stdout.write(`PASS ${id} ${title}\n`);
    } catch (error) {
      results.push({
        id,
        title,
        procedure,
        status: 'FAIL',
        startedAt,
        finishedAt: new Date().toISOString(),
        error: error.message,
        details: error.details || null,
        stack: error.stack
      });
      process.stdout.write(`FAIL ${id} ${title}: ${error.message}\n`);
    }
  }
  function block(id, title, procedure, reason) {
    results.push({ id, title, procedure, status: 'BLOCKED', reason, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() });
    process.stdout.write(`BLOCKED ${id} ${title}: ${reason}\n`);
  }
  function write(extra = {}) {
    const summary = {
      total: results.length,
      passed: results.filter(row => row.status === 'PASS').length,
      failed: results.filter(row => row.status === 'FAIL').length,
      blocked: results.filter(row => row.status === 'BLOCKED').length
    };
    const payload = { generatedAt: new Date().toISOString(), summary, results, ...extra };
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    return payload;
  }
  return { results, run, block, write };
}

function cleanRuntimeErrors(state) {
  const ignored = /favicon\.ico|ERR_ABORTED|Failed to load resource.*favicon/i;
  const errors = [...state.pageErrors, ...state.consoleErrors, ...state.responseErrors].filter(message => !ignored.test(message));
  assert(errors.length === 0, 'Unexpected browser runtime errors', errors);
  return errors;
}

module.exports = {
  ROOT,
  BASE,
  assert,
  launch,
  openPage,
  createResultCollector,
  cleanRuntimeErrors
};
