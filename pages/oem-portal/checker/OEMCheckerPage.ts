import { expect, type Locator, type Page } from "@playwright/test";
import {
  getOemCheckerCredentials,
  getOemCheckerQueuePath,
} from "@config/oem-env";
import { BasePage } from "@pages/common/BasePage";
import { OEMLoginPage } from "@pages/oem-portal/login/OEMLoginPage";

/** UC-OEM-004 — OEM Checker (Maker–Checker Approval Queue). */
export class OEMCheckerPage extends BasePage {
  readonly pageHeading: Locator;
  readonly checkerConsoleTab: Locator;
  readonly kpiSection: Locator;
  readonly awaitingApprovalList: Locator;
  readonly searchInput: Locator;
  readonly selectAllCheckbox: Locator;
  readonly approveSelectedButton: Locator;
  readonly connectivityError: Locator;
  readonly auditNavItem: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /checker queue|awaiting your approval/i })
      .first();
    this.checkerConsoleTab = page
      .getByRole("link", { name: /checker console/i })
      .or(page.getByRole("tab", { name: /checker console/i }))
      .first();
    this.kpiSection = page.locator("main").filter({
      hasText: /pending review|total amount|distinct dealers/i,
    });
    this.awaitingApprovalList = page
      .locator("table, [role='table'], [role='grid']")
      .filter({ hasText: /invoice|dealer|approve|reject|product/i })
      .first();
    this.searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"))
      .first();
    this.selectAllCheckbox = page
      .getByRole("checkbox", { name: /select all/i })
      .first();
    this.approveSelectedButton = page.getByRole("button", {
      name: /approve selected/i,
    });
    this.connectivityError = page.getByText(
      /we're having trouble loading your data|can't connect to one or more of the systems/i,
    );
    this.auditNavItem = page
      .locator("nav, aside")
      .getByRole("link", { name: /audit.*tracking/i })
      .first();
  }

  protected stepLogPrefix(): string {
    return "OEM Portal — Checker Queue";
  }

  async signInWithCheckerCredentials(): Promise<void> {
    const creds = getOemCheckerCredentials();
    if (!creds) {
      throw new Error(
        "SKIP: Set OEM_CHECKER_USERNAME and OEM_CHECKER_PASSWORD for Checker tests.",
      );
    }
    const login = new OEMLoginPage(this.page);
    await login.logoutIfSignedIn();
    await login.open();
    await login.loginWithCredentials(creds.username, creds.password);
    await this.page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 90_000,
    });
  }

  async openFromLogin(): Promise<void> {
    await this.signInWithCheckerCredentials();
    const path = getOemCheckerQueuePath();
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
    await this.waitForLoader();
    await this.expectModuleLoaded();
  }

  async expectModuleLoaded(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login(?:\?|$)/i, {
      timeout: 60_000,
    });
    const text = await this.page.locator("main").innerText().catch(() => "");
    expect(text).toMatch(/checker|awaiting|approval|pending review/i);
  }

  async getPageText(): Promise<string> {
    return (await this.page.locator("main").innerText().catch(() => "")) || "";
  }

  async expectCheckerKpis(): Promise<void> {
    await expect(this.kpiSection.first()).toBeVisible();
  }

  async expectAwaitingApprovalList(): Promise<void> {
    await expect(this.awaitingApprovalList).toBeVisible();
  }

  async expectAuditLogVisible(): Promise<void> {
    await this.common.click(this.auditNavItem);
    const text = await this.getPageText();
    expect(text).toMatch(/audit|tracking|action/i);
  }
}
