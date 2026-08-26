import { test, type Page } from "@playwright/test";
import { HFIPayoutsPage } from "@pages/hfi-portal/consumer-finance/HFIPayoutsPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const PAY_STEP_PREFIX = "HFI Portal — Payouts";

export function initPayoutsSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(PAY_STEP_PREFIX, title);
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

export async function requireModule(page: Page): Promise<HFIPayoutsPage> {
  const mod = new HFIPayoutsPage(page);
  await mod.openFromLogin();
  return mod;
}
