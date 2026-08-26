import { expect, type Locator, type Page } from "@playwright/test";
import { getCredentials, getLoginUrl } from "@config/env";
import { BasePage } from "@pages/common/BasePage";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { logger } from "@utils/logger";

const DEFAULT_DASHBOARD_PATH =
  process.env.DEALER_FINANCE_DASHBOARD_PATH?.trim() || "/dashboard";

/** US-DLR-007 — Dealer Finance Dashboard (Limit, Exposure & Action Items). */
export class HFIDealerFinanceDashboardPage extends BasePage {
  private lastDashboardApiResponse: {
    url: string;
    status: number;
    body: unknown;
  } | null = null;

  readonly dealerFinanceTab: Locator;
  readonly dashboardNavItem: Locator;
  readonly branchScopeChip: Locator;
  readonly dateRange7D: Locator;
  readonly dateRange30D: Locator;
  readonly dateRangeMTD: Locator;
  readonly dateRange90D: Locator;
  readonly dateRangeYTD: Locator;
  readonly dateRangeCustom: Locator;
  readonly normalLimitCard: Locator;
  readonly adhocLimitCard: Locator;
  readonly duesSection: Locator;
  readonly payDuesButton: Locator;
  readonly needsYouTodaySection: Locator;
  readonly poDetailsSection: Locator;
  readonly poDetailsOpenLink: Locator;
  readonly poBucketSection: Locator;
  readonly poBucketOpenLink: Locator;
  readonly mainContent: Locator;
  readonly noDataMessage: Locator;
  readonly connectivityError: Locator;

  constructor(page: Page) {
    super(page);
    this.dealerFinanceTab = page
      .getByRole("link", { name: /dealer finance/i })
      .or(page.getByRole("button", { name: /dealer finance/i }))
      .or(page.getByText(/^dealer finance$/i))
      .first();
    this.dashboardNavItem = page
      .locator("nav, aside")
      .getByRole("link", { name: /^dashboard$/i })
      .first();
    this.branchScopeChip = page
      .getByRole("button", { name: /all branches/i })
      .first();
    this.dateRange7D = page.getByRole("button", { name: /^7D$/i });
    this.dateRange30D = page.getByRole("button", { name: /^30D$/i });
    this.dateRangeMTD = page.getByRole("button", { name: /^MTD$/i });
    this.dateRange90D = page.getByRole("button", { name: /^90D$/i });
    this.dateRangeYTD = page.getByRole("button", { name: /^YTD$/i });
    this.dateRangeCustom = page.getByRole("button", { name: /^custom$/i });
    this.mainContent = page.locator("main");
    this.normalLimitCard = page
      .locator("main")
      .locator("div, section, article")
      .filter({ hasText: /^normal limit$/i })
      .first();
    this.adhocLimitCard = page
      .locator("main")
      .locator("div, section, article")
      .filter({ hasText: /^adhoc limit$/i })
      .first();
    this.duesSection = page
      .locator("main")
      .filter({ hasText: /^normal$/i })
      .filter({ hasText: /overdue/i })
      .first();
    this.payDuesButton = page
      .getByRole("link", { name: /pay dues/i })
      .or(page.getByRole("button", { name: /pay dues/i }));
    this.needsYouTodaySection = page.getByText(/needs you today/i).first();
    this.poDetailsSection = page
      .getByRole("heading", { name: /po details/i })
      .or(page.getByText(/po details/i))
      .first();
    this.poDetailsOpenLink = page
      .locator("main")
      .filter({ hasText: /po details/i })
      .getByRole("link", { name: /^open$/i })
      .or(
        page
          .locator("main")
          .filter({ hasText: /po details/i })
          .getByRole("button", { name: /^open$/i }),
      )
      .first();
    this.poBucketSection = page
      .getByRole("heading", { name: /po bucket statistics/i })
      .or(page.getByText(/po bucket statistics/i))
      .first();
    this.poBucketOpenLink = page
      .locator("main")
      .filter({ hasText: /po bucket statistics/i })
      .getByRole("link", { name: /^open$/i })
      .or(
        page
          .locator("main")
          .filter({ hasText: /po bucket statistics/i })
          .getByRole("button", { name: /^open$/i }),
      )
      .first();
    this.noDataMessage = page.getByText(
      /no data to show|no po details available|no data available/i,
    );
    this.connectivityError = page.getByText(
      /trouble loading|unable to reach|connectivity|service unavailable/i,
    );
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Dealer Finance Dashboard";
  }

