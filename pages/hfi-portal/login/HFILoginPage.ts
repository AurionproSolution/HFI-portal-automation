import { expect, type Locator, type Page } from "@playwright/test";
import { getCredentials, getLoginUrl } from "@config/env";
import { messages } from "@testData/hfi/messages";
import { urls } from "@testData/hfi/urls";
import { logger } from "@utils/logger";
import { BasePage } from "@pages/common/BasePage";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";

export class HFILoginPage extends BasePage {
  protected stepLogPrefix(): string {
    return "HFI Portal — Login";
  }

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordVisibilityToggle: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signInButton: Locator;
  readonly hondaLogo: Locator;
  readonly welcomeText: Locator;
  readonly helpSection: Locator;
  readonly contactInformation: Locator;
  readonly validationMessages: Locator;
  readonly forgotPasswordModalTitle: Locator;
  readonly forgotPasswordEmailInput: Locator;
  readonly sendTemporaryPasswordButton: Locator;

  constructor(page: Page) {
    super(page);

    this.usernameInput = page.getByPlaceholder("dealer-id or email");
    this.passwordInput = page.getByPlaceholder("••••••••");
    this.passwordVisibilityToggle = page.getByRole("button", {
      name: /show password|hide password/i,
    });
    this.forgotPasswordLink = page.getByRole("link", {
      name: /forgot password/i,
    });
    this.signInButton = page.getByRole("button", { name: /sign in/i });
    this.hondaLogo = page.getByRole("img", { name: /honda/i }).first();
    this.welcomeText = page.getByText(messages.login.welcomeText).first();
    this.helpSection = page.getByText(/help/i).first();
    this.contactInformation = page.getByText(/contact/i).first();
    this.validationMessages = page.locator(
      '[role="alert"], .text-destructive, p.text-sm.text-destructive',
    );
    this.forgotPasswordModalTitle = page.getByRole("heading", {
      name: /forgot your password/i,
    });
    this.forgotPasswordEmailInput = page.getByRole("textbox", {
      name: "you@dealer.com",
    });
    this.sendTemporaryPasswordButton = page.getByRole("button", {
      name: /send temporary password/i,
    });
  }

  async open(): Promise<void> {
    await this.navigateTo(getLoginUrl());
    await this.verifyLoginPage();
  }

