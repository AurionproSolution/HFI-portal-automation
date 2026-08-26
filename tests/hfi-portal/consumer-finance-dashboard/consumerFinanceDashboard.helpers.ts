import { test, type Page } from "@playwright/test";
import { HFIConsumerFinanceDashboardPage } from "@pages/hfi-portal/consumer-finance/HFIConsumerFinanceDashboardPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const CFD_STEP_PREFIX = "HFI Portal — Consumer Finance Dashboard";

export function initConsumerFinanceDashboardSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(CFD_STEP_PREFIX, title);
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

export async function requireModule(
  page: Page,
): Promise<HFIConsumerFinanceDashboardPage> {
  const mod = new HFIConsumerFinanceDashboardPage(page);
  await mod.openFromLogin();
  return mod;
}

export async function openConsumerFinanceDashboardPage(
  page: Page,
): Promise<HFIConsumerFinanceDashboardPage> {
  return requireModule(page);
}
