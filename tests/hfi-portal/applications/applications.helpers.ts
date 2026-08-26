import { test, type Page } from "@playwright/test";
import { HFIApplicationsPage } from "@pages/hfi-portal/consumer-finance/HFIApplicationsPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const APP_STEP_PREFIX = "HFI Portal — Applications";

export function initApplicationsSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(APP_STEP_PREFIX, title);
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

export async function requireModule(page: Page): Promise<HFIApplicationsPage> {
  const mod = new HFIApplicationsPage(page);
  await mod.openFromLogin();
  return mod;
}
