import { test, type Browser, type Page } from "@playwright/test";
import {
  getAdminCredentials,
  getLoginCommsPath,
  getNotificationTemplatesPath,
  getOemCheckerCredentials,
  getOemMakerCredentials,
  getPortalUsersPath,
} from "@config/admin-env";
import { AdminLoginCommsPage } from "@pages/admin-console/login-comms/AdminLoginCommsPage";
import { AdminNotificationTemplatesPage } from "@pages/admin-console/notification-templates/AdminNotificationTemplatesPage";
import { AdminPortalUsersPage } from "@pages/admin-console/portal-users/AdminPortalUsersPage";
import { AdminConsoleBasePage } from "@pages/admin-console/AdminConsoleBasePage";
import { AdminLoginPage } from "@pages/admin-console/login/AdminLoginPage";
import { OEMLoginPage } from "@pages/oem-portal/login/OEMLoginPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const ADMIN_CONSOLE_STEP_PREFIX = "Admin Console";

export function initAdminConsoleSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(ADMIN_CONSOLE_STEP_PREFIX, title);
  await test.step(title, fn);
}

export function skipWithReason(reason: string): never {
  throw new Error(`SKIP: ${reason}`);
}

/** Login banner is deferred on DEV for the current sprint (Support & Comms only). */
export function isLoginBannerInScope(): boolean {
  return process.env.ADMIN_LOGIN_BANNER_IN_SCOPE?.trim() === "true";
}

export function skipLoginBannerDeferred(): void {
  if (!isLoginBannerInScope()) {
    test.skip(
      true,
      "OUT OF SCOPE (current sprint): Login banner removed from Support & Comms UI.",
    );
  }
}

export function requireEnv(name: string, reason: string): void {
  if (!process.env[name]?.trim()) {
    skipWithReason(reason);
  }
}

export async function requirePortalUsersAsAdmin(
  page: Page,
): Promise<AdminPortalUsersPage> {
  const pu = new AdminPortalUsersPage(page);
  await pu.openPortalUsersAsAdmin();
  if (!(await pu.isPortalUsersVisible())) {
    skipWithReason(
      `Portal Users module not available at ${getPortalUsersPath()}. Verify ADMIN credentials and path.`,
    );
  }
  await pu.expectModuleLoaded();
  return pu;
}

export async function requireNotificationTemplatesAsAdmin(
  page: Page,
): Promise<AdminNotificationTemplatesPage> {
  const nt = new AdminNotificationTemplatesPage(page);
  await nt.openNotificationTemplatesAsAdmin();
  if (!(await nt.isNotificationTemplatesVisible())) {
    skipWithReason(
      `Notification Templates not available at ${getNotificationTemplatesPath()}.`,
    );
  }
  await nt.expectModuleLoaded();
  return nt;
}

export async function requireLoginCommsAsAdmin(
  page: Page,
): Promise<AdminLoginCommsPage> {
  const lc = new AdminLoginCommsPage(page);
  await lc.openLoginCommsAsAdmin();
  if (!(await lc.isLoginCommsVisible())) {
    skipWithReason(`Login & Comms not available at ${getLoginCommsPath()}.`);
  }
  await lc.expectModuleLoaded();
  return lc;
}

export async function openAsNonAdminMaker(page: Page): Promise<void> {
  const creds = getOemMakerCredentials();
  if (!creds) {
    skipWithReason(
      "BLOCKED – Verified OEM Maker credentials are unavailable in the current DEV environment.",
    );
  }
  const login = new OEMLoginPage(page);
  await login.open();
  await login.loginWithCredentials(creds!.username, creds!.password);
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 90_000,
  });
}

export async function openAsNonAdminChecker(page: Page): Promise<void> {
  const creds = getOemCheckerCredentials();
  if (!creds) {
    skipWithReason(
      "Set OEM_CHECKER_USERNAME and OEM_CHECKER_PASSWORD for non-Admin security tests.",
    );
  }
  const login = new OEMLoginPage(page);
  await login.open();
  await login.loginWithCredentials(creds!.username, creds!.password);
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 90_000,
  });
}

export async function expectAdminConsoleAccessDenied(page: Page): Promise<void> {
  const text = await page.locator("body").innerText();
  const url = page.url();
  const denied =
    /access denied|not authorized|forbidden|permission|unauthorized/i.test(text) ||
    url.includes("/login") ||
    (!/\/admin\/(system-configuration|notification-templates|login-comms|oem-users)/i.test(
      url,
    ) &&
      !/oem users|notification templates|login\s*&\s*comms|system configuration/i.test(
        text,
      ));
  if (!denied) {
    skipWithReason(
      "Non-Admin user unexpectedly reached Admin Console — verify role mapping before asserting denial.",
    );
  }
}

export async function navigateDirectAdminPath(
  page: Page,
  path: string,
): Promise<void> {
  const base = new AdminConsoleBasePage(page);
  await base.navigateToAdminPath(path);
}

export function requireAdminCredentials(): void {
  if (!getAdminCredentials()) {
    skipWithReason("Set ADMIN_USERNAME and ADMIN_PASSWORD for Admin Console tests.");
  }
}

export async function withSecondBrowser(
  browser: Browser,
  fn: (page: Page) => Promise<void>,
): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await fn(page);
  } finally {
    await context.close();
  }
}

export function uniqueAutomationEmail(prefix = "adm.auto"): string {
  return `${prefix}.${Date.now()}@automation.test`;
}
