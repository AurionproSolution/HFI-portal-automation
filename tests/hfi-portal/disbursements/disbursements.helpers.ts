import { test, type Page } from "@playwright/test";
import { HFIDisbursementsPage } from "@pages/hfi-portal/consumer-finance/HFIDisbursementsPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const DIS_STEP_PREFIX = "HFI Portal — Disbursements";

export function initDisbursementsSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(DIS_STEP_PREFIX, title);
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

export async function requireModule(page: Page): Promise<HFIDisbursementsPage> {
  const mod = new HFIDisbursementsPage(page);
  await mod.openFromLogin();
  return mod;
}
