import { expect, type Locator, type Page } from "@playwright/test";
import { getAdminLoginUrl } from "@config/admin-env";
import { BasePage } from "@pages/common/BasePage";

/** Admin Console — dedicated /admin sign-in. */
export class AdminLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page
      .getByLabel(/username/i)
      .or(page.getByRole("textbox", { name: /^admin$/i }))
      .first();
    this.passwordInput = page.locator("input[type='password']").first();
    this.signInButton = page.getByRole("button", {
      name: /sign in to admin console/i,
    });
  }

  protected stepLogPrefix(): string {
    return "Admin Console — Login";
  }

  async open(): Promise<void> {
    this.logStep("Open Admin Console login page");
    await this.navigateTo(getAdminLoginUrl());
    await expect(this.usernameInput).toBeVisible({ timeout: 60_000 });
    await expect(this.passwordInput).toBeVisible();
  }

  async loginWithCredentials(username: string, password: string): Promise<void> {
    this.logStep(
      `Sign in as Admin user: ${this.stepValueDisplay("username", username)}`,
    );
    await this.common.clearAndFill(this.usernameInput, username);
    await this.common.clearAndFill(this.passwordInput, password);
    await expect(this.signInButton).toBeEnabled({ timeout: 15_000 });
    await this.common.click(this.signInButton);
  }

  async expectLoginSucceeded(): Promise<void> {
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/login"),
      { timeout: 90_000 },
    );
    const body = await this.page.locator("body").innerText();
    expect(body).not.toMatch(/invalid credentials|incorrect password/i);
    expect(body).not.toMatch(/suspended/i);
    expect(body).toMatch(/admin console|oem console users|signed in as admin/i);
  }
}
