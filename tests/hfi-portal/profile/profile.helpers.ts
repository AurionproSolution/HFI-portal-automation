import { test, type Page } from "@playwright/test";
import { HFIProfilePage } from "@pages/hfi-portal/profile/HFIProfilePage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const PROFILE_STEP_PREFIX = "HFI Portal — Profile";

export function initProfileSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(PROFILE_STEP_PREFIX, title);
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

export async function openProfilePage(page: Page): Promise<HFIProfilePage> {
  const profile = new HFIProfilePage(page);
  await profile.openFromLogin();
  return profile;
}

export async function requireProfile(page: Page): Promise<HFIProfilePage> {
  const profile = await openProfilePage(page);
  await profile.expectProfileLoaded();
  return profile;
}

export async function getFirstSpecificBranch(
  profile: HFIProfilePage,
): Promise<string | undefined> {
  const labels = await profile.getBranchFilterOptionLabels();
  return labels.find(
    (l) => l.length > 0 && !/all branches|consolidated/i.test(l),
  );
}

export function getProfileTestBranch(): string | undefined {
  return process.env.PROFILE_TEST_BRANCH?.trim() || undefined;
}

export function getProfileEmptyBranch(): string | undefined {
  return process.env.PROFILE_EMPTY_BRANCH?.trim() || undefined;
}
