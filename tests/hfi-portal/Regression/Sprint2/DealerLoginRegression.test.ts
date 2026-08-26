/**
 * US-DLR-001 — Dealer Portal Login regression (TC-001 … TC-050)
 * Catalog: testData/hfi/dealerLoginCatalog.ts
 */

import { test, expect } from "@playwright/test";
import {
  getCredentials,
  getLoginUrl,
  getMustResetCredentials,
  getMustResetLoginId,
  getLockoutTestCredentials,
  getSuspendedAccountCredentials,
  getSessionIdleTimeoutMs,
  requireEmailLoginUsername,
  isHttpsBaseUrl,
} from "@config/env";
import {
  findDealerEntry,
  getDealerLoginPassword,
  getLoginUsername,
} from "@config/dealer-registry";
import { DEALER_LOGIN_CASES } from "@testData/hfi/dealerLoginCatalog";
import { loginData } from "@testData/hfi/loginData";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { HFIResetPasswordPage } from "@pages/hfi-portal/reset-password/HFIResetPasswordPage";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";
import { HFIOnboardingDashboardPage } from "@pages/hfi-portal/onboarding/HFIOnboardingDashboardPage";
import {
  hasAuthArtifacts,
  snapshotAuthStorage,
} from "@utils/authStorage";
import { readAuthTokenFromPage } from "@utils/authToken";
import {
  initDealerLoginSteps,
  regressionStep,
  catchSkip,
  caseTags,
  skipWithReason,
  requireEnv,
  verifyBrowserASessionInvalidated,
} from "../../dealer-login/dealerLogin.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

const CASE = Object.fromEntries(
  DEALER_LOGIN_CASES.map((c) => [c.id, c]),
) as Record<string, (typeof DEALER_LOGIN_CASES)[number]>;

async function getResetPasswordTestUser(): Promise<{
  loginId: string;
  password: string;
} | undefined> {
  for (const key of ["dealer3", "dealer1", "dealer5", "dealer7", "dealer11"]) {
    const entry = findDealerEntry(key);
    if (entry?.group === "resetPassword") {
      const temp = entry.profile.temporaryPassword?.trim();
      if (temp) {
        return {
          loginId: getLoginUsername(entry.profile),
          password: temp,
        };
      }
    }
  }
  const resetCreds = getMustResetCredentials();
  if (resetCreds) {
    return {
      loginId: getMustResetLoginId(resetCreds),
      password: resetCreds.password,
    };
  }
  return undefined;
}

