import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "@pages/common/BasePage";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { logger } from "@utils/logger";

export type ConsumerFinanceDateRangePreset =
  | "7D"
  | "30D"
  | "MTD"
  | "90D"
  | "YTD"
  | "Custom";

const DATE_RANGE_PRESETS: ConsumerFinanceDateRangePreset[] = [
  "7D",
  "30D",
  "MTD",
  "90D",
  "YTD",
  "Custom",
];

/** Shared Consumer Finance navigation, filters and common assertions (Sprint 3 dealer modules). */
export class HFIConsumerFinanceBasePage extends BasePage {
  readonly consumerFinanceTab: Locator;
  readonly dealerFinanceTab: Locator;
  readonly branchScopeChip: Locator;
  readonly mainContent: Locator;
  readonly connectivityError: Locator;
  readonly noDataMessage: Locator;
  readonly searchInput: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    super(page);
    this.consumerFinanceTab = page
      .getByRole("link", { name: /consumer finance/i })
      .or(page.getByRole("button", { name: /consumer finance/i }))
      .or(page.getByText(/^consumer finance$/i))
      .first();
    this.dealerFinanceTab = page
      .getByRole("link", { name: /dealer finance/i })
      .or(page.getByRole("button", { name: /dealer finance/i }))
      .first();
    this.branchScopeChip = page
      .getByRole("button", { name: /all branches|consolidated/i })
      .or(page.getByRole("combobox", { name: /branch/i }))
      .first();
    this.mainContent = page.locator("main").first();
    this.connectivityError = page.getByText(
      /trouble loading|can't connect to one or more|connectivity|service unavailable/i,
    );
    this.noDataMessage = page.getByText(/no data available|no data to show/i);
    this.searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"))
      .first();
    this.exportButton = page.getByRole("button", { name: /^export$/i });
  }

  protected stepLogPrefix(): string {
    return "HFI Portal — Consumer Finance";
  }

  async signInFromEnv(): Promise<void> {
    const login = new HFILoginPage(this.page);
    await login.open();
    await login.login();
    await this.waitForLoader();
  }

  async openFromLogin(modulePath?: string): Promise<void> {
    await this.signInFromEnv();
    if (modulePath) {
      await this.navigateTo(modulePath);
    } else {
      await this.ensureConsumerFinanceContext();
    }
  }

  async ensureConsumerFinanceContext(): Promise<void> {
    if (!(await this.isConsumerFinanceActive())) {
      if (await this.consumerFinanceTab.isVisible().catch(() => false)) {
        await this.common.click(this.consumerFinanceTab);
        await this.waitForLoader();
      }
    }
  }

  async isConsumerFinanceActive(): Promise<boolean> {
    const url = this.getCurrentUrl().toLowerCase();
    if (/consumer-finance|consumer finance/.test(url)) {
      return true;
    }
    const tabSelected = await this.consumerFinanceTab
      .getAttribute("aria-current")
      .catch(() => null);
    return tabSelected === "page" || tabSelected === "true";
  }

  async navigateToModule(path: string): Promise<void> {
    await this.ensureConsumerFinanceContext();
    const normalized = path.startsWith("/") ? path : `/${path}`;
    logger.info(`Navigate to Consumer Finance module ${normalized}`);
    await this.page.goto(normalized, { waitUntil: "domcontentloaded" });
    await this.waitForLoader();
  }

  async expectModuleShellLoaded(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login(?:\?|$)/i, {
      timeout: 60_000,
    });
    await expect(this.mainContent).toBeVisible({ timeout: 60_000 });
    await expect(this.consumerFinanceTab).toBeVisible();
  }

  async getPageText(): Promise<string> {
    return (await this.mainContent.innerText().catch(() => "")) || "";
  }

  dateRangeButton(preset: ConsumerFinanceDateRangePreset): Locator {
    if (preset === "Custom") {
      return this.page.getByRole("button", { name: /^custom$/i });
    }
    return this.page.getByRole("button", { name: new RegExp(`^${preset}$`, "i") });
  }

  async selectDateRangePreset(preset: ConsumerFinanceDateRangePreset): Promise<void> {
    const btn = this.dateRangeButton(preset);
    if (await btn.isVisible().catch(() => false)) {
      await this.common.click(btn);
      await this.waitForLoader();
      return;
    }
    for (const fallback of DATE_RANGE_PRESETS) {
      const alt = this.dateRangeButton(fallback);
      if (await alt.isVisible().catch(() => false)) {
        await this.common.click(alt);
        await this.waitForLoader();
        return;
      }
    }
  }

  async getBranchFilterOptionLabels(): Promise<string[]> {
    await this.common.click(this.branchScopeChip);
    const options = this.page.getByRole("option").or(this.page.getByRole("menuitem"));
    const count = await options.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await options.nth(i).innerText().catch(() => "")).trim();
      if (text) labels.push(text);
    }
    await this.page.keyboard.press("Escape").catch(() => undefined);
    return labels;
  }

  async selectBranch(label: string | RegExp): Promise<void> {
    await this.common.click(this.branchScopeChip);
    const option = this.page
      .getByRole("option", { name: label })
      .or(this.page.getByRole("menuitem", { name: label }))
      .first();
    await this.common.click(option);
    await this.waitForLoader();
  }

  async expectReadOnlyModule(): Promise<void> {
    const text = await this.getPageText();
    expect(text.length).toBeGreaterThan(0);
    await expect(
      this.page.getByRole("button", { name: /submit|save changes|upload file/i }),
    ).toHaveCount(0);
  }

  async expectIndianCurrencyFormatting(): Promise<void> {
    const text = await this.getPageText();
    expect(text).toMatch(/₹|INR|,\d{2}/i);
  }
}
