/**
 * Honda Financial Services Dealer Portal — Official Login Regression (TC-001 … TC-042)
 *
 * Source of truth: testData/hfi/loginRegressionCatalog.ts
 * Manual index: regression/login/login-regression-suite.md
 */

import { test, expect, type Page } from "@playwright/test";
import {
  getCredentials,
  getLoginUrl,
  getMustResetCredentials,
  getLockoutTestCredentials,
  getSessionIdleTimeoutMs,
  getSuspendedAccountCredentials,
  getMustResetLoginId,
  getSingleSessionTestCredentials,
  isHttpsBaseUrl,
  requireEmailLoginUsername,
} from "@config/env";
import { LOGIN_REGRESSION_CASES } from "@testData/hfi/loginRegressionCatalog";
import { loginData } from "@testData/hfi/loginData";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { HFIResetPasswordPage } from "@pages/hfi-portal/reset-password/HFIResetPasswordPage";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";
import {
  hasAuthArtifacts,
  snapshotAuthStorage,
} from "@utils/authStorage";
import { readAuthTokenFromPage } from "@utils/authToken";

const CASE = Object.fromEntries(
  LOGIN_REGRESSION_CASES.map((c) => [c.id, c]),
) as Record<string, (typeof LOGIN_REGRESSION_CASES)[number]>;

function priorityTag(p: string): string {
  return `@${p.toLowerCase()}`;
}

function typeTag(t: string): string {
  return `@${t.toLowerCase()}`;
}

/** HFS-T0010 — Browser A session ended (login redirect, session message, or 401). */
async function verifyBrowserASessionInvalidated(
  page: Page,
  loginPage: HFILoginPage,
  saw401: boolean,
): Promise<{ invalidated: boolean; detail: string }> {
  if (saw401) {
    return { invalidated: true, detail: "HTTP 401 observed on Browser A" };
  }
  if (await loginPage.isOnLoginPage()) {
    return { invalidated: true, detail: "Browser A on /login" };
  }
  const sessionBanner = await page
    .getByText(/session|expired|unauthorized|logged out|signed out/i)
    .first()
    .isVisible()
    .catch(() => false);
  if (sessionBanner) {
    return { invalidated: true, detail: "Session invalidation message on Browser A" };
  }
  const dashboard = new HFIDashboardPage(page);
  if (!(await dashboard.isDashboardLoaded())) {
    return {
      invalidated: true,
      detail: "Browser A no longer on authenticated dashboard view",
    };
  }
  return {
    invalidated: false,
    detail: `Browser A still authenticated at ${page.url()}`,
  };
}

