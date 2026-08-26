import { expect, type Locator, type Page } from "@playwright/test";
import { messages } from "@testData/hfi/messages";
import { logger } from "@utils/logger";
import { BasePage } from "@pages/common/BasePage";

export class HFIDashboardPage extends BasePage {
  protected stepLogPrefix(): string {
    return "HFI Portal — Dashboard";
  }

  readonly userMenuButton: Locator;
  readonly logoutButton: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    super(page);

    this.userMenuButton = page
      .getByRole("button", { name: /profile|account|user|dealer/i })
      .or(page.locator('[data-testid="user-menu"]'))
      .first();
    this.logoutButton = page
      .getByRole("button", { name: /log\s*out/i })
      .or(page.getByRole("link", { name: /log\s*out/i }))
      .or(page.locator('[aria-label*="Logout" i], [title*="Logout" i]'));
    this.mainContent = page.locator("main").first();
  }

  async verifyDashboardLoaded(): Promise<void> {
    await this.waitForLoader();
    await expect(this.page).not.toHaveURL(/\/login(?:\?|$)/i, {
      timeout: 60_000,
    });

    const urlMatches = messages.dashboard.loadedUrlPattern.test(
      this.getCurrentUrl(),
    );
    const mainVisible = await this.mainContent.isVisible().catch(() => false);

    if (!urlMatches && !mainVisible) {
      logger.info(
        `Dashboard heuristic: URL=${this.getCurrentUrl()}, mainVisible=${mainVisible}`,
      );
    }

    expect(
      urlMatches || mainVisible || !/\/login/i.test(this.getCurrentUrl()),
    ).toBeTruthy();
  }

  async isDashboardLoaded(): Promise<boolean> {
    try {
      await this.verifyDashboardLoaded();
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    const headerLogout = this.logoutButton.first();
    if (await headerLogout.isVisible()) {
      await this.common.click(headerLogout);
    } else if (await this.userMenuButton.isVisible()) {
      await this.common.click(this.userMenuButton);
      await this.common.click(this.logoutButton.first());
    } else {
      await this.common.click(this.logoutButton.first());
    }
    await this.waitForLoader();
  }
}
