const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.env.PMS_BASE_URL || 'https://hotelpms-eight.vercel.app';
const RUN_ID = process.env.PMS_CYCLE_RUN_ID || `CYCLE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
const OUT_DIR = process.env.PMS_CYCLE_OUTPUT_DIR || path.join(ROOT, 'outputs', 'full-cycle-20260722');

const suites = [
  { id: 'BASELINE', mode: 'ISOLATED_BUSINESS_FLOW', file: 'e2e-business-flows.cjs', result: 'baseline.json' },
  { id: 'AUTH', mode: 'ISOLATED_FUNCTIONAL', file: 'audit-plan-functional-auth.cjs', result: 'auth.json' },
  { id: 'CRITICAL_UI', mode: 'ISOLATED_FUNCTIONAL', file: 'audit-critical-ui.cjs', result: 'critical-ui.json' },
  {
    id: 'STAFF_ROLE_GUARDS',
    mode: 'ISOLATED_FUNCTIONAL',
    file: 'audit-plan-hotel-direct.cjs',
    result: 'staff-role-guards.json',
    env: { PMS_CASES: 'AUTH-003,AUTH-004,STAFF-014,ROLE-010' }
  },
  { id: 'FRONTDESK', mode: 'ISOLATED_FUNCTIONAL', file: 'audit-plan-functional-frontdesk.cjs', result: 'frontdesk.json' },
  { id: 'GROUPS_ROOMS', mode: 'ISOLATED_FUNCTIONAL', file: 'audit-plan-functional-groups-rooms.cjs', result: 'groups-rooms.json' },
  { id: 'OPERATIONS', mode: 'ISOLATED_FUNCTIONAL', file: 'audit-plan-functional-operations.cjs', result: 'operations.json' },
  { id: 'OPERATIONS_EXTENDED', mode: 'ISOLATED_FUNCTIONAL', file: 'audit-plan-functional-operations-extended.cjs', result: 'operations-extended.json' },
  { id: 'STATE_TRANSITIONS', mode: 'ISOLATED_STATE_TRANSITION', file: 'audit-proactive-state-transitions.cjs', result: 'state-transitions.json' }
];

fs.mkdirSync(OUT_DIR, { recursive: true });

const executed = suites.map(suite => {
  const env = { ...process.env, PMS_BASE_URL: BASE, PMS_CYCLE_RUN_ID: RUN_ID, ...(suite.env || {}) };
  if (suite.result) env.PMS_RESULT_FILE = path.join(OUT_DIR, suite.result);
  const script = path.join(__dirname, suite.file);
  const startedAt = new Date().toISOString();
  process.stdout.write(`\n=== ${suite.id} (${suite.mode}) ===\n`);
  const run = spawnSync(process.execPath, [script], { cwd: ROOT, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  let payload = null;
  if (suite.result && fs.existsSync(env.PMS_RESULT_FILE)) payload = JSON.parse(fs.readFileSync(env.PMS_RESULT_FILE, 'utf8'));
  const rawResults = payload?.results || [];
  const inferredPassed = rawResults.filter(item => item.status === 'PASS' || item.ok === true).length;
  const inferredFailed = rawResults.filter(item => item.status === 'FAIL' || item.ok === false).length;
  const summary = payload?.summary || {
    total: Number(payload?.total ?? rawResults.length),
    passed: Number(payload?.passed ?? inferredPassed),
    failed: Number(payload?.failed ?? inferredFailed),
    blocked: 0
  };
  return {
    id: suite.id,
    mode: suite.mode,
    script: suite.file,
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: run.status,
    summary,
    resultFile: suite.result,
    results: rawResults
  };
});

const aggregate = executed.reduce((acc, suite) => {
  acc.total += Number(suite.summary.total || 0);
  acc.passed += Number(suite.summary.passed || 0);
  acc.failed += Number(suite.summary.failed || 0);
  acc.blocked += Number(suite.summary.blocked || 0);
  return acc;
}, { total: 0, passed: 0, failed: 0, blocked: 0 });

const architectureGate = {
  id: 'CYCLE-ARCH-001',
  status: 'BLOCKED',
  reason: 'Admin and PMS currently use separate browser localStorage stores. Server-side propagation through one shared backend cannot be verified in this static deployment.'
};
aggregate.total += 1;
aggregate.blocked += 1;

const baselineSuite = executed.find(suite => suite.id === 'BASELINE');
const connectedResult = baselineSuite?.results.find(result =>
  String(result.name || '').toLowerCase().includes('connected reservation')
);
const connectedCycleGate = {
  id: 'CYCLE-E2E-001',
  status: connectedResult?.ok === true ? 'PASS' : 'FAIL',
  reason: connectedResult?.ok === true
    ? 'One browser context completed reservation, ancillary, settlement, reopen, expense and final settlement with linked identifiers.'
    : (connectedResult?.error || 'The connected business-cycle result was not produced by the baseline suite.'),
  result: connectedResult || null
};
aggregate.total += 1;
if (connectedCycleGate.status === 'PASS') aggregate.passed += 1;
else aggregate.failed += 1;

const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  runId: RUN_ID,
  scope: 'deployed production-like static site',
  summary: aggregate,
  architectureGate,
  connectedCycleGate,
  suites: executed
};
fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`\n${JSON.stringify({ runId: RUN_ID, base: BASE, summary: aggregate, output: path.join(OUT_DIR, 'summary.json') }, null, 2)}\n`);
if (aggregate.failed > 0 || executed.some(suite => suite.exitCode !== 0)) process.exitCode = 1;
