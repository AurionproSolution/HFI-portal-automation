import { expect, type Locator, type Page } from "@playwright/test";
import {
  getAdminAppOrigin,
  getAdminCredentials,
  getAdminLoginUrl,
  getLoginCommsPath,
  getNotificationTemplatesPath,
  getPortalUsersPath,
} from "@config/admin-env";
import { BasePage } from "@pages/common/BasePage";
import { AdminLoginPage } from "@pages/admin-console/login/AdminLoginPage";

/** UC-ADM-001 — Admin Console shared navigation and authentication. */
export class AdminConsoleBasePage extends BasePage {
  readonly leftNav: Locator;
  readonly oemUsersNav: Locator;
  readonly notificationTemplatesNav: Locator;
  readonly loginCommsNav: Locator;

  constructor(page: Page) {
    super(page);
    this.leftNav = page.locator("nav, aside, [role='navigation']").first();
    this.oemUsersNav = this.leftNav
      .getByRole("link", { name: /oem users/i })
      .or(page.getByRole("link", { name: /oem users/i }))
      .first();
    this.notificationTemplatesNav = this.leftNav
      .getByRole("link", { name: /notification templates/i })
      .or(page.getByRole("link", { name: /notification templates/i }))
      .first();
    this.loginCommsNav = this.leftNav
      .getByRole("link", { name: /support\s*&\s*comms|login\s*&\s*comms/i })
      .or(page.getByRole("link", { name: /support\s*&\s*comms|login\s*&\s*comms/i }))
      .first();
  }

  protected stepLogPrefix(): string {
    return "Admin Console";
  }

  async signInAsAdmin(): Promise<void> {
    this.logStep("Sign in with Admin credentials");
    const creds = getAdminCredentials();
    if (!creds) {
      throw new Error(
        "SKIP: Set ADMIN_USERNAME and ADMIN_PASSWORD for Admin Console tests.",
      );
    }
    const login = new AdminLoginPage(this.page);
    await login.open();
    await login.loginWithCredentials(creds.username, creds.password);
    await login.expectLoginSucceeded();
  }

  async signInWithCredentials(username: string, password: string): Promise<void> {
    this.logStep(
      `Sign in as user: ${this.stepValueDisplay("username", username)}`,
    );
    const login = new AdminLoginPage(this.page);
    await login.open();
    await login.loginWithCredentials(username, password);
    await login.expectLoginSucceeded();
  }

  protected async gotoPath(path: string): Promise<void> {
    const url = path.startsWith("http")
      ? path
      : `${getAdminAppOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
    await this.navigateTo(url);
  }

  protected async clickNavOrGoto(nav: Locator, path: string): Promise<void> {
    if (await nav.isVisible().catch(() => false)) {
      try {
        await nav.click({ timeout: 10_000 });
        await this.page
          .waitForURL((url) => url.pathname.includes(path.replace(/\/$/, "")), {
            timeout: 15_000,
          })
          .catch(() => undefined);
      } catch {
        await this.gotoPath(path);
      }
    } else {
      await this.gotoPath(path);
    }
  }

  async navigateToPortalUsers(): Promise<void> {
    this.logStep(`Navigate to Portal Users (${getPortalUsersPath()})`);
    await this.clickNavOrGoto(this.oemUsersNav, getPortalUsersPath());
    await this.waitForLoader();
  }

  async navigateToNotificationTemplates(): Promise<void> {
    this.logStep(
      `Navigate to Notification Templates (${getNotificationTemplatesPath()})`,
    );
    await this.clickNavOrGoto(
      this.notificationTemplatesNav,
      getNotificationTemplatesPath(),
    );
    await this.waitForLoader();
  }

  async navigateToLoginComms(): Promise<void> {
    this.logStep(`Navigate to Support & Comms (${getLoginCommsPath()})`);
    await this.clickNavOrGoto(this.loginCommsNav, getLoginCommsPath());
    await this.waitForLoader();
  }

  async openPortalUsersAsAdmin(): Promise<void> {
    this.logStep("Open Portal Users as Admin");
    await this.signInAsAdmin();
    await this.navigateToPortalUsers();
  }

  async openNotificationTemplatesAsAdmin(): Promise<void> {
    this.logStep("Open Notification Templates as Admin");
    await this.signInAsAdmin();
    await this.navigateToNotificationTemplates();
  }

  async openLoginCommsAsAdmin(): Promise<void> {
    this.logStep("Open Support & Comms as Admin");
    await this.signInAsAdmin();
    await this.navigateToLoginComms();
  }

  async isPortalUsersVisible(): Promise<boolean> {
    const text = await this.getPageText();
    return /oem console users|oem users|of\s+\d+\s+accounts/i.test(text);
  }

  async isNotificationTemplatesVisible(): Promise<boolean> {
    const text = await this.getPageText();
    return /notification templates/i.test(text);
  }

  async isLoginCommsVisible(): Promise<boolean> {
    const text = await this.getPageText();
    return /support\s*&\s*comm|banner|support\s*&\s*contact|save changes/i.test(
      text,
    );
  }

  async getPageText(): Promise<string> {
    this.logStep("Read page body text");
    return this.page.locator("body").innerText();
  }

  getDirectUrl(path: string): string {
    return `${getAdminAppOrigin()}${path}`;
  }

  getLoginUrl(): string {
    return getAdminLoginUrl();
  }

  async navigateToAdminPath(path: string): Promise<void> {
    await this.gotoPath(path);
  }
}
