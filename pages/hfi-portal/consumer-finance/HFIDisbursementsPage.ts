import { expect, type Locator, type Page } from "@playwright/test";
import { HFIConsumerFinanceBasePage } from "./HFIConsumerFinanceBasePage";

const DEFAULT_PATH =
  process.env.CONSUMER_FINANCE_DISBURSEMENTS_PATH?.trim() ||
  "/consumer-finance/disbursements";

/** US-DLR-014 — Disbursements (Funded Cases & Analytics). */
export class HFIDisbursementsPage extends HFIConsumerFinanceBasePage {
  readonly pageHeading: Locator;
  readonly kpiSection: Locator;
  readonly analyticsSection: Locator;
  readonly disbursalLedger: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /disbursements|disbursal/i })
      .first();
    this.kpiSection = page.locator("main").filter({
      hasText: /disbursed|cycle time|avg ticket|total value/i,
    });
    this.analyticsSection = page.locator("main").filter({
      hasText: /current|previous|delta|peak|week/i,
    });
    this.disbursalLedger = page
      .locator("table, [role='table'], [role='grid']")
      .filter({ hasText: /disbursal|customer|utr|amount/i })
      .first();
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Disbursements";
  }

  async openFromLogin(): Promise<void> {
    await super.openFromLogin(DEFAULT_PATH);
    await this.expectModuleLoaded();
  }

  async expectModuleLoaded(): Promise<void> {
    await this.expectModuleShellLoaded();
    const text = await this.getPageText();
    expect(text).toMatch(/disburs|ledger|analytics/i);
  }

  async expectSummaryKpis(): Promise<void> {
    await expect(this.kpiSection.first()).toBeVisible();
  }

  async expectDisbursalLedger(): Promise<void> {
    await expect(this.disbursalLedger).toBeVisible();
  }
}
