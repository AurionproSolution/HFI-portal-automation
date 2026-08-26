import { expect, type Locator, type Page } from "@playwright/test";
import {
  getDealerLimitsPath,
  getOemCheckerCredentials,
  getOemMakerCredentials,
} from "@config/oem-env";
import { BasePage } from "@pages/common/BasePage";
import { OEMLoginPage } from "@pages/oem-portal/login/OEMLoginPage";

/** US-OEM-002 — Dealer Limits (Retrieval & Dashboard). */
export class OEMDealerLimitsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly availableHeadroomKpi: Locator;
  readonly dealerLimitTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly downloadButton: Locator;
  readonly dealerCodeFilter: Locator;
  readonly searchInput: Locator;
  readonly connectivityError: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /dealer limit/i })
      .or(page.getByText(/dealer limit/i).first());
    this.availableHeadroomKpi = page
      .locator("main, section, div")
      .filter({ hasText: /available headroom/i })
      .first();
    this.dealerLimitTable = page
      .locator("[role='grid'], table, [role='table']")
      .filter({ hasText: /dealer code|available/i })
      .first();
    this.tableHeaders = this.dealerLimitTable.locator(
      "[role='columnheader'], thead th",
    );
    this.tableRows = this.dealerLimitTable
      .getByRole("row")
      .filter({ has: page.getByRole("gridcell") });
    this.downloadButton = page.getByRole("button", {
      name: /download(?:\s+limit\s+list)?/i,
    });
    this.dealerCodeFilter = page
      .getByLabel(/dealer code/i)
      .or(page.getByPlaceholder(/dealer code/i))
      .or(page.getByRole("combobox", { name: /dealer code/i }))
      .first();
    this.searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"))
      .first();
    this.connectivityError = page.getByText(
      /we're having trouble loading your data|can't connect to one or more of the systems/i,
    );
    this.retryButton = page.getByRole("button", { name: /^retry$/i });
  }

  protected stepLogPrefix(): string {
    return "OEM Portal — Dealer Limits";
  }

  async signInWithMakerCredentials(): Promise<void> {
    this.logStep("Sign in with OEM Maker credentials");
    const creds = getOemMakerCredentials();
    if (!creds) {
      throw new Error(
        "SKIP: Set OEM_MAKER_USERNAME and OEM_MAKER_PASSWORD for OEM Dealer Limits tests.",
      );
    }
    const login = new OEMLoginPage(this.page);
    await login.logoutIfSignedIn();
    await login.open();
    await login.loginWithCredentials(creds.username, creds.password);
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/login"),
      { timeout: 90_000 },
    );
  }

  async signInWithCheckerCredentials(): Promise<void> {
    this.logStep("Sign in with OEM Checker credentials");
    const creds = getOemCheckerCredentials();
    if (!creds) {
      throw new Error(
        "SKIP: Set OEM_CHECKER_USERNAME and OEM_CHECKER_PASSWORD for Checker role tests.",
      );
    }
    const login = new OEMLoginPage(this.page);
    await login.logoutIfSignedIn();
    await login.open();
    await login.loginWithCredentials(creds.username, creds.password);
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/login"),
      { timeout: 90_000 },
    );
  }

  async navigateToModule(options?: { waitForDashboardData?: boolean }): Promise<void> {
    this.logStep(`Navigate to Dealer Limits (${getDealerLimitsPath()})`);
    const navLink = this.page
      .locator("nav, aside")
      .getByRole("link", { name: /dealer limit/i })
      .first();
    if (await navLink.isVisible().catch(() => false)) {
      await this.common.click(navLink);
    } else if (!/dealer-limit/i.test(this.page.url())) {
      await this.navigateTo(getDealerLimitsPath());
    }
    await this.waitForLoader();
    if (options?.waitForDashboardData !== false) {
      await this.waitForDashboardData();
    }
  }

  async waitForDashboardData(): Promise<void> {
    this.logStep("Wait for dealer-limit dashboard data to load");
    await this.page
      .getByText(/loading dealer limits/i)
      .waitFor({ state: "hidden", timeout: 60_000 })
      .catch(() => undefined);
    await expect(this.page.getByText(/available headroom/i)).toBeVisible({
      timeout: 60_000,
    });
    await expect(this.dealerLimitTable).toBeVisible({ timeout: 30_000 });
    await expect(this.tableRows.first()).toBeVisible({ timeout: 30_000 });
  }

  async openFromLoginAsMaker(options?: {
    waitForDashboardData?: boolean;
  }): Promise<void> {
    this.logStep("Open Dealer Limits dashboard as Maker");
    await this.signInWithMakerCredentials();
    await this.navigateToModule(options);
  }

  async openFromLoginAsChecker(): Promise<void> {
    this.logStep("Open Dealer Limits dashboard as Checker");
    await this.signInWithCheckerCredentials();
    await this.navigateToModule();
  }

  async isModuleAvailable(): Promise<boolean> {
    const urlOk = /dealer-limit|dealer-limits/i.test(this.page.url());
    const heading = await this.pageHeading.isVisible().catch(() => false);
    const table = await this.dealerLimitTable.isVisible().catch(() => false);
    const headroom = await this.availableHeadroomKpi.isVisible().catch(() => false);
    const bodyText = await this.getPageText();
    const textOk = /dealer limit|available headroom|available limit/i.test(bodyText);
    return (urlOk || heading || textOk) && (heading || table || headroom || textOk);
  }

  async getPageText(): Promise<string> {
    this.logStep("Read page body text");
    return this.page.locator("body").innerText();
  }

  async expectDashboardLanding(): Promise<void> {
    this.logStep("Verify Dealer Limit Dashboard is displayed");
    const text = await this.getPageText();
    expect(text).toMatch(/dealer limit/i);
    expect(
      await this.isModuleAvailable(),
      `Dealer Limit Dashboard not found at ${this.page.url()}`,
    ).toBeTruthy();
  }

  async expectAvailableHeadroomKpi(): Promise<void> {
    this.logStep("Verify Available Headroom KPI is visible");
    await this.waitForDashboardData();
    const text = await this.getPageText();
    expect(text).toMatch(/available headroom/i);
    if (await this.availableHeadroomKpi.isVisible().catch(() => false)) {
      await expect(this.availableHeadroomKpi).toBeVisible({ timeout: 30_000 });
    }
  }

  async getAvailableHeadroomText(): Promise<string> {
    this.logStep("Read Available Headroom KPI text");
    if (await this.availableHeadroomKpi.isVisible().catch(() => false)) {
      return await this.availableHeadroomKpi.innerText();
    }
    const text = await this.getPageText();
    const match = text.match(/available headroom[^\n]*\n?([^\n]+)/i);
    return match?.[1]?.trim() ?? text;
  }

  async expectAc3TableColumns(): Promise<void> {
    this.logStep("Verify AC-3 dealer-limit table columns");
    const headers = await this.getHeaderTexts();
    const joined = headers.join(", ");
    expect(
      headers.some((h) => /dealer code/i.test(h)),
      `Expected Dealer Code column; headers: ${joined}`,
    ).toBeTruthy();
    expect(
      headers.some((h) => /dealer name/i.test(h)),
      `Expected Dealer Name column; headers: ${joined}`,
    ).toBeTruthy();
    expect(
      headers.some((h) => /^city$/i.test(h.trim())),
      `Expected City column; headers: ${joined}`,
    ).toBeTruthy();
    expect(
      headers.some((h) => /address/i.test(h)),
      `Expected Address column; headers: ${joined}`,
    ).toBeTruthy();
    expect(
      headers.some((h) => /available limit/i.test(h)),
      `Expected Available Limit column; headers: ${joined}`,
    ).toBeTruthy();
    expect(
      headers.some((h) => /last invoice raised/i.test(h)),
      `Expected Last Invoice Raised column; headers: ${joined}`,
    ).toBeTruthy();
  }

  async expectFrontendTableColumns(): Promise<void> {
    this.logStep("Verify Frontend Requirements table columns");
    const headers = await this.getHeaderTexts();
    const headerText = headers.join(" ").toLowerCase();
    expect(headerText, `Table headers: ${headers.join(", ")}`).toMatch(
      /product type/i,
    );
    expect(headerText, `Table headers: ${headers.join(", ")}`).toMatch(
      /standard limit/i,
    );
    expect(headerText, `Table headers: ${headers.join(", ")}`).toMatch(
      /adhoc limit/i,
    );
    expect(headerText, `Table headers: ${headers.join(", ")}`).toMatch(
      /utilisation/i,
    );
  }

  async getFirstDealerCodeFromTable(): Promise<string | undefined> {
    this.logStep("Read first dealer code from table");
    const firstRow = this.tableRows.first();
    if (!(await firstRow.isVisible().catch(() => false))) {
      return undefined;
    }
    const text = (await firstRow.innerText()).trim();
    const match = text.match(
      /\b([A-Z]{2}\d{4,6}|HMD-\d+|DLR\d+|DL[A-Z0-9-]+)\b/i,
    );
    return match?.[1];
  }

  async getDealerRowText(dealerCode: string): Promise<string> {
    this.logStep(`Read dealer row for ${this.stepValueDisplay("code", dealerCode)}`);
    const row = this.tableRows.filter({
      hasText: new RegExp(dealerCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    });
    return (await row.first().innerText()).trim();
  }

  async hasDealerCodeFilterControl(): Promise<boolean> {
    return await this.dealerCodeFilter.isVisible().catch(() => false);
  }

  async hasDealerSearchControl(): Promise<boolean> {
    return await this.searchInput.isVisible().catch(() => false);
  }

  async getPaginationTotal(): Promise<number | undefined> {
    this.logStep("Read dealer-limit pagination total");
    const text = await this.getPageText();
    const match = text.match(/\d+\s+to\s+\d+\s+of\s+(\d+)/i);
    return match ? Number.parseInt(match[1], 10) : undefined;
  }

  async findDealerCodeWithZeroAvailableLimit(): Promise<string | undefined> {
    this.logStep("Scan table for dealer with zero Available Limit");
    const rowCount = await this.getTableRowCount();
    for (let i = 0; i < rowCount; i++) {
      const rowText = await this.tableRows.nth(i).innerText();
      if (/₹\s*0(?:\.0+)?\s*(?:cr|l)?|0\.00\s*cr|0\s*cr/i.test(rowText)) {
        const code = rowText.match(
          /\b([A-Z]{2}\d{4,6}|HMD-\d+|DLR\d+|DL[A-Z0-9-]+)\b/i,
        );
        if (code) {
          return code[1];
        }
      }
    }
    return undefined;
  }

  async expectReadOnlyFields(): Promise<void> {
    this.logStep("Verify dealer-limit fields are read-only");
    const editable = this.dealerLimitTable.locator(
      "input:not([type='hidden']), textarea, [contenteditable='true']",
    );
    expect(await editable.count()).toBe(0);
  }

  async expectNoEditControls(): Promise<void> {
    this.logStep("Verify no edit controls on dealer limits");
    const edit = this.page.getByRole("button", { name: /^edit$/i });
    expect(await edit.count()).toBe(0);
    await this.expectReadOnlyFields();
  }

  async expectNoLimitChangeActions(): Promise<void> {
    this.logStep("Verify no raise/approve limit change actions");
    const text = await this.getPageText();
    expect(text).not.toMatch(/raise limit|approve limit change/i);
    const actions = this.page.getByRole("button", {
      name: /raise limit|approve limit|limit change/i,
    });
    expect(await actions.count()).toBe(0);
  }

  async expectNoInvoiceFinancingActions(): Promise<void> {
    this.logStep("Verify no invoice upload/financing actions on dashboard");
    const upload = this.page.getByRole("button", {
      name: /upload|invoice financing|download xlsx template/i,
    });
    expect(await upload.count()).toBe(0);
  }

  async filterByDealerCode(dealerCode: string): Promise<void> {
    this.logStep(`Filter by Dealer Code: ${this.stepValueDisplay("code", dealerCode)}`);
    if (await this.dealerCodeFilter.isVisible().catch(() => false)) {
      await this.common.clearAndFill(this.dealerCodeFilter, dealerCode);
      await this.common.pressKey("Enter").catch(() => undefined);
    } else if (await this.searchInput.isVisible().catch(() => false)) {
      await this.common.clearAndFill(this.searchInput, dealerCode);
      await this.common.pressKey("Enter").catch(() => undefined);
    }
    await this.waitForLoader();
    await this.page.waitForTimeout(1_500);
  }

  async downloadDealerLimits(): Promise<void> {
    this.logStep("Click Download on dealer-limit list");
    await this.common.click(this.downloadButton);
    await this.waitForLoader();
  }

  async expectConnectivityError(): Promise<void> {
    this.logStep("Verify LMS connectivity error message");
    await expect(this.connectivityError).toBeVisible({ timeout: 30_000 });
  }

  async refreshDashboard(): Promise<void> {
    this.logStep("Refresh Dealer Limits dashboard");
    await this.page.reload({ waitUntil: "domcontentloaded" });
    await this.waitForLoader();
    await this.waitForDashboardData();
  }

  async getTableRowCount(): Promise<number> {
    this.logStep("Count dealer-limit table rows");
    return await this.tableRows.count();
  }

  async getHeaderTexts(): Promise<string[]> {
    this.logStep("Read dealer-limit table header texts");
    const count = await this.tableHeaders.count();
    const headers: string[] = [];
    for (let i = 0; i < count; i++) {
      headers.push((await this.tableHeaders.nth(i).innerText()).trim());
    }
    return headers;
  }

  parseCrAmountsFromText(text: string): number[] {
    const amounts: number[] = [];
    const crMatches = text.matchAll(/(\d+(?:\.\d+)?)\s*cr/gi);
    for (const m of crMatches) {
      amounts.push(Number.parseFloat(m[1]));
    }
    const lakhMatches = text.matchAll(/(\d+(?:\.\d+)?)\s*l\b/gi);
    for (const m of lakhMatches) {
      amounts.push(Number.parseFloat(m[1]) / 100);
    }
    return amounts;
  }
}
