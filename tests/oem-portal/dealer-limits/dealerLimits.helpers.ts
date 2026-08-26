import { test, type Page } from "@playwright/test";
import { OEMDealerLimitsPage } from "@pages/oem-portal/dealer-limits/OEMDealerLimitsPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const DEALER_LIMITS_STEP_PREFIX = "OEM Portal — Dealer Limits";

export function initDealerLimitsSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(DEALER_LIMITS_STEP_PREFIX, title);
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

export async function openDealerLimitsAsMaker(
  page: Page,
  options?: { waitForDashboardData?: boolean },
): Promise<OEMDealerLimitsPage> {
  const dl = new OEMDealerLimitsPage(page);
  await dl.openFromLoginAsMaker(options);
  return dl;
}

export async function openDealerLimitsAsChecker(
  page: Page,
): Promise<OEMDealerLimitsPage> {
  const dl = new OEMDealerLimitsPage(page);
  await dl.openFromLoginAsChecker();
  return dl;
}

export async function requireModuleAsMaker(
  page: Page,
): Promise<OEMDealerLimitsPage> {
  const dl = await openDealerLimitsAsMaker(page);
  if (!(await dl.isModuleAvailable())) {
    skipWithReason(
      "Dealer Limits module not available. Set DEALER_LIMITS_PATH and OEM Maker credentials.",
    );
  }
  return dl;
}

export async function requireModuleAsChecker(
  page: Page,
): Promise<OEMDealerLimitsPage> {
  const dl = await openDealerLimitsAsChecker(page);
  if (!(await dl.isModuleAvailable())) {
    skipWithReason(
      "Dealer Limits module not available for Checker. Set DEALER_LIMITS_PATH and OEM_CHECKER credentials.",
    );
  }
  return dl;
}
