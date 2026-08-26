import { test, type Page } from "@playwright/test";
import { HFIContactInfoUpdatePage } from "@pages/hfi-portal/contact-info/HFIContactInfoUpdatePage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const CONTACT_INFO_STEP_PREFIX = "HFI Portal — Contact Info Update";

export function initContactInfoSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(CONTACT_INFO_STEP_PREFIX, title);
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

export async function openContactInfoFromLogin(
  page: Page,
): Promise<HFIContactInfoUpdatePage> {
  const contact = new HFIContactInfoUpdatePage(page);
  await contact.openFromLogin();
  await contact.expectProfileLoaded();
  return contact;
}

export async function requireContactInfo(
  page: Page,
): Promise<HFIContactInfoUpdatePage> {
  return openContactInfoFromLogin(page);
}

export async function requireEmailPanel(
  page: Page,
): Promise<HFIContactInfoUpdatePage> {
  const contact = await requireContactInfo(page);
  await contact.openEmailUpdatePanel();
  return contact;
}

export async function requireMobilePanel(
  page: Page,
): Promise<HFIContactInfoUpdatePage> {
  const contact = await requireContactInfo(page);
  await contact.openMobileUpdatePanel();
  return contact;
}

export function requireOtpHarness(reason: string): void {
  if (!process.env.CONTACT_INFO_TEST_OTP?.trim() && !process.env.CONTACT_INFO_OTP_API_URL?.trim()) {
    skipWithReason(reason);
  }
}

export function getTestOtp(): string | undefined {
  return process.env.CONTACT_INFO_TEST_OTP?.trim() || undefined;
}
