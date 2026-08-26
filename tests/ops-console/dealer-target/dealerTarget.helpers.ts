import { test, type Page } from "@playwright/test";
import { OpsDealerTargetPage } from "@pages/ops-console/OpsDealerTargetPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const OPS3_STEP_PREFIX = "Ops Console — Dealer Target";

export function initDealerTargetSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(OPS3_STEP_PREFIX, title);
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

export async function requireModule(page: Page): Promise<OpsDealerTargetPage> {
  const mod = new OpsDealerTargetPage(page);
  await mod.openFromLogin();
  return mod;
}