  async signInWithDealerCredentials(): Promise<void> {
    this.logStep("Sign in with active dealer credentials");
    const creds = getCredentials();
    const loginId = creds.dealerCode || creds.username;
    await this.page.goto(getLoginUrl());
    await new HFILoginPage(this.page).loginWithCredentials(
      loginId,
      creds.password,
    );
    await this.page.waitForURL(
      /consumer|dashboard|dealer-finance|operations|financials/i,
      { timeout: 90_000 },
    );
  }

  async openFromLogin(): Promise<void> {
    this.logStep("Open Dealer Finance Dashboard from login");
    await this.signInWithDealerCredentials();
    await this.navigateToDashboard();
  }

  async navigateToDashboard(): Promise<void> {
    this.logStep("Navigate to Dealer Finance Dashboard");
    const apiPromise = this.page
      .waitForResponse(
        (r) =>
          r.request().method() === "GET" &&
          /dashboard|limit|exposure|dealer|customer/i.test(r.url()),
        { timeout: 60_000 },
      )
      .catch(() => null);

    const url = this.page.url();
    if (!/dashboard/i.test(url)) {
      if (await this.dealerFinanceTab.isVisible().catch(() => false)) {
        await this.common.click(this.dealerFinanceTab);
        await this.page.waitForURL(/dashboard/i, { timeout: 30_000 });
      } else if (await this.dashboardNavItem.isVisible().catch(() => false)) {
        await this.common.click(this.dashboardNavItem);
        await this.page.waitForURL(/dashboard/i, { timeout: 30_000 });
      } else {
        await this.navigateTo(DEFAULT_DASHBOARD_PATH);
      }
    }
    await this.waitForLoader();
    const response = await apiPromise;
    if (response) await this.storeDashboardApiResponse(response);
    logger.info(`Dealer Finance Dashboard URL: ${this.page.url()}`);
  }

