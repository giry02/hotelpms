const path = require('path');
const { launch, openPage, createResultCollector, cleanRuntimeErrors, ROOT, BASE, assert } = require('./plan-test-harness.cjs');

const OUT = process.env.PMS_RESULT_FILE || path.join(ROOT, 'outputs', 'full-plan-20260719', '101-functional-auth.json');

(async () => {
  const { browser, server } = await launch();
  const result = createResultCollector(OUT);
  try {
    await result.run('AUTH-002', '잘못된 비밀번호 차단', '오류 안내, 세션 미생성, 로그인 화면 유지', async () => {
      const state = await openPage(browser, 'dashboard/login.html', { authenticated: false });
      try {
        const { page } = state;
        await page.locator('#email').fill('admin@hotel.com');
        await page.locator('#password').fill('wrong-password');
        await page.locator('#btnLogin').click();
        await page.waitForTimeout(1400);
        const actual = await page.evaluate(() => ({
          session: sessionStorage.getItem('pms_logged_in'),
          path: location.pathname,
          error: document.querySelector('#loginError')?.innerText.trim()
        }));
        assert(actual.session !== 'true', '잘못된 비밀번호로 세션이 생성됨', actual);
        assert(actual.path.endsWith('/login.html'), '로그인 실패 후 보호 화면으로 이동함', actual);
        assert(actual.error, '로그인 실패 원인 안내가 없음', actual);
        cleanRuntimeErrors(state);
        return actual;
      } finally { await state.context.close(); }
    });

    await result.run('AUTH-008', '사이드바 대메뉴 아코디언과 active 경로', '서로 다른 대메뉴를 순서대로 열고 단일 확장 및 현재 하위 메뉴 active 확인', async () => {
      const state = await openPage(browser, 'dashboard/frontdesk/reservation-board.html');
      try {
        const { page } = state;
        const parents = page.locator('.nav-item[data-menu]');
        assert(await parents.count() >= 2, '검증할 사이드바 대메뉴가 부족함');
        await parents.nth(0).locator('.nav-chevron').click();
        await parents.nth(1).locator('.nav-chevron').click();
        const actual = await page.evaluate(() => ({
          expanded: [...document.querySelectorAll('.nav-item[data-menu].expanded')].map(node => node.dataset.menu),
          active: [...document.querySelectorAll('.sidebar-nav a.active')].map(node => node.getAttribute('href'))
        }));
        assert(actual.expanded.length === 1, '두 개 이상의 대메뉴가 동시에 펼쳐짐', actual);
        assert(actual.active.some(href => String(href).includes('reservation-board.html')), '현재 화면 메뉴 active 위치가 다름', actual);
        cleanRuntimeErrors(state);
        return actual;
      } finally { await state.context.close(); }
    });

    await result.run('AUTH-010', '로그아웃 후 뒤로가기 보호', '로그아웃 버튼 클릭 후 세션 삭제, 로그인 이동, 뒤로가기 보호', async () => {
      const state = await openPage(browser, 'dashboard/dashboard.html');
      try {
        const { page } = state;
        await page.locator('.sidebar-logout-btn').click();
        await page.waitForURL(/dashboard\/login\.html/, { timeout: 5000 });
        const afterLogout = await page.evaluate(() => sessionStorage.getItem('pms_logged_in'));
        await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => null);
        await page.waitForTimeout(300);
        const backUrl = page.url();
        await page.goto(`${BASE}/dashboard/dashboard.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);
        const actual = await page.evaluate(() => ({ path: location.pathname, session: sessionStorage.getItem('pms_logged_in') }));
        assert(afterLogout !== 'true', '로그아웃 후 세션이 남음', { afterLogout, actual });
        assert(actual.path.endsWith('/login.html'), '뒤로가기로 보호 페이지에 재진입함', actual);
        return { afterLogout, backUrl, ...actual };
      } finally { await state.context.close(); }
    });

    await result.run('AUTH-012', '내 정보 이메일·비밀번호 변경과 재로그인', '일반 직원으로 프로필 저장 후 이전 비밀번호 차단, 새 비밀번호 로그인', async () => {
      const staff = [{
        id: 'QA-PROFILE-1', name: 'QA Profile', email: 'qa.profile.old@example.com',
        password: 'OldPassword1!', roleId: 'sys_desk', status: 'active', phone: '+63 900 000 0000', address: 'Manila'
      }];
      const state = await openPage(browser, 'dashboard/dashboard.html', {
        seed: {
          'raw:pms_staff': staff,
          'raw:mock_user_id': 'QA-PROFILE-1',
          'raw:currentUserRole': 'sys_desk',
          'raw:pms_staff_email': 'qa.profile.old@example.com'
        }
      });
      try {
        const { page } = state;
        await page.locator('.sidebar-profile-btn').click();
        await page.locator('#profileEmail').fill('qa.profile.new@example.com');
        await page.locator('#profileNewPw').fill('NewPassword1!');
        await page.locator('#profileNewPwConfirm').fill('NewPassword1!');
        await page.locator('#sidebarProfileModal .btn-primary-sm').click();
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pms_staff') || '[]').find(row => row.id === 'QA-PROFILE-1'));
        assert(saved?.email === 'qa.profile.new@example.com', '변경 이메일이 직원 데이터에 저장되지 않음', saved);
        assert(saved?.password === 'NewPassword1!', '변경 비밀번호 값이 직원 데이터에 저장되지 않음', saved);

        await page.evaluate(() => sessionStorage.clear());
        await page.goto(`${BASE}/dashboard/login.html`);
        await page.locator('#email').fill('qa.profile.new@example.com');
        await page.locator('#password').fill('OldPassword1!');
        await page.locator('#btnLogin').click();
        await page.waitForTimeout(1400);
        const oldBlocked = await page.evaluate(() => sessionStorage.getItem('pms_logged_in') !== 'true');
        assert(oldBlocked, '이전 비밀번호로 로그인이 허용됨');
        await page.locator('#password').fill('NewPassword1!');
        await page.locator('#btnLogin').click();
        await page.waitForTimeout(1400);
        const loggedIn = await page.evaluate(() => sessionStorage.getItem('pms_logged_in') === 'true');
        assert(loggedIn, '변경 비밀번호로 재로그인되지 않음', saved);
        return { email: saved.email, oldPasswordBlocked: oldBlocked, newPasswordLogin: loggedIn };
      } finally { await state.context.close(); }
    });
  } finally {
    const payload = result.write({ suite: 'functional-auth' });
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    console.log(JSON.stringify(payload.summary));
    process.exitCode = payload.summary.failed ? 1 : 0;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
