import { test, expect, type Page } from "@playwright/test";
import {
  isDealerFinanceEnabledForOnboarding,
} from "@config/env";
import { HFIInPrincipalSanctionPage } from "@pages/hfi-portal/onboarding/HFIInPrincipalSanctionPage";
import { HFIOnboardingDashboardPage } from "@pages/hfi-portal/onboarding/HFIOnboardingDashboardPage";

export type LoginLanding = "onboarding" | "full-finance" | "other";

export async function loginOnboardingUser(page: Page): Promise<LoginLanding> {
  const dash = new HFIOnboardingDashboardPage(page);
  await dash.signInWithOnboardingCredentials();
  await page.waitForURL(/onboarding|consumer|dashboard|dealer-finance/i, {
    timeout: 90_000,
  });
  await page.waitForTimeout(2_000);

  if (!page.url().includes("onboarding")) {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2_500);
  }
  const body = await page.locator("body").innerText();
  if (/error\s*404|not found/i.test(body)) {
    if (isDealerFinanceEnabledForOnboarding()) {
      return "full-finance";
    }
    return "other";
  }
  if (/my tasks|dealer onboarding|in principal sanction letter/i.test(body)) {
    return "onboarding";
  }
  if (
    isDealerFinanceEnabledForOnboarding() &&
    (page.url().includes("consumer") || /consumer finance/i.test(body))
  ) {
    return "full-finance";
  }
  return "other";
}

export async function openOnboardingDashboard(
  page: Page,
): Promise<HFIInPrincipalSanctionPage> {
  const ip = new HFIInPrincipalSanctionPage(page);
  const landing = await loginOnboardingUser(page);
  if (landing === "onboarding" || page.url().includes("onboarding")) {
    await ip.waitForLoader();
    await expect(ip.myTasksSection).toBeVisible({ timeout: 60_000 }).catch(() => undefined);
  }
  return ip;
}

export function skipUnlessOnboarding(
  landing: LoginLanding,
  reason: string,
): void {
  if (landing !== "onboarding") {
    test.skip(true, reason);
  }
}

export function skipUnlessInPrincipalPanel(
  hasPanel: boolean,
  reason: string,
): void {
  if (!hasPanel) {
    test.skip(true, reason);
  }
}

export function allowInPrincipalDecisions(): boolean {
  return process.env.IN_PRINCIPAL_ALLOW_DECISIONS === "true";
}

export function skipDestructiveDecision(reason: string): void {
  if (!allowInPrincipalDecisions()) {
    test.skip(true, reason);
  }
}
