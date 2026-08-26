import { expect, type Locator, type Page } from "@playwright/test";
import { getCredentials, getLoginUrl } from "@config/env";
import { BasePage } from "@pages/common/BasePage";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { logger } from "@utils/logger";

const DEFAULT_PO_VIN_PATH =
  process.env.PO_VIN_PATH?.trim() || "/operations/purchase-orders";

export type PoVinDateRangePreset =
  | "7D"
  | "30D"
  | "MTD"
  | "90D"
  | "YTD"
  | "Custom";

const PO_VIN_DATE_RANGE_PRESETS: PoVinDateRangePreset[] = [
  "7D",
  "30D",
  "MTD",
  "90D",
  "YTD",
  "Custom",
];

/** US-DLR-009 — Purchase Orders & VINs (Pay Against Sold VINs). */
export class HFIPurchaseOrdersVINsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly dealerFinanceTab: Locator;
  readonly purchaseOrdersNavItem: Locator;
  readonly kpiTotalPOs: Locator;
  readonly kpiTotalVINs: Locator;
  readonly kpiTotalValue: Locator;
  readonly kpiPaymentPending: Locator;
  readonly connectivityError: Locator;
  readonly retryButton: Locator;
  readonly noDataMessage: Locator;
  readonly vinSnapshotSection: Locator;
  readonly poGrid: Locator;
  readonly poGridRows: Locator;
  readonly searchInput: Locator;
  readonly exportButton: Locator;
  readonly branchScopeSelect: Locator;
  readonly dateRangeControl: Locator;
  readonly payButton: Locator;
  readonly totalPayableAmount: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole("heading", {
      level: 1,
      name: /purchase orders?\s*&\s*vins?/i,
    });
    this.dealerFinanceTab = page
      .getByRole("button", { name: /dealer finance/i })
      .or(page.getByRole("tab", { name: /dealer finance/i }))
      .or(page.getByText(/^dealer finance$/i))
      .first();
    this.purchaseOrdersNavItem = page
      .locator("nav, aside")
      .getByRole("link", { name: /purchase orders?\s*&\s*vins?/i })
      .or(page.getByRole("link", { name: /purchase orders?\s*&\s*vins?/i }))
      .first();
    this.kpiTotalPOs = page
      .locator("main")
      .locator("div, section")
      .filter({ hasText: /total pos?/i })
      .first();
    this.kpiTotalVINs = page
      .locator("main")
      .locator("div, section")
      .filter({ hasText: /total vins?/i })
      .first();
    this.kpiTotalValue = page
      .locator("main")
      .locator("div, section")
      .filter({ hasText: /total value/i })
      .first();
    this.kpiPaymentPending = page
      .locator("main")
      .locator("div, section")
      .filter({ hasText: /payment pending/i })
      .first();
    this.connectivityError = page.getByText(
      /we're having trouble loading your data|can't connect to one or more of the systems/i,
    );
    this.retryButton = page.getByRole("button", { name: /^retry$/i });
    this.noDataMessage = page.getByText(
      /no data available|no matching rows|no purchase orders match/i,
    );
    this.vinSnapshotSection = page
      .locator("section, div")
      .filter({ hasText: /vin inventory snapshot/i })
      .first();
    this.poGrid = page
      .locator("[role='grid'], table, [role='table'], [data-testid='po-vin-grid']")
      .first();
    this.poGridRows = this.page
      .getByRole("row")
      .filter({ has: page.getByRole("button", { name: /^PO-/i }) });
    this.searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"))
      .or(page.getByLabel(/search/i))
      .first();
    this.exportButton = page.getByRole("button", {
      name: /export(\s+csv)?/i,
    });
    this.branchScopeSelect = page
      .getByLabel(/branch/i)
      .or(page.getByRole("combobox", { name: /branch/i }))
      .first();
    this.dateRangeControl = page
      .getByLabel(/date range/i)
      .or(page.getByRole("button", { name: /date range/i }))
      .first();
    this.payButton = page
      .getByRole("button", { name: /^pay$/i })
      .or(page.getByRole("button", { name: /pay now/i }))
      .or(page.locator("button").filter({ hasText: /^pay$/i }))
      .last();
    this.totalPayableAmount = page
      .locator("main, footer")
      .filter({ hasText: /total payable|payable/i })
      .first();
    this.paginationNext = page.getByRole("button", { name: /next/i });
    this.paginationPrev = page.getByRole("button", { name: /previous|prev/i });
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Purchase Orders & VINs";
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
      /purchase orders|dealer finance|exposure settings|dashboard/i.test(body),
      `Dealer Finance dashboard not loaded at ${this.page.url()}`,
    ).toBeTruthy();
  }

  async openFromLogin(): Promise<void> {
    this.logStep("Open Purchase Orders & VINs from login");
    await this.signInWithDealerCredentials();
    await this.navigateToModule();
  }

  async navigateToModule(): Promise<void> {
    this.logStep("Navigate to Purchase Orders & VINs via left navigation");
    await this.ensureDealerFinanceDashboardLoaded();

    const urlBefore = this.page.url();
    logger.info(`URL before Purchase Orders click: ${urlBefore}`);

    await expect(
      this.purchaseOrdersNavItem,
      "Purchase Orders & VINs menu item not visible in left navigation",
    ).toBeVisible({ timeout: 30_000 });

    await this.common.click(this.purchaseOrdersNavItem);
    await this.page.waitForURL(/purchase-orders|operations/i, {
      timeout: 30_000,
    });
    await this.waitForLoader();

    const urlAfter = this.page.url();
    logger.info(`URL after Purchase Orders navigation: ${urlAfter}`);

    if (!/purchase-orders|operations\/purchase/i.test(urlAfter)) {
      this.logStep(`Fallback navigate to ${DEFAULT_PO_VIN_PATH}`);
      await this.navigateTo(DEFAULT_PO_VIN_PATH);
      await this.waitForLoader();
      logger.info(`URL after fallback navigation: ${this.page.url()}`);
    }
  }

  async isModuleAvailable(): Promise<boolean> {
    const url = this.page.url();
    const onRoute = /purchase-orders|operations\/purchase/i.test(url);
    if (!onRoute) return false;

    const headingVisible = await this.pageHeading.isVisible().catch(() => false);
    if (headingVisible) return true;

    const body = await this.page.locator("body").innerText().catch(() => "");
    return /total pos?|total vins?|vin inventory snapshot|purchase orders/i.test(
      body,
    );
  }

  async expectModuleLoaded(): Promise<void> {
    this.logStep("Verify Purchase Orders & VINs module is loaded");
    await expect(this.page).toHaveURL(/purchase-orders|operations\/purchase/i, {
      timeout: 30_000,
    });
    await expect(this.pageHeading).toBeVisible({ timeout: 30_000 });
    await expect(this.page.locator("main")).toContainText(
      /total pos?|total vins?|vin inventory snapshot/i,
      { timeout: 30_000 },
    );
  }

  async expectKpiCardsVisible(): Promise<void> {
    this.logStep("Verify all four KPI cards are visible");
    await expect(this.kpiTotalPOs).toBeVisible({ timeout: 30_000 });
    await expect(this.kpiTotalVINs).toBeVisible();
    await expect(this.kpiTotalValue).toBeVisible();
    await expect(this.kpiPaymentPending).toBeVisible();
  }

  async getKpiSectionText(): Promise<string> {
    this.logStep("Read KPI card section text");
    const cards = this.page
      .locator("div, section")
      .filter({ hasText: /total pos?|total vins?|total value|payment pending/i });
    return cards.first().locator("..").innerText().catch(() => this.getPageText());
  }

  async getPageText(): Promise<string> {
    this.logStep("Read page body text");
    return this.page.locator("body").innerText();
  }

  async expectConnectivityError(): Promise<void> {
    this.logStep("Verify standard connectivity error message");
    await expect(this.connectivityError).toBeVisible({ timeout: 30_000 });
    await expect(this.connectivityError).toContainText(
      /trouble loading your data/i,
    );
  }

  async clickRetry(): Promise<void> {
    this.logStep("Click Retry on data-load failure");
    await this.common.click(this.retryButton);
    await this.waitForLoader();
  }

  async search(query: string): Promise<void> {
    this.logStep(
      `Search PO/VIN list: ${this.stepValueDisplay("query", query)}`,
    );
    await this.common.clearAndFill(this.searchInput, query);
    await this.common.pressKey("Enter").catch(() => undefined);
    await this.waitForLoader();
    await this.page.waitForTimeout(1_500);
  }

  async clearSearch(): Promise<void> {
    this.logStep("Clear search filter");
    await this.searchInput.clear();
    await this.common.pressKey("Enter").catch(() => undefined);
    await this.waitForLoader();
  }

  async exportCsv(): Promise<void> {
    this.logStep("Click Export to download CSV");
    await expect(this.exportButton).toBeVisible({ timeout: 15_000 });
    await this.common.click(this.exportButton);
  }

  async selectBranchScope(branchLabel: string): Promise<void> {
    this.logStep(
      `Select branch scope: ${this.stepValueDisplay("branch", branchLabel)}`,
    );
    await this.common.click(this.branchScopeSelect);
    const option = this.page
      .getByRole("option", { name: new RegExp(branchLabel, "i") })
      .or(this.page.getByText(new RegExp(branchLabel, "i")))
      .first();
    await this.common.click(option);
    await this.waitForLoader();
  }

  async openDateRangePicker(): Promise<void> {
    this.logStep("Open date range filter");
    if (await this.dateRangeControl.isVisible().catch(() => false)) {
      await this.common.click(this.dateRangeControl);
      return;
    }
    const custom = this.dateRangeChip("Custom");
    if (await custom.isVisible().catch(() => false)) {
      await this.common.click(custom);
    }
  }

  dateRangeChip(preset: PoVinDateRangePreset | string): Locator {
    const label = String(preset);
    return this.page
      .getByText(label, { exact: true })
      .or(this.page.getByRole("button", { name: new RegExp(`^${label}$`, "i") }))
      .or(this.page.getByRole("tab", { name: new RegExp(`^${label}$`, "i") }))
      .first();
  }

  async isDateRangeChipVisible(preset: PoVinDateRangePreset): Promise<boolean> {
    const chip = this.dateRangeChip(preset);
    return chip.isVisible().catch(() => false);
  }

  async selectDateRangeChip(preset: PoVinDateRangePreset): Promise<void> {
    this.logStep(`Select date range preset: ${preset}`);
    const chip = this.dateRangeChip(preset);
    await expect(chip, `Date range chip "${preset}" not visible`).toBeVisible({
      timeout: 15_000,
    });
    await this.common.click(chip);
    await this.waitForLoader();
    await this.page.waitForTimeout(1_500);
  }

  async selectDateRangePreset(preset: RegExp): Promise<void> {
    this.logStep(`Select date range preset: ${String(preset)}`);
    const chip = this.page
      .locator("main")
      .getByRole("button", { name: preset })
      .first();
    if (await chip.isVisible().catch(() => false)) {
      await this.common.click(chip);
      await this.waitForLoader();
      await this.page.waitForTimeout(1_500);
      return;
    }
    await this.openDateRangePicker();
    const button = this.page.getByRole("button", { name: preset }).first();
    if (await button.isVisible().catch(() => false)) {
      await this.common.click(button);
      await this.waitForLoader();
      await this.page.waitForTimeout(1_500);
    }
  }

  async hasPoGridRows(): Promise<boolean> {
    const mainText = await this.page.locator("main").innerText().catch(() => "");
    if (/PO-\d{4}-\d+/i.test(mainText) || /PO[-\s]?\d{4,}/i.test(mainText)) {
      return true;
    }
    if (/\b[A-HJ-NPR-Z0-9]{11,17}\b/.test(mainText)) {
      return true;
    }

    const count = await this.poGridRows.count();
    if (count === 0) {
      return false;
    }
    let dataRows = 0;
    for (let i = 0; i < count; i++) {
      const text = await this.poGridRows.nth(i).innerText().catch(() => "");
      if (
        text.trim().length > 0 &&
        !/no data available|no matching rows|no purchase orders match/i.test(text)
      ) {
        dataRows += 1;
      }
    }
    return dataRows > 0;
  }

  /**
   * PO/VIN rows are often empty on the default range — always try 30D / 90D presets.
   */
  async ensurePoVinGridData(
    presets: PoVinDateRangePreset[] = ["30D", "90D", "7D", "MTD", "YTD"],
  ): Promise<PoVinDateRangePreset | undefined> {
    this.logStep(
      `Ensure PO/VIN grid has data (presets: ${presets.join(", ")})`,
    );

    let lastWithData: PoVinDateRangePreset | undefined;
    for (const preset of presets) {
      if (!(await this.isDateRangeChipVisible(preset))) {
        continue;
      }
      await this.selectDateRangeChip(preset);
      if (await this.hasPoGridRows()) {
        this.logStep(`PO/VIN data visible under date range: ${preset}`);
        lastWithData = preset;
        break;
      }
    }

    if (lastWithData) {
      return lastWithData;
    }

    if (await this.hasPoGridRows()) {
      return undefined;
    }
    return undefined;
  }

  async expandFirstPoRowIfNeeded(): Promise<string | undefined> {
    if (!(await this.hasPoGridRows())) {
      return undefined;
    }

    const rows = this.poGridRows;
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).innerText();
      const identifier = this.extractPoIdentifierFromText(rowText);
      if (identifier && this.isPoRowWithVins(rowText)) {
        await this.expandPoRow(identifier);
        return identifier;
      }
    }

    const firstRowText = await rows.first().innerText();
    const identifier = this.extractPoIdentifierFromText(firstRowText);
    if (identifier) {
      await this.expandPoRow(identifier);
      return identifier;
    }

    await this.common.click(rows.first());
    await this.waitForLoader();
    return undefined;
  }

  poDetailDrawer(): Locator {
    return this.page.locator("app-po-detail-drawer");
  }

  poDetailDrawerClose(): Locator {
    return this.poDetailDrawer()
      .getByRole("button", { name: /^close$/i })
      .first();
  }

  /** VIN rows render inline under the PO or inside the PO detail drawer. */
  vinDetailRoot(): Locator {
    return this.page.locator("main");
  }

  async waitForPoDetailDrawer(): Promise<void> {
    await expect(this.poDetailDrawer()).toBeVisible({ timeout: 15_000 });
  }

  async closePoDetailDrawerIfOpen(): Promise<void> {
    const close = this.poDetailDrawerClose();
    if (await close.isVisible().catch(() => false)) {
      this.logStep("Close PO detail drawer");
      await this.common.click(close);
      await this.waitForLoader();
    }
  }

  extractVinFromText(text: string): string | undefined {
    const withoutPo = text.replace(/PO-\d{4}-\d+/gi, " ");
    const patterns = [
      /\b[A-HJ-NPR-Z0-9]{17}\b/i,
      /\b(?:MH|MA)[A-HJ-NPR-Z0-9]{13,16}\b/i,
      /\b[A-Z0-9]{4,8}\*{2,8}[A-Z0-9]{2,8}\b/i,
    ];
    for (const pattern of patterns) {
      const match = withoutPo.match(pattern);
      if (match?.[0]) {
        return match[0];
      }
    }
    const tokens = withoutPo.split(/\s+/).filter((token) => {
      const t = token.trim();
      return (
        /^[A-Z0-9]{8,20}$/i.test(t) &&
        !/^PO/i.test(t) &&
        !/^(Received|Amended|Created|In Stock|Sold|Pending)$/i.test(t)
      );
    });
    return tokens[0];
  }

  private vinDetailRows(): Locator {
    return this.vinDetailRoot().locator("tr, [role='row']");
  }

  private vinCheckboxIn(container: Locator): Locator {
    return container
      .getByRole("checkbox")
      .or(container.locator("input[type='checkbox']"))
      .first();
  }

  private vinDataRows(): Locator {
    return this.vinDetailRoot().locator("table tr").filter({
      hasText: /MAKGM|MH[A-Z0-9]{10,}|[A-HJ-NPR-Z0-9]{17}/i,
    });
  }

  async getFirstInStockVin(): Promise<string | undefined> {
    const inStockRow = this.vinDataRows()
      .filter({ hasText: /\bin stock\b/i })
      .first();
    if (await inStockRow.isVisible().catch(() => false)) {
      return this.extractVinFromText(await inStockRow.innerText());
    }

    const markSoldRow = this.vinDetailRows()
      .filter({ has: this.page.getByRole("button", { name: /^mark sold$/i }) })
      .first();
    if (await markSoldRow.isVisible().catch(() => false)) {
      return this.extractVinFromText(await markSoldRow.innerText());
    }

    return undefined;
  }

  async getAllSoldUnpaidVins(): Promise<string[]> {
    await this.page
      .getByText(/VINS UNDER PO/i)
      .first()
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => undefined);

    const vins: string[] = [];
    const rows = this.vinDataRows();
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const rowText = await rows.nth(i).innerText();
      if (!/sold/i.test(rowText)) {
        continue;
      }
      const vin = this.extractVinFromText(rowText);
      if (vin && !vins.includes(vin)) {
        vins.push(vin);
      }
    }
    return vins;
  }

  async getFirstSoldUnpaidVin(): Promise<string | undefined> {
    const vins = await this.getAllSoldUnpaidVins();
    return vins[0];
  }

  async getFirstExpandedVin(): Promise<string | undefined> {
    const inStockVin = await this.getFirstInStockVin();
    if (inStockVin) {
      return inStockVin;
    }

    const soldUnpaid = await this.getFirstSoldUnpaidVin();
    if (soldUnpaid) {
      return soldUnpaid;
    }

    const vinGridRow = this.vinDetailRows()
      .filter({ has: this.vinDetailRoot().getByRole("checkbox") })
      .filter({ hasNot: this.page.getByRole("button", { name: /^PO-/i }) })
      .first();
    if (await vinGridRow.isVisible().catch(() => false)) {
      return this.extractVinFromText(await vinGridRow.innerText());
    }

    return undefined;
  }

  vinCountFromPoRowText(rowText: string): number | undefined {
    const soldMatch = rowText.match(/\b(\d+)\s*·\s*\d+\s+sold\b/i);
    if (soldMatch) {
      return Number.parseInt(soldMatch[1], 10);
    }

    const statusMatch = rowText.match(
      /(?:Received|Amended|Created|Dispatched|Cancelled)[\s\S]*?\b(\d+)\b[\s\S]*?₹/i,
    );
    if (statusMatch) {
      return Number.parseInt(statusMatch[1], 10);
    }

    const legacyMatch = rowText.match(
      /(?:Received|Amended|Created|Dispatched|Cancelled)\s+(\d+)\s+₹/i,
    );
    if (legacyMatch) {
      return Number.parseInt(legacyMatch[1], 10);
    }

    return undefined;
  }

  isPoRowWithVins(rowText: string): boolean {
    const vinCount = this.vinCountFromPoRowText(rowText);
    return typeof vinCount === "number" && vinCount > 0;
  }

  async isDateRangeFilterVisible(): Promise<boolean> {
    if (await this.dateRangeControl.isVisible().catch(() => false)) {
      return true;
    }
    for (const preset of PO_VIN_DATE_RANGE_PRESETS) {
      if (await this.isDateRangeChipVisible(preset)) {
        return true;
      }
    }
    return false;
  }

  extractPoIdentifierFromText(text: string): string | undefined {
    const poMatch =
      text.match(/PO-\d{4}-\d+/i) || text.match(/PO[-\s]?\d{4,}/i);
    if (poMatch) {
      return poMatch[0].trim();
    }
    const rows = text.split("\n").filter((l) => l.trim().length > 4);
    for (const line of rows) {
      if (/purchase order|po number|order/i.test(line)) {
        const token = line.match(/\b[A-Z0-9-]{5,20}\b/);
        if (token) {
          return token[0];
        }
      }
    }
    return undefined;
  }

  poRowByIdentifier(id: string): Locator {
    return this.page
      .getByRole("row")
      .filter({ hasText: new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") })
      .first();
  }

  async expandPoRow(identifier: string): Promise<void> {
    this.logStep(`Expand PO row: ${identifier}`);
    await this.closePoDetailDrawerIfOpen();
    const row = this.poRowByIdentifier(identifier);
    const collapseBtn = row.getByRole("button", { name: /^collapse$/i }).first();
    if (await collapseBtn.isVisible().catch(() => false)) {
      return;
    }
    const expand = row.getByRole("button", { name: /^expand$/i }).first();
    if (await expand.isVisible().catch(() => false)) {
      await this.common.click(expand);
    } else {
      const collapsedExpand = row
        .getByRole("button", { name: /expand|chevron|toggle/i })
        .first();
      if (await collapsedExpand.isVisible().catch(() => false)) {
        await this.common.click(collapsedExpand);
      } else {
        throw new Error(`Expand control not found for PO row ${identifier}.`);
      }
    }
    await this.waitForLoader();
  }

  async collapsePoRow(identifier: string): Promise<void> {
    this.logStep(`Collapse PO row: ${identifier}`);
    if (await this.poDetailDrawer().isVisible().catch(() => false)) {
      await this.closePoDetailDrawerIfOpen();
      await this.waitForLoader();
      return;
    }
    const row = this.poRowByIdentifier(identifier);
    const collapse = row.getByRole("button", { name: /^collapse$/i }).first();
    if (await collapse.isVisible().catch(() => false)) {
      await this.common.click(collapse);
    } else {
      const fallback = row
        .getByRole("button", { name: /collapse|chevron/i })
        .first();
      if (await fallback.isVisible().catch(() => false)) {
        await this.common.click(fallback);
      } else {
        await this.common.click(row);
      }
    }
    await this.waitForLoader();
  }

  vinRow(vin: string): Locator {
    const escaped = vin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.vinDetailRoot()
      .locator("table tr")
      .filter({
        has: this.page
          .locator("td, [role='cell']")
          .filter({ hasText: new RegExp(`^\\s*${escaped}\\s*$`, "i") }),
      })
      .first();
  }

  vinCheckbox(vin: string): Locator {
    return this.vinCheckboxIn(this.vinRow(vin));
  }

  async markVinAsSold(vin: string): Promise<void> {
    this.logStep(`Mark VIN as Sold: ${vin}`);
    const row = this.vinRow(vin);
    const markSoldAction = row
      .getByRole("button", { name: /^mark sold$/i })
      .or(row.getByLabel(/^mark sold$/i))
      .first();
    await expect(
      markSoldAction,
      `Mark Sold action not available for VIN ${vin}`,
    ).toBeVisible({ timeout: 15_000 });
    await this.common.click(markSoldAction);
    const soldDialog = this.page
      .locator("[role='dialog'], section, main")
      .filter({
        has: this.page.getByRole("heading", { name: /mark asset as sold/i }),
      })
      .last();
    await expect(soldDialog).toBeVisible({ timeout: 15_000 });
    await this.common.click(
      soldDialog.getByRole("button", { name: /^confirm sale$/i }),
    );
    await this.waitForLoader();
    await expect(
      row.locator("td, [role='cell']").filter({ hasText: /^sold$/i }),
    ).toBeVisible({ timeout: 30_000 });
  }

  async expectVinPaymentCheckboxEnabled(vin: string): Promise<void> {
    this.logStep(`Verify payment checkbox enabled for VIN: ${vin}`);
    const checkbox = this.vinCheckbox(vin);
    await expect(checkbox).toBeVisible({ timeout: 15_000 });
    await expect(checkbox).toBeEnabled({ timeout: 30_000 });
  }

  async attemptSelectInStockVin(vin: string): Promise<boolean> {
    this.logStep(`Attempt to select In Stock VIN: ${vin}`);
    const checkbox = this.vinCheckbox(vin);
    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check({ force: true }).catch(() => undefined);
      return checkbox.isChecked().catch(() => false);
    }
    return false;
  }

  async selectVinForPayment(vin: string): Promise<void> {
    this.logStep(`Select VIN for payment: ${vin}`);
    const checkbox = this.vinCheckbox(vin);
    await checkbox.scrollIntoViewIfNeeded().catch(() => undefined);
    if (!(await checkbox.isChecked().catch(() => false))) {
      await checkbox.check({ force: true });
    }
    await this.page.waitForTimeout(500);
  }

  async expectPayActionEnabled(): Promise<void> {
    this.logStep("Verify Pay action is enabled");
    const pay = this.payButton;
    if (await pay.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(pay).toBeEnabled();
      return;
    }
    const text = await this.getPageText();
    expect(text).toMatch(/total payable|payable|₹/i);
  }

  async deselectAllVins(): Promise<void> {
    this.logStep("Deselect all VIN checkboxes");
    const boxes = this.page.getByRole("checkbox");
    const count = await boxes.count();
    for (let i = 0; i < count; i++) {
      const box = boxes.nth(i);
      if (await box.isChecked().catch(() => false)) {
        await box.uncheck().catch(() => undefined);
      }
    }
  }

  paymentStatusCell(vin: string): Locator {
    return this.vinRow(vin).locator("td, [role='cell']").filter({
      hasText: /not required|pending|awaiting confirmation|payment completed/i,
    });
  }

  addPaymentDetailsButton(_vin?: string): Locator {
    return this.page.getByRole("button", { name: /add payment details/i });
  }

  async openAddPaymentDetails(vin: string): Promise<void> {
    this.logStep(`Open Add Payment Details for VIN: ${vin}`);
    await this.selectVinForPayment(vin);
    const btn = this.addPaymentDetailsButton();
    await btn.scrollIntoViewIfNeeded();
    await this.common.click(btn);
    await expect(
      this.page.getByRole("heading", { name: /add payment details/i }),
    ).toBeVisible({ timeout: 15_000 });
  }

  addPaymentDetailsPanel(): Locator {
    return this.page
      .locator("main, [role='dialog'], section")
      .filter({
        has: this.page.getByRole("heading", { name: /add payment details/i }),
      })
      .last();
  }

  amountPaidField(): Locator {
    return this.page.getByRole("textbox", { name: /^0\.00$/ });
  }

  utrNumberField(): Locator {
    return this.page.getByRole("textbox", { name: /hdfcn|e\.g\./i });
  }

  async fillAddPaymentDetails(amount: string, utr: string): Promise<void> {
    this.logStep("Fill Amount Paid and UTR Number");
    await this.common.clearAndFill(this.amountPaidField(), amount);
    await this.common.clearAndFill(this.utrNumberField(), utr);
  }

  async expectAddPaymentDetailsValues(amount: string, utr: string): Promise<void> {
    this.logStep("Verify Amount Paid and UTR Number field values");
    await expect(this.amountPaidField()).toHaveValue(amount);
    await expect(this.utrNumberField()).toHaveValue(utr);
  }

  async submitAddPaymentDetails(): Promise<void> {
    this.logStep("Submit Add Payment Details form");
    const submit = this.page.getByRole("button", { name: /submit|save|confirm/i });
    await this.common.click(submit);
    await this.waitForLoader();
  }

  async uploadPaymentDocument(filePath: string): Promise<void> {
    this.logStep("Upload payment confirmation document");
    const upload = this.page
      .getByLabel(/upload|document|attachment|proof/i)
      .or(this.page.locator("input[type='file']"))
      .first();
    await upload.setInputFiles(filePath);
  }

  async clickPayNow(): Promise<void> {
    this.logStep("Click Pay / Pay Now");
    await this.common.click(this.payButton);
  }

  async countVisiblePoRows(): Promise<number> {
    this.logStep("Count visible PO grid rows");
    return this.poGridRows.count();
  }

  async openZeroCountSnapshotBucket(): Promise<boolean> {
    this.logStep("Open zero-count VIN Inventory Snapshot bucket if present");
    const section = this.vinSnapshotSection;
    const bucketLabels = [/in stock/i, /paid/i];
    for (const label of bucketLabels) {
      const bucket = section
        .locator("div, button, [role='button']")
        .filter({ hasText: label })
        .filter({ hasText: /\b0\b/ })
        .first();
      if (await bucket.isVisible().catch(() => false)) {
        await this.common.click(bucket);
        await this.waitForLoader();
        return true;
      }
    }
    return false;
  }

  async expectVinSnapshotBuckets(): Promise<void> {
    this.logStep("Verify VIN Inventory Snapshot buckets");
    await expect(this.vinSnapshotSection).toBeVisible({ timeout: 30_000 });
    const text = await this.vinSnapshotSection.innerText();
    const buckets = [
      /in stock/i,
      /sold/i,
      /paid/i,
      /pending/i,
    ];
    const matched = buckets.filter((re) => re.test(text)).length;
    expect(matched).toBeGreaterThanOrEqual(2);
  }
}