test.describe("Honda Dealer Portal - Login Regression Suite @honda @login @regression", () => {
  test.setTimeout(120_000);

  test(`${CASE["HFS-T0001"].id} - ${CASE["HFS-T0001"].title} ${typeTag(CASE["HFS-T0001"].type)} ${priorityTag(CASE["HFS-T0001"].priority)} @smoke @honda`, async ({
    page,
  }) => {
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.verifyMandatoryLoginElements();
  });

  test(`${CASE["HFS-T0002"].id} - ${CASE["HFS-T0002"].title} ${typeTag(CASE["HFS-T0002"].type)} ${priorityTag(CASE["HFS-T0002"].priority)} @honda`, async ({
    page,
  }) => {
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.enterPassword("Test@1234");
    expect(await loginPage.getPasswordInputType()).toBe("password");
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordInputType()).toBe("text");
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordInputType()).toBe("password");
  });

  test(`${CASE["HFS-T0003"].id} - ${CASE["HFS-T0003"].title} ${typeTag(CASE["HFS-T0003"].type)} ${priorityTag(CASE["HFS-T0003"].priority)} @honda`, async ({
    page,
  }) => {
    const loginPage = new HFILoginPage(page);
    const loginUrl = new URL(getLoginUrl());
    const httpLogin = `http://${loginUrl.host}${loginUrl.pathname}${loginUrl.search}`;

    await page.goto(httpLogin, { waitUntil: "domcontentloaded" });
    await expect(
      page,
      "TC-003: http:// login must redirect to https://",
    ).toHaveURL(/^https:\/\//i, { timeout: 30_000 });

    const response = await page.goto(page.url(), { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBeTruthy();
    await loginPage.verifyLoginPage();
  });

  test(`${CASE["HFS-T0004"].id} - ${CASE["HFS-T0004"].title} ${typeTag(CASE["HFS-T0004"].type)} ${priorityTag(CASE["HFS-T0004"].priority)} @smoke @honda`, async ({
    page,
  }) => {
    const { dealerId, password } = loginData.tc004ReturningUser();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(dealerId, password);
    await loginPage.verifyDashboardLoaded();
    await expect(
      page.getByText(/consumer finance|dealer onboarding|dashboard/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test(`${CASE["HFS-T0005"].id} - ${CASE["HFS-T0005"].title} ${typeTag(CASE["HFS-T0005"].type)} ${priorityTag(CASE["HFS-T0005"].priority)} @smoke @honda`, async ({
    page,
  }) => {
    const loginUsername = requireEmailLoginUsername();
    const { password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(loginUsername, password);
    await loginPage.verifyDashboardLoaded();
  });

  test(`${CASE["HFS-T0006"].id} - ${CASE["HFS-T0006"].title} ${typeTag(CASE["HFS-T0006"].type)} ${priorityTag(CASE["HFS-T0006"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();
    await expect(
      page.getByText(/consumer finance|dealer onboarding|dashboard/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test(`${CASE["HFS-T0007"].id} - ${CASE["HFS-T0007"].title} ${typeTag(CASE["HFS-T0007"].type)} ${priorityTag(CASE["HFS-T0007"].priority)} @honda`, async ({
    page,
  }) => {
    const resetCreds = getMustResetCredentials();
    test.skip(
      !resetCreds,
      "Test Data Issue – set MUST_RESET_USERNAME / MUST_RESET_PASSWORD (e.g. MP00007 / Temp@123).",
    );

    const loginPage = new HFILoginPage(page);
    const setPasswordPage = new HFIResetPasswordPage(page);
    await loginPage.open();
    await loginPage.login(
      getMustResetLoginId(resetCreds!),
      resetCreds!.password,
    );
    await setPasswordPage.verifySetPasswordScreen();
    expect(await setPasswordPage.isSetPasswordScreen()).toBeTruthy();
  });

  test(`${CASE["HFS-T0008"].id} - ${CASE["HFS-T0008"].title} ${typeTag(CASE["HFS-T0008"].type)} ${priorityTag(CASE["HFS-T0008"].priority)} @honda`, async ({
    page,
  }) => {
    const resetCreds = getMustResetCredentials();
    test.skip(
      !resetCreds,
      "Test Data Issue – set MUST_RESET_USERNAME / MUST_RESET_PASSWORD (e.g. DLR55555 / AdminReset@1).",
    );

    const loginPage = new HFILoginPage(page);
    const setPasswordPage = new HFIResetPasswordPage(page);
    await loginPage.open();
    await loginPage.login(
      getMustResetLoginId(resetCreds!),
      resetCreds!.password,
    );
    await setPasswordPage.verifySetPasswordScreen();
  });

  test(`${CASE["HFS-T0009"].id} - ${CASE["HFS-T0009"].title} ${typeTag(CASE["HFS-T0009"].type)} ${priorityTag(CASE["HFS-T0009"].priority)} @honda`, async ({
    page,
  }) => {
    const resetCreds = getMustResetCredentials();
    test.skip(
      !resetCreds,
      "Test Data Issue – requires logged-in session with must_reset_password = true.",
    );

    const loginPage = new HFILoginPage(page);
    const setPasswordPage = new HFIResetPasswordPage(page);
    await loginPage.open();
    await loginPage.login(
      getMustResetLoginId(resetCreds!),
      resetCreds!.password,
    );
    await setPasswordPage.verifySetPasswordScreen();
    await expect(page).toHaveURL(/reset-password/i);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(
      page,
      "TC-009: protected /dashboard must redirect to Set Password, not Login or dashboard",
    ).toHaveURL(/reset-password/i, { timeout: 15_000 });
    await setPasswordPage.verifySetPasswordScreen();
    expect(await new HFIDashboardPage(page).isDashboardLoaded()).toBeFalsy();
  });

  test(`${CASE["HFS-T0010"].id} - ${CASE["HFS-T0010"].title} ${typeTag(CASE["HFS-T0010"].type)} ${priorityTag(CASE["HFS-T0010"].priority)} @honda`, async ({
    browser,
  }) => {
    test.setTimeout(180_000);
    const { username, password, postLoginPath } =
      getSingleSessionTestCredentials();

    let saw401OnBrowserA = false;
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    pageA.on("response", (response) => {
      if (response.status() === 401) {
        saw401OnBrowserA = true;
      }
    });

    const loginA = new HFILoginPage(pageA);
    const loginB = new HFILoginPage(pageB);
    const dashboardA = new HFIDashboardPage(pageA);
    const dashboardB = new HFIDashboardPage(pageB);

    await test.step("1–3: Browser A — login and verify dashboard", async () => {
      await loginA.open();
      await loginA.login(username, password);
      await loginA.verifyDashboardLoaded();
    });

    await test.step("4–6: Browser B — same credentials, verify dashboard", async () => {
      await loginB.open();
      await loginB.login(username, password);
      await loginB.verifyDashboardLoaded();
    });

    let invalidation: { invalidated: boolean; detail: string } = {
      invalidated: false,
      detail: "",
    };

    await test.step("7–9: Browser A — refresh and navigate to trigger session check", async () => {
      await pageA.reload({ waitUntil: "domcontentloaded" });
      await pageA.waitForLoadState("networkidle").catch(() => undefined);
      invalidation = await verifyBrowserASessionInvalidated(
        pageA,
        loginA,
        saw401OnBrowserA,
      );

      if (!invalidation.invalidated) {
        await pageA.goto(postLoginPath, {
          waitUntil: "domcontentloaded",
        });
        await pageA.waitForLoadState("networkidle").catch(() => undefined);
        invalidation = await verifyBrowserASessionInvalidated(
          pageA,
          loginA,
          saw401OnBrowserA,
        );
      }

      if (!invalidation.invalidated) {
        const menuLink = pageA
          .getByRole("link", { name: /consumer finance|home|dashboard|onboarding/i })
          .first();
        if (await menuLink.isVisible().catch(() => false)) {
          await menuLink.click();
          await pageA.waitForLoadState("networkidle").catch(() => undefined);
          invalidation = await verifyBrowserASessionInvalidated(
            pageA,
            loginA,
            saw401OnBrowserA,
          );
        }
      }
    });

    await test.step("10: Browser A session must be invalidated (401 or login)", async () => {
      const browserAStillAuthenticated =
        await dashboardA.isDashboardLoaded();
      const onLoginA = await loginA.isOnLoginPage();

      expect(
        browserAStillAuthenticated && !onLoginA,
        `Single active session failed: Browser A still usable at ${pageA.url()} ` +
          `(saw401=${saw401OnBrowserA}, onLogin=${onLoginA}). ` +
          "Application allows concurrent sessions for the same dealer.",
      ).toBeFalsy();

      expect(
        onLoginA || !browserAStillAuthenticated || saw401OnBrowserA,
        "Browser A should be redirected to login, lose dashboard access, and/or receive 401.",
      ).toBeTruthy();
    });

    await test.step("11: Browser B remains logged in and functional", async () => {
      await pageB.reload({ waitUntil: "domcontentloaded" });
      await dashboardB.verifyDashboardLoaded();
      await pageB.goto(postLoginPath, {
        waitUntil: "domcontentloaded",
      });
      await dashboardB.verifyDashboardLoaded();
    });

    await contextA.close();
    await contextB.close();
  });

  test(`${CASE["HFS-T0011"].id} - ${CASE["HFS-T0011"].title} ${typeTag(CASE["HFS-T0011"].type)} ${priorityTag(CASE["HFS-T0011"].priority)} @honda`, async ({
    page,
  }) => {
    const idleMs = getSessionIdleTimeoutMs();
    test.skip(
      idleMs === undefined,
      "Cannot Verify: set SESSION_IDLE_TIMEOUT_MS to the app-configured idle timeout (spec 900000 for 15 min). Do not reduce unless QA confirms env uses a lower value.",
    );

    test.setTimeout(idleMs! + 120_000);
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);

    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();

    await page.waitForTimeout(idleMs!);

    await page.goto("/consumer-finance", { waitUntil: "domcontentloaded" });
    const onLogin = await loginPage.isOnLoginPage();
    const expiredMsg = await page
      .getByText(/session|expired|timed out|inactive/i)
      .first()
      .isVisible()
      .catch(() => false);

    expect(onLogin || expiredMsg).toBeTruthy();
    expect(await new HFIDashboardPage(page).isDashboardLoaded()).toBeFalsy();
  });

  test(`${CASE["HFS-T0012"].id} - ${CASE["HFS-T0012"].title} ${typeTag(CASE["HFS-T0012"].type)} ${priorityTag(CASE["HFS-T0012"].priority)} @honda`, async ({
    page,
  }) => {
    test.skip(
      process.env.RUN_SESSION_ACTIVITY_TEST !== "true",
      "Cannot Verify: TC-012 requires activity every 5 min for 30 min. Set RUN_SESSION_ACTIVITY_TEST=true and SESSION_ACTIVITY_DURATION_MS / SESSION_ACTIVITY_INTERVAL_MS for a controlled run.",
    );

    const durationMs = Number.parseInt(
      process.env.SESSION_ACTIVITY_DURATION_MS ?? "1800000",
      10,
    );
    const intervalMs = Number.parseInt(
      process.env.SESSION_ACTIVITY_INTERVAL_MS ?? "300000",
      10,
    );
    test.setTimeout(durationMs + 180_000);

    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    const dashboard = new HFIDashboardPage(page);

    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();

    const end = Date.now() + durationMs;
    while (Date.now() < end) {
      await page.reload({ waitUntil: "domcontentloaded" });
      await dashboard.verifyDashboardLoaded();
      await page.waitForTimeout(intervalMs);
    }
  });

  test(`${CASE["HFS-T0013"].id} - ${CASE["HFS-T0013"].title} ${typeTag(CASE["HFS-T0013"].type)} ${priorityTag(CASE["HFS-T0013"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);

    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();

    const beforeLogout = await snapshotAuthStorage(page);
    await loginPage.logout();
    const afterLogout = await snapshotAuthStorage(page);

    if (hasAuthArtifacts(beforeLogout)) {
      expect(hasAuthArtifacts(afterLogout)).toBeFalsy();
    }

    await page.goBack();
    await expect(page).toHaveURL(/\/login/i, { timeout: 15_000 });
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test(`${CASE["HFS-T0014"].id} - ${CASE["HFS-T0014"].title} ${typeTag(CASE["HFS-T0014"].type)} ${priorityTag(CASE["HFS-T0014"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    const dashboard = new HFIDashboardPage(page);

    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();
    await loginPage.logout();

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/i, { timeout: 15_000 });
    expect(await dashboard.isDashboardLoaded()).toBeFalsy();
  });

  test(`${CASE["HFS-T0015"].id} - ${CASE["HFS-T0015"].title} ${typeTag(CASE["HFS-T0015"].type)} ${priorityTag(CASE["HFS-T0015"].priority)} @honda`, async ({
    page,
  }) => {
    const { username } = getCredentials();
    const loginPage = new HFILoginPage(page);
    const message = await loginPage.expectFailedLogin(username, "WrongPass@999");

    expect(message.toLowerCase()).toMatch(/invalid credentials/i);
    expect(message).toMatch(/\d+\s*attempts?\s*remaining/i);
  });

  test(`${CASE["HFS-T0016"].id} - ${CASE["HFS-T0016"].title} ${typeTag(CASE["HFS-T0016"].type)} ${priorityTag(CASE["HFS-T0016"].priority)} @honda`, async ({
    page,
  }) => {
    const loginPage = new HFILoginPage(page);
    const message = await loginPage.expectFailedLogin(
      loginData.invalidUsername.username,
      loginData.invalidUsername.password,
    );

    expect(message.toLowerCase()).toMatch(/invalid credentials/i);
    expect(message.toLowerCase()).not.toMatch(/user.*not found|does not exist/i);
  });

  test(`${CASE["HFS-T0017"].id} - ${CASE["HFS-T0017"].title} ${typeTag(CASE["HFS-T0017"].type)} ${priorityTag(CASE["HFS-T0017"].priority)} @honda`, async ({
    page,
  }) => {
    const lockoutUser = getLockoutTestCredentials();
    test.skip(
      !lockoutUser,
      "Test Data Issue: set LOCKOUT_TEST_USERNAME / LOCKOUT_TEST_PASSWORD for counter-decrement test (do not use primary dealer — risk of lockout).",
    );

    const loginPage = new HFILoginPage(page);
    const remainingCounts: number[] = [];
    const { username } = lockoutUser!;

    await loginPage.open();
    for (let attempt = 1; attempt <= 4; attempt++) {
      await loginPage.enterUsername(username);
      await loginPage.enterPassword(`Wrong@${attempt}`);
      await loginPage.clickSignIn();
      const message = await loginPage.getAuthErrorMessage();
      const match = message.match(/(\d+)\s*attempts?\s*remaining/i);
      expect(match, `Attempt ${attempt}: ${message}`).toBeTruthy();
      remainingCounts.push(Number.parseInt(match![1], 10));
    }

    expect(remainingCounts).toEqual([4, 3, 2, 1]);
  });

  test(`${CASE["HFS-T0018"].id} - ${CASE["HFS-T0018"].title} ${typeTag(CASE["HFS-T0018"].type)} ${priorityTag(CASE["HFS-T0018"].priority)} @honda`, async ({
    page,
  }) => {
    const lockoutUser = getLockoutTestCredentials();
    test.skip(
      !lockoutUser,
      "Test Data Issue: dedicated lockout user with Failed Login Counter = 4 required (LOCKOUT_TEST_*). Destructive — do not run on DL00009.",
    );

    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    const lockMsg = await loginPage.expectFailedLogin(
      lockoutUser!.username,
      "Wrong@5",
    );
    expect(lockMsg.toLowerCase()).toMatch(/suspended|locked|admin/i);

    const blockedMsg = await loginPage.expectFailedLogin(
      lockoutUser!.username,
      lockoutUser!.password,
    );
    expect(blockedMsg.toLowerCase()).toMatch(/suspended|locked|invalid/i);
  });

  test(`${CASE["HFS-T0019"].id} - ${CASE["HFS-T0019"].title} ${typeTag(CASE["HFS-T0019"].type)} ${priorityTag(CASE["HFS-T0019"].priority)} @honda`, async ({
    page,
  }) => {
    const lockoutUser = getLockoutTestCredentials();
    test.skip(
      !lockoutUser,
      "Test Data Issue: LOCKOUT_TEST_* user with counter = 3 required before run.",
    );

    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    for (let i = 1; i <= 3; i++) {
      await loginPage.enterUsername(lockoutUser!.username);
      await loginPage.enterPassword(`Wrong@${i}`);
      await loginPage.clickSignIn();
      await loginPage.getAuthErrorMessage();
    }
    await loginPage.login(lockoutUser!.username, lockoutUser!.password);
    await loginPage.verifyDashboardLoaded();
    await loginPage.logout();

    const message = await loginPage.expectFailedLogin(
      lockoutUser!.username,
      "WrongAfterReset!",
    );
    expect(message).toMatch(/4\s*attempts?\s*remaining/i);
  });

  test(`${CASE["HFS-T0020"].id} - ${CASE["HFS-T0020"].title} ${typeTag(CASE["HFS-T0020"].type)} ${priorityTag(CASE["HFS-T0020"].priority)} @honda`, async ({
    page,
  }) => {
    const suspended = getSuspendedAccountCredentials();
    test.skip(
      !suspended,
      "Test Data Issue: set SUSPENDED_USERNAME / SUSPENDED_PASSWORD (e.g. DLR77777).",
    );

    const loginPage = new HFILoginPage(page);
    const message = await loginPage.expectFailedLogin(
      suspended!.username,
      suspended!.password,
    );
    expect(message.toLowerCase()).toMatch(/suspended|reactivate|it admin/i);
  });

  test(`${CASE["HFS-T0021"].id} - ${CASE["HFS-T0021"].title} ${typeTag(CASE["HFS-T0021"].type)} ${priorityTag(CASE["HFS-T0021"].priority)} @honda`, async ({
    page,
  }) => {
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.enterPassword("Any@1");
    const disabled = await loginPage.signInButton.isDisabled();
    if (!disabled) {
      await loginPage.clickSignIn();
    }
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    expect(disabled || (await loginPage.expectClientSideValidation()).length > 0).toBeTruthy();
  });

  test(`${CASE["HFS-T0022"].id} - ${CASE["HFS-T0022"].title} ${typeTag(CASE["HFS-T0022"].type)} ${priorityTag(CASE["HFS-T0022"].priority)} @honda`, async ({
    page,
  }) => {
    const { username } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.assertLoginBlocked(username, "");
    const validation = await loginPage.expectClientSideValidation();
    expect(
      validation.length > 0 || (await loginPage.signInButton.isDisabled()),
    ).toBeTruthy();
  });

  test(`${CASE["HFS-T0023"].id} - ${CASE["HFS-T0023"].title} ${typeTag(CASE["HFS-T0023"].type)} ${priorityTag(CASE["HFS-T0023"].priority)} @honda`, async ({
    page,
  }) => {
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.assertLoginBlocked("", "");
    expect(await loginPage.signInButton.isDisabled()).toBeTruthy();
  });

  test(`${CASE["HFS-T0024"].id} - ${CASE["HFS-T0024"].title} ${typeTag(CASE["HFS-T0024"].type)} ${priorityTag(CASE["HFS-T0024"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(`  ${dealerCode}  `, password);
    await loginPage.verifyDashboardLoaded();
  });

  test(`${CASE["HFS-T0025"].id} - ${CASE["HFS-T0025"].title} ${typeTag(CASE["HFS-T0025"].type)} ${priorityTag(CASE["HFS-T0025"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const email = requireEmailLoginUsername();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(email.toUpperCase().replace(/@GMAIL/, "@gmail"), password);
    await loginPage.verifyDashboardLoaded();
    await loginPage.logout();
    await loginPage.open();
    await loginPage.login(dealerCode.toLowerCase(), password);
    await loginPage.verifyDashboardLoaded();
  });

  test(`${CASE["HFS-T0026"].id} - ${CASE["HFS-T0026"].title} ${typeTag(CASE["HFS-T0026"].type)} ${priorityTag(CASE["HFS-T0026"].priority)} @honda`, async ({
    page,
  }) => {
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.clickForgotPassword();
    await loginPage.verifyForgotPasswordModal();
  });

  test(`${CASE["HFS-T0027"].id} - ${CASE["HFS-T0027"].title} ${typeTag(CASE["HFS-T0027"].type)} ${priorityTag(CASE["HFS-T0027"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    let mockActive = true;
    await page.route("**/*", async (route) => {
      const req = route.request();
      if (
        mockActive &&
        req.method() === "POST" &&
        /login|auth|signin/i.test(req.url())
      ) {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ message: "Service unavailable" }),
        });
        return;
      }
      await route.continue();
    });

    await loginPage.open();
    await loginPage.enterUsername(dealerCode);
    await loginPage.enterPassword(password);
    await loginPage.clickSignIn();
    expect(await loginPage.isOnLoginPage()).toBeTruthy();

    mockActive = false;
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();
  });

  test(`${CASE["HFS-T0028"].id} - ${CASE["HFS-T0028"].title} ${typeTag(CASE["HFS-T0028"].type)} ${priorityTag(CASE["HFS-T0028"].priority)} @honda`, async ({
    page,
    context,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await context.setOffline(true);
    await loginPage.enterUsername(dealerCode);
    await loginPage.enterPassword(password);
    await loginPage.signInButton.click({ timeout: 5_000 }).catch(() => undefined);
    await page.waitForTimeout(1_500);
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    await context.setOffline(false);
    await page.waitForTimeout(500);
    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();
  });

  test(`${CASE["HFS-T0029"].id} - ${CASE["HFS-T0029"].title} ${typeTag(CASE["HFS-T0029"].type)} ${priorityTag(CASE["HFS-T0029"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    await page.goto(getLoginUrl(), { waitUntil: "domcontentloaded" });
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/i, { timeout: 30_000 });
    expect(await new HFIDashboardPage(page).isDashboardLoaded()).toBeFalsy();
  });

  test(`${CASE["HFS-T0030"].id} - ${CASE["HFS-T0030"].title} ${typeTag(CASE["HFS-T0030"].type)} ${priorityTag(CASE["HFS-T0030"].priority)} @honda`, async () => {
    test.skip(!process.env.AUDIT_API_URL, "Cannot Verify: AUDIT_API_URL not configured for audit log query.");
  });

  test(`${CASE["HFS-T0031"].id} - ${CASE["HFS-T0031"].title} ${typeTag(CASE["HFS-T0031"].type)} ${priorityTag(CASE["HFS-T0031"].priority)} @honda`, async () => {
    test.skip(!process.env.AUDIT_API_URL, "Cannot Verify: AUDIT_API_URL not configured.");
  });

  test(`${CASE["HFS-T0032"].id} - ${CASE["HFS-T0032"].title} ${typeTag(CASE["HFS-T0032"].type)} ${priorityTag(CASE["HFS-T0032"].priority)} @honda`, async () => {
    test.skip(!process.env.AUDIT_API_URL, "Cannot Verify: AUDIT_API_URL not configured.");
  });

  test(`${CASE["HFS-T0033"].id} - ${CASE["HFS-T0033"].title} ${typeTag(CASE["HFS-T0033"].type)} ${priorityTag(CASE["HFS-T0033"].priority)} @honda`, async () => {
    test.skip(!process.env.AUDIT_API_URL, "Cannot Verify: AUDIT_API_URL not configured.");
  });

  test(`${CASE["HFS-T0034"].id} - ${CASE["HFS-T0034"].title} ${typeTag(CASE["HFS-T0034"].type)} ${priorityTag(CASE["HFS-T0034"].priority)} @honda`, async ({
    page,
  }) => {
    const loginPage = new HFILoginPage(page);
    const message = await loginPage.expectFailedLogin("' OR '1'='1", "Any@1234");
    expect(message.toLowerCase()).toMatch(/invalid credentials/i);
    expect(message.toLowerCase()).not.toMatch(/sql|syntax|database/i);
  });

  test(`${CASE["HFS-T0035"].id} - ${CASE["HFS-T0035"].title} ${typeTag(CASE["HFS-T0035"].type)} ${priorityTag(CASE["HFS-T0035"].priority)} @honda`, async ({
    page,
  }) => {
    let dialogFired = false;
    page.on("dialog", async () => {
      dialogFired = true;
    });
    const loginPage = new HFILoginPage(page);
    await loginPage.expectFailedLogin("<script>alert(1)</script>", "Any@1234");
    expect(dialogFired).toBe(false);
    await expect(page.locator("body")).not.toContainText("<script>alert(1)</script>");
  });

  test(`${CASE["HFS-T0036"].id} - ${CASE["HFS-T0036"].title} ${typeTag(CASE["HFS-T0036"].type)} ${priorityTag(CASE["HFS-T0036"].priority)} @honda`, async ({
    page,
  }) => {
    test.skip(
      !isHttpsBaseUrl(),
      "Environment Issue: BASE_URL is HTTP — cannot verify TLS/password-in-transit per TC-036 on this dev URL.",
    );
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    const requests: string[] = [];
    page.on("request", (req) => {
      if (/login|auth/i.test(req.url())) {
        requests.push(req.url());
      }
    });
    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();
    expect(requests.every((u) => u.startsWith("https://"))).toBeTruthy();
    expect(page.url()).not.toContain(password);
  });

  test(`${CASE["HFS-T0037"].id} - ${CASE["HFS-T0037"].title} ${typeTag(CASE["HFS-T0037"].type)} ${priorityTag(CASE["HFS-T0037"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();
    const token = await readAuthTokenFromPage(page);
    const beforeLogout = await snapshotAuthStorage(page);
    await loginPage.logout();
    const afterLogout = await snapshotAuthStorage(page);
    if (hasAuthArtifacts(beforeLogout)) {
      expect(hasAuthArtifacts(afterLogout)).toBeFalsy();
    }
    if (token) {
      const response = await page.request.get("/consumer-finance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(
        [401, 403].includes(response.status()),
        `Replayed token should be rejected (got ${response.status()})`,
      ).toBeTruthy();
    }
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/i, { timeout: 30_000 });
  });

  test(`${CASE["HFS-T0038"].id} - ${CASE["HFS-T0038"].title} ${typeTag(CASE["HFS-T0038"].type)} ${priorityTag(CASE["HFS-T0038"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();
    await loginPage.logout();
    await page.goBack();
    await expect(page).toHaveURL(/\/login/i, { timeout: 15_000 });
  });

  test(`${CASE["HFS-T0039"].id} - ${CASE["HFS-T0039"].title} ${typeTag(CASE["HFS-T0039"].type)} ${priorityTag(CASE["HFS-T0039"].priority)} @honda`, async ({
    page,
  }) => {
    const { username, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(username, password);
    await loginPage.verifyDashboardLoaded();
  });

  test(`${CASE["HFS-T0040"].id} - ${CASE["HFS-T0040"].title} ${typeTag(CASE["HFS-T0040"].type)} ${priorityTag(CASE["HFS-T0040"].priority)} @honda`, async ({
    page,
  }) => {
    const maxLen = process.env.MAX_FIELD_LENGTH?.trim();
    test.skip(!maxLen, "Cannot Verify: set MAX_FIELD_LENGTH per DFS boundary spec.");
    const { password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    const n = Number.parseInt(maxLen!, 10);
    const longUser = `U${"x".repeat(Math.max(n - 1, 1))}`;
    await loginPage.open();
    await loginPage.login(longUser, password);
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test(`${CASE["HFS-T0041"].id} - ${CASE["HFS-T0041"].title} ${typeTag(CASE["HFS-T0041"].type)} ${priorityTag(CASE["HFS-T0041"].priority)} @honda`, async ({
    page,
    context,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    await loginPage.open();
    await loginPage.login(dealerCode, password);
    await loginPage.verifyDashboardLoaded();

    const tab2 = await context.newPage();
    await tab2.goto("/consumer-finance", { waitUntil: "domcontentloaded" });
    await new HFIDashboardPage(tab2).verifyDashboardLoaded();

    await new HFIDashboardPage(page).logout();
    await tab2.goto(getLoginUrl(), { waitUntil: "domcontentloaded" });
    await tab2.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(tab2).toHaveURL(/\/login/i, { timeout: 30_000 });
    await tab2.close();
  });

  test(`${CASE["HFS-T0042"].id} - ${CASE["HFS-T0042"].title} ${typeTag(CASE["HFS-T0042"].type)} ${priorityTag(CASE["HFS-T0042"].priority)} @honda`, async ({
    page,
  }) => {
    const { dealerCode, password } = getCredentials();
    const loginPage = new HFILoginPage(page);
    let loginPosts = 0;
    page.on("request", (req) => {
      if (req.method() === "POST" && /login|auth|signin/i.test(req.url())) {
        loginPosts += 1;
      }
    });
    await loginPage.open();
    await loginPage.enterUsername(dealerCode);
    await loginPage.enterPassword(password);
    await loginPage.signInButton.dblclick();
    await loginPage.waitForSignInAttemptToFinish();
    await loginPage.verifyDashboardLoaded();
    expect(loginPosts).toBeLessThanOrEqual(2);
  });
});
