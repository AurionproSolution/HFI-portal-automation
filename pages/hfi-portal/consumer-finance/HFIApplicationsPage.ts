import { expect, type Locator, type Page } from "@playwright/test";
import { HFIConsumerFinanceBasePage } from "./HFIConsumerFinanceBasePage";

const DEFAULT_PATH =
  process.env.CONSUMER_FINANCE_APPLICATIONS_PATH?.trim() ||
  "/consumer-finance/applications";

/** US-DLR-013 — Applications (Lead Application Analytics & Detail). */
export class HFIApplicationsPage extends HFIConsumerFinanceBasePage {
  readonly pageHeading: Locator;
  readonly funnelKpiSection: Locator;
  readonly applicationsLedger: Locator;
  readonly detailOverlay: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /applications|lead application/i })
      .first();
    this.funnelKpiSection = page.locator("main").filter({
      hasText: /logged in|in process|approved|disbursed|rejected|cancelled|abnd/i,
    });
    this.applicationsLedger = page
      .locator("table, [role='table'], [role='grid']")
      .filter({ hasText: /application|customer|stage|loan amount/i })
      .first();
    this.detailOverlay = page
      .getByRole("dialog")
      .or(page.locator("[role='dialog'], .overlay, .drawer"))
      .filter({ hasText: /application detail|snapshot|progress/i })
      .first();
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Applications";
  }

  async openFromLogin(): Promise<void> {
    await super.openFromLogin(DEFAULT_PATH);
    await this.expectModuleLoaded();
  }

  async expectModuleLoaded(): Promise<void> {
    await this.expectModuleShellLoaded();
    const text = await this.getPageText();
    expect(text).toMatch(/application|funnel|ledger/i);
  }

  async expectFunnelKpis(): Promise<void> {
    await expect(this.funnelKpiSection.first()).toBeVisible();
  }

  async expectApplicationsLedger(): Promise<void> {
    await expect(this.applicationsLedger).toBeVisible();
  }

  async openFirstApplicationDetail(): Promise<void> {
    const row = this.applicationsLedger.locator("tbody tr, [role='row']").nth(1);
    if (!(await row.isVisible().catch(() => false))) {
      throw new Error("SKIP: No application rows available in ledger.");
    }
    await this.common.click(row);
    await expect(this.detailOverlay).toBeVisible({ timeout: 30_000 });
  }
}
