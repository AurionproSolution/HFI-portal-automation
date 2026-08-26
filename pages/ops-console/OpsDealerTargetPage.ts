import { expect, type Locator, type Page } from "@playwright/test";
import { getOpsCredentials, getOpsDealerTargetPath, getOpsLoginUrl } from "@config/ops-env";
import { BasePage } from "@pages/common/BasePage";

/** US-OPS-003 — Dealer Target Upload & Maintenance. */
export class OpsDealerTargetPage extends BasePage {
  readonly pageHeading: Locator;
  readonly kpiSection: Locator;
  readonly uploadPanel: Locator;
  readonly sampleFormatButton: Locator;
  readonly uploadFileButton: Locator;
  readonly submitTargetButton: Locator;
  readonly connectivityError: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /dealer target/i })
      .first();
    this.kpiSection = page.locator("main").filter({
      hasText: /active dealers|dealers in file|total file amount|active period/i,
    });
    this.uploadPanel = page.locator("main").filter({
      hasText: /upload|sample format|target file/i,
    });
    this.sampleFormatButton = page.getByRole("button", {
      name: /sample format/i,
    });
    this.uploadFileButton = page.getByRole("button", { name: /upload file/i });
    this.submitTargetButton = page.getByRole("button", {
      name: /submit target/i,
    });
    this.connectivityError = page.getByText(
      /we're having trouble loading your data|can't connect to one or more of the systems/i,
    );
  }

  protected stepLogPrefix(): string {
    return "Ops Console — Dealer Target";
  }

  async signIn(): Promise<void> {
    const creds = getOpsCredentials();
    if (!creds) {
      throw new Error(
        "SKIP: Set OPS_USERNAME and OPS_PASSWORD for Ops Console tests.",
      );
    }
    await this.page.goto(getOpsLoginUrl(), { waitUntil: "domcontentloaded" });
    await this.page.getByLabel(/username|email/i).fill(creds.username);
    await this.page.getByLabel(/^password$/i).fill(creds.password);
    await this.page.getByRole("button", { name: /sign in|log in/i }).click();
    await this.waitForLoader();
  }

  async openFromLogin(): Promise<void> {
    await this.signIn();
    await this.page.goto(getOpsDealerTargetPath(), {
      waitUntil: "domcontentloaded",
    });
    await this.waitForLoader();
    await this.expectModuleLoaded();
  }

  async expectModuleLoaded(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login(?:\?|$)/i, {
      timeout: 60_000,
    });
    const text = await this.page.locator("main").innerText().catch(() => "");
    expect(text).toMatch(/dealer target|upload|sample format/i);
  }

  async expectKpiCards(): Promise<void> {
    await expect(this.kpiSection.first()).toBeVisible();
  }

  async expectUploadPanel(): Promise<void> {
    await expect(this.uploadPanel.first()).toBeVisible();
  }
}
