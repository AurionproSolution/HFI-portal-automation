import { test, type Page } from "@playwright/test";
import type { DealerLoginCase } from "@testData/hfi/dealerLoginCatalog";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const DEALER_LOGIN_STEP_PREFIX = "HFI Portal — Dealer Login";

export function initDealerLoginSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(DEALER_LOGIN_STEP_PREFIX, title);
  await test.step(title, fn);
}

export function skipWithReason(reason: string): never {
  throw new Error(`SKIP: ${reason}`);
}

export function requireEnv(name: string, reason: string): void {
  if (!process.env[name]?.trim()) {
    skipWithReason(reason);
  }
}

export function priorityTag(p: string): string {
  return `@${p.toLowerCase()}`;
}

export function typeTag(t: string): string {
  return `@${t.toLowerCase()}`;
}

export function caseTags(c: DealerLoginCase): string {
  return `${typeTag(c.type)} ${priorityTag(c.priority)} @honda`;
}

/** TC-012 — Browser A session ended after concurrent login on Browser B. */
export async function verifyBrowserASessionInvalidated(
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
    return {
      invalidated: true,
      detail: "Session invalidation message on Browser A",
    };
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

export async function catchSkip(
  e: unknown,
  testFn: typeof test,
): Promise<void> {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.startsWith("SKIP:")) {
    testFn.skip(true, msg.replace(/^SKIP:\s*/, ""));
  }
  throw e;
}
