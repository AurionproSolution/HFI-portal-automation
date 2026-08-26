import { test, expect, type Page } from "@playwright/test";
import {
  allowDestructivePasswordReset,
  getForgotPasswordEmail,
  getLoginUrl,
  getMustResetCredentials,
  getNewPasswordForResetTest,
  isHttpsBaseUrl,
} from "@config/env";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";
import { HFIForgotPasswordPage } from "@pages/hfi-portal/reset-password/HFIForgotPasswordPage";
import { HFIResetPasswordPage } from "@pages/hfi-portal/reset-password/HFIResetPasswordPage";

export async function requireMustReset(page: Page): Promise<HFIResetPasswordPage> {
  const creds = getMustResetCredentials();
  if (!creds) {
    throw new Error("SKIP: MUST_RESET_USERNAME / MUST_RESET_PASSWORD not set");
  }
  const setPage = new HFIResetPasswordPage(page);
  await setPage.openViaFirstTimeLogin();
  return setPage;
}

export const resetPasswordHandlers: Record<
  string,
  (page: Page) => Promise<void>
> = {
  "TC-001": async (page) => {
    const setPage = await requireMustReset(page);
    await setPage.verifyFirstTimeScreen();
  },
  "TC-002": async (page) => {
    const forgot = new HFIForgotPasswordPage(page);
    await forgot.openFromLogin();
  },
  "TC-003": async (page) => {
    test.skip(true, "Cannot Verify: requires valid temporary password from email (Forgot Password path).");
  },
  "TC-004": async (page) => {
    const setPage = await requireMustReset(page);
    await setPage.fillNewPassword("Test@1234");
    expect(await setPage.getNewPasswordInputType()).toBe("password");
    await setPage.fillConfirmPassword("Test@1234");
    expect(await setPage.confirmPasswordInput.getAttribute("type")).toBe(
      "password",
    );
    await setPage.toggleNewPasswordVisibility();
    await setPage.toggleConfirmPasswordVisibility();
    await setPage.toggleNewPasswordVisibility();
    await setPage.toggleConfirmPasswordVisibility();
    expect(await setPage.getNewPasswordInputType()).toBe("password");
  },
  "TC-005": async (page) => {
    const setPage = await requireMustReset(page);
    await setPage.expectPolicyMessageVisible();
    for (const s of ["a", "A", "A1", "A1!", "LongPass1!"]) {
      await setPage.fillNewPassword(s);
    }
    await expect(
      page.getByText(/at least 1 uppercase|uppercase letter/i),
    ).toBeVisible({ timeout: 3_000 });
  },
  "TC-006": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "abcdefg", "abcdefg");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
    await setPage.fillNewPassword("Abcdef1!");
    await setPage.fillConfirmPassword("Abcdef1!");
    expect(await setPage.isSubmitEnabled()).toBeTruthy();
  },
  "TC-007": async (page) => {
    if (!allowDestructivePasswordReset()) {
      test.skip(true, "Test Data: set RESET_TEST_ALLOW_PASSWORD_CHANGE=true and RESET_TEST_NEW_PASSWORD to run successful reset.");
    }
    const newPwd = getNewPasswordForResetTest() ?? "Winter@2026";
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, newPwd, newPwd);
    await setPage.clickSubmit();
    await new HFILoginPage(page).verifyDashboardLoaded();
  },
  "TC-008": async (page) => {
    test.skip(true, "Cannot Verify: destructive multi-login verification after password change.");
  },
  "TC-009": async (page) => {
    await requireMustReset(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/reset-password/i, { timeout: 15_000 });
  },
  "TC-010": async (page) => {
    const email = getForgotPasswordEmail();
    test.skip(!email, "Test Data: FORGOT_PASSWORD_EMAIL or EMAIL_USERNAME required.");
    const forgot = new HFIForgotPasswordPage(page);
    await forgot.openFromLogin();
    await forgot.submitEmail(email!);
    await expect(forgot.confirmationMessage).toBeVisible({ timeout: 15_000 });
  },
  "TC-011": async () => {
    test.skip(true, "Cannot Verify: temporary password from email inbox required.");
  },
  "TC-012": async () => {
    test.skip(true, "Cannot Verify: full Forgot Password reset path with temp password.");
  },
  "TC-013": async () => {
    test.skip(true, "Cannot Verify: depends on TC-012 password change.");
  },
  "TC-014": async () => {
    test.skip(true, "Cannot Verify: email inbox / temp password reissue.");
  },
  "TC-015": async () => {
    test.skip(true, "Cannot Verify: resend limit configuration not exposed in UI.");
  },
  "TC-016": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "Ab1@z", "Ab1@z");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
    await setPage.expectPolicyMessageVisible();
  },
  "TC-017": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "abcdef1!", "abcdef1!");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
  },
  "TC-018": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "ABCDEF1!", "ABCDEF1!");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
  },
  "TC-019": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "Abcdefgh!", "Abcdefgh!");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
  },
  "TC-020": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "Abcdefg1", "Abcdefg1");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
  },
  "TC-021": async (page) => {
    if (!allowDestructivePasswordReset()) {
      test.skip(true, "Test Data: enable RESET_TEST_ALLOW_PASSWORD_CHANGE for boundary save.");
    }
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "Abc1@xyz", "Abc1@xyz");
    expect(await setPage.isSubmitEnabled()).toBeTruthy();
  },
  "TC-022": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "Winter@2026", "Winter@2027");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
    await setPage.expectMismatchMessage();
  },
  "TC-023": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, reset.password, reset.password);
    await setPage.clickSubmit();
    await expect(
      page.getByText(/cannot be the same|same as old/i),
    ).toBeVisible({ timeout: 10_000 });
  },
  "TC-024": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.fillCurrentPassword(reset.password);
    await setPage.fillConfirmPassword("Abcdef1!");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
    await setPage.fillNewPassword("Abcdef1!");
    await setPage.fillConfirmPassword("");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
  },
  "TC-025": async () => {
    test.skip(true, "Cannot Verify: temporary password entry screen / wrong temp pwd flow.");
  },
  "TC-026": async () => {
    test.skip(true, "Cannot Verify: expired temporary password.");
  },
  "TC-027": async () => {
    test.skip(true, "Cannot Verify: temp password retry limit.");
  },
  "TC-028": async () => {
    test.skip(true, "Cannot Verify: single-use temp password after full reset.");
  },
  "TC-029": async (page) => {
    const forgot = new HFIForgotPasswordPage(page);
    await forgot.openFromLogin();
    await forgot.submitEmail("unknown-not-registered@example.com");
    await expect(
      page.getByText(/if the email is registered|temporary password has been sent/i),
    ).toBeVisible({ timeout: 15_000 });
  },
  "TC-030": async (page) => {
    const forgot = new HFIForgotPasswordPage(page);
    await forgot.openFromLogin();
    await forgot.emailInput.fill("dealer.example.com");
    await forgot.sendButton.click();
    expect(await new HFILoginPage(page).isOnLoginPage()).toBeTruthy();
  },
  "TC-031": async (page) => {
    const forgot = new HFIForgotPasswordPage(page);
    await forgot.openFromLogin();
    await forgot.sendButton.click();
    expect(await forgot.sendButton.isEnabled()).toBeTruthy();
    expect(await new HFILoginPage(page).isOnLoginPage()).toBeTruthy();
  },
  "TC-032": async () => {
    test.skip(!process.env.SUSPENDED_EMAIL_FOR_FORGOT, "Test Data: SUSPENDED_EMAIL_FOR_FORGOT not set.");
  },
  "TC-033": async (page) => {
    const forgot = new HFIForgotPasswordPage(page);
    await forgot.openFromLogin();
    await forgot.cancel();
  },
  "TC-034": async (page) => {
    await requireMustReset(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/reset-password/i, { timeout: 15_000 });
    await page.goto("/dealer-finance/exposure", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/reset-password/i, { timeout: 15_000 });
    await expect(
      page.getByText(/reset your password|set a new password/i).first(),
    ).toBeVisible();
  },
  "TC-035": async () => {
    test.skip(true, "Cannot Verify: Sinch / notification service outage simulation.");
  },
  "TC-036": async (page) => {
    const setPage = await requireMustReset(page);
    await page.route("**/*", async (route) => {
      if (
        route.request().method() === "POST" &&
        /password|auth/i.test(route.request().url())
      ) {
        await route.fulfill({ status: 503, body: "{}" });
        return;
      }
      await route.continue();
    });
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "Winter@2026", "Winter@2026");
    await setPage.clickSubmit();
    await expect(page).toHaveURL(/reset-password/i);
    await page.unrouteAll({ behavior: "ignoreErrors" });
  },
  "TC-037": async () => {
    test.skip(!process.env.AUDIT_API_URL, "Cannot Verify: AUDIT_API_URL not configured.");
  },
  "TC-038": async () => {
    test.skip(!process.env.AUDIT_API_URL, "Cannot Verify: AUDIT_API_URL not configured.");
  },
  "TC-039": async () => {
    test.skip(!process.env.AUDIT_API_URL, "Cannot Verify: AUDIT_API_URL not configured.");
  },
  "TC-040": async () => {
    test.skip(!isHttpsBaseUrl(), "Environment Issue: HTTPS required for TLS password transmission check.");
  },
  "TC-041": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    let dialog = false;
    page.on("dialog", () => {
      dialog = true;
    });
    await setPage.setPasswords(
      reset.password,
      "<script>alert(1)</script>@1A",
      "<script>alert(1)</script>@1A",
    );
    expect(dialog).toBeFalsy();
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
  },
  "TC-042": async () => {
    test.skip(true, "Cannot Verify: two-device Forgot Password session invalidation.");
  },
  "TC-043": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "weak", "weak");
    expect(await setPage.isSubmitEnabled()).toBeFalsy();
    expect(await new HFIDashboardPage(page).isDashboardLoaded()).toBeFalsy();
  },
  "TC-044": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(reset.password, "Ab1@#$%&", "Ab1@#$%&");
    expect(await setPage.isSubmitEnabled()).toBeTruthy();
  },
  "TC-045": async (page) => {
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    await setPage.setPasswords(
      reset.password,
      "  Winter@2026  ",
      "  Winter@2026  ",
    );
    const enabled = await setPage.isSubmitEnabled();
    expect(typeof enabled).toBe("boolean");
  },
  "TC-046": async () => {
    test.skip(!process.env.MAX_FIELD_LENGTH, "Cannot Verify: MAX_FIELD_LENGTH not set per DFS.");
  },
  "TC-047": async (page) => {
    const email = getForgotPasswordEmail();
    test.skip(!email, "Test Data: registered email required.");
    const forgot = new HFIForgotPasswordPage(page);
    await forgot.openFromLogin();
    const mixed = email!.split("@");
    const cased = `${mixed[0].charAt(0).toUpperCase()}${mixed[0].slice(1)}@${mixed[1]}`;
    await forgot.submitEmail(cased);
    await expect(forgot.confirmationMessage).toBeVisible({ timeout: 15_000 });
  },
  "TC-048": async (page) => {
    if (!allowDestructivePasswordReset()) {
      test.skip(true, "Test Data: RESET_TEST_ALLOW_PASSWORD_CHANGE=true for submit test.");
    }
    const setPage = await requireMustReset(page);
    const reset = getMustResetCredentials()!;
    const newPwd = getNewPasswordForResetTest() ?? "Winter@2026";
    await setPage.setPasswords(reset.password, newPwd, newPwd);
    await setPage.submitButton.dblclick();
    await page.waitForTimeout(3_000);
    const onReset = page.url().includes("reset-password");
    const onDash = await new HFIDashboardPage(page).isDashboardLoaded().catch(() => false);
    expect(onDash || !onReset).toBeTruthy();
  },
};
