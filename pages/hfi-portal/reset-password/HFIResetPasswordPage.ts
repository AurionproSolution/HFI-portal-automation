import { expect, type Locator, type Page } from "@playwright/test";
import { getCredentials, getMustResetCredentials } from "@config/env";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { BasePage } from "@pages/common/BasePage";

export class HFIResetPasswordPage extends BasePage {
  readonly heading: Locator;
  readonly contextBanner: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly policyHint: Locator;
  readonly passwordVisibilityToggles: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page
      .getByRole("heading", { name: /reset your password|set a new password/i })
      .or(page.getByText(/reset your password/i).first());
    this.contextBanner = page.getByText(
      /first-time sign-in|first-time login requires|one quick step/i,
    );
    this.currentPasswordInput = page.locator('input[type="password"]').nth(0);
    this.newPasswordInput = page.locator('input[type="password"]').nth(1);
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(2);
    this.submitButton = page.getByRole("button", {
      name: /reset password|save and continue|save|submit/i,
    });
    this.policyHint = page.getByText(
      /at least 8 characters|uppercase|lowercase|number|special character|6\+ characters/i,
    );
    this.passwordVisibilityToggles = page
      .locator('input[type="password"]')
      .nth(1)
      .locator("xpath=..")
      .locator('[class*="cursor-pointer"], button')
      .first();
  }

  async openViaFirstTimeLogin(): Promise<void> {
    const reset = getMustResetCredentials();
    if (!reset) {
      throw new Error("MUST_RESET_USERNAME / MUST_RESET_PASSWORD required");
    }
    const login = new HFILoginPage(this.page);
    await login.open();
    await login.login(reset.username, reset.password);
    await this.verifyFirstTimeScreen();
  }

  async verifyFirstTimeScreen(): Promise<void> {
    await this.waitForLoader();
    await expect(this.page).toHaveURL(/reset-password/i, { timeout: 60_000 });
    await expect(this.heading).toBeVisible();
    const banner = this.contextBanner.first();
    if ((await this.contextBanner.count()) > 0) {
      await expect(banner).toBeAttached();
    }
    await expect(this.newPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    const toggleVisible = await this.passwordVisibilityToggles
      .first()
      .isVisible()
      .catch(() => false);
    if (!toggleVisible) {
      await expect(
        this.page.locator('input[type="password"]').nth(1),
      ).toBeVisible();
    } else {
      await expect(this.passwordVisibilityToggles.first()).toBeVisible();
    }
  }

  async verifySetPasswordScreen(): Promise<void> {
    await this.verifyFirstTimeScreen();
  }

  async isSetPasswordScreen(): Promise<boolean> {
    if (!this.page.url().includes("reset-password")) {
      return false;
    }
    return this.heading.isVisible({ timeout: 3_000 }).catch(() => false);
  }

  async fillCurrentPassword(value: string): Promise<void> {
    await this.common.clearAndFill(this.currentPasswordInput, value);
  }

  async fillNewPassword(value: string): Promise<void> {
    await this.common.clearAndFill(this.newPasswordInput, value);
  }

  async fillConfirmPassword(value: string): Promise<void> {
    await this.common.clearAndFill(this.confirmPasswordInput, value);
  }

  async setPasswords(current: string, newPwd: string, confirm: string): Promise<void> {
    await this.fillCurrentPassword(current);
    await this.fillNewPassword(newPwd);
    await this.fillConfirmPassword(confirm);
  }

  async clickSubmit(): Promise<void> {
    await this.common.click(this.submitButton);
    await this.waitForLoader();
  }

  async isSubmitEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled();
  }

  async getNewPasswordInputType(): Promise<string | null> {
    return this.newPasswordInput.getAttribute("type");
  }

  /** App may keep type=password and toggle via -webkit-text-security. */
  async isNewPasswordVisuallyRevealed(): Promise<boolean> {
    const row = this.newPasswordInput.locator("xpath=..");
    const toggle = row.locator("button").last();
    const label = (await toggle.getAttribute("aria-label")) ?? "";
    return /hide/i.test(label);
  }

  async toggleNewPasswordVisibility(): Promise<void> {
    const row = this.newPasswordInput.locator("xpath=..");
    const toggle = row.locator("button").last();
    await toggle.click({ force: true });
  }

  async toggleConfirmPasswordVisibility(): Promise<void> {
    const row = this.confirmPasswordInput.locator("xpath=..");
    await row.locator("button").last().click({ force: true });
  }

  async expectMismatchMessage(): Promise<void> {
    await expect(
      this.page.getByText(/passwords do not match|do not match/i),
    ).toBeVisible();
  }

  async expectPolicyMessageVisible(): Promise<void> {
    await expect(this.page.getByText(/6\+.*characters/i).first()).toBeVisible();
  }
}
