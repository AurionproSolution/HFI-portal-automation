import { expect, type Locator, type Page } from "@playwright/test";
import { getOpsCredentials, getOpsLoginUrl, getOpsOfflinePaymentPath } from "@config/ops-env";
import { BasePage } from "@pages/common/BasePage";

/** US-OPS-002 — Offline Payment Verification. */
export class OpsOfflinePaymentPage extends BasePage {
  readonly pageHeading: Locator;
  readonly kpiSection: Locator;
  readonly queueTabs: Locator;
  readonly queueGrid: Locator;
  readonly verifyButtons: Locator;
  readonly connectivityError: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /offline payment verification/i })
      .first();
    this.kpiSection = page.locator("main").filter({
      hasText: /awaiting verification|value pending|verified this month|dealers submitting/i,
    });
    this.queueTabs = page.getByRole("tablist").or(
      page.locator("main").filter({ hasText: /pending verification|verified|rejected|all/i }),
    );
    this.queueGrid = page
      .locator("table, [role='table'], [role='grid']")
      .filter({ hasText: /dealer|utr|po|vin|verify|amount/i })
      .first();
    this.verifyButtons = page.getByRole("button", { name: /^verify$/i });
    this.connectivityError = page.getByText(
      /we're having trouble loading your data|can't connect to one or more of the systems/i,
    );
  }

  protected stepLogPrefix(): string {
    return "Ops Console — Offline Payment Verification";
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
    await this.page.goto(getOpsOfflinePaymentPath(), {
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
    expect(text).toMatch(/offline payment|verification|pending verification/i);
  }

  async expectKpiCards(): Promise<void> {
    await expect(this.kpiSection.first()).toBeVisible();
  }

  async expectQueueGrid(): Promise<void> {
    await expect(this.queueGrid).toBeVisible();
  }
}
