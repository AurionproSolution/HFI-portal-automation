import { test, type Page } from "@playwright/test";
import { OEMCheckerPage } from "@pages/oem-portal/checker/OEMCheckerPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const CHK_STEP_PREFIX = "OEM Portal — Checker Queue";

export function initOEMCheckerSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(CHK_STEP_PREFIX, title);
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

export async function requireModule(page: Page): Promise<OEMCheckerPage> {
  const mod = new OEMCheckerPage(page);
  await mod.openFromLogin();
  return mod;
}
