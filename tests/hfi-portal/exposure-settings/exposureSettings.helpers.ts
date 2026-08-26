import { test, type Page } from "@playwright/test";
import {
  findDealerEntry,
  getDealerLoginPassword,
  getLoginUsername,
} from "@config/dealer-registry";
import { HFIExposureSettingsPage } from "@pages/hfi-portal/dealer-finance/HFIExposureSettingsPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";
import { applyExposureDataFailureRoute } from "./exposureSettings.api.helpers";

export const EXPOSURE_STEP_PREFIX = "HFI Portal — Exposure Settings";

export function initExposureSettingsSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(EXPOSURE_STEP_PREFIX, title);
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

export async function openExposureSettingsPage(
  page: Page,
): Promise<HFIExposureSettingsPage> {
  const exp = new HFIExposureSettingsPage(page);
  await exp.openFromLogin();
  return exp;
}

export async function requireModule(
  page: Page,
): Promise<HFIExposureSettingsPage> {
  const exp = new HFIExposureSettingsPage(page);
  await exp.openFromLogin();
  await exp.expectModuleLoaded();
  return exp;
}

export async function getFirstRequestId(page: Page): Promise<string> {
  const text = await new HFIExposureSettingsPage(page).getPageText();
  const match = text.match(/REQ[-\s]?[A-Z0-9]{4,}/i);
  if (!match) {
    skipWithReason("No Request ID found in Pending Limit Requests table.");
  }
  return match[0];
}

export async function catchSkip(
  e: unknown,
  testFn: typeof test,
): Promise<void> {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.startsWith("SKIP:")) {
    testFn.skip(true, msg.replace(/^SKIP:\s*/, ""));
  }
  throw e;
}

export async function openExposureWithDataFailure(
  page: Page,
): Promise<HFIExposureSettingsPage> {
  await applyExposureDataFailureRoute(page);
  return openExposureSettingsPage(page);
}

export async function requireFirstTimeExposureDealer(
  page: Page,
): Promise<HFIExposureSettingsPage> {
  const dealerKey = process.env.EXPOSURE_FIRST_TIME_DEALER?.trim();
  if (!dealerKey) {
    skipWithReason(
      "Set EXPOSURE_FIRST_TIME_DEALER to a dealer key in dealers.json (AC-20).",
    );
  }
  const entry = findDealerEntry(dealerKey);
  if (!entry) {
    skipWithReason(`Dealer key "${dealerKey}" not found in dealers.json.`);
  }
  const exp = new HFIExposureSettingsPage(page);
  await exp.signInWithCredentials(
    getLoginUsername(entry.profile),
    getDealerLoginPassword(entry.profile),
  );
  if (
    await exp.firstTimeVisibilityPrompt
      .isVisible({ timeout: 20_000 })
      .catch(() => false)
  ) {
    return exp;
  }
  await exp.navigateToModule().catch(() => undefined);
  if (
    !(await exp.firstTimeVisibilityPrompt.isVisible({ timeout: 10_000 }).catch(() => false))
  ) {
    skipWithReason(
      "First-time visibility prompt not shown for EXPOSURE_FIRST_TIME_DEALER.",
    );
  }
  return exp;
}

export async function openAsBranchScopedDealer(
  page: Page,
): Promise<HFIExposureSettingsPage> {
  const dealerKey =
    process.env.EXPOSURE_SCOPED_DEALER?.trim() ||
    process.env.ACTIVE_DEALER?.trim();
  if (!dealerKey) {
    skipWithReason(
      "Set EXPOSURE_SCOPED_DEALER or ACTIVE_DEALER for branch-scoped security test.",
    );
  }
  const entry = findDealerEntry(dealerKey);
  if (!entry) {
    skipWithReason(`Dealer key "${dealerKey}" not found in dealers.json.`);
  }
  const exp = new HFIExposureSettingsPage(page);
  await exp.signInWithCredentials(
    getLoginUsername(entry.profile),
    getDealerLoginPassword(entry.profile),
  );
  await exp.navigateToModule();
  await exp.expectModuleLoaded();
  return exp;
}
