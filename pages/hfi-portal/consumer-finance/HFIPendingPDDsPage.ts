import { expect, type Locator, type Page } from "@playwright/test";
import { HFIConsumerFinanceBasePage } from "./HFIConsumerFinanceBasePage";

const DEFAULT_PATH =
  process.env.CONSUMER_FINANCE_PDD_PATH?.trim() ||
  "/consumer-finance/pending-pdds";

/** US-DLR-015 — Pending PDDs (Queue & Upload). */
export class HFIPendingPDDsPage extends HFIConsumerFinanceBasePage {
  readonly pageHeading: Locator;
  readonly kpiSection: Locator;
  readonly pddQueue: Locator;
  readonly uploadPanel: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /pending pdd|pdd/i })
      .first();
    this.kpiSection = page.locator("main").filter({
      hasText: /pending pdd|overdue|cases due|pending rc/i,
    });
    this.pddQueue = page
      .locator("table, [role='table'], [role='grid']")
      .filter({ hasText: /application|customer|rc|insurance|upload/i })
      .first();
    this.uploadPanel = page
      .getByRole("dialog")
      .filter({ hasText: /upload|document|reference/i })
      .first();
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Pending PDDs";
  }

  async openFromLogin(): Promise<void> {
    await super.openFromLogin(DEFAULT_PATH);
    await this.expectModuleLoaded();
  }

  async expectModuleLoaded(): Promise<void> {
    await this.expectModuleShellLoaded();
    const text = await this.getPageText();
    expect(text).toMatch(/pdd|rc|insurance/i);
  }

  async expectPddKpis(): Promise<void> {
    await expect(this.kpiSection.first()).toBeVisible();
  }

  async expectPddQueue(): Promise<void> {
    await expect(this.pddQueue).toBeVisible();
  }
}
