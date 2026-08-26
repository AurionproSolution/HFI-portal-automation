import { expect, type Locator, type Page } from "@playwright/test";
import { getOemLoginUrl } from "@config/oem-env";
import { BasePage } from "@pages/common/BasePage";

/** OEM Portal — Maker / Checker sign-in (not Dealer Portal login). */
export class OEMLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page
      .getByRole("textbox", { name: /maker-id|checker-id|user-?id/i })
      .or(page.locator("input[type='text']").first());
    this.passwordInput = page.locator("input[type='password']").first();
    this.signInButton = page.getByRole("button", { name: /sign in/i });
  }

  protected stepLogPrefix(): string {
    return "OEM Portal — Login";
  }

  async open(): Promise<void> {
    this.logStep("Open OEM login page");
    await this.navigateTo(getOemLoginUrl());
    await expect(this.signInButton).toBeVisible({ timeout: 60_000 });
  }

  async logoutIfSignedIn(): Promise<void> {
    const logout = this.page.getByRole("button", { name: /^logout$/i });
    if (await logout.isVisible().catch(() => false)) {
      this.logStep("Sign out current OEM session");
      await this.common.click(logout);
      await this.page.waitForURL(
        (url) => url.pathname.includes("/login"),
        { timeout: 60_000 },
      );
    }
  }

  async loginWithCredentials(username: string, password: string): Promise<void> {
    this.logStep(
      `Sign in as OEM user: ${this.stepValueDisplay("username", username)}`,
    );
    await this.common.clearAndFill(this.usernameInput, username);
    await this.common.clearAndFill(this.passwordInput, password);
    await this.common.click(this.signInButton);
  }
}