  private async storeDashboardApiResponse(
    response: import("@playwright/test").Response,
  ): Promise<void> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    this.lastDashboardApiResponse = {
      url: response.url(),
      status: response.status(),
      body,
    };
    logger.info(
      `Dashboard API captured: ${response.url()} status=${response.status()}`,
    );
  }

  async expectDashboardLoaded(): Promise<void> {
    this.logStep("Verify Dealer Finance Dashboard is loaded");
    await expect(this.page).toHaveURL(/dashboard/i, { timeout: 30_000 });
    await this.waitForDashboardDataLoaded();
  }

  async waitForDashboardDataLoaded(): Promise<void> {
    this.logStep("Wait for dashboard data to finish loading");
    const loading = this.page.getByText(/loading dashboard|loading data/i);
    if (await loading.isVisible().catch(() => false)) {
      await expect(loading).toBeHidden({ timeout: 60_000 });
    }
    await expect(this.page.getByText(/normal limit/i).first()).toBeVisible({
      timeout: 60_000,
    });
    await this.waitForLoader();
  }

  async getPageText(): Promise<string> {
    this.logStep("Read page body text");
    return this.page.locator("body").innerText();
  }

  async getMainText(): Promise<string> {
    return this.mainContent.innerText();
  }

  async expectDefaultFilters(): Promise<void> {
    this.logStep("Verify default All Branches Consolidated and 30D filters");
    const scope = await this.getSelectedBranchScope();
    expect(scope).toMatch(/all branches/i);
    expect(scope).toMatch(/consolidated/i);
    await expect(this.dateRange30D).toBeVisible();
    const text = await this.getPageText();
    expect(text).toMatch(/\b30D\b/);
  }

  async getSelectedBranchScope(): Promise<string> {
    const chip = this.branchScopeChip;
    if (await chip.isVisible().catch(() => false)) {
      return (await chip.innerText()).trim();
    }
    return "";
  }

  async expectDateRangeChipsVisible(): Promise<void> {
    this.logStep("Verify all six date-range chips are visible");
    await expect(this.dateRange7D).toBeVisible();
    await expect(this.dateRange30D).toBeVisible();
    await expect(this.dateRangeMTD).toBeVisible();
    await expect(this.dateRange90D).toBeVisible();
    await expect(this.dateRangeYTD).toBeVisible();
    await expect(this.dateRangeCustom).toBeVisible();
  }

  async selectDateRange(label: "7D" | "30D" | "MTD" | "90D" | "YTD" | "Custom"): Promise<void> {
    this.logStep(`Select date range: ${label}`);
    const map = {
      "7D": this.dateRange7D,
      "30D": this.dateRange30D,
      MTD: this.dateRangeMTD,
      "90D": this.dateRange90D,
      YTD: this.dateRangeYTD,
      Custom: this.dateRangeCustom,
    };
    await this.common.click(map[label]);
    await this.waitForDashboardDataLoaded();
  }

  async openBranchFilter(): Promise<void> {
    this.logStep("Open branch scope filter");
    await this.common.click(this.branchScopeChip);
  }

  async getBranchFilterOptionLabels(): Promise<string[]> {
    await this.openBranchFilter();
    await this.page.waitForTimeout(500);
    const options = this.page
      .getByRole("option")
      .or(this.page.getByRole("menuitem"));
    const count = await options.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      labels.push((await options.nth(i).innerText()).trim());
    }
    return labels;
  }

  async selectBranchScope(branchLabel: string): Promise<void> {
    this.logStep(`Select branch scope: ${branchLabel}`);
    await this.openBranchFilter();
    const option = this.page
      .getByRole("option", { name: new RegExp(branchLabel, "i") })
      .or(this.page.getByRole("menuitem", { name: new RegExp(branchLabel, "i") }))
      .or(
        this.page
          .locator("[role='listbox'], [role='menu']")
          .getByText(new RegExp(branchLabel, "i")),
      )
      .first();
    await this.common.click(option);
    await this.waitForDashboardDataLoaded();
  }

  async expectNormalLimitFields(): Promise<void> {
    this.logStep("Verify Normal Limit card fields");
    const text = await this.getMainText();
    expect(text).toMatch(/normal limit/i);
    expect(text).toMatch(/used limit/i);
    expect(text).toMatch(/available limit/i);
    expect(text).toMatch(/limit expiry/i);
    expect(text).toMatch(/days left/i);
    expect(this.hasIndianCurrencyFormat(text)).toBeTruthy();
  }

  async expectAdhocLimitFields(): Promise<void> {
    this.logStep("Verify Adhoc Limit card fields");
    const text = await this.getMainText();
    expect(text).toMatch(/adhoc limit/i);
    expect(text).toMatch(/used limit/i);
    expect(text).toMatch(/available limit/i);
    expect(text).toMatch(/adhoc validity/i);
    expect(text).toMatch(/days left/i);
  }

  async expectDuesSection(): Promise<void> {
    this.logStep("Verify Dues section (Normal, Adhoc, Overdue)");
    const text = await this.getMainText();
    expect(text).toMatch(/\bnormal\b/i);
    expect(text).toMatch(/\badhoc\b/i);
    expect(text).toMatch(/overdue/i);
    await expect(this.payDuesButton).toBeVisible();
  }

  async expectNeedsYouTodayCards(): Promise<void> {
    this.logStep("Verify Needs You Today section with four cards");
    await expect(this.needsYouTodaySection).toBeVisible();
    const text = await this.getMainText();
    expect(text).toMatch(/days to nearest tranche/i);
    expect(text).toMatch(/pos closest to due date/i);
    expect(text).toMatch(/interest repayment dues/i);
    expect(text).toMatch(/limit renewals pending/i);
  }

  needsYouTodayCard(title: RegExp): Locator {
    return this.mainContent.getByRole("link", { name: title }).first();
  }

  async expectAllDashboardSections(): Promise<void> {
    await this.expectNormalLimitFields();
    await this.expectAdhocLimitFields();
    await this.expectDuesSection();
    await this.expectNeedsYouTodayCards();
    await expect(this.poDetailsSection).toBeVisible();
    await expect(this.poBucketSection).toBeVisible();
  }

  async expectNoWriteActions(): Promise<void> {
    this.logStep("Verify dashboard is read-only except Pay dues and Open links");
    const forbidden = this.mainContent.getByRole("button", {
      name: /^add$|^edit$|^delete$|^save$|^submit$/i,
    });
    await expect(forbidden).toHaveCount(0);
    const allowed = this.mainContent.getByRole("link", {
      name: /pay dues|open|days to nearest|pos closest|interest repayment|limit renewals/i,
    });
    await expect(allowed.first()).toBeVisible();
  }

  async expectNoOemVisibilityControl(): Promise<void> {
    const controls = this.page.getByRole("slider").or(
      this.page.getByLabel(/limit shared|oem visibility|shared portion/i),
    );
    await expect(controls).toHaveCount(0);
  }

  hasIndianCurrencyFormat(text: string): boolean {
    return /₹|rs\.?\s*[\d,]+/i.test(text);
  }

  hasPercentageFormat(text: string): boolean {
    return /\d+(\.\d+)?\s*%/.test(text);
  }

  parseAmountCr(text: string, label: RegExp): number | undefined {
    const section = text.match(
      new RegExp(`${label.source}[^₹]*₹\\s*([\\d.]+)\\s*Cr`, "i"),
    );
    if (section) return Number.parseFloat(section[1]);
    return undefined;
  }

  async captureDashboardApiResponse(): Promise<{
    url: string;
    status: number;
    body: unknown;
  } | null> {
    if (this.lastDashboardApiResponse) return this.lastDashboardApiResponse;
    const response = await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.request().method() === "GET" &&
          /dashboard|limit|exposure|dealer|customer/i.test(r.url()),
        { timeout: 60_000 },
      ),
      this.page.reload(),
    ])
      .then(([r]) => r)
      .catch(() => null);
    if (!response) return null;
    await this.storeDashboardApiResponse(response);
    return this.lastDashboardApiResponse;
  }

  async getPoDetailsRowCount(): Promise<number> {
    const rows = this.page
      .locator("main")
      .getByRole("row")
      .filter({ has: this.page.getByText(/^PO-/i) });
    return rows.count();
  }

  poBucketContainer(): Locator {
    return this.mainContent.filter({ hasText: /po bucket statistics/i });
  }

  async expectPoBucketBuckets(): Promise<void> {
    const text = await this.poBucketContainer().innerText();
    expect(text).toMatch(/regular/i);
    expect(text).toMatch(/1-30\s*d/i);
    expect(text).toMatch(/31-60\s*d/i);
    expect(text).toMatch(/61-90\s*d/i);
    expect(text).toMatch(/90\+\s*d/i);
    expect(text).toMatch(/overdue/i);
  }

  async clickPayDues(): Promise<void> {
    this.logStep("Click Pay dues");
    await this.common.click(this.payDuesButton);
    await this.waitForLoader();
  }

  async clickPoDetailsOpen(): Promise<void> {
    this.logStep("Click PO Details Open link");
    await this.common.click(this.poDetailsOpenLink);
    await this.waitForLoader();
  }

  async clickPoBucketOpen(): Promise<void> {
    this.logStep("Click PO Bucket Statistics Open link");
    await this.common.click(this.poBucketOpenLink);
    await this.waitForLoader();
  }

  async clickAttentionCard(pattern: RegExp): Promise<void> {
    this.logStep(`Click attention card: ${pattern}`);
    await this.common.click(this.needsYouTodayCard(pattern));
    await this.waitForLoader();
  }
}
