import { expect, type Locator, type Page } from "@playwright/test";
import { getBaseUrl } from "@config/env";
import { HFIProfilePage } from "@pages/hfi-portal/profile/HFIProfilePage";
import { logger } from "@utils/logger";

export const EMAIL_INVALID_FORMAT_MESSAGE =
  /invalid format|please enter a valid email/i;
export const MOBILE_INVALID_FORMAT_MESSAGE =
  /invalid format|please enter a valid.*phone|10-digit phone/i;
export const SAME_EMAIL_MESSAGE =
  /new email.*cannot be the same|same as the current email/i;
export const SAME_MOBILE_MESSAGE =
  /new mobile.*cannot be the same|same as the current one/i;
export const INCORRECT_OTP_MESSAGE = /incorrect otp|attempts remaining/i;
export const LOCKOUT_MESSAGE =
  /otp verification unsuccessful|try again after 24 hours|service request/i;
export const OTP_NOTIFICATION_FAILURE_MESSAGE =
  /unable to send otp|try again/i;

/** US-DLR-006 — Contact Info Update (Registered Email & Mobile OTP-Verified). */
export class HFIContactInfoUpdatePage extends HFIProfilePage {
  private lastSendOtpResponse: {
    url: string;
    status: number;
    body: unknown;
    requestBody: unknown;
  } | null = null;

  private lastVerifyOtpResponse: {
    url: string;
    status: number;
    body: unknown;
    requestBody: unknown;
  } | null = null;

  private lastUpdateResponse: {
    url: string;
    status: number;
    body: unknown;
  } | null = null;

  readonly cancelButton: Locator;
  readonly sendOtpButton: Locator;
  readonly verifyOtpButton: Locator;
  readonly resendOtpButton: Locator;
  readonly newEmailInput: Locator;
  readonly newMobileInput: Locator;
  readonly otpInput: Locator;

  constructor(page: Page) {
    super(page);
    this.cancelButton = page.getByRole("button", { name: /^cancel$/i });
    this.sendOtpButton = page.getByRole("button", { name: /send otp/i });
    this.verifyOtpButton = page.getByRole("button", { name: /verify otp/i });
    this.resendOtpButton = page.getByRole("button", { name: /resend otp/i });
    this.newEmailInput = page.locator(
      'main input[placeholder="new.email@dealer.com"]',
    );
    this.newMobileInput = page
      .locator("main")
      .getByText(/new mobile/i)
      .locator("xpath=ancestor::*[self::div or self::app-form-field][1]")
      .locator("input")
      .last()
      .or(
        page
          .locator("main input")
          .filter({ has: page.locator("xpath=..") })
          .nth(1),
      );
    this.otpInput = page.locator('main input[placeholder="6-digit OTP"]');
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Contact Info Update";
  }

  async openEmailUpdatePanel(): Promise<void> {
    this.logStep("Open Registered Email update panel");
    await this.clickRegisteredEmailUpdate();
    await this.expectEmailUpdatePanelOpen();
  }

  async openMobileUpdatePanel(): Promise<void> {
    this.logStep("Open Registered Mobile update panel");
    await this.clickRegisteredMobileUpdate();
    await this.expectMobileUpdatePanelOpen();
  }

  async expectEmailUpdatePanelOpen(): Promise<void> {
    await expect(this.page.getByText(/current email id/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(/new email id/i)).toBeVisible();
    await expect(this.newEmailInput).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.sendOtpButton).toBeVisible();
  }

  async expectMobileUpdatePanelOpen(): Promise<void> {
    await expect(this.page.getByText(/current mobile/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(/new mobile/i)).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.sendOtpButton).toBeVisible();
  }

  async expectUpdatePanelBasics(channel: "email" | "mobile"): Promise<void> {
    if (channel === "email") {
      await this.expectEmailUpdatePanelOpen();
      const current = await this.getCurrentEmailValue();
      expect(current.length).toBeGreaterThan(0);
    } else {
      await this.expectMobileUpdatePanelOpen();
      const current = await this.getCurrentMobileValue();
      expect(current.length).toBeGreaterThan(0);
    }
    await expect(this.sendOtpButton).toBeDisabled();
    await expect(this.cancelButton).toBeEnabled();
  }

  async expectInlineOnProfile(): Promise<void> {
    this.logStep("Verify inline panel on Profile URL");
    await this.expectDealerFinanceProfileUrl();
    await expect(this.dealerInformationSection).toBeVisible();
    await expect(this.pageHeading).toBeVisible();
  }

  async getCurrentEmailValue(): Promise<string> {
    const field = this.mainContent
      .getByText(/current email id/i)
      .locator("xpath=following::input[1]");
    if (await field.isVisible().catch(() => false)) {
      return (await field.inputValue()).trim();
    }
    return (await this.mainContent.locator("input").first().inputValue()).trim();
  }

