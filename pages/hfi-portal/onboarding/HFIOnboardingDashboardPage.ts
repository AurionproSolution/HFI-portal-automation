import { expect, type Locator, type Page } from "@playwright/test";
import { getLoginUrl, getOnboardingCredentials } from "@config/env";
import { BasePage } from "@pages/common/BasePage";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";

export class HFIOnboardingDashboardPage extends BasePage {
  readonly welcomeHeader: Locator;
  readonly applicationIdTag: Locator;
  readonly stageTag: Locator;
  readonly rmTag: Locator;
  readonly applicationProgress: Locator;
  readonly myTasksSection: Locator;
  readonly taskRows: Locator;
  readonly navLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeader = page.getByText(/welcome,/i).first();
    this.applicationIdTag = page.getByText(/application id/i).locator("..");
    this.stageTag = page.getByText(/^stage$/i).locator("..");
    this.rmTag = page.getByText(/^rm$/i).locator("..");
    this.applicationProgress = page.getByText(/application progress/i).first();
    this.myTasksSection = page.getByRole("heading", { name: /my tasks/i });
    this.taskRows = page.locator("section, div").filter({
      has: page.getByText(/due \d/i),
    });
    this.navLinks = page.locator("nav, aside").getByRole("link");
  }

  /** Opens login and signs in with ONBOARDING_* credentials from .env. */
  async signInWithOnboardingCredentials(): Promise<void> {
    const creds = getOnboardingCredentials();
    await this.page.goto(getLoginUrl());
    await new HFILoginPage(this.page).loginWithCredentials(
      creds.email,
      creds.password,
    );
  }

  /** Signs in with ONBOARDING_* credentials when the login page is already open. */
  async signInFromLoginPage(): Promise<void> {
    const creds = getOnboardingCredentials();
    await new HFILoginPage(this.page).loginWithCredentials(
      creds.email,
      creds.password,
    );
  }

  async navigateToOnboardingDashboard(): Promise<void> {
    if (!this.page.url().includes("onboarding")) {
      await this.page.goto("/onboarding", { waitUntil: "domcontentloaded" });
      await this.page.waitForTimeout(2_500);
    }
    await this.waitForLoader();
  }

  async openViaLogin(): Promise<void> {
    await this.signInWithOnboardingCredentials();
    await this.page.waitForURL(/onboarding|consumer|dashboard/i, {
      timeout: 90_000,
    });
    await this.navigateToOnboardingDashboard();
    await expect(this.myTasksSection).toBeVisible({ timeout: 60_000 });
  }

  async logout(): Promise<void> {
    await new HFIDashboardPage(this.page).logout();
    await expect(this.page).toHaveURL(/\/login(?:\?|$)/i, { timeout: 60_000 });
  }

  async getPageText(): Promise<string> {
    return this.page.locator("body").innerText();
  }

  taskByTitle(title: RegExp | string): Locator {
    const name = typeof title === "string" ? title : title.source;
    return this.page.locator("div").filter({
      has: this.page.getByText(typeof title === "string" ? title : title),
    }).first();
  }

  uploadButtonInTask(taskTitle: string): Locator {
    return this.page
      .locator("div")
      .filter({ has: this.page.getByText(taskTitle, { exact: false }) })
      .getByRole("button", { name: /^upload$/i })
      .first();
  }

  async getNavLinkLabels(): Promise<string[]> {
    return this.navLinks.allTextContents();
  }

  async uploadFileToTask(taskTitle: string, filePath: string): Promise<void> {
    const upload = this.uploadButtonInTask(taskTitle);
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      upload.click(),
    ]);
    await fileChooser.setFiles(filePath);
    await this.waitForLoader();
    await this.page.waitForTimeout(3_000);
  }

  markCompleteInTask(taskTitle: string): Locator {
    return this.page
      .locator("div")
      .filter({ has: this.page.getByText(taskTitle, { exact: false }) })
      .getByRole("button", { name: /mark complete/i })
      .first();
  }

  inPrincipalSanctionTab(): Locator {
    return this.page
      .getByRole("link", { name: /in principal sanction letter/i })
      .or(this.page.getByRole("button", { name: /in principal sanction letter/i }))
      .or(this.page.getByText(/in principal sanction letter/i))
      .first();
  }

  async openInPrincipalSanctionLetter(): Promise<void> {
    const tab = this.inPrincipalSanctionTab();
    await tab.click();
    await this.waitForLoader();
    await expect(
      this.page.getByText(/in principal sanction letter|credit approved|sanctioned limit/i).first(),
    ).toBeVisible({ timeout: 30_000 });
  }
}