  async verifyLoginPage(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  /** TC-001 — Username, Password, Sign in, Forgot password, encrypted-session note */
  async verifyRequiredLoginElements(): Promise<void> {
    this.logStep("Verify required Login screen elements");
    await this.verifyLoginPage();
    await expect(
      this.page.getByText(/encrypted session|Honda Finance India security/i),
    ).toBeVisible();
  }

  /** TC-003 — Honda Finance India logo and application name */
  async verifyBrandingSection(): Promise<void> {
    this.logStep("Verify branding section");
    await expect(this.hondaLogo).toBeVisible();
    await expect(this.welcomeText).toBeVisible();
  }

  /** TC-004 / TC-046 — encrypted-session note and support contact block */
  async verifyEncryptedSessionNoteAndSupport(): Promise<void> {
    this.logStep("Verify encrypted-session note and support contact block");
    await expect(
      this.page.getByText(/encrypted session|Honda Finance India security/i),
    ).toBeVisible();
    await expect(
      this.page.getByText(/1800|dealer\.support|@hondafinance|support/i).first(),
    ).toBeVisible();
  }

  async verifyPasswordMaskedByDefault(): Promise<void> {
    this.logStep("Verify password field masked by default");
    expect(await this.getPasswordInputType()).toBe("password");
  }

  /** HFS-T0001 / full mandatory login screen elements */
  async verifyMandatoryLoginElements(): Promise<void> {
    await this.verifyRequiredLoginElements();
    await expect(this.passwordVisibilityToggle).toBeVisible();
    await this.verifyBrandingSection();
    await this.verifyEncryptedSessionNoteAndSupport();
  }

  async openLoginUrl(url: string): Promise<void> {
    await this.navigateTo(url);
    await this.verifyLoginPage();
  }

  async enterUsername(username: string): Promise<void> {
    await this.common.clearAndFill(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.common.clearAndFill(this.passwordInput, password);
  }

  async togglePasswordVisibility(): Promise<void> {
    const currentType = await this.getPasswordInputType();
    const toggleName =
      currentType === "password" ? /^show password$/i : /^hide password$/i;
    const toggle = this.page.getByRole("button", { name: toggleName }).first();
    await this.common.click(toggle);
  }

  async clickSignIn(): Promise<void> {
    await this.common.click(this.signInButton);
    await this.waitForSignInAttemptToFinish();
  }

  /** Waits until login API completes (error on login page or navigation away). */
  async waitForSignInAttemptToFinish(): Promise<void> {
    const signingIn = this.signInButton.filter({ hasText: /signing in/i });
    if (await signingIn.isVisible().catch(() => false)) {
      await signingIn.waitFor({ state: "hidden", timeout: 45_000 }).catch(() => undefined);
    }
    await this.waitForLoader();
    await Promise.race([
      this.page.waitForURL((url) => !url.pathname.includes("/login"), {
        timeout: 45_000,
      }),
      this.page
        .getByText(/invalid credentials|attempts remaining|suspended|account/i)
        .first()
        .waitFor({ state: "visible", timeout: 45_000 }),
    ]).catch(() => undefined);
  }

  async login(username?: string, password?: string): Promise<void> {
    const creds = getCredentials();
    const user = username ?? creds.username;
    const pass = password ?? creds.password;

    logger.info(`Logging in as ${user}`);
    await this.loginWithCredentials(user, pass);
  }

  /** Sign in with explicit credentials (caller navigates to login first if needed). */
  async loginWithCredentials(username: string, password: string): Promise<void> {
    this.logStep(
      `Sign in as ${this.stepValueDisplay("username", username)}`,
    );
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  /**
   * Fills credentials and asserts the user cannot reach the dashboard
   * (Sign In disabled and/or remains on login with validation).
   */
  async assertLoginBlocked(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);

    const signInEnabled = await this.signInButton.isEnabled();
    if (signInEnabled) {
      await this.signInButton.click();
      await this.waitForSignInAttemptToFinish().catch(() => undefined);
    } else {
      await expect(this.signInButton).toBeDisabled();
    }

    expect(await this.isOnLoginPage()).toBeTruthy();
  }

  async expectClientSideValidation(): Promise<string> {
    const text =
      (await this.getInlineValidationText()) ||
      (await this.page
        .getByText(/required|enter.*username|enter.*password|username|password/i)
        .first()
        .innerText()
        .catch(() => ""));
    return text.trim();
  }

  async loginWithEnterKey(username?: string, password?: string): Promise<void> {
    const creds = getCredentials();
    await this.enterUsername(username ?? creds.username);
    await this.enterPassword(password ?? creds.password);
    await this.passwordInput.press("Enter");
    await this.waitForLoader();
  }

  async verifyDashboardLoaded(): Promise<void> {
    const dashboard = new HFIDashboardPage(this.page);
    await dashboard.verifyDashboardLoaded();
  }

  async clickForgotPassword(): Promise<void> {
    await this.common.click(this.forgotPasswordLink);
  }

  async verifyForgotPasswordModal(): Promise<void> {
    await expect(this.forgotPasswordModalTitle).toBeVisible();
    await expect(this.forgotPasswordEmailInput).toBeVisible();
    await expect(this.sendTemporaryPasswordButton).toBeVisible();
  }

  async getPasswordInputType(): Promise<string | null> {
    return this.passwordInput.getAttribute("type");
  }

  async getInlineValidationText(): Promise<string> {
    const count = await this.validationMessages.count();
    if (count === 0) {
      return "";
    }
    return (await this.validationMessages.first().innerText()).trim();
  }

  async getAuthErrorMessage(): Promise<string> {
    const alert = this.page.getByRole("alert").first();
    if (await alert.isVisible()) {
      return (await alert.innerText()).trim();
    }
    const inline = this.page
      .getByText(/invalid credentials|attempts remaining|suspended|account/i)
      .first();
    if (await inline.isVisible().catch(() => false)) {
      return (await inline.innerText()).trim();
    }
    return await this.getInlineValidationText();
  }

  async attemptLogin(username: string, password: string): Promise<string> {
    await this.open();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSignIn();
    return this.getAuthErrorMessage();
  }

  async expectFailedLogin(username: string, password: string): Promise<string> {
    const message = await this.attemptLogin(username, password);
    expect(await this.isOnLoginPage()).toBeTruthy();
    expect(message.length).toBeGreaterThan(0);
    return message;
  }

  async isOnLoginPage(): Promise<boolean> {
    return this.getCurrentUrl().includes("/login");
  }

  async logout(): Promise<void> {
    const dashboard = new HFIDashboardPage(this.page);
    await dashboard.logout();
    await expect(this.usernameInput).toBeVisible({
      timeout: 30_000,
    });
  }

  async expectForgotPasswordNavigation(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(urls.forgotPasswordPath.replace("/", "\\/"), "i"),
    );
  }
}
