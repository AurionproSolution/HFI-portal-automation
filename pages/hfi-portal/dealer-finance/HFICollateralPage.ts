import { expect, type Locator, type Page } from "@playwright/test";
import { getCredentials, getLoginUrl } from "@config/env";
import { BasePage } from "@pages/common/BasePage";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { logger } from "@utils/logger";

const DEFAULT_COLLATERAL_PATH =
  process.env.COLLATERAL_PATH?.trim() || "/collateral";

/** US-DLR-008 — Collateral (Read-only View). */
export class HFICollateralPage extends BasePage {
  private lastCollateralApiResponse: {
    url: string;
    status: number;
    body: unknown;
  } | null = null;

  readonly pageHeading: Locator;
  readonly breadcrumb: Locator;
  readonly dealerFinanceTab: Locator;
  readonly collateralNavItem: Locator;
  readonly branchScopeChip: Locator;
  readonly branchScopeSelect: Locator;
  readonly kpiSection: Locator;
  readonly kpiTotalCollateralValue: Locator;
  readonly kpiActiveCollateral: Locator;
  readonly kpiExpiringSoon: Locator;
  readonly kpiCoverageRatio: Locator;
  readonly collateralSecuritiesSection: Locator;
  readonly securityCards: Locator;
  readonly connectivityError: Locator;
  readonly noDataMessage: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole("heading", {
      level: 1,
      name: /^collateral$/i,
    });
    this.breadcrumb = page
      .locator("main")
      .getByText(/honda finance\s*\/\s*collateral/i)
      .first();
    this.dealerFinanceTab = page
      .getByRole("button", { name: /dealer finance/i })
      .or(page.getByRole("tab", { name: /dealer finance/i }))
      .or(page.getByText(/^dealer finance$/i))
      .first();
    this.collateralNavItem = page
      .locator("nav, aside")
      .getByRole("link", { name: /^collateral$/i })
      .or(page.getByRole("link", { name: /collateral/i }))
      .first();
    this.branchScopeChip = page
      .getByRole("button", { name: /all branches/i })
      .or(page.getByText(/all branches/i))
      .first();
    this.branchScopeSelect = page
      .getByLabel(/branch/i)
      .or(page.getByRole("combobox", { name: /branch|all branches/i }))
      .or(page.getByRole("button", { name: /all branches/i }))
      .first();
    this.kpiSection = page.locator("main");
    this.kpiTotalCollateralValue = page
      .locator("main")
      .getByText(/total collateral value/i)
      .first();
    this.kpiActiveCollateral = page
      .locator("main")
      .getByText(/active collateral/i)
      .first();
    this.kpiExpiringSoon = page
      .locator("main")
      .getByText(/expiring soon/i)
      .first();
    this.kpiCoverageRatio = page
      .locator("main")
      .getByText(/coverage ratio/i)
      .first();
    this.collateralSecuritiesSection = page
      .getByRole("heading", { name: /collateral securities/i })
      .or(page.getByText(/collateral securities/i))
      .first();
    this.securityCards = page
      .locator("main")
      .locator("div, article, section")
      .filter({
        has: page.getByText(
          /bank guarantee|fixed deposit|property mortgage|corporate guarantee/i,
        ),
      });
    this.connectivityError = page.getByText(
      /trouble loading|unable to reach|connectivity|service unavailable/i,
    );
    this.noDataMessage = page.getByText(
      /no collateral|no securities|no matching|no data available|nothing to show/i,
    );
    this.retryButton = page.getByRole("button", { name: /^retry$/i });
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Collateral";
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

  async ensureDealerFinanceDashboardLoaded(): Promise<void> {
    this.logStep("Verify Dealer Finance dashboard is loaded");
    const url = this.page.url();
    logger.info(`Current URL before Dealer Finance check: ${url}`);

    if (!/dashboard|operations|financials|dealer-finance/i.test(url)) {
      if (await this.dealerFinanceTab.isVisible().catch(() => false)) {
        this.logStep("Open Dealer Finance tab from post-login landing page");
        await this.common.click(this.dealerFinanceTab);
        await this.waitForLoader();
        await this.page.waitForURL(/dashboard|operations|financials|dealer-finance/i, {
          timeout: 30_000,
        });
      }
    }

    logger.info(`Dealer Finance dashboard URL: ${this.page.url()}`);
    const body = await this.getPageText();
    expect(
      /collateral|purchase orders|dealer finance|exposure settings|dashboard/i.test(
        body,
      ),
      `Dealer Finance dashboard not loaded at ${this.page.url()}`,
    ).toBeTruthy();
  }

