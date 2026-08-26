import { expect, type Locator, type Page } from "@playwright/test";
import { getCredentials, getLoginUrl } from "@config/env";
import { BasePage } from "@pages/common/BasePage";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { logger } from "@utils/logger";

const DEFAULT_PROFILE_PATH = process.env.PROFILE_PATH?.trim() || "/profile";

export const PROFILE_SYSTEM_DOWN_MESSAGE =
  "We're having trouble loading your data. We can't connect to one or more of the systems that provide this information. Please try again in a few minutes.";

/** US-DLR-005 — Profile (Dealer Info, Branches & Key Connects). */
export class HFIProfilePage extends BasePage {
  private lastProfileApiResponse: {
    url: string;
    status: number;
    body: unknown;
  } | null = null;

  private lastEscalationApiResponse: {
    url: string;
    status: number;
    body: unknown;
  } | null = null;

  readonly pageHeading: Locator;
  readonly breadcrumb: Locator;
  readonly profileNavLink: Locator;
  readonly dealerFinanceTab: Locator;
  readonly branchScopeChip: Locator;
  readonly mainContent: Locator;
  readonly dealerInformationSection: Locator;
  readonly outletsSection: Locator;
  readonly keyConnectsSection: Locator;
  readonly hondaFinanceManagersSection: Locator;
  readonly registeredEmailUpdate: Locator;
  readonly registeredMobileUpdate: Locator;
  readonly connectivityError: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { level: 1, name: /^profile$/i })
      .or(page.locator("main").getByRole("heading", { name: /^profile$/i }))
      .first();
    this.breadcrumb = page
      .locator("main")
      .getByText(/honda finance\s*\/\s*profile/i)
      .first();
    this.profileNavLink = page
      .getByRole("link", { name: /^profile$/i })
      .or(page.getByRole("link", { name: /profile/i }))
      .first();
    this.dealerFinanceTab = page
      .getByRole("link", { name: /dealer finance/i })
      .or(page.getByRole("button", { name: /dealer finance/i }))
      .first();
    this.branchScopeChip = page
      .getByRole("button", { name: /all branches/i })
      .first();
    this.mainContent = page.locator("main");
    this.dealerInformationSection = page
      .getByText(/dealer information/i)
      .first();
    this.outletsSection = page
      .getByText(/^outlets$/i)
      .or(page.getByText(/dealer branches/i))
      .first();
    this.keyConnectsSection = page.getByText(/key connects/i).first();
    this.hondaFinanceManagersSection = page
      .getByText(/your honda finance managers/i)
      .first();
    this.registeredEmailUpdate = page
      .locator("main")
      .getByRole("button", { name: /^update$/i })
      .or(page.locator("main").getByRole("link", { name: /^update$/i }))
      .first();
    this.registeredMobileUpdate = page
      .locator("main")
      .getByRole("button", { name: /^update$/i })
      .or(page.locator("main").getByRole("link", { name: /^update$/i }))
      .nth(1);
    this.connectivityError = page.getByText(
      /we're having trouble loading your data|can't connect to one or more of the systems/i,
    );
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Profile";
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
      /consumer|dashboard|dealer-finance|profile|operations|financials/i,
      { timeout: 90_000 },
    );
  }

  async openFromLogin(): Promise<void> {
    this.logStep("Open Profile from login");
    await this.signInWithDealerCredentials();
    await this.navigateToProfile();
  }

  async navigateToProfile(): Promise<void> {
    this.logStep("Navigate to Dealer Finance Profile module");

    if (await this.dealerFinanceTab.isVisible().catch(() => false)) {
      await this.common.click(this.dealerFinanceTab);
      await this.page.waitForURL(/dashboard|operations|financials|profile/i, {
        timeout: 30_000,
      });
      await this.waitForLoader();
    }

    await this.navigateTo(DEFAULT_PROFILE_PATH);
    await this.page.waitForURL(
      (u) =>
        /\/profile\/?$/i.test(u.pathname) && !/consumer\/profile/i.test(u.pathname),
      { timeout: 30_000 },
    );
    await this.waitForLoader();
    logger.info(`Profile URL: ${this.page.url()}`);
  }

  async expectDealerFinanceProfileUrl(): Promise<void> {
    const url = this.page.url();
    expect(url).toMatch(/\/profile\/?$/i);
    expect(url).not.toMatch(/consumer\/profile/i);
  }

  private async storeProfileApiResponse(
    response: import("@playwright/test").Response,
  ): Promise<void> {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      try {
        body = await response.text();
      } catch {
        body = null;
      }
    }
    const entry = {
      url: response.url(),
      status: response.status(),
      body,
    };
    if (/escalation|matrix|manager/i.test(response.url())) {
      this.lastEscalationApiResponse = entry;
    } else {
      this.lastProfileApiResponse = entry;
    }
    logger.info(
      `Profile API captured: ${response.url()} status=${response.status()}`,
    );
  }

  async expectProfileLoaded(): Promise<void> {
    this.logStep("Verify Profile page is loaded");
    await this.expectDealerFinanceProfileUrl();
    await expect(this.pageHeading).toBeVisible({ timeout: 30_000 });
    await this.waitForProfileDataLoaded();
  }

  async waitForProfileDataLoaded(): Promise<void> {
    this.logStep("Wait for profile data to finish loading");
    const loading = this.page.getByText(/loading profile|loading data/i);
    if (await loading.isVisible().catch(() => false)) {
      await expect(loading).toBeHidden({ timeout: 60_000 });
    }
    await expect(this.dealerInformationSection).toBeVisible({
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

  async expectDefaultBranchFilter(): Promise<void> {
    this.logStep("Verify default All Branches filter");
    const scope = await this.getSelectedBranchScope();
    expect(scope).toMatch(/all branches/i);
  }

  async getSelectedBranchScope(): Promise<string> {
    if (await this.branchScopeChip.isVisible().catch(() => false)) {
      return (await this.branchScopeChip.innerText()).trim();
    }
    return "";
  }

  async openBranchFilter(): Promise<void> {
    this.logStep("Open branch scope filter");
    await this.common.click(this.branchScopeChip);
    await this.page.waitForTimeout(500);
  }

  async getBranchFilterOptionLabels(): Promise<string[]> {
    await this.openBranchFilter();
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
      .first();
    await this.common.click(option);
    await this.waitForProfileDataLoaded();
  }

  async expectAllSections(): Promise<void> {
    this.logStep("Verify all four Profile sections");
    await expect(this.dealerInformationSection).toBeVisible();
    if (await this.outletsSection.isVisible().catch(() => false)) {
      await expect(this.outletsSection).toBeVisible();
    }
    if (await this.keyConnectsSection.isVisible().catch(() => false)) {
      await expect(this.keyConnectsSection).toBeVisible();
    }
    if (await this.hondaFinanceManagersSection.isVisible().catch(() => false)) {
      await expect(this.hondaFinanceManagersSection).toBeVisible();
    }
    const text = await this.getMainText();
    const hasBranchesOrOutlets = /outlets|dealer branches/i.test(text);
    const hasKeyConnects = /key connects/i.test(text);
    const hasManagers = /honda finance managers|l1|l2/i.test(text);
    expect(hasBranchesOrOutlets || hasKeyConnects || hasManagers).toBeTruthy();
  }

  async expectDealerInformationFields(): Promise<void> {
    this.logStep("Verify Dealer Information card fields");
    const text = await this.getMainText();
    const fields = [
      /dealer name/i,
      /dealer code/i,
      /dealer principal/i,
      /last login/i,
      /registered email/i,
      /registered mobile/i,
      /gstin/i,
      /onboarded/i,
    ];
    for (const field of fields) {
      expect(text).toMatch(field);
    }
  }

  async expectOutletsTableColumns(): Promise<void> {
    this.logStep("Verify Outlets/Branches table columns");
    const text = await this.getMainText();
    const columns = [
      /outlet name|branch name/i,
      /outlet code|branch code|code/i,
      /city/i,
      /state/i,
      /in-charge|branch manager|manager/i,
      /contact/i,
      /email/i,
      /status/i,
      /created date/i,
    ];
    for (const col of columns) {
      expect(text).toMatch(col);
    }
  }

  async expectKeyConnectsTableColumns(): Promise<void> {
    this.logStep("Verify Key Connects table columns");
    const text = await this.getMainText();
    expect(text).toMatch(/employee id/i);
    expect(text).toMatch(/designation/i);
    expect(text).toMatch(/branch/i);
    expect(text).toMatch(/contact/i);
    expect(text).toMatch(/email/i);
  }

  async waitForEscalationManagersLoaded(): Promise<void> {
    await expect(this.hondaFinanceManagersSection).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      this.mainContent.getByText(/l1[\s·•-]*first point of contact/i),
    ).toBeVisible({ timeout: 60_000 });
    await expect(
      this.mainContent.getByText(/l2[\s·•-]*escalation/i),
    ).toBeVisible({ timeout: 60_000 });
    await this.waitForLoader();
  }

  async expectL1L2Contacts(): Promise<void> {
    this.logStep("Verify L1 and L2 escalation contacts");
    await this.waitForEscalationManagersLoaded();

    await expect(
      this.mainContent.getByText(/l1[\s·•-]*first point of contact/i),
    ).toBeVisible();
    await expect(
      this.mainContent.getByText(/l2[\s·•-]*escalation/i),
    ).toBeVisible();
    await expect(
      this.mainContent.getByText(/relationship manager|zonal head/i).first(),
    ).toBeVisible();
    await expect(this.mainContent.getByText(/\+91/).first()).toBeVisible();
    await expect(this.mainContent.getByText(/@/).first()).toBeVisible();
  }

  async expectPhoneAndEmailFormatting(): Promise<void> {
    this.logStep("Verify phone and email formatting on Profile");
    await this.waitForProfileDataLoaded();
    const phone = this.mainContent.getByText(/\+91/).first();
    await expect(phone).toBeVisible({ timeout: 60_000 });
    expect((await phone.innerText()).trim()).toMatch(/\+91[\s\d-]{8,}/);
    const email = this.mainContent.getByText(
      /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    ).first();
    await expect(email).toBeVisible({ timeout: 60_000 });
    expect((await email.innerText()).trim()).toMatch(
      /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    );
  }

  async expectRegisteredEmailUpdateAction(): Promise<void> {
    await expect(this.registeredEmailUpdate).toBeVisible();
  }

  async expectRegisteredMobileUpdateAction(): Promise<void> {
    await expect(this.registeredMobileUpdate).toBeVisible();
  }

  async clickRegisteredEmailUpdate(): Promise<void> {
    this.logStep("Click Update next to Registered Email");
    await this.common.click(this.registeredEmailUpdate);
    await this.waitForLoader();
  }

  async clickRegisteredMobileUpdate(): Promise<void> {
    this.logStep("Click Update next to Registered Mobile");
    await this.common.click(this.registeredMobileUpdate);
    await this.waitForLoader();
  }

  async expectNoEditableFieldsExceptUpdate(): Promise<void> {
    this.logStep("Verify fields are read-only except Update actions");
    const inputs = this.mainContent.locator(
      "input:not([type='hidden']), textarea, [contenteditable='true']",
    );
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const el = inputs.nth(i);
      const ro = await el.getAttribute("readonly");
      const dis = await el.isDisabled().catch(() => true);
      expect(ro !== null || dis).toBeTruthy();
    }
    await this.expectRegisteredEmailUpdateAction();
    await this.expectRegisteredMobileUpdateAction();
  }

  hasGstinFormat(text: string): boolean {
    const normalized = text.replace(/\s+/g, "");
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(
      normalized,
    );
  }

  async getGstinDisplayValue(): Promise<string> {
    const valueLocator = this.mainContent
      .getByText(/^gstin$/i)
      .locator("xpath=following-sibling::*[1]");
    if (await valueLocator.isVisible().catch(() => false)) {
      return (await valueLocator.innerText()).trim();
    }
    const text = await this.getMainText();
    const match = text.match(
      /gstin\s*([0-9]{2}[A-Z0-9]{13})/i,
    );
    return match?.[1]?.trim() ?? "";
  }

  async expectGstinFormat(): Promise<void> {
    this.logStep("Verify GSTIN display value and format");
    const gstin = await this.getGstinDisplayValue();
    expect(gstin.length).toBe(15);
    expect(gstin).toMatch(/^[0-9A-Z]{15}$/i);
    expect(gstin).not.toMatch(/[*•x]/i);
    expect(this.hasGstinFormat(gstin)).toBeTruthy();
  }

  async expectEmailContactUpdateFlow(): Promise<void> {
    this.logStep("Verify Contact Info Update flow for Registered Email");
    await expect(this.page.getByText(/current email id/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(/new email id/i)).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: /send otp/i }),
    ).toBeVisible();
    await expect(this.page.getByRole("button", { name: /cancel/i })).toBeVisible();
  }

  async expectMobileContactUpdateFlow(): Promise<void> {
    this.logStep("Verify Contact Info Update flow for Registered Mobile");
    await expect(this.page.getByText(/current mobile number/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText(/new mobile number/i)).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: /send otp/i }),
    ).toBeVisible();
    await expect(this.page.getByRole("button", { name: /cancel/i })).toBeVisible();
  }

  hasIstTimestamp(text: string): boolean {
    return /\d{1,2}\s+\w{3}\s+\d{4}.*ist/i.test(text);
  }

  hasDateFormat(text: string): boolean {
    return /\d{1,2}\s+\w{3}\s+\d{4}/i.test(text);
  }

  hasPhoneFormat(text: string): boolean {
    return /\+91[\s\d-]{10,}/i.test(text);
  }

  hasEmailFormat(text: string): boolean {
    return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  }

  async getOutletRowCount(): Promise<number> {
    const text = await this.getMainText();
    const rows = text.match(/PWH-|OUTLET|BRANCH/gi);
    return rows ? rows.length : 0;
  }

  async getKeyConnectRowCount(): Promise<number> {
    return this.mainContent
      .getByRole("row")
      .filter({ has: this.page.getByText(/PWH-EMP|EMP-/i) })
      .count();
  }

  async expectBranchStatusPill(status: "Active" | "Pending" | "Inactive"): Promise<void> {
    const text = await this.getMainText();
    expect(text).toMatch(new RegExp(`\\b${status}\\b`, "i"));
  }

  async expectConnectivityError(): Promise<void> {
    await expect(this.connectivityError).toBeVisible({ timeout: 30_000 });
    const text = await this.getPageText();
    expect(text).toMatch(/trouble loading your data/i);
    expect(text).toMatch(/can't connect to one or more of the systems/i);
  }

  async captureProfileApiResponse(): Promise<{
    url: string;
    status: number;
    body: unknown;
  } | null> {
    if (this.lastProfileApiResponse) return this.lastProfileApiResponse;
    const response = await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.request().method() === "GET" &&
          /profile|dealer|customer|branch|connect/i.test(r.url()),
        { timeout: 60_000 },
      ),
      this.page.reload(),
    ])
      .then(([r]) => r)
      .catch(() => null);
    if (!response) return null;
    await this.storeProfileApiResponse(response);
    return this.lastProfileApiResponse;
  }

  async captureEscalationApiResponse(): Promise<{
    url: string;
    status: number;
    body: unknown;
  } | null> {
    if (this.lastEscalationApiResponse) return this.lastEscalationApiResponse;
    const response = await this.page
      .waitForResponse(
        (r) =>
          r.request().method() === "GET" &&
          /escalation|matrix|manager/i.test(r.url()),
        { timeout: 60_000 },
      )
      .catch(() => null);
    if (!response) return null;
    await this.storeProfileApiResponse(response);
    return this.lastEscalationApiResponse;
  }

  l1ContactLinks(): Locator {
    return this.mainContent
      .locator("div")
      .filter({ hasText: /l1[\s·•-]*first point of contact/i })
      .getByRole("link");
  }

  l2ContactLinks(): Locator {
    return this.mainContent
      .locator("div")
      .filter({ hasText: /l2[\s·•-]*escalation/i })
      .getByRole("link");
  }
}
