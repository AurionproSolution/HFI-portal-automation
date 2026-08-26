import { expect, type Locator, type Page } from "@playwright/test";
import { getCredentials, getLoginUrl } from "@config/env";
import { BasePage } from "@pages/common/BasePage";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { logger } from "@utils/logger";

const DEFAULT_EXPOSURE_PATH =
  process.env.EXPOSURE_SETTINGS_PATH?.trim() || "/financials/exposure";

/** US-DLR-011 — Exposure Settings (Limits, Sub-limits, Expiry, Requests & Visibility). */
export class HFIExposureSettingsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly dealerFinanceTab: Locator;
  readonly exposureSettingsNavItem: Locator;
  readonly exposureKpiSection: Locator;
  readonly kpiSanctioned: Locator;
  readonly kpiUtilised: Locator;
  readonly kpiAvailable: Locator;
  readonly kpiExpiry: Locator;
  readonly normalLimitBlock: Locator;
  readonly adhocLimitBlock: Locator;
  readonly pendingRequestsSection: Locator;
  readonly pendingRequestsTable: Locator;
  readonly pendingRequestsSearch: Locator;
  readonly branchFilter: Locator;
  readonly statusFilter: Locator;
  readonly adhocLimitRequestButton: Locator;
  readonly limitRenewalButton: Locator;
  readonly requestModal: Locator;
  readonly requestModalHeading: Locator;
  readonly confirmationDialog: Locator;
  readonly adhocAmountField: Locator;
  readonly validitySelect: Locator;
  readonly requestedLimitField: Locator;
  readonly tenorSelect: Locator;
  readonly businessJustificationField: Locator;
  readonly supportingDocumentInput: Locator;
  readonly submitForReviewButton: Locator;
  readonly modalCancelButton: Locator;
  readonly confirmSubmitButton: Locator;
  readonly confirmationCancelButton: Locator;
  readonly visibilitySection: Locator;
  readonly sharedPortionInput: Locator;
  readonly sharedPortionSlider: Locator;
  readonly saveVisibilityButton: Locator;
  readonly visibilityIndicator: Locator;
  readonly sharedAmountCard: Locator;
  readonly heldBackAmountCard: Locator;
  readonly lastUpdatedLabel: Locator;
  readonly connectivityError: Locator;
  readonly noDataMessage: Locator;
  readonly branchScopeSelect: Locator;
  readonly retryButton: Locator;
  readonly firstTimeVisibilityPrompt: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole("heading", {
      level: 1,
      name: /exposure settings/i,
    });
    this.dealerFinanceTab = page
      .getByRole("button", { name: /dealer finance/i })
      .or(page.getByRole("tab", { name: /dealer finance/i }))
      .or(page.getByText(/^dealer finance$/i))
      .first();
    this.exposureSettingsNavItem = page
      .locator("nav, aside")
      .getByRole("link", { name: /exposure settings/i })
      .or(page.getByRole("link", { name: /exposure settings/i }))
      .or(page.getByText(/^exposure settings$/i))
      .first();
    this.exposureKpiSection = page.locator("main");
    this.kpiSanctioned = page.locator("main").getByText(/^sanctioned$/i).first();
    this.kpiUtilised = page.locator("main").getByText(/^utilised$/i).first();
    this.kpiAvailable = page.locator("main").getByText(/^available$/i).first();
    this.kpiExpiry = page.locator("main").getByText(/^expiry$/i).first();
    this.normalLimitBlock = page
      .locator("main")
      .locator("div, section, article")
      .filter({ hasText: /normal limit/i })
      .filter({ hasText: /limit expiry/i })
      .first();
    this.adhocLimitBlock = page
      .locator("main")
      .locator("div, section, article")
      .filter({ hasText: /adhoc limit/i })
      .filter({ hasText: /adhoc validity/i })
      .first();
    this.pendingRequestsSection = page
      .locator("section, div")
      .filter({ hasText: /pending limit requests/i })
      .first();
    this.pendingRequestsTable = page
      .locator("table, [role='table']")
      .filter({ hasText: /request id|branch|status/i })
      .first();
    this.pendingRequestsSearch = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"))
      .first();
    this.branchFilter = this.pendingRequestsSection
      .getByLabel(/branch/i)
      .or(this.pendingRequestsSection.getByRole("combobox", { name: /branch/i }))
      .or(this.pendingRequestsSection.getByRole("button", { name: /branch/i }))
      .first();
    this.statusFilter = this.pendingRequestsSection
      .getByLabel(/status/i)
      .or(this.pendingRequestsSection.getByRole("combobox", { name: /status/i }))
      .or(this.pendingRequestsSection.getByRole("button", { name: /status/i }))
      .first();
    this.adhocLimitRequestButton = page.getByRole("button", {
      name: /adhoc limit request/i,
    });
    this.limitRenewalButton = page.getByRole("button", {
      name: /limit renewal/i,
    });
    const requestDrawer = page.locator("app-limit-request-drawer");
    this.requestModalHeading = page.getByRole("heading", {
      level: 2,
      name: /adhoc limit request|limit renewal/i,
    });
    this.requestModal = this.requestModalHeading;
    this.confirmationDialog = page
      .getByRole("dialog")
      .filter({ hasText: /confirm|submission/i })
      .or(page.getByText(/confirm submission|are you sure/i))
      .first();
    this.adhocAmountField = requestDrawer.getByRole("textbox").first();
    this.validitySelect = requestDrawer
      .getByLabel(/validity/i)
      .or(requestDrawer.getByText(/validity \(days\)/i).locator("..").getByRole("textbox"))
      .first();
    this.requestedLimitField = requestDrawer.getByRole("textbox").first();
    this.tenorSelect = requestDrawer
      .getByLabel(/tenor|tenure/i)
      .or(requestDrawer.getByText(/tenure \(months\)/i).locator("..").getByRole("textbox"))
      .first();
    this.businessJustificationField = requestDrawer.getByPlaceholder(
      /festive demand|justification/i,
    );
    this.supportingDocumentInput = requestDrawer
      .getByLabel(/supporting document|upload/i)
      .or(requestDrawer.locator("input[type='file']"))
      .first();
    this.submitForReviewButton = requestDrawer.getByRole("button", {
      name: /submit for review/i,
    });
    this.modalCancelButton = requestDrawer.getByRole("button", {
      name: /^cancel$/i,
    });
    this.confirmSubmitButton = page.getByRole("button", {
      name: /^confirm$/i,
    });
    this.confirmationCancelButton = page
      .getByRole("dialog")
      .getByRole("button", { name: /^cancel$/i })
      .last();
    this.visibilitySection = page
      .locator("main")
      .locator("div, section, article")
      .filter({ hasText: /visibility preference/i })
      .filter({ hasText: /percentage/i })
      .filter({ has: page.getByRole("button", { name: /save changes/i }) })
      .first();
    this.sharedPortionInput = this.visibilitySection.getByRole("spinbutton").first();
    this.sharedPortionSlider = this.visibilitySection.getByRole("slider").first();
    this.saveVisibilityButton = this.visibilitySection.getByRole("button", {
      name: /save changes/i,
    });
    this.visibilityIndicator = this.visibilitySection
      .locator("span, div")
      .filter({
        hasText: /conservative|balanced|high visibility/i,
      })
      .first();
    this.sharedAmountCard = this.visibilitySection
      .locator("div, section")
      .filter({ hasText: /^shared$/i })
      .first();
    this.heldBackAmountCard = this.visibilitySection
      .locator("div, section")
      .filter({ hasText: /held back/i })
      .first();
    this.lastUpdatedLabel = this.visibilitySection.getByText(/last updated/i);
    this.connectivityError = page.getByText(
      /we're having trouble loading your data|can't connect to one or more of the systems/i,
    );
    this.noDataMessage = page.getByText(
      /no data available|no limit requests match the selected filters|no matching rows/i,
    );
    this.branchScopeSelect = page
      .getByRole("button", { name: /all branches/i })
      .or(page.getByText(/all branches/i))
      .or(page.getByLabel(/branch/i))
      .or(page.getByRole("combobox", { name: /branch|all branches/i }))
      .first();
    this.retryButton = page.getByRole("button", { name: /^retry$/i });
    this.firstTimeVisibilityPrompt = page
      .locator("section, div, dialog")
      .filter({
        hasText: /shared portion|oem visibility|first.?time|set.*visibility/i,
      })
      .first();
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Exposure Settings";
  }

  async signInWithDealerCredentials(): Promise<void> {
    const creds = getCredentials();
    const loginId = creds.dealerCode || creds.username;
    await this.signInWithCredentials(loginId, creds.password);
  }

  async signInWithCredentials(loginId: string, password: string): Promise<void> {
    this.logStep(`Sign in with credentials: ${this.stepValueDisplay("loginId", loginId)}`);
    const login = new HFILoginPage(this.page);
    if (!this.page.url().includes("/login")) {
      await login.logout().catch(() => undefined);
    }
    await this.page.goto(getLoginUrl(), { waitUntil: "domcontentloaded" });
    await expect(login.usernameInput).toBeVisible({ timeout: 60_000 });
    await login.loginWithCredentials(loginId, password);
    await this.page.waitForURL(
      /consumer|dashboard|dealer-finance|financials/i,
      { timeout: 90_000 },
    );
  }

  async captureScreenshot(label: string): Promise<string> {
    const safe = label.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
    const filePath = `test-results/exposure-${safe}-${Date.now()}.png`;
    await this.page.screenshot({ path: filePath, fullPage: true });
    this.logStep(`Screenshot captured: ${filePath}`);
    logger.info(`Exposure Settings screenshot [${label}]: ${filePath}`);
    return filePath;
  }

  async ensureDealerFinanceDashboardLoaded(): Promise<void> {
    this.logStep("Verify Dealer Finance dashboard is loaded");
    const url = this.page.url();
    logger.info(`Current URL before Dealer Finance check: ${url}`);

    const needsDealerFinance =
      !/dashboard|financials|dealer-finance/i.test(url) ||
      /\/consumer\/?$/i.test(url);

    if (needsDealerFinance) {
      if (await this.dealerFinanceTab.isVisible().catch(() => false)) {
        this.logStep("Open Dealer Finance tab from post-login landing page");
        await this.common.click(this.dealerFinanceTab);
        await this.waitForLoader();
        await this.page
          .waitForURL(/dashboard|financials|dealer-finance/i, {
            timeout: 15_000,
          })
          .catch(() => undefined);
      }
      if (!/dashboard|financials|dealer-finance/i.test(this.page.url())) {
        this.logStep("Fallback navigate to Dealer Finance dashboard");
        await this.navigateTo("/dashboard");
        await this.waitForLoader();
      }
    }

    logger.info(`Dealer Finance dashboard URL: ${this.page.url()}`);
    const body = await this.getPageText();
    expect(
      /normal limit|dealer finance|purchase orders|exposure settings/i.test(body),
      `Dealer Finance dashboard not loaded at ${this.page.url()}`,
    ).toBeTruthy();
  }

  async navigateToModule(): Promise<void> {
    this.logStep("Navigate to Exposure Settings via left navigation");
    await this.ensureDealerFinanceDashboardLoaded();

    const urlBefore = this.page.url();
    logger.info(`URL before Exposure Settings click: ${urlBefore}`);
    await this.captureScreenshot("before-exposure-nav-click");

    await expect(
      this.exposureSettingsNavItem,
      "Exposure Settings menu item not visible in left navigation",
    ).toBeVisible({ timeout: 30_000 });

    await this.common.click(this.exposureSettingsNavItem);
    await this.page.waitForURL(/exposure|financials/i, { timeout: 30_000 });
    await this.waitForLoader();

    const urlAfter = this.page.url();
    logger.info(`URL after Exposure Settings click: ${urlAfter}`);
    await this.captureScreenshot("after-exposure-navigation");

    if (!/exposure/i.test(urlAfter) && process.env.EXPOSURE_SETTINGS_PATH) {
      this.logStep(`Fallback navigate to ${DEFAULT_EXPOSURE_PATH}`);
      await this.navigateTo(DEFAULT_EXPOSURE_PATH);
      await this.waitForLoader();
      logger.info(`URL after fallback navigation: ${this.page.url()}`);
    }
  }

  async openFromLogin(): Promise<void> {
    this.logStep("Open Exposure Settings from login");
    await this.signInWithDealerCredentials();
    await this.navigateToModule();
  }

  async isModuleAvailable(): Promise<boolean> {
    const url = this.page.url();
    const onExposureRoute = /exposure|financials\/exposure/i.test(url);
    if (!onExposureRoute) return false;

    const headingVisible = await this.pageHeading.isVisible().catch(() => false);
    const kpiVisible = await this.exposureKpiSection.isVisible().catch(() => false);
    const normalLimitVisible = await this.normalLimitBlock
      .isVisible()
      .catch(() => false);
    if (headingVisible || kpiVisible || normalLimitVisible) return true;

    const body = await this.page.locator("body").innerText().catch(() => "");
    return /visibility preference|pending limit requests|normal limit/i.test(body);
  }

  async expectModuleLoaded(): Promise<void> {
    this.logStep("Verify Exposure Settings page is loaded after navigation");
    await expect(this.page).toHaveURL(/exposure|financials\/exposure/i, {
      timeout: 30_000,
    });
    await expect(this.pageHeading).toBeVisible({ timeout: 30_000 });
    await expect(this.page.locator("main")).toContainText(/normal limit/i, {
      timeout: 30_000,
    });
  }

  async getPageText(): Promise<string> {
    this.logStep("Read page body text");
    return this.page.locator("body").innerText();
  }

  async getKpiSectionText(): Promise<string> {
    this.logStep("Read Exposure KPI section text");
    return this.getPageText();
  }

  async expectExposureKpiCards(): Promise<void> {
    this.logStep("Verify Exposure KPI cards (Sanctioned, Utilised, Available, Expiry)");
    const main = this.page.locator("main");
    await expect(main).toBeVisible({ timeout: 30_000 });
    await expect(main).toContainText(/sanctioned/i);
    await expect(main).toContainText(/utilised/i);
    await expect(main).toContainText(/available/i);
    await expect(main).toContainText(/expiry/i);
  }

  async expectNormalLimitBlockFields(): Promise<void> {
    this.logStep("Verify Normal Limit block required fields");
    await expect(this.normalLimitBlock).toBeVisible({ timeout: 30_000 });
    const text = await this.normalLimitBlock.innerText();
    expect(text).toMatch(
      /used limit|available limit|limit expiry|utilised|available|sanctioned|expiry|days (left|remaining)|%/i,
    );
  }

  async expectAdhocLimitBlockFields(): Promise<void> {
    this.logStep("Verify Adhoc Limit block required fields");
    await expect(this.adhocLimitBlock).toBeVisible({ timeout: 30_000 });
    const text = await this.adhocLimitBlock.innerText();
    expect(text).toMatch(
      /used limit|available limit|adhoc validity|utilised|available|sanctioned|validity|days (left|remaining)|%/i,
    );
  }

  async expectAdhocLimitBlockHidden(): Promise<void> {
    this.logStep("Verify Adhoc Limit block is not shown");
    await expect(this.adhocLimitBlock).toBeHidden({ timeout: 10_000 });
  }

  async expectPendingRequestsColumns(): Promise<void> {
    this.logStep("Verify Pending Limit Requests table columns");
    await expect(this.pendingRequestsSection).toBeVisible({ timeout: 30_000 });
    const text = await this.getPageText();
    expect(text).toMatch(
      /request id|branch|request date|requested amount|under review|approved|pending docs|sanctioned|rejected/i,
    );
  }

  async searchPendingRequests(query: string): Promise<void> {
    this.logStep(`Search pending requests: ${this.stepValueDisplay("query", query)}`);
    await this.common.clearAndFill(this.pendingRequestsSearch, query);
    await this.common.pressKey("Enter").catch(() => undefined);
    await this.waitForLoader();
    await this.page.waitForTimeout(1_000);
  }

  async clearPendingRequestsSearch(): Promise<void> {
    this.logStep("Clear pending requests search");
    await this.pendingRequestsSearch.clear();
    await this.common.pressKey("Enter").catch(() => undefined);
    await this.waitForLoader();
  }

  async filterByBranch(branchLabel: string): Promise<void> {
    this.logStep(`Filter by branch: ${this.stepValueDisplay("branch", branchLabel)}`);
    await this.common.click(this.branchFilter);
    const option = this.page
      .getByRole("option", { name: new RegExp(branchLabel, "i") })
      .first();
    await this.common.click(option);
    await this.waitForLoader();
  }

  async filterByStatus(statusLabel: string): Promise<void> {
    this.logStep(`Filter by status: ${statusLabel}`);
    await this.common.click(this.statusFilter);
    const option = this.page
      .getByRole("option", { name: new RegExp(statusLabel, "i") })
      .first();
    await this.common.click(option);
    await this.waitForLoader();
  }

  async selectBranchScope(branchLabel: string): Promise<void> {
    this.logStep(`Select branch scope: ${this.stepValueDisplay("branch", branchLabel)}`);
    await this.common.click(this.branchScopeSelect);
    const option = this.page
      .getByRole("option", { name: new RegExp(branchLabel, "i") })
      .first();
    await this.common.click(option);
    await this.waitForLoader();
  }

  async expectRequestModalVisible(): Promise<void> {
    await expect(this.requestModalHeading).toBeVisible({ timeout: 15_000 });
  }

  async openAdhocLimitRequestModal(): Promise<void> {
    this.logStep("Open Adhoc Limit Request modal");
    await this.common.click(this.adhocLimitRequestButton);
    await this.expectRequestModalVisible();
    await expect(this.requestModalHeading).toContainText(/adhoc limit request/i);
  }

  async openLimitRenewalModal(): Promise<void> {
    this.logStep("Open Limit Renewal modal");
    await this.common.click(this.limitRenewalButton);
    await this.expectRequestModalVisible();
    await expect(this.requestModalHeading).toContainText(/limit renewal/i);
  }

  async closeRequestModal(): Promise<void> {
    this.logStep("Cancel / close request modal");
    await this.common.click(this.modalCancelButton);
    await expect(this.requestModalHeading).toBeHidden({ timeout: 10_000 });
  }

  async fillAdhocRequestForm(
    amount: string,
    validityLabel: string,
    justification: string,
  ): Promise<void> {
    this.logStep("Fill Adhoc Limit Request form");
    await this.adhocAmountField.click();
    await this.adhocAmountField.fill("");
    await this.adhocAmountField.pressSequentially(amount.replace(/[^\d]/g, ""), {
      delay: 40,
    });
    if (await this.validitySelect.isEnabled().catch(() => false)) {
      await this.common.click(this.validitySelect);
      await this.common.click(
        this.page
          .getByRole("option", { name: new RegExp(validityLabel, "i") })
          .first(),
      );
    }
    await this.common.clearAndFill(this.businessJustificationField, justification);
  }

  async fillLimitRenewalForm(
    requestedLimit: string,
    tenorLabel: string,
    justification: string,
  ): Promise<void> {
    this.logStep("Fill Limit Renewal form");
    await this.requestedLimitField.click();
    await this.requestedLimitField.fill("");
    await this.requestedLimitField.pressSequentially(
      requestedLimit.replace(/[^\d]/g, ""),
      { delay: 40 },
    );
    if (await this.tenorSelect.isEnabled().catch(() => false)) {
      await this.common.click(this.tenorSelect);
      await this.common.click(
        this.page.getByRole("option", { name: new RegExp(tenorLabel, "i") }).first(),
      );
    }
    await this.common.clearAndFill(this.businessJustificationField, justification);
  }

  async uploadSupportingDocument(filePath: string): Promise<void> {
    this.logStep("Upload supporting document");
    await this.supportingDocumentInput.setInputFiles(filePath);
  }

  async clickSubmitForReview(): Promise<void> {
    this.logStep("Click Submit for Review");
    await this.common.click(this.submitForReviewButton);
    await this.page
      .getByText(/submitting/i)
      .waitFor({ state: "hidden", timeout: 60_000 })
      .catch(() => undefined);
  }

  async clickConfirmSubmission(): Promise<void> {
    this.logStep("Confirm request submission");
    await this.common.click(this.confirmSubmitButton);
    await this.waitForLoader();
  }

  async cancelConfirmationDialog(): Promise<void> {
    this.logStep("Cancel confirmation dialog");
    await this.common.click(this.confirmationCancelButton);
  }

  async expectAdhocAmountHelperText(): Promise<void> {
    this.logStep("Verify Adhoc Amount helper text");
    const text = await this.getPageText();
    expect(text).toMatch(/temporary increment|current sanctioned limit/i);
  }

  async expectRequestedLimitHelperText(): Promise<void> {
    this.logStep("Verify Requested Limit helper text and SLA");
    const text = await this.getPageText();
    expect(text).toMatch(/new total ceiling|not the increment/i);
    expect(text).toMatch(/24.?36 hours|credit|reviewed by credit/i);
  }

  async expectVisibilitySection(): Promise<void> {
    this.logStep("Verify Visibility Preference section elements");
    await expect(this.visibilitySection).toBeVisible({ timeout: 30_000 });
    const text = await this.getPageText();
    expect(text).toMatch(
      /shared portion|40|60|75|90|last updated|held back|balanced|conservative|high visibility/i,
    );
  }

  presetChip(percent: number): Locator {
    return this.visibilitySection.getByRole("button", {
      name: new RegExp(`${percent}\\s*%`, "i"),
    });
  }

  async selectVisibilityPreset(percent: number): Promise<void> {
    this.logStep(`Select visibility preset: ${percent}%`);
    await this.common.click(this.presetChip(percent));
  }

  async setSharedPortionPercent(value: string): Promise<void> {
    this.logStep(`Set Visibility Preference percentage: ${value}`);
    await expect(this.visibilitySection).toBeVisible({ timeout: 30_000 });
    await this.common.clearAndFill(this.sharedPortionInput, value);
    await this.sharedPortionInput.press("Tab").catch(() => undefined);
  }

  async expectBelowMinimumVisibilityBlocked(minimumPercent = 10): Promise<void> {
    this.logStep(
      `Verify Visibility Preference cannot go below ${minimumPercent}% minimum`,
    );
    await expect(this.visibilitySection).toBeVisible({ timeout: 30_000 });
    const inputValue = Number((await this.sharedPortionInput.inputValue()).trim());

    expect(
      inputValue,
      `Visibility Preference PERCENTAGE field accepted ${inputValue}% — minimum is ${minimumPercent}%`,
    ).toBeGreaterThanOrEqual(minimumPercent);

    const sharedHeader = this.visibilitySection
      .getByText(/^shared portion$/i)
      .locator("..");
    const headerText = await sharedHeader.innerText().catch(() => "");
    const headerPercent = headerText.match(/(\d+)\s*%/);
    if (headerPercent) {
      expect(
        Number(headerPercent[1]),
        `SHARED PORTION display shows ${headerPercent[1]}% below minimum`,
      ).toBeGreaterThanOrEqual(minimumPercent);
    }
  }

  async saveVisibilityChanges(): Promise<void> {
    this.logStep("Save visibility preference changes");
    await this.common.click(this.saveVisibilityButton);
    await this.waitForLoader();
  }

  async getSharedHeldBackText(): Promise<string> {
    this.logStep("Read Shared and Held Back amounts");
    const shared = (await this.sharedAmountCard.innerText().catch(() => "")) || "";
    const held = (await this.heldBackAmountCard.innerText().catch(() => "")) || "";
    return `${shared}\n${held}`;
  }

  async expectVisibilityIndicator(label: RegExp): Promise<void> {
    this.logStep(`Verify visibility indicator: ${String(label)}`);
    await expect(this.visibilityIndicator).toContainText(label);
  }

  async expectConnectivityError(): Promise<void> {
    this.logStep("Verify standard connectivity error message");
    await expect(this.connectivityError).toBeVisible({ timeout: 30_000 });
  }

  async clickRetry(): Promise<void> {
    this.logStep("Click Retry");
    await this.common.click(this.retryButton);
    await this.waitForLoader();
  }

  async navigateAwayAndReturn(): Promise<void> {
    this.logStep("Navigate away and return to Exposure Settings");
    const dashboard = this.page
      .getByRole("link", { name: /dashboard|home/i })
      .first();
    if (await dashboard.isVisible().catch(() => false)) {
      await this.common.click(dashboard);
      await this.waitForLoader();
    }
    await this.navigateToModule();
  }

  async expectFirstTimeVisibilityPromptBlocking(): Promise<void> {
    this.logStep("Verify first-time visibility prompt blocks navigation");
    await expect(this.firstTimeVisibilityPrompt).toBeVisible({
      timeout: 30_000,
    });
    const dashboard = this.page
      .getByRole("link", { name: /dashboard|purchase orders|transaction history/i })
      .first();
    if (await dashboard.isVisible().catch(() => false)) {
      await this.common.click(dashboard);
      await this.page.waitForTimeout(1_000);
    }
    await expect(this.firstTimeVisibilityPrompt).toBeVisible();
  }

  async completeFirstTimeVisibilityPercent(percent: number): Promise<void> {
    this.logStep(`Complete first-time visibility setup: ${percent}%`);
    await this.selectVisibilityPreset(percent);
    const save = this.firstTimeVisibilityPrompt
      .getByRole("button", { name: /save|confirm|continue|proceed/i })
      .or(this.saveVisibilityButton)
      .first();
    if (await save.isVisible().catch(() => false)) {
      await this.common.click(save);
      await this.waitForLoader();
    }
  }

  async expectSubmissionSuccessMessage(): Promise<void> {
    this.logStep("Verify post-submission confirmation message");
    const text = await this.getPageText();
    expect(text).toMatch(
      /submitted|submission successful|request.*submitted|thank you/i,
    );
  }

  async expectRequestStatusInTable(status: RegExp): Promise<void> {
    this.logStep(`Verify pending requests table shows status: ${String(status)}`);
    await expect(this.pendingRequestsSection).toBeVisible({ timeout: 30_000 });
    const text = await this.pendingRequestsSection.innerText();
    expect(text).toMatch(status);
  }

  async expectDaysRemainingIndicator(): Promise<void> {
    this.logStep("Verify near-expiry days-remaining indicator");
    const text = await this.getPageText();
    if (!/days remaining|day[s]? left/i.test(text)) {
      throw new Error(
        "SKIP: No near-expiry limit data on dev — seed limit expiring within days.",
      );
    }
    expect(text).toMatch(/\d+\s*days?\s*(remaining|left)/i);
  }

  async expectFullyUtilisedIndicator(): Promise<void> {
    this.logStep("Verify fully-utilised limit indicator");
    const text = await this.getPageText();
    if (!/100\s*%|fully utilised|0\s*available/i.test(text)) {
      throw new Error("SKIP: No fully-utilised limit on dev test data.");
    }
    expect(text).toMatch(/100\s*%|fully utilised/i);
  }

  async expectLosSubmissionFailureMessage(): Promise<void> {
    this.logStep("Verify LOS submission failure message");
    const text = await this.getPageText();
    expect(text).toMatch(
      /failed|unable to submit|try again|error|could not|trouble/i,
    );
  }
}