  async openFromLogin(): Promise<void> {
    this.logStep("Open Collateral from login");
    await this.signInWithDealerCredentials();
    await this.navigateToModule();
  }

  async navigateToModule(): Promise<void> {
    this.logStep("Navigate to Collateral via left navigation");
    await this.ensureDealerFinanceDashboardLoaded();

    const urlBefore = this.page.url();
    logger.info(`URL before Collateral click: ${urlBefore}`);

    const apiPromise = this.page
      .waitForResponse(
        (r) =>
          r.request().method() === "GET" &&
          /collateral|securities|financials/i.test(r.url()),
        { timeout: 60_000 },
      )
      .catch(() => null);

    if (await this.collateralNavItem.isVisible().catch(() => false)) {
      await this.common.click(this.collateralNavItem);
      await this.page.waitForURL(/collateral|financials/i, {
        timeout: 30_000,
      });
      await this.waitForLoader();
    }

    const urlAfter = this.page.url();
    logger.info(`URL after Collateral navigation: ${urlAfter}`);

    if (!/collateral|financials\/collateral/i.test(urlAfter)) {
      this.logStep(`Fallback navigate to ${DEFAULT_COLLATERAL_PATH}`);
      await this.navigateTo(DEFAULT_COLLATERAL_PATH);
      await this.waitForLoader();
      logger.info(`URL after fallback navigation: ${this.page.url()}`);
    }

    const response = await apiPromise;
    if (response) {
      await this.storeCollateralApiResponse(response);
    }
  }