async function runConcurrentSessionTest(
  browser: import("@playwright/test").Browser,
): Promise<void> {
  const { dealerCode, password } = getCredentials();
  const username = dealerCode;
  const postLoginPath = "/consumer";

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

  await regressionStep("Browser A — login and verify dashboard", async () => {
    await loginA.open();
    await loginA.login(username, password);
    await loginA.verifyDashboardLoaded();
  });

  await regressionStep("Browser B — same credentials, verify dashboard", async () => {
    await loginB.open();
    await loginB.login(username, password);
    await loginB.verifyDashboardLoaded();
  });

  let invalidation: { invalidated: boolean; detail: string } = {
    invalidated: false,
    detail: "",
  };

  await regressionStep("Browser A — refresh and navigate to trigger session check", async () => {
    await pageA.reload({ waitUntil: "domcontentloaded" });
    await pageA.waitForLoadState("networkidle").catch(() => undefined);
    invalidation = await verifyBrowserASessionInvalidated(
      pageA,
      loginA,
      saw401OnBrowserA,
    );

    if (!invalidation.invalidated) {
      await pageA.goto(postLoginPath, { waitUntil: "domcontentloaded" });
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

  await regressionStep("Browser A session must be invalidated", async () => {
    const browserAStillAuthenticated = await dashboardA.isDashboardLoaded();
    const onLoginA = await loginA.isOnLoginPage();

    expect(
      browserAStillAuthenticated && !onLoginA && !saw401OnBrowserA,
      `Single active session failed: Browser A still usable at ${pageA.url()} ` +
        `(saw401=${saw401OnBrowserA}, onLogin=${onLoginA}).`,
    ).toBeFalsy();

    expect(
      onLoginA || !browserAStillAuthenticated || saw401OnBrowserA,
      "Browser A should be redirected to login, lose dashboard access, and/or receive 401.",
    ).toBeTruthy();
  });

  await regressionStep("Browser B remains logged in and functional", async () => {
    await pageB.reload({ waitUntil: "domcontentloaded" });
    await dashboardB.verifyDashboardLoaded();
    await pageB.goto(postLoginPath, { waitUntil: "domcontentloaded" });
    await dashboardB.verifyDashboardLoaded();
  });

  await contextA.close();
  await contextB.close();
}

async function collectNavLinkLabels(page: import("@playwright/test").Page): Promise<string[]> {
  const links = page.locator("nav, aside").getByRole("link");
  const labels = await links.allTextContents();
  return labels.map((l) => l.trim()).filter(Boolean);
}

test.describe(
  "US-DLR-001 Dealer Portal Login @us-dlr-001 @dealer-login @regression",
  () => {
    test.setTimeout(120_000);
    registerSprint2PassEvidence(test, "US-DLR-001");

    test.beforeEach(() => {
      initDealerLoginSteps();
    });

    test(`TC-001 ${CASE["TC-001"].title} ${caseTags(CASE["TC-001"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Open login page", async () => {
          await loginPage.open();
        });
        await regressionStep("Verify required login elements", async () => {
          await loginPage.verifyRequiredLoginElements();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-002 ${CASE["TC-002"].title} ${caseTags(CASE["TC-002"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Open login and test password toggle", async () => {
          await loginPage.open();
          await loginPage.enterPassword("Test@1234");
          expect(await loginPage.getPasswordInputType()).toBe("password");
          await loginPage.togglePasswordVisibility();
          expect(await loginPage.getPasswordInputType()).toBe("text");
          await loginPage.togglePasswordVisibility();
          expect(await loginPage.getPasswordInputType()).toBe("password");
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-003 ${CASE["TC-003"].title} ${caseTags(CASE["TC-003"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Verify branding section", async () => {
          await loginPage.open();
          await loginPage.verifyBrandingSection();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-004 ${CASE["TC-004"].title} ${caseTags(CASE["TC-004"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Verify encrypted-session note and support block", async () => {
          await loginPage.open();
          await loginPage.verifyEncryptedSessionNoteAndSupport();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-005 ${CASE["TC-005"].title} ${caseTags(CASE["TC-005"])}`, async ({ page }) => {
      try {
        const { dealerId, password } = loginData.tc004ReturningUser();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Login with dealer ID", async () => {
          await loginPage.open();
          await loginPage.login(dealerId, password);
          await loginPage.verifyDashboardLoaded();
        });
        await expect(
          page.getByText(/consumer finance|dealer onboarding|dashboard/i).first(),
        ).toBeVisible({ timeout: 15_000 });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-006 ${CASE["TC-006"].title} ${caseTags(CASE["TC-006"])}`, async ({ page }) => {
      try {
        const loginUsername = requireEmailLoginUsername();
        const { password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Login with registered email", async () => {
          await loginPage.open();
          await loginPage.login(loginUsername, password);
          await loginPage.verifyDashboardLoaded();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-007 ${CASE["TC-007"].title} ${caseTags(CASE["TC-007"])}`, async ({ page }) => {
      try {
        if (!isHttpsBaseUrl()) {
          skipWithReason(
            "Environment Issue: BASE_URL is HTTP — cannot verify TLS-encrypted login requests on this dev URL.",
          );
        }
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        const requests: string[] = [];
        page.on("request", (req) => {
          if (/login|auth/i.test(req.url())) {
            requests.push(req.url());
          }
        });
        await regressionStep("Login and verify HTTPS requests", async () => {
          await loginPage.open();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
        });
        expect(requests.every((u) => u.startsWith("https://"))).toBeTruthy();
        expect(page.url()).not.toContain(password);
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-008 ${CASE["TC-008"].title} ${caseTags(CASE["TC-008"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Login and verify Consumer Finance landing", async () => {
          await loginPage.open();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
        });
        await expect(page).toHaveURL(/consumer-finance|consumer finance/i, {
          timeout: 30_000,
        }).catch(async () => {
          await expect(
            page.getByText(/consumer finance/i).first(),
          ).toBeVisible({ timeout: 15_000 });
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-009 ${CASE["TC-009"].title} ${caseTags(CASE["TC-009"])}`, async () => {
      try {
        skipWithReason(
          "Test Data Issue: Dealer Finance-only RBAC account (no Consumer Finance) required.",
        );
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-010 ${CASE["TC-010"].title} ${caseTags(CASE["TC-010"])}`, async ({ page }) => {
      try {
        const resetUser = await getResetPasswordTestUser();
        if (!resetUser) {
          skipWithReason(
            "Test Data Issue: resetPassword dealer (e.g. dealer3) or MUST_RESET_* credentials required.",
          );
        }
        const loginPage = new HFILoginPage(page);
        const setPasswordPage = new HFIResetPasswordPage(page);
        await regressionStep("First-time login routes to Set Password", async () => {
          await loginPage.open();
          await loginPage.login(resetUser!.loginId, resetUser!.password);
          await setPasswordPage.verifySetPasswordScreen();
          expect(await setPasswordPage.isSetPasswordScreen()).toBeTruthy();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-011 ${CASE["TC-011"].title} ${caseTags(CASE["TC-011"])}`, async ({ page }) => {
      try {
        const resetUser = await getResetPasswordTestUser();
        if (!resetUser) {
          skipWithReason(
            "Test Data Issue: resetPassword dealer or MUST_RESET credentials required.",
          );
        }
        const loginPage = new HFILoginPage(page);
        const setPasswordPage = new HFIResetPasswordPage(page);
        await regressionStep("Login with must_reset and block /dashboard", async () => {
          await loginPage.open();
          await loginPage.login(resetUser!.loginId, resetUser!.password);
          await setPasswordPage.verifySetPasswordScreen();
          await expect(page).toHaveURL(/reset-password/i);

          await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
          await expect(page).toHaveURL(/reset-password/i, { timeout: 15_000 });
          await setPasswordPage.verifySetPasswordScreen();
          expect(await new HFIDashboardPage(page).isDashboardLoaded()).toBeFalsy();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-012 ${CASE["TC-012"].title} ${caseTags(CASE["TC-012"])}`, async ({ browser }) => {
      try {
        test.setTimeout(180_000);
        await runConcurrentSessionTest(browser);
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-013 ${CASE["TC-013"].title} ${caseTags(CASE["TC-013"])}`, async ({ browser }) => {
      try {
        test.setTimeout(180_000);
        await runConcurrentSessionTest(browser);
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-014 ${CASE["TC-014"].title} ${caseTags(CASE["TC-014"])}`, async ({ page }) => {
      try {
        const { username } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Wrong password — expect attempts remaining", async () => {
          const message = await loginPage.expectFailedLogin(username, "WrongPass@999");
          expect(message.toLowerCase()).toMatch(/invalid credentials/i);
          expect(message).toMatch(/4\s*attempts?\s*remaining/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-015 ${CASE["TC-015"].title} ${caseTags(CASE["TC-015"])}`, async ({ page }) => {
      try {
        const lockoutUser = getLockoutTestCredentials();
        const priorFails = process.env.LOCKOUT_TEST_PRIOR_FAILS?.trim();
        if (!lockoutUser || priorFails !== "1") {
          skipWithReason(
            "Test Data Issue: LOCKOUT_TEST_* with LOCKOUT_TEST_PRIOR_FAILS=1 required (1 prior failed attempt).",
          );
        }
        const loginPage = new HFILoginPage(page);
        const remainingCounts: number[] = [];
        const { username } = lockoutUser!;

        await regressionStep("Failed attempts decrement counter", async () => {
          await loginPage.open();
          for (let attempt = 1; attempt <= 3; attempt++) {
            await loginPage.enterUsername(username);
            await loginPage.enterPassword(`Wrong@${attempt}`);
            await loginPage.clickSignIn();
            const message = await loginPage.getAuthErrorMessage();
            const match = message.match(/(\d+)\s*attempts?\s*remaining/i);
            expect(match, `Attempt ${attempt}: ${message}`).toBeTruthy();
            remainingCounts.push(Number.parseInt(match![1], 10));
          }
        });
        expect(remainingCounts).toEqual([3, 2, 1]);
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-016 ${CASE["TC-016"].title} ${caseTags(CASE["TC-016"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Invalid credentials — no session created", async () => {
          await loginPage.open();
          await loginPage.enterUsername(loginData.invalidUsername.username);
          await loginPage.enterPassword(loginData.invalidUsername.password);
          await loginPage.clickSignIn();
          expect(await loginPage.isOnLoginPage()).toBeTruthy();

          await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
          await expect(page).toHaveURL(/\/login/i, { timeout: 15_000 });
          expect(await new HFIDashboardPage(page).isDashboardLoaded()).toBeFalsy();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-017 ${CASE["TC-017"].title} ${caseTags(CASE["TC-017"])}`, async ({ page }) => {
      try {
        const lockoutUser = getLockoutTestCredentials();
        const priorFails = process.env.LOCKOUT_TEST_PRIOR_FAILS?.trim();
        if (!lockoutUser || priorFails !== "4") {
          skipWithReason(
            "Test Data Issue: LOCKOUT_TEST_* with LOCKOUT_TEST_PRIOR_FAILS=4 required. Destructive lockout test.",
          );
        }
        const loginPage = new HFILoginPage(page);
        await regressionStep("5th failed attempt locks account", async () => {
          await loginPage.open();
          const lockMsg = await loginPage.expectFailedLogin(
            lockoutUser!.username,
            "Wrong@5",
          );
          expect(lockMsg.toLowerCase()).toMatch(/suspended|locked|admin/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-018 ${CASE["TC-018"].title} ${caseTags(CASE["TC-018"])}`, async ({ page }) => {
      try {
        const lockoutUser = getLockoutTestCredentials();
        const locked = process.env.LOCKOUT_TEST_LOCKED?.trim()?.toLowerCase();
        if (!lockoutUser || locked !== "true") {
          skipWithReason(
            "Test Data Issue: LOCKOUT_TEST_* locked account with LOCKOUT_TEST_LOCKED=true required.",
          );
        }
        const loginPage = new HFILoginPage(page);
        await regressionStep("Correct creds on locked account blocked", async () => {
          const blockedMsg = await loginPage.expectFailedLogin(
            lockoutUser!.username,
            lockoutUser!.password,
          );
          expect(blockedMsg.toLowerCase()).toMatch(/suspended|locked|invalid/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-019 ${CASE["TC-019"].title} ${caseTags(CASE["TC-019"])}`, async ({ page }) => {
      try {
        const lockoutUser = getLockoutTestCredentials();
        const priorFails = process.env.LOCKOUT_TEST_PRIOR_FAILS?.trim();
        if (!lockoutUser || priorFails !== "3") {
          skipWithReason(
            "Test Data Issue: LOCKOUT_TEST_* with LOCKOUT_TEST_PRIOR_FAILS=3 required before run.",
          );
        }
        const loginPage = new HFILoginPage(page);
        await regressionStep("Counter resets after successful login", async () => {
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
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-020 ${CASE["TC-020"].title} ${caseTags(CASE["TC-020"])}`, async ({ page }) => {
      try {
        const suspended = getSuspendedAccountCredentials();
        if (!suspended) {
          skipWithReason(
            "Test Data Issue: set SUSPENDED_USERNAME / SUSPENDED_PASSWORD.",
          );
        }
        const loginPage = new HFILoginPage(page);
        await regressionStep("Suspended account message", async () => {
          const message = await loginPage.expectFailedLogin(
            suspended!.username,
            suspended!.password,
          );
          expect(message.toLowerCase()).toMatch(/suspended|reactivate|it admin/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-021 ${CASE["TC-021"].title} ${caseTags(CASE["TC-021"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Forgot password modal", async () => {
          await loginPage.open();
          await loginPage.clickForgotPassword();
          await loginPage.verifyForgotPasswordModal();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-022 ${CASE["TC-022"].title} ${caseTags(CASE["TC-022"])}`, async ({ page }) => {
      try {
        const idleMs = getSessionIdleTimeoutMs();
        if (idleMs === undefined) {
          skipWithReason(
            "Cannot Verify: set SESSION_IDLE_TIMEOUT_MS to the app-configured idle timeout.",
          );
        }
        test.setTimeout(idleMs! + 120_000);
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);

        await regressionStep("Idle timeout terminates session", async () => {
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
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-023 ${CASE["TC-023"].title} ${caseTags(CASE["TC-023"])}`, async () => {
      try {
        if (process.env.RUN_SESSION_ACTIVITY_TEST !== "true") {
          skipWithReason(
            "Cannot Verify: TC-023 requires activity every 5 min for 30 min. Set RUN_SESSION_ACTIVITY_TEST=true.",
          );
        }
        const durationMs = Number.parseInt(
          process.env.SESSION_ACTIVITY_DURATION_MS ?? "1800000",
          10,
        );
        const intervalMs = Number.parseInt(
          process.env.SESSION_ACTIVITY_INTERVAL_MS ?? "300000",
          10,
        );
        test.setTimeout(durationMs + 180_000);
        skipWithReason("Long-running session activity test — configure duration and run manually.");
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-024 ${CASE["TC-024"].title} ${caseTags(CASE["TC-024"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Logout clears auth storage", async () => {
          await loginPage.open();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
          const beforeLogout = await snapshotAuthStorage(page);
          await loginPage.logout();
          const afterLogout = await snapshotAuthStorage(page);
          if (hasAuthArtifacts(beforeLogout)) {
            expect(hasAuthArtifacts(afterLogout)).toBeFalsy();
          }
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-025 ${CASE["TC-025"].title} ${caseTags(CASE["TC-025"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        const dashboard = new HFIDashboardPage(page);
        await regressionStep("Logout then protected route redirects to login", async () => {
          await loginPage.open();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
          await loginPage.logout();
          await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
          await expect(page).toHaveURL(/\/login/i, { timeout: 15_000 });
          expect(await dashboard.isDashboardLoaded()).toBeFalsy();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-026 ${CASE["TC-026"].title} ${caseTags(CASE["TC-026"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Back after logout does not restore session", async () => {
          await loginPage.open();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
          await loginPage.logout();
          await page.goBack();
          await expect(page).toHaveURL(/\/login/i, { timeout: 15_000 });
          expect(await loginPage.isOnLoginPage()).toBeTruthy();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-027 ${CASE["TC-027"].title} ${caseTags(CASE["TC-027"])}`, async () => {
      try {
        requireEnv("AUDIT_API_URL", "Cannot Verify: AUDIT_API_URL not configured for audit log query.");
        skipWithReason("Audit log verification requires AUDIT_API_URL backend integration.");
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-028 ${CASE["TC-028"].title} ${caseTags(CASE["TC-028"])}`, async () => {
      try {
        requireEnv("AUDIT_API_URL", "Cannot Verify: AUDIT_API_URL not configured.");
        skipWithReason("Audit log verification requires AUDIT_API_URL backend integration.");
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-029 ${CASE["TC-029"].title} ${caseTags(CASE["TC-029"])}`, async () => {
      try {
        requireEnv("AUDIT_API_URL", "Cannot Verify: AUDIT_API_URL not configured.");
        skipWithReason("Audit log verification requires AUDIT_API_URL backend integration.");
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-030 ${CASE["TC-030"].title} ${caseTags(CASE["TC-030"])}`, async () => {
      try {
        requireEnv("AUDIT_API_URL", "Cannot Verify: AUDIT_API_URL not configured.");
        skipWithReason("Audit log verification requires AUDIT_API_URL backend integration.");
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-031 ${CASE["TC-031"].title} ${caseTags(CASE["TC-031"])}`, async ({ page }) => {
      try {
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

        await regressionStep("503 on login API — remain on login", async () => {
          await loginPage.open();
          await loginPage.enterUsername(dealerCode);
          await loginPage.enterPassword(password);
          await loginPage.clickSignIn();
          expect(await loginPage.isOnLoginPage()).toBeTruthy();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-032 ${CASE["TC-032"].title} ${caseTags(CASE["TC-032"])}`, async ({ page }) => {
      try {
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

        await regressionStep("503 then retry succeeds", async () => {
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
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-033 ${CASE["TC-033"].title} ${caseTags(CASE["TC-033"])}`, async ({ page }) => {
      try {
        if (!isHttpsBaseUrl()) {
          skipWithReason(
            "Environment Issue: BASE_URL is HTTP — cannot verify TLS-only credential transmission.",
          );
        }
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        const requests: string[] = [];
        page.on("request", (req) => {
          if (/login|auth/i.test(req.url())) {
            requests.push(req.url());
          }
        });
        await regressionStep("Verify login requests use HTTPS only", async () => {
          await loginPage.open();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
        });
        expect(requests.length).toBeGreaterThan(0);
        expect(requests.every((u) => u.startsWith("https://"))).toBeTruthy();
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-034 ${CASE["TC-034"].title} ${caseTags(CASE["TC-034"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Password masked by default when typing", async () => {
          await loginPage.open();
          await loginPage.enterPassword("Test@1234");
          await loginPage.verifyPasswordMaskedByDefault();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-035 ${CASE["TC-035"].title} ${caseTags(CASE["TC-035"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Token replay after logout rejected", async () => {
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
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-036 ${CASE["TC-036"].title} ${caseTags(CASE["TC-036"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        const { username } = getCredentials();
        await regressionStep("Blank username/password validation", async () => {
          await loginPage.open();
          await loginPage.enterPassword("Any@1");
          const disabledEmptyUser = await loginPage.signInButton.isDisabled();
          if (!disabledEmptyUser) {
            await loginPage.clickSignIn();
          }
          expect(await loginPage.isOnLoginPage()).toBeTruthy();
          expect(
            disabledEmptyUser ||
              (await loginPage.expectClientSideValidation()).length > 0,
          ).toBeTruthy();

          await loginPage.open();
          await loginPage.assertLoginBlocked(username, "");
          const validation = await loginPage.expectClientSideValidation();
          expect(
            validation.length > 0 || (await loginPage.signInButton.isDisabled()),
          ).toBeTruthy();

          await loginPage.open();
          await loginPage.assertLoginBlocked("", "");
          expect(await loginPage.signInButton.isDisabled()).toBeTruthy();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-037 ${CASE["TC-037"].title} ${caseTags(CASE["TC-037"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Clear storage then protected route redirects to login", async () => {
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
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-038 ${CASE["TC-038"].title} ${caseTags(CASE["TC-038"])}`, async ({ page }) => {
      try {
        const { username } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("401 inline error message", async () => {
          const message = await loginPage.expectFailedLogin(username, "WrongPass@999");
          expect(message.toLowerCase()).toMatch(/invalid credentials/i);
          expect(message).toMatch(/\d+\s*attempts?\s*remaining/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-039 ${CASE["TC-039"].title} ${caseTags(CASE["TC-039"])}`, async ({ page }) => {
      try {
        const lockoutUser = getLockoutTestCredentials();
        const locked = process.env.LOCKOUT_TEST_LOCKED?.trim()?.toLowerCase();
        if (!lockoutUser || locked !== "true") {
          skipWithReason(
            "Test Data Issue: locked LOCKOUT_TEST account with LOCKOUT_TEST_LOCKED=true required for 423 lockout message.",
          );
        }
        const loginPage = new HFILoginPage(page);
        await regressionStep("423 lockout message on locked account", async () => {
          const message = await loginPage.expectFailedLogin(
            lockoutUser!.username,
            "Wrong@999",
          );
          expect(message.toLowerCase()).toMatch(/suspended|locked|admin/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-040 ${CASE["TC-040"].title} ${caseTags(CASE["TC-040"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await page.route("**/*", async (route) => {
          const req = route.request();
          if (
            req.method() === "POST" &&
            /logout|signout|sign-out/i.test(req.url())
          ) {
            await route.fulfill({
              status: 503,
              contentType: "application/json",
              body: JSON.stringify({ message: "Logout service unavailable" }),
            });
            return;
          }
          await route.continue();
        });

        await regressionStep("Logout API failure still clears client session", async () => {
          await loginPage.open();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
          const beforeLogout = await snapshotAuthStorage(page);
          await loginPage.logout();
          const afterLogout = await snapshotAuthStorage(page);
          if (hasAuthArtifacts(beforeLogout)) {
            expect(hasAuthArtifacts(afterLogout)).toBeFalsy();
          }
          expect(await loginPage.isOnLoginPage()).toBeTruthy();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-041 ${CASE["TC-041"].title} ${caseTags(CASE["TC-041"])}`, async ({ page }) => {
      try {
        const dealer2 = findDealerEntry("dealer2");
        const dealer4 = findDealerEntry("dealer4");
        if (!dealer2 || !dealer4) {
          skipWithReason("Test Data Issue: dealer2 and dealer4 required in dealers.json.");
        }

        const loginPage = new HFILoginPage(page);
        const onboardingDash = new HFIOnboardingDashboardPage(page);

        await regressionStep("Dealer2 full access navigation", async () => {
          await loginPage.open();
          await loginPage.loginWithCredentials(
            getLoginUsername(dealer2!.profile),
            getDealerLoginPassword(dealer2!.profile),
          );
          await loginPage.verifyDashboardLoaded();
          const nav2 = await collectNavLinkLabels(page);
          expect(nav2.join(" ").toLowerCase()).toMatch(/consumer|finance|dashboard/i);
          await loginPage.logout();
        });

        await regressionStep("Dealer4 onboarding-only navigation", async () => {
          await loginPage.open();
          await loginPage.loginWithCredentials(
            getLoginUsername(dealer4!.profile),
            getDealerLoginPassword(dealer4!.profile),
          );
          await page.waitForURL(/onboarding|consumer|dashboard/i, { timeout: 90_000 });
          const nav4 = await onboardingDash.getNavLinkLabels();
          const navText = nav4.map((n) => n.trim()).filter(Boolean).join(" ").toLowerCase();
          expect(navText).not.toMatch(/purchase orders|dealer finance|collateral/i);
          const text = await onboardingDash.getPageText();
          expect(text).toMatch(/dealer onboarding|my tasks|limited access|welcome/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-042 ${CASE["TC-042"].title} ${caseTags(CASE["TC-042"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const email = requireEmailLoginUsername();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Case and whitespace username handling", async () => {
          await loginPage.open();
          await loginPage.login(
            email.toUpperCase().replace(/@GMAIL/, "@gmail"),
            password,
          );
          await loginPage.verifyDashboardLoaded();
          await loginPage.logout();
          await loginPage.open();
          await loginPage.login(`  ${dealerCode}  `, password);
          await loginPage.verifyDashboardLoaded();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-043 ${CASE["TC-043"].title} ${caseTags(CASE["TC-043"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("SQL injection safely rejected", async () => {
          const message = await loginPage.expectFailedLogin("' OR '1'='1", "Any@1234");
          expect(message.toLowerCase()).toMatch(/invalid credentials/i);
          expect(message.toLowerCase()).not.toMatch(/sql|syntax|database/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-044 ${CASE["TC-044"].title} ${caseTags(CASE["TC-044"])}`, async ({ page }) => {
      try {
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);
        await regressionStep("Single provisioned dealer login succeeds", async () => {
          await loginPage.open();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-045 ${CASE["TC-045"].title} ${caseTags(CASE["TC-045"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Unknown dealer ID invalid credentials", async () => {
          const message = await loginPage.expectFailedLogin(
            loginData.invalidUsername.username,
            loginData.invalidUsername.password,
          );
          expect(message.toLowerCase()).toMatch(/invalid credentials/i);
          expect(message.toLowerCase()).not.toMatch(/user.*not found|does not exist/i);
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-046 ${CASE["TC-046"].title} ${caseTags(CASE["TC-046"])}`, async ({ page }) => {
      try {
        const loginPage = new HFILoginPage(page);
        await regressionStep("Support contact details visible", async () => {
          await loginPage.open();
          await loginPage.verifyEncryptedSessionNoteAndSupport();
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-047 ${CASE["TC-047"].title} ${caseTags(CASE["TC-047"])}`, async () => {
      try {
        if (!process.env.LOCKOUT_THRESHOLD?.trim()) {
          skipWithReason(
            "Cannot Verify: set LOCKOUT_THRESHOLD to non-default configured value in test environment.",
          );
        }
        skipWithReason("Configurable lockout threshold test requires dedicated env with non-default LOCKOUT_THRESHOLD.");
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-048 ${CASE["TC-048"].title} ${caseTags(CASE["TC-048"])}`, async () => {
      try {
        const idleMs = getSessionIdleTimeoutMs();
        const defaultIdle = 900_000;
        if (!idleMs || idleMs === defaultIdle) {
          skipWithReason(
            "Cannot Verify: SESSION_IDLE_TIMEOUT_MS must be set to a non-default value (e.g. 300000 for 5 min).",
          );
        }
        skipWithReason("Non-default idle timeout test requires controlled env with SESSION_IDLE_TIMEOUT_MS.");
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-049 ${CASE["TC-049"].title} ${caseTags(CASE["TC-049"])}`, async ({ page }) => {
      try {
        if (process.env.RUN_NFR_TESTS !== "true") {
          skipWithReason("Set RUN_NFR_TESTS=true to execute login response-time NFR checks.");
        }
        const loadThreshold = Number(process.env.LOGIN_LOAD_MS ?? "5000");
        const apiThreshold = Number(process.env.LOGIN_API_MS ?? "8000");
        const { dealerCode, password } = getCredentials();
        const loginPage = new HFILoginPage(page);

        await regressionStep("Measure login screen load time", async () => {
          const start = Date.now();
          await loginPage.open();
          const elapsed = Date.now() - start;
          expect(elapsed).toBeLessThan(loadThreshold);
        });

        await regressionStep("Measure login API response time", async () => {
          let loginResponseMs = 0;
          page.on("response", (response) => {
            if (
              response.request().method() === "POST" &&
              /login|auth|signin/i.test(response.url())
            ) {
              const timing = response.request().timing();
              if (timing.responseEnd > 0) {
                loginResponseMs = timing.responseEnd;
              }
            }
          });
          const start = Date.now();
          await loginPage.login(dealerCode, password);
          await loginPage.verifyDashboardLoaded();
          const elapsed = Date.now() - start;
          expect(elapsed).toBeLessThan(apiThreshold);
          if (loginResponseMs > 0) {
            expect(loginResponseMs).toBeLessThan(apiThreshold);
          }
        });
      } catch (e) {
        await catchSkip(e, test);
      }
    });

    test(`TC-050 ${CASE["TC-050"].title} ${caseTags(CASE["TC-050"])}`, async ({ browser }) => {
      try {
        const context = await browser.newContext();
        const freshPage = await context.newPage();
        const loginPage = new HFILoginPage(freshPage);
        await regressionStep("Fresh session opens login screen", async () => {
          await freshPage.goto(getLoginUrl(), { waitUntil: "domcontentloaded" });
          await loginPage.verifyLoginPage();
          expect(await loginPage.isOnLoginPage()).toBeTruthy();
          expect(await new HFIDashboardPage(freshPage).isDashboardLoaded()).toBeFalsy();
        });
        await context.close();
      } catch (e) {
        await catchSkip(e, test);
      }
    });
  },
);
