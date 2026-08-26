import { expect, type Locator, type Page } from "@playwright/test";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { BasePage } from "@pages/common/BasePage";

export class HFIForgotPasswordPage extends BasePage {
  readonly modalTitle: Locator;
  readonly modalRoot: Locator;
  readonly emailInput: Locator;
  readonly sendButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.modalTitle = page.getByRole("heading", {
      name: /forgot your password/i,
    });
    this.modalRoot = page
      .locator("div")
      .filter({ has: this.modalTitle })
      .last();
    this.emailInput = this.modalRoot.locator('input[type="email"]');
    this.sendButton = page.getByRole("button", {
      name: /send temporary password/i,
    });
    this.cancelButton = this.modalRoot.getByRole("button", { name: /cancel/i }).or(
      this.modalRoot.getByText(/^cancel$/i),
    );
    this.confirmationMessage = page.getByText(
      /temporary password|if the email is registered|check your email/i,
    );
  }

  async openFromLogin(): Promise<void> {
    const login = new HFILoginPage(this.page);
    await login.open();
    await login.clickForgotPassword();
    await this.verifyEntryScreen();
  }

  async verifyEntryScreen(): Promise<void> {
    await expect(this.modalTitle).toBeVisible({ timeout: 15_000 });
    await expect(this.emailInput).toBeVisible();
    await expect(this.sendButton).toBeVisible();
  }

  async submitEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.sendButton.click();
    await this.waitForLoader();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await expect(new HFILoginPage(this.page).usernameInput).toBeVisible();
  }
}
