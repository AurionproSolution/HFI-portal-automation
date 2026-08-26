import { test, type Page } from "@playwright/test";
import { OpsOfflinePaymentPage } from "@pages/ops-console/OpsOfflinePaymentPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const OPS2_STEP_PREFIX = "Ops Console — Offline Payment Verification";

export function initOfflinePaymentSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(OPS2_STEP_PREFIX, title);
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

export async function requireModule(page: Page): Promise<OpsOfflinePaymentPage> {
  const mod = new OpsOfflinePaymentPage(page);
  await mod.openFromLogin();
  return mod;
}
