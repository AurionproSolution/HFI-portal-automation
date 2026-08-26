import { expect, type Locator, type Page } from "@playwright/test";
import { getCredentials, getLoginUrl } from "@config/env";
import { BasePage } from "@pages/common/BasePage";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { logger } from "@utils/logger";

const DEFAULT_TXN_HISTORY_PATH =
  process.env.TRANSACTION_HISTORY_PATH?.trim() ||
  "/financials/transactions";

export type TxnHistoryDateRangePreset =
  | "7D"
  | "30D"
  | "MTD"
  | "90D"
  | "YTD"
  | "Custom";

const TXN_HISTORY_DATE_RANGE_PRESETS: TxnHistoryDateRangePreset[] = [
  "7D",
  "30D",
  "MTD",
  "90D",
  "YTD",
  "Custom",
];

/** US-DLR-010 — Transaction History (Ledger, Balances & Online Payments). */
export class HFITransactionHistoryPage extends BasePage {
  readonly pageHeading: Locator;
  readonly dealerFinanceTab: Locator;
  readonly transactionHistoryNavItem: Locator;
  readonly kpiOpeningBalance: Locator;
  readonly kpiTotalDebit: Locator;
  readonly kpiTotalCredit: Locator;
  readonly kpiClosingBalance: Locator;
  readonly onlinePaymentsBanner: Locator;
  readonly payNowButton: Locator;
  readonly ledgerGrid: Locator;
  readonly ledgerRows: Locator;
  readonly ledgerSummary: Locator;
  readonly searchInput: Locator;
  readonly exportButton: Locator;
  readonly branchFilter: Locator;
  readonly periodFilter: Locator;
  readonly consolidatedBranchToggle: Locator;
  readonly connectivityError: Locator;
  readonly retryButton: Locator;
  readonly noDataMessage: Locator;
  readonly onlinePaymentPanel: Locator;
  readonly proceedToPayButton: Locator;
  readonly cancelPaymentButton: Locator;
  readonly amountField: Locator;
  readonly payAgainstSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /^transaction history$/i })
      .first();
    this.dealerFinanceTab = page.getByRole("link", { name: /dealer finance/i });
    this.transactionHistoryNavItem = page
      .locator("nav, aside")
      .getByRole("link", { name: /transaction history/i })
      .or(page.getByRole("link", { name: /transaction history/i }))
      .first();
    this.kpiOpeningBalance = page
      .locator("div, section, main")
      .filter({ hasText: /opening balance/i })
      .first();
    this.kpiTotalDebit = page
      .locator("div, section, main")
      .filter({ hasText: /total debit/i })
      .first();
    this.kpiTotalCredit = page
      .locator("div, section, main")
      .filter({ hasText: /total credit/i })
      .first();
    this.kpiClosingBalance = page
      .locator("div, section, main")
      .filter({ hasText: /closing balance/i })
      .first();
    this.onlinePaymentsBanner = page
      .locator("section, div")
      .filter({ hasText: /online payments|total dues today|overdue/i })
      .first();
    this.payNowButton = page.getByRole("button", { name: /^pay\s*now$/i });
    this.ledgerGrid = page
      .locator("table, [role='table'], [role='grid']")
      .filter({ hasText: /purchase order|po date|entries|debit/i })
      .first();
    this.ledgerRows = this.ledgerGrid.locator("tbody tr, [role='row']").filter({
      hasNot: page.locator("th"),
    });
    this.ledgerSummary = page.getByText(
      /pos?\s*[·x×]\s*\d+\s+entries|\d+\s+of\s+\d+\s+pos?/i,
    );
    this.searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"))
      .or(page.locator("input[type='search']"))
      .first();
    this.exportButton = page.getByRole("button", { name: /export\s*csv/i });
    this.branchFilter = page
      .getByRole("button", { name: /all branches|branch/i })
      .first();
    this.periodFilter = page
      .getByRole("button", { name: /^(7D|30D|MTD|90D|YTD|Custom)$/i })
      .first();
    this.consolidatedBranchToggle = page
      .getByRole("button", { name: /consolidated|all branches/i })
      .first();
    this.connectivityError = page.getByText(
      /we're having trouble loading your data|can't connect to one or more of the systems/i,
    );
    this.retryButton = page.getByRole("button", { name: /^retry$/i });
    this.noDataMessage = page.getByText(
      /no transactions match|no data available/i,
    );
    this.onlinePaymentPanel = page
      .locator("[role='dialog']")
      .filter({ has: page.getByRole("button", { name: /proceed to pay/i }) })
      .or(
        page.locator("section, aside, div").filter({
          has: page.getByRole("button", { name: /proceed to pay/i }),
        }),
      )
      .last();
    this.proceedToPayButton = page.getByRole("button", {
      name: /proceed to pay/i,
    });
    this.cancelPaymentButton = page.getByRole("button", { name: /^cancel$/i });
    this.amountField = page
      .getByLabel(/amount/i)
      .or(page.getByPlaceholder(/amount|0\.00/i))
      .or(page.getByRole("textbox", { name: /amount|0\.00/i }))
      .first();
    this.payAgainstSelect = page
      .getByLabel(/pay against/i)
      .or(page.getByRole("combobox", { name: /pay against/i }))
      .first();
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Transaction History";
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
      /transaction history|purchase orders|dealer finance|exposure settings|dashboard/i.test(
        body,
      ),
      `Dealer Finance dashboard not loaded at ${this.page.url()}`,
    ).toBeTruthy();
  }

  async navigateToModule(): Promise<void> {
    this.logStep("Navigate to Transaction History via left navigation");
    await this.ensureDealerFinanceDashboardLoaded();

    const urlBefore = this.page.url();
    logger.info(`URL before Transaction History click: ${urlBefore}`);

    await expect(
      this.transactionHistoryNavItem,
      "Transaction History menu item not visible in left navigation",
    ).toBeVisible({ timeout: 30_000 });

    await this.common.click(this.transactionHistoryNavItem);
    await this.page.waitForURL(/financials\/transactions|transaction-history/i, {
      timeout: 30_000,
    });
    await this.waitForLoader();

    const urlAfter = this.page.url();
    logger.info(`URL after Transaction History navigation: ${urlAfter}`);

    if (!/financials\/transactions|transaction-history/i.test(urlAfter)) {
      this.logStep(`Fallback navigate to ${DEFAULT_TXN_HISTORY_PATH}`);
      await this.navigateTo(DEFAULT_TXN_HISTORY_PATH);
      await this.waitForLoader();
      logger.info(`URL after fallback navigation: ${this.page.url()}`);
    }
  }

  async openFromLogin(): Promise<void> {
    this.logStep("Open Transaction History from login");
    await this.signInWithDealerCredentials();
    await this.navigateToModule();
  }

  async openFromDashboardAction(): Promise<void> {
    this.logStep("Open Transaction History via dashboard action");
    await this.signInWithDealerCredentials();
    await this.ensureDealerFinanceDashboardLoaded();

    const dashboardActions = [
      this.page.getByRole("link", { name: /transaction history|view ledger/i }),
      this.page.getByRole("button", { name: /transaction history|view ledger/i }),
      this.page.getByRole("link", { name: /pay dues/i }),
    ];

    for (const action of dashboardActions) {
      if (await action.first().isVisible().catch(() => false)) {
        await this.common.click(action.first());
        await this.waitForLoader();
        if (await this.isModuleAvailable()) {
          return;
        }
      }
    }

    await this.navigateToModule();
  }

  async isModuleAvailable(): Promise<boolean> {
    const urlOk = /financials\/transactions|transaction-history/i.test(
      this.page.url(),
    );
    const heading = await this.pageHeading.isVisible().catch(() => false);
    const kpi = await this.kpiOpeningBalance.isVisible().catch(() => false);
    return urlOk && (heading || kpi);
  }

  async expectModuleLoaded(): Promise<void> {
    this.logStep("Verify Transaction History module is loaded");
    expect(
      await this.isModuleAvailable(),
      `Transaction History not found at ${this.page.url()}. Set TRANSACTION_HISTORY_PATH or use dealer8 with Dealer Finance.`,
    ).toBeTruthy();
  }

  async expectBalanceKpiCards(): Promise<void> {
    this.logStep("Verify Balance KPI cards (Opening, Debit, Credit, Closing)");
    await expect(this.kpiOpeningBalance).toBeVisible({ timeout: 30_000 });
    await expect(this.kpiTotalDebit).toBeVisible();
    await expect(this.kpiTotalCredit).toBeVisible();
    await expect(this.kpiClosingBalance).toBeVisible();
  }

  async getKpiSectionText(): Promise<string> {
    this.logStep("Read Balance KPI section text");
    return this.page.locator("body").innerText();
  }

  async getPageText(): Promise<string> {
    this.logStep("Read page body text");
    return this.page.locator("body").innerText();
  }

  async expectOnlinePaymentsBanner(): Promise<void> {
    this.logStep("Verify Online Payments banner content");
    await expect(this.onlinePaymentsBanner).toBeVisible({ timeout: 30_000 });
    const text = await this.getPageText();
    expect(text).toMatch(/neft|rtgs|upi|mandate|t\+0|total dues|overdue/i);
    await expect(this.payNowButton).toBeVisible();
  }

  async expectLedgerColumnHeaders(): Promise<void> {
    this.logStep("Verify PO-wise ledger column headers");
    const text = await this.getPageText();
    expect(text).toMatch(/purchase order|po date|vehicle|po value|entries|debit/i);
  }

  dateRangePresetButton(preset: TxnHistoryDateRangePreset): Locator {
    return this.page.getByRole("button", { name: new RegExp(`^${preset}$`, "i") });
  }

  async selectDateRangePreset(preset: TxnHistoryDateRangePreset): Promise<void> {
    this.logStep(`Select date range preset: ${preset}`);
    const button = this.dateRangePresetButton(preset);
    await expect(button).toBeVisible({ timeout: 15_000 });
    await this.common.click(button);
    await this.waitForLoader();
  }

  async ensureLedgerData(
    presets: TxnHistoryDateRangePreset[] = ["30D", "90D", "7D", "MTD", "YTD"],
  ): Promise<void> {
    this.logStep(
      `Ensure ledger has data (presets: ${presets.join(", ")})`,
    );
    if (await this.hasLedgerRows()) {
      return;
    }
    for (const preset of presets) {
      if (!(await this.dateRangePresetButton(preset).isVisible().catch(() => false))) {
        continue;
      }
      await this.selectDateRangePreset(preset);
      if (await this.hasLedgerRows()) {
        this.logStep(`Ledger data visible under date range: ${preset}`);
        return;
      }
    }
  }

  async hasLedgerRows(): Promise<boolean> {
    const text = await this.getPageText();
    if (/no transactions match the selected filters/i.test(text)) {
      return false;
    }
    return /PO-\d{4}-\d+/i.test(text);
  }

  extractPoIdentifierFromText(text: string): string | undefined {
    const match = text.match(/PO-\d{4}-\d+/i);
    return match?.[0];
  }

  async expandPoRow(identifier: string): Promise<void> {
    this.logStep(`Expand PO ledger row: ${identifier}`);
    const row = this.ledgerGrid
      .locator("tr, [role='row']")
      .filter({ hasText: new RegExp(identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") })
      .first();
    const collapseBtn = row.getByRole("button", { name: /^collapse$/i }).first();
    if (await collapseBtn.isVisible().catch(() => false)) {
      return;
    }
    const expand = row
      .getByRole("button", { name: /^expand$/i })
      .or(row.getByRole("button", { name: /expand|chevron|toggle/i }))
      .first();
    if (await expand.isVisible().catch(() => false)) {
      await this.common.click(expand);
    } else {
      await this.common.click(row);
    }
    await this.waitForLoader();
  }

  async collapsePoRow(identifier: string): Promise<void> {
    this.logStep(`Collapse PO ledger row: ${identifier}`);
    const row = this.ledgerGrid
      .locator("tr, [role='row']")
      .filter({ hasText: new RegExp(identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") })
      .first();
    const collapse = row
      .getByRole("button", { name: /^collapse$/i })
      .or(row.getByRole("button", { name: /collapse|chevron/i }))
      .first();
    if (await collapse.isVisible().catch(() => false)) {
      await this.common.click(collapse);
    } else {
      await this.common.click(row);
    }
    await this.waitForLoader();
  }

  async search(query: string): Promise<void> {
    this.logStep(`Search ledger: ${this.stepValueDisplay("query", query)}`);
    const search = this.searchInput;
    await search.scrollIntoViewIfNeeded().catch(() => undefined);
    if (!(await search.isVisible({ timeout: 10_000 }).catch(() => false))) {
      throw new Error("SKIP: Ledger search input not visible on page.");
    }
    await this.common.clearAndFill(this.searchInput, query);
    await this.common.pressKey("Enter").catch(() => undefined);
    await this.waitForLoader();
    await this.page.waitForTimeout(1_500);
  }

  async clearSearch(): Promise<void> {
    this.logStep("Clear ledger search filter");
    await this.searchInput.clear();
    await this.common.pressKey("Enter").catch(() => undefined);
    await this.waitForLoader();
  }

  async selectBranch(branchLabel: string): Promise<void> {
    this.logStep(`Select branch filter: ${this.stepValueDisplay("branch", branchLabel)}`);
    await this.common.click(this.branchFilter);
    const option = this.page
      .getByRole("option", { name: new RegExp(branchLabel, "i") })
      .or(this.page.getByRole("menuitem", { name: new RegExp(branchLabel, "i") }))
      .or(this.page.getByRole("button", { name: new RegExp(branchLabel, "i") }))
      .first();
    await this.common.click(option);
    await this.waitForLoader();
  }

  async changePeriodFilter(optionLabel: RegExp | string): Promise<void> {
    this.logStep(`Change period filter: ${String(optionLabel)}`);
    if (typeof optionLabel === "string") {
      const preset = TXN_HISTORY_DATE_RANGE_PRESETS.find((p) =>
        new RegExp(optionLabel, "i").test(p),
      );
      if (preset) {
        await this.selectDateRangePreset(preset);
        return;
      }
    }

    const pattern =
      typeof optionLabel === "string"
        ? new RegExp(optionLabel, "i")
        : optionLabel;

    for (const preset of TXN_HISTORY_DATE_RANGE_PRESETS) {
      if (pattern.test(preset)) {
        await this.selectDateRangePreset(preset);
        return;
      }
    }

    if (pattern.test("7") || pattern.test("last 7")) {
      await this.selectDateRangePreset("7D");
      return;
    }
    if (pattern.test("90") || pattern.test("last 90")) {
      await this.selectDateRangePreset("90D");
      return;
    }
    if (pattern.test("month")) {
      await this.selectDateRangePreset("MTD");
      return;
    }

    const fallback = this.page.getByRole("button", { name: pattern }).first();
    if (await fallback.isVisible().catch(() => false)) {
      await this.common.click(fallback);
      await this.waitForLoader();
      return;
    }

    throw new Error("SKIP: Period filter option not available in UI.");
  }

  async selectCustomPeriodRange(): Promise<void> {
    this.logStep("Select custom period range");
    await this.selectDateRangePreset("Custom");
    const customUi = this.page
      .locator("main, [role='dialog']")
      .filter({ hasText: /custom|from|to|date/i });
    await expect(customUi.first()).toBeVisible({ timeout: 15_000 });
  }

  async toggleConsolidatedBranch(mode: "consolidated" | "branch"): Promise<void> {
    this.logStep(`Switch ledger scope to ${mode}`);
    const toggle = this.page
      .getByRole("button", { name: new RegExp(mode, "i") })
      .or(this.page.getByRole("tab", { name: new RegExp(mode, "i") }))
      .first();
    await this.common.click(toggle);
    await this.waitForLoader();
  }

  async openOnlinePaymentPanel(): Promise<void> {
    this.logStep("Open Online Payment panel via Pay Now");
    await this.payNowButton.scrollIntoViewIfNeeded();
    await this.common.click(this.payNowButton);
    await expect(this.onlinePaymentPanel).toBeVisible({ timeout: 15_000 });
  }

  async closeOnlinePaymentPanel(): Promise<void> {
    this.logStep("Cancel / close Online Payment panel");
    const panel = this.onlinePaymentPanel;
    const cancel = panel
      .getByRole("button", { name: /^cancel$/i })
      .or(panel.getByRole("button", { name: /^close$/i }))
      .first();
    await this.common.click(cancel);
    await expect(this.proceedToPayButton).toBeHidden({ timeout: 10_000 });
  }

  async fillAmount(value: string): Promise<void> {
    this.logStep(`Fill payment amount: ${this.stepValueDisplay("amount", value)}`);
    await this.common.clearAndFill(this.amountField, value);
  }

  async tryEnterAmountChars(chars: string): Promise<string> {
    this.logStep(`Attempt to enter amount characters: ${chars}`);
    await this.amountField.click();
    await this.amountField.fill("");
    await this.amountField.pressSequentially(chars, { delay: 30 });
    return this.getAmountFieldValue();
  }

  poEntryDetailRows(identifier: string): Locator {
    const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.page
      .locator("table tr, [role='row']")
      .filter({ hasText: new RegExp(escaped, "i") })
      .filter({ hasText: /transaction|reference|debit|credit|disbursement|repayment/i });
  }

  async expectPoEntriesHidden(identifier: string): Promise<void> {
    this.logStep(`Verify entry rows hidden for PO: ${identifier}`);
    await expect(this.poEntryDetailRows(identifier)).toHaveCount(0, {
      timeout: 10_000,
    });
  }

  async clearAmount(): Promise<void> {
    this.logStep("Clear payment amount field");
    await this.amountField.clear();
  }

  async clickProceedToPay(): Promise<void> {
    this.logStep("Click Proceed to Pay");
    await this.common.click(this.proceedToPayButton);
  }

  async selectAlternatePayAgainst(): Promise<void> {
    this.logStep("Select alternate Pay Against option");
    await this.common.click(this.payAgainstSelect);
    const alt = this.page
      .getByRole("option")
      .filter({ hasNotText: /outstanding dues/i })
      .first();
    if (await alt.isVisible().catch(() => false)) {
      await this.common.click(alt);
    }
  }

  async getAmountFieldValue(): Promise<string> {
    this.logStep("Read payment amount field value");
    return this.amountField.inputValue();
  }

  async expectKpiCardsReadOnly(): Promise<void> {
    this.logStep("Verify Balance KPI cards are read-only");
    const kpiArea = this.page
      .locator("main")
      .filter({ hasText: /opening balance/i })
      .filter({ hasText: /closing balance/i })
      .first();
    const inputs = kpiArea.locator(
      "input:not([type='hidden']), textarea, select, [contenteditable='true']",
    );
    expect(await inputs.count()).toBe(0);
  }

  async exportLedger(): Promise<void> {
    this.logStep("Export ledger as CSV");
    await this.common.click(this.exportButton);
  }

  async expectConnectivityError(): Promise<void> {
    this.logStep("Verify standard connectivity error message");
    await expect(this.connectivityError).toBeVisible({ timeout: 30_000 });
  }

  statusPill(text: RegExp): Locator {
    return this.page.locator("span, div").filter({ hasText: text }).first();
  }
}