  async getCurrentMobileValue(): Promise<string> {
    const field = this.mainContent
      .getByText(/current mobile/i)
      .locator("xpath=following::input[1]");
    if (await field.isVisible().catch(() => false)) {
      return (await field.inputValue()).trim();
    }
    return (await this.mainContent.locator("input").first().inputValue()).trim();
  }

  async fillNewEmail(value: string): Promise<void> {
    this.logStep("Enter new email value");
    await this.newEmailInput.fill(value);
    await this.newEmailInput.blur();
    await this.page.waitForTimeout(300);
  }

  async fillNewMobile(value: string): Promise<void> {
    this.logStep("Enter new mobile value");
    const input = await this.resolveNewMobileInput();
    await input.fill(value);
    await input.blur();
    await this.page.waitForTimeout(300);
  }

  private async resolveNewMobileInput(): Promise<Locator> {
    const byLabel = this.mainContent
      .getByText(/new mobile/i)
      .locator("xpath=following::input[1]");
    if (await byLabel.isVisible().catch(() => false)) return byLabel;
    return this.mainContent.locator("input").nth(1);
  }

  async expectSendOtpEnabled(): Promise<void> {
    await expect(this.sendOtpButton).toBeEnabled({ timeout: 10_000 });
  }

  async expectSendOtpDisabled(): Promise<void> {
    await expect(this.sendOtpButton).toBeDisabled({ timeout: 10_000 });
  }

