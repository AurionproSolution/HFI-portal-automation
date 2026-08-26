import { expect, type Locator, type Page } from "@playwright/test";
import { settings } from "../config/settings";

export class Assertions {
  constructor(private readonly page: Page) {}

  async expectVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible({
      timeout: settings.expectTimeout,
    });
  }

  async expectHidden(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeHidden({
      timeout: settings.expectTimeout,
    });
  }

  async expectUrlMatches(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern, {
      timeout: settings.navigationTimeout,
    });
  }

  async expectText(
    locator: Locator,
    pattern: string | RegExp,
  ): Promise<void> {
    await expect(locator).toContainText(pattern, {
      timeout: settings.expectTimeout,
    });
  }
}
