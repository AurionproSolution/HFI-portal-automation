import { test, type Page } from "@playwright/test";
import { HFIPendingPDDsPage } from "@pages/hfi-portal/consumer-finance/HFIPendingPDDsPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const PDD_STEP_PREFIX = "HFI Portal — Pending PDDs";

export function initPendingPDDsSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(PDD_STEP_PREFIX, title);
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

export async function requireModule(page: Page): Promise<HFIPendingPDDsPage> {
  const mod = new HFIPendingPDDsPage(page);
  await mod.openFromLogin();
  return mod;
}
