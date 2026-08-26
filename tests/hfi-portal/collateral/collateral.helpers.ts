import { test, type Page } from "@playwright/test";
import { HFICollateralPage } from "@pages/hfi-portal/dealer-finance/HFICollateralPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const COLLATERAL_STEP_PREFIX = "HFI Portal — Collateral";

export function initCollateralSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(COLLATERAL_STEP_PREFIX, title);
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

export async function openCollateralPage(
  page: Page,
): Promise<HFICollateralPage> {
  const col = new HFICollateralPage(page);
  await col.openFromLogin();
  return col;
}

export async function requireModule(page: Page): Promise<HFICollateralPage> {
  const col = await openCollateralPage(page);
  await col.expectModuleLoaded();
  return col;
}

export async function requireCollateralData(
  col: HFICollateralPage,
): Promise<void> {
  await col.waitForCollateralDataLoaded();
  const text = await col.getPageText();
  const empty =
    /no collateral|no securities|no matching|no data available/i.test(text);
  const cards = await col.countRenderedSecurityCards();
  if (empty && cards === 0) {
    skipWithReason(
      "No collateral securities on DEV for active dealer — seed LOS/LMS collateral data or set COLLATERAL_TEST_BRANCH / COLLATERAL_ALT_BRANCH.",
    );
  }
}

export async function getFirstSpecificBranch(
  col: HFICollateralPage,
): Promise<string | undefined> {
  const labels = await col.getBranchFilterOptionLabels();
  return labels.find(
    (l) => l.length > 0 && !/all branches|consolidated/i.test(l),
  );
}

export function getCollateralTestBranch(): string {
  return (
    process.env.COLLATERAL_TEST_BRANCH?.trim() ||
    process.env.COLLATERAL_ALT_BRANCH?.trim() ||
    "Branch"
  );
}

export function getCollateralEmptyBranch(): string | undefined {
  return process.env.COLLATERAL_EMPTY_BRANCH?.trim() || undefined;
}