  private async storeCollateralApiResponse(
    response: import("@playwright/test").Response,
  ): Promise<void> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    this.lastCollateralApiResponse = {
      url: response.url(),
      status: response.status(),
      body,
    };
    logger.info(
      `Collateral API captured: ${response.url()} status=${response.status()}`,
    );
  }

  async expectModuleLoaded(): Promise<void> {
    this.logStep("Verify Collateral module is loaded");
    await expect(this.page).toHaveURL(/collateral/i, {
      timeout: 30_000,
    });
    await expect(this.pageHeading).toBeVisible({ timeout: 30_000 });
    await this.waitForCollateralDataLoaded();
  }

  async waitForCollateralDataLoaded(): Promise<void> {
    this.logStep("Wait for collateral KPI and securities data to finish loading");
    const loading = this.page.getByText(/loading collateral data/i);
    if (await loading.isVisible().catch(() => false)) {
      await expect(loading).toBeHidden({ timeout: 60_000 });
    }
    await expect(this.kpiTotalCollateralValue).toBeVisible({ timeout: 60_000 });
    await this.page
      .waitForFunction(
        () => {
          const text = document.body?.innerText ?? "";
          return (
            /total collateral value/i.test(text) &&
            !/loading collateral data/i.test(text)
          );
        },
        undefined,
        { timeout: 60_000 },
      )
      .catch(() => undefined);
    await this.waitForLoader();
  }

  async expectKpiCardsVisible(): Promise<void> {
    this.logStep("Verify all four Collateral KPI cards are visible");
    await expect(this.kpiTotalCollateralValue).toBeVisible({ timeout: 30_000 });
    await expect(this.kpiActiveCollateral).toBeVisible();
    await expect(this.kpiExpiringSoon).toBeVisible();
    await expect(this.kpiCoverageRatio).toBeVisible();
  }

  async expectBreadcrumbAndTitle(): Promise<void> {
    this.logStep("Verify breadcrumb and page title");
    await expect(this.breadcrumb).toBeVisible({ timeout: 15_000 });
    await expect(this.pageHeading).toBeVisible();
    const text = await this.getPageText();
    expect(text).toMatch(/collateral/i);
  }

  async getPageText(): Promise<string> {
    this.logStep("Read page body text");
    return this.page.locator("body").innerText();
  }

  async getKpiSectionText(): Promise<string> {
    this.logStep("Read KPI section text");
    return this.kpiSection.innerText();
  }

  async getSelectedBranchScope(): Promise<string> {
    const chip = this.page
      .getByRole("button")
      .filter({ hasText: /branch|all branches/i })
      .first();
    if (await chip.isVisible().catch(() => false)) {
      return (await chip.innerText()).trim();
    }
    const text = await this.getPageText();
    const match = text.match(/all branches|branch\s*[:\-]?\s*[\w\s]+/i);
    return match?.[0]?.trim() ?? "";
  }

  async selectBranchScope(branchLabel: string): Promise<void> {
    this.logStep(`Select branch scope: ${branchLabel}`);
    const trigger = this.branchScopeSelect.or(this.branchScopeChip).first();
    await this.common.click(trigger);
    await this.page.waitForTimeout(500);
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
    await this.waitForCollateralDataLoaded();
  }

  async selectAllBranches(): Promise<void> {
    await this.selectBranchScope("All Branches");
  }

  async getSecurityCardCount(): Promise<number> {
    return this.countRenderedSecurityCards();
  }

  async getSecurityTypeHeadings(): Promise<string[]> {
    const types = [
      "Bank Guarantee",
      "Fixed Deposit",
      "Property Mortgage",
      "Corporate Guarantee",
    ];
    const text = await this.getPageText();
    return types.filter((t) => text.includes(t));
  }

  async expectSecurityCardFields(
    type: "BG" | "FD" | "Property" | "CG",
  ): Promise<void> {
    const text = await this.getPageText();
    switch (type) {
      case "BG":
        expect(text).toMatch(/bank guarantee/i);
        expect(text).toMatch(/face value|issuing bank|issue date|expiry date/i);
        break;
      case "FD":
        expect(text).toMatch(/fixed deposit/i);
        expect(text).toMatch(/deposit amount|bank|maturity|lien marked/i);
        break;
      case "Property":
        expect(text).toMatch(/property mortgage/i);
        expect(text).toMatch(/market value|location|mortgage date|valuation date/i);
        break;
      case "CG":
        expect(text).toMatch(/corporate guarantee/i);
        expect(text).toMatch(/guarantor|guaranteed value|validity/i);
        break;
    }
  }

  async expectPageDescription(): Promise<void> {
    await expect(this.page.locator("main")).toContainText(
      /track all collateral securities|collateral securities submitted/i,
    );
  }

  async openBranchFilter(): Promise<void> {
    this.logStep("Open branch scope filter");
    const trigger = this.branchScopeSelect.or(this.branchScopeChip).first();
    await this.common.click(trigger);
  }

  async getBranchFilterOptionLabels(): Promise<string[]> {
    await this.openBranchFilter();
    const options = this.page.getByRole("option").or(
      this.page.getByRole("menuitem"),
    );
    const count = await options.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      labels.push((await options.nth(i).innerText()).trim());
    }
    return labels;
  }

  async captureCollateralApiResponse(): Promise<{
    url: string;
    status: number;
    body: unknown;
  } | null> {
    if (this.lastCollateralApiResponse) {
      return this.lastCollateralApiResponse;
    }
    const response = await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.request().method() === "GET" &&
          /collateral|securities|financials/i.test(r.url()),
        { timeout: 60_000 },
      ),
      this.page.reload(),
    ])
      .then(([r]) => r)
      .catch(() => null);
    if (!response) return null;
    await this.storeCollateralApiResponse(response);
    return this.lastCollateralApiResponse;
  }

  async getBankGuaranteeCardCount(): Promise<number> {
    const text = await this.getPageText();
    const refs = text.match(/\bBG-[A-Z0-9-]+\b/gi);
    return refs ? new Set(refs.map((r) => r.toUpperCase())).size : 0;
  }

  async getDaysLeftValues(): Promise<number[]> {
    const text = await this.getPageText();
    const matches = [...text.matchAll(/(\d+)\s*days left/gi)];
    return matches.map((m) => Number.parseInt(m[1], 10));
  }

  async measurePageLoadMs(): Promise<number> {
    const start = Date.now();
    await this.navigateToModule();
    await this.expectKpiCardsVisible();
    return Date.now() - start;
  }

  async countRenderedSecurityCards(): Promise<number> {
    const text = await this.getPageText();
    const refs = text.match(
      /\b(BG-[A-Z0-9-]+|FD-[A-Z0-9-]+|PROP-[A-Z0-9-]+|CG-[A-Z0-9-]+)\b/gi,
    );
    return refs ? new Set(refs.map((r) => r.toUpperCase())).size : 0;
  }

  async getCollateralSecuritiesHeaderCount(): Promise<number | undefined> {
    const text = await this.getPageText();
    const match = text.match(/collateral securities[^\d]*(\d+)/i);
    if (!match) return undefined;
    return Number.parseInt(match[1], 10);
  }

  securityCard(type: RegExp): Locator {
    return this.page
      .locator("main")
      .locator("div, article, section")
      .filter({ has: this.page.getByText(type) })
      .first();
  }

  async expectNoWriteActions(): Promise<void> {
    this.logStep("Verify no Add/Edit/Delete/Release/Audit/Revaluation actions");
    const forbidden = this.page.getByRole("button", {
      name: /add|edit|delete|release|audit|revaluat/i,
    });
    await expect(forbidden).toHaveCount(0);
    const menus = this.page.getByRole("menuitem", {
      name: /add|edit|delete|release|audit|revaluat/i,
    });
    await expect(menus).toHaveCount(0);
  }

  async expectNoEditableFields(): Promise<void> {
    this.logStep("Verify no editable fields on KPI or security cards");
    const inputs = this.page
      .locator("main")
      .locator("input:not([type='hidden']), textarea, [contenteditable='true']");
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const el = inputs.nth(i);
      const type = (await el.getAttribute("type")) ?? "";
      if (/search/i.test(type)) continue;
      const ro = await el.getAttribute("readonly");
      const dis = await el.isDisabled().catch(() => true);
      expect(ro !== null || dis).toBeTruthy();
    }
  }

  async expectConnectivityError(): Promise<void> {
    this.logStep("Verify connectivity error message");
    await expect(this.connectivityError).toBeVisible({ timeout: 30_000 });
  }

  async clickRetry(): Promise<void> {
    this.logStep("Click Retry on data-load failure");
    await this.common.click(this.retryButton);
    await this.waitForLoader();
  }

  async expectEmptyState(): Promise<void> {
    this.logStep("Verify empty state message");
    await expect(this.noDataMessage.first()).toBeVisible({ timeout: 30_000 });
  }

  hasIndianCurrencyFormat(text: string): boolean {
    return /₹|rs\.?\s*[\d,]+/i.test(text);
  }

  hasPercentageFormat(text: string): boolean {
    return /\d+(\.\d+)?\s*%/.test(text);
  }

  parseAmount(text: string): number | undefined {
    const match = text.match(/₹\s*([\d,]+(?:\.\d+)?)/i);
    if (!match) return undefined;
    return Number.parseFloat(match[1].replace(/,/g, ""));
  }

  async getExpiringSoonCountFromKpi(): Promise<number | undefined> {
    const text = await this.getKpiSectionText();
    const match = text.match(/expiring soon[^\d]*(\d+)/i);
    if (!match) return undefined;
    return Number.parseInt(match[1], 10);
  }

  async getCoverageRatioFromKpi(): Promise<string | undefined> {
    const text = await this.getKpiSectionText();
    const match = text.match(/coverage ratio[^\d]*(\d+(?:\.\d+)?)\s*%/i);
    return match?.[1];
  }

  async waitForCollateralApiResponse(): Promise<import("@playwright/test").Response | null> {
    return this.page
      .waitForResponse(
        (r) =>
          r.request().method() === "GET" &&
          /collateral|securities|financials/i.test(r.url()) &&
          r.status() === 200,
        { timeout: 60_000 },
      )
      .catch(() => null);
  }
}