  async expectEmailValidationError(): Promise<void> {
    await expect(this.mainContent.getByText(EMAIL_INVALID_FORMAT_MESSAGE)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectMobileValidationError(): Promise<void> {
    await expect(this.mainContent.getByText(MOBILE_INVALID_FORMAT_MESSAGE)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectSameEmailError(): Promise<void> {
    await expect(this.mainContent.getByText(SAME_EMAIL_MESSAGE)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectSameMobileError(): Promise<void> {
    await expect(this.mainContent.getByText(SAME_MOBILE_MESSAGE)).toBeVisible({
      timeout: 10_000,
    });
  }

  async clickSendOtp(): Promise<void> {
    this.logStep("Click Send OTP");
    const responsePromise = this.page
      .waitForResponse(
        (r) =>
          /otp|send|contact|email|mobile|update/i.test(r.url()) &&
          r.request().method() !== "GET",
        { timeout: 60_000 },
      )
      .catch(() => null);
    await this.common.click(this.sendOtpButton);
    await this.waitForLoader();
    const response = await responsePromise;
    if (response) await this.storeSendOtpResponse(response);
  }

  async clickVerifyOtp(): Promise<void> {
    this.logStep("Click Verify OTP");
    const responsePromise = this.page
      .waitForResponse(
        (r) =>
          /otp|verify|contact|email|mobile|update/i.test(r.url()) &&
          r.request().method() !== "GET",
        { timeout: 60_000 },
      )
      .catch(() => null);
    await this.common.click(this.verifyOtpButton);
    await this.waitForLoader();
    const response = await responsePromise;
    if (response) await this.storeVerifyOtpResponse(response);
  }

  async clickResendOtp(): Promise<void> {
    this.logStep("Click Resend OTP");
    await this.common.click(this.resendOtpButton);
    await this.waitForLoader();
  }

  async clickCancel(): Promise<void> {
    this.logStep("Click Cancel on update panel");
    await this.common.click(this.cancelButton);
    await this.waitForLoader();
    await expect(this.sendOtpButton).toBeHidden({ timeout: 10_000 }).catch(() => {});
  }

  async fillOtp(value: string): Promise<void> {
    this.logStep("Enter OTP value");
    await expect(this.otpInput).toBeVisible({ timeout: 30_000 });
    await this.otpInput.fill(value);
  }

  async expectOtpStepVisible(): Promise<void> {
    this.logStep("Verify OTP entry step");
    await expect(this.page.getByText(/enter otp/i)).toBeVisible({ timeout: 30_000 });
    await expect(this.otpInput).toBeVisible();
    await expect(this.verifyOtpButton).toBeVisible();
    await expect(this.page.getByText(/otp sent to/i)).toBeVisible();
  }

  async expectVerifyOtpDisabled(): Promise<void> {
    await expect(this.verifyOtpButton).toBeDisabled();
  }

  async expectVerifyOtpEnabled(): Promise<void> {
    await expect(this.verifyOtpButton).toBeEnabled();
  }

  async expectOtpLengthEnforced(expectedLength = 6): Promise<void> {
    const max = await this.otpInput.getAttribute("maxlength");
    expect(max).toBe(String(expectedLength));
    await this.otpInput.fill("1".repeat(expectedLength - 1));
    await expect(this.verifyOtpButton).toBeDisabled();
    await this.otpInput.fill("1".repeat(expectedLength));
    await expect(this.verifyOtpButton).toBeEnabled();
  }

  async expectIncorrectOtpMessage(): Promise<void> {
    await expect(this.mainContent.getByText(INCORRECT_OTP_MESSAGE)).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectLockoutMessage(): Promise<void> {
    await expect(this.mainContent.getByText(LOCKOUT_MESSAGE)).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectResendCountdownVisible(): Promise<void> {
    await expect(this.mainContent.getByText(/\d+\s*s/i)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectResendOtpDisabled(): Promise<void> {
    await expect(this.resendOtpButton).toBeDisabled();
  }

  async expectPanelClosed(): Promise<void> {
    await expect(this.sendOtpButton).toBeHidden({ timeout: 10_000 });
    await expect(this.newEmailInput).toBeHidden({ timeout: 10_000 }).catch(() => {});
  }

  private async readResponseBody(
    response: import("@playwright/test").Response,
  ): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      try {
        return await response.text();
      } catch {
        return null;
      }
    }
  }

  private async readRequestBody(
    response: import("@playwright/test").Response,
  ): Promise<unknown> {
    try {
      return response.request().postDataJSON();
    } catch {
      return null;
    }
  }

  private async storeSendOtpResponse(
    response: import("@playwright/test").Response,
  ): Promise<void> {
    this.lastSendOtpResponse = {
      url: response.url(),
      status: response.status(),
      body: await this.readResponseBody(response),
      requestBody: await this.readRequestBody(response),
    };
    logger.info(`Send OTP API: ${response.url()} status=${response.status()}`);
  }

  private async storeVerifyOtpResponse(
    response: import("@playwright/test").Response,
  ): Promise<void> {
    this.lastVerifyOtpResponse = {
      url: response.url(),
      status: response.status(),
      body: await this.readResponseBody(response),
      requestBody: await this.readRequestBody(response),
    };
    if (/update|contact|email|mobile/i.test(response.url())) {
      this.lastUpdateResponse = {
        url: response.url(),
        status: response.status(),
        body: await this.readResponseBody(response),
      };
    }
    logger.info(`Verify OTP API: ${response.url()} status=${response.status()}`);
  }

  getLastSendOtpResponse() {
    return this.lastSendOtpResponse;
  }

  getLastVerifyOtpResponse() {
    return this.lastVerifyOtpResponse;
  }

  getLastUpdateResponse() {
    return this.lastUpdateResponse;
  }

  async assertOtpNotInClientStorage(): Promise<void> {
    const storage = await this.page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    }));
    const serialized = JSON.stringify(storage).toLowerCase();
    expect(serialized).not.toMatch(/\botp\b.*\d{6}/);
    expect(this.page.url()).not.toMatch(/otp=/i);
  }

  async assertHttpsOnLastOtpCall(): Promise<void> {
    const apiUrl =
      this.lastVerifyOtpResponse?.url || this.lastSendOtpResponse?.url || "";
    if (apiUrl) {
      expect(apiUrl).toMatch(/^https:\/\//i);
      return;
    }
    expect(this.page.url()).toMatch(/^https:\/\//i);
  }

  async attemptDirectUpdateWithoutOtp(
    channel: "email" | "mobile",
    newValue: string,
  ): Promise<number> {
    const base = getBaseUrl().replace(/\/$/, "");
    const candidates = [
      process.env.CONTACT_INFO_UPDATE_API_URL?.trim(),
      this.lastUpdateResponse?.url,
      this.lastVerifyOtpResponse?.url,
      `${base}/api/dealer/contact/update`,
      `${base}/api/contact/update`,
    ].filter(Boolean) as string[];

    for (const url of candidates) {
      const response = await this.page.request.post(url, {
        data: {
          channel,
          newValue,
          email: newValue,
          mobile: newValue,
          dealerCode: "PB00018",
        },
        failOnStatusCode: false,
      });
      if ([401, 403, 404, 405, 415, 422].includes(response.status())) {
        return response.status();
      }
    }
    return 0;
  }

  normalizeMobileDigits(value: string): string {
    return value.replace(/\D/g, "").slice(-10);
  }

  getTestNewEmail(): string {
    return (
      process.env.CONTACT_INFO_NEW_EMAIL?.trim() ||
      `ciu.automation.${Date.now()}@gmail.com`
    );
  }

  getTestNewMobile(): string {
    const env = process.env.CONTACT_INFO_NEW_MOBILE?.trim();
    if (env) return env.replace(/\D/g, "").slice(-10);
    return "9876543210";
  }
}
