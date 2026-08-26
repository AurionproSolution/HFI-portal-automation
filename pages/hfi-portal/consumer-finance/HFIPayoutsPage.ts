import { expect, type Locator, type Page } from "@playwright/test";
import { HFIConsumerFinanceBasePage } from "./HFIConsumerFinanceBasePage";

const DEFAULT_PATH =
  process.env.CONSUMER_FINANCE_PAYOUTS_PATH?.trim() || "/consumer-finance/payouts";

/** US-DLR-016 — Payouts (Commissions & Payout File Upload). */
export class HFIPayoutsPage extends HFIConsumerFinanceBasePage {
  readonly pageHeading: Locator;
  readonly kpiSection: Locator;
  readonly uploadPanel: Locator;
  readonly payoutLedger: Locator;
  readonly sampleFormatButton: Locator;
  readonly uploadFileButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole("heading", { name: /payouts/i }).first();
    this.kpiSection = page.locator("main").filter({
      hasText: /invoices raised|disbursed|pending amount|earnings/i,
    });
    this.uploadPanel = page.locator("main").filter({
      hasText: /payout file|upload|sample format/i,
    });
    this.payoutLedger = page
      .locator("table, [role='table'], [role='grid']")
      .filter({ hasText: /invoice|payout|status|deduction/i })
      .first();
    this.sampleFormatButton = page.getByRole("button", {
      name: /sample format/i,
    });
    this.uploadFileButton = page.getByRole("button", { name: /upload file/i });
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Payouts";
  }

  async openFromLogin(): Promise<void> {
    await super.openFromLogin(DEFAULT_PATH);
    await this.expectModuleLoaded();
  }

  async expectModuleLoaded(): Promise<void> {
    await this.expectModuleShellLoaded();
    const text = await this.getPageText();
    expect(text).toMatch(/payout|invoice|earnings/i);
  }

  async expectPayoutKpis(): Promise<void> {
    await expect(this.kpiSection.first()).toBeVisible();
  }

  async expectUploadPanel(): Promise<void> {
    await expect(this.uploadPanel.first()).toBeVisible();
  }
}
