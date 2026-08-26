import { test, type Page } from "@playwright/test";
import { HFIDealerFinanceDashboardPage } from "@pages/hfi-portal/dealer-finance/HFIDealerFinanceDashboardPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const DASHBOARD_STEP_PREFIX = "HFI Portal — Dealer Finance Dashboard";

export function initDashboardSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(DASHBOARD_STEP_PREFIX, title);
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

export async function openDashboardPage(
  page: Page,
): Promise<HFIDealerFinanceDashboardPage> {
  const dash = new HFIDealerFinanceDashboardPage(page);
  await dash.openFromLogin();
  return dash;
}

export async function requireDashboard(
  page: Page,
): Promise<HFIDealerFinanceDashboardPage> {
  const dash = await openDashboardPage(page);
  await dash.expectDashboardLoaded();
  return dash;
}

export async function getFirstSpecificBranch(
  dash: HFIDealerFinanceDashboardPage,
): Promise<string | undefined> {
  const labels = await dash.getBranchFilterOptionLabels();
  return labels.find(
    (l) => l.length > 0 && !/all branches|consolidated/i.test(l),
  );
}

export function getDashboardTestBranch(): string | undefined {
  return process.env.DASHBOARD_TEST_BRANCH?.trim() || undefined;
}

export function getDashboardEmptyBranch(): string | undefined {
  return process.env.DASHBOARD_EMPTY_BRANCH?.trim() || undefined;
}
