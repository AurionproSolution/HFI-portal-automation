import { expect, type Locator, type Page } from "@playwright/test";
import { HFIConsumerFinanceBasePage } from "./HFIConsumerFinanceBasePage";

const DEFAULT_PATH =
  process.env.CONSUMER_FINANCE_DASHBOARD_PATH?.trim() || "/consumer-finance";

/** US-DLR-012 — Consumer Finance Dashboard. */
export class HFIConsumerFinanceDashboardPage extends HFIConsumerFinanceBasePage {
  readonly pageHeading: Locator;
  readonly disbursedMtdCard: Locator;
  readonly dealerPayoutMtdCard: Locator;
  readonly attentionRequiredPanel: Locator;
  readonly applicationPipelineWidget: Locator;
  readonly disbursalTrendWidget: Locator;
  readonly recentActivityFeed: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /consumer finance dashboard|dashboard/i })
      .first();
    this.disbursedMtdCard = page
      .locator("main")
      .filter({ hasText: /disbursed.*mtd|disbursed \(mtd\)/i })
      .first();
    this.dealerPayoutMtdCard = page
      .locator("main")
      .filter({ hasText: /dealer payout|payout.*mtd/i })
      .first();
    this.attentionRequiredPanel = page
      .locator("main")
      .filter({ hasText: /attention required/i })
      .first();
    this.applicationPipelineWidget = page
      .locator("main")
      .filter({ hasText: /application pipeline/i })
      .first();
    this.disbursalTrendWidget = page
      .locator("main")
      .filter({ hasText: /disbursal trend/i })
      .first();
    this.recentActivityFeed = page
      .locator("main")
      .filter({ hasText: /recent activity/i })
      .first();
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Consumer Finance Dashboard";
  }

  async openFromLogin(): Promise<void> {
    await super.openFromLogin(DEFAULT_PATH);
    await this.expectModuleLoaded();
  }

  async expectModuleLoaded(): Promise<void> {
    await this.expectModuleShellLoaded();
    const text = await this.getPageText();
    expect(text).toMatch(/dashboard|disbursed|consumer finance/i);
  }

  async expectDefaultLandingAndFilters(): Promise<void> {
    await expect(this.consumerFinanceTab).toBeVisible();
    await expect(this.dateRangeButton("30D")).toBeVisible();
    await expect(this.branchScopeChip).toBeVisible();
  }

  async expectPerformanceCards(): Promise<void> {
    const text = await this.getPageText();
    expect(text).toMatch(/disbursed|payout|target|achievement/i);
  }

  async expectAttentionRequiredPanel(): Promise<void> {
    await expect(this.attentionRequiredPanel).toBeVisible();
  }

  async expectApplicationPipelineWidget(): Promise<void> {
    await expect(this.applicationPipelineWidget).toBeVisible();
  }

  async expectDisbursalTrendWidget(): Promise<void> {
    await expect(this.disbursalTrendWidget).toBeVisible();
  }

  async expectRecentActivityFeed(): Promise<void> {
    await expect(this.recentActivityFeed).toBeVisible();
  }

  async expectTargetSuppressedForExtendedPeriod(): Promise<void> {
    await this.selectDateRangePreset("90D");
    const text = await this.getPageText();
    expect(text).not.toMatch(/target chip|achievement gauge/i);
  }
}
