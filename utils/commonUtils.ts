import type { Locator, Page } from "@playwright/test";
import { logger } from "./logger";

export class CommonUtils {
  constructor(private readonly page: Page) {}

  async clickElement(locator: Locator): Promise<void> {
    await this.highlight(locator);
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
  }

  async fillElement(locator: Locator, value: string): Promise<void> {
    await this.highlight(locator);
    await locator.scrollIntoViewIfNeeded();
    await locator.fill(value);
  }

  async type(locator: Locator, value: string, options?: { delay?: number }): Promise<void> {
    await this.highlight(locator);
    await locator.scrollIntoViewIfNeeded();
    await locator.pressSequentially(value, options);
  }

  /** @deprecated Use clickElement — kept for incremental migration */
  async click(locator: Locator): Promise<void> {
    await this.clickElement(locator);
  }

  /** @deprecated Use fillElement */
  async fill(locator: Locator, value: string): Promise<void> {
    await this.fillElement(locator, value);
  }

  async clearAndFill(locator: Locator, value: string): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await locator.clear();
    await locator.fill(value);
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async highlight(locator: Locator): Promise<void> {
    try {
      await locator.evaluate((el) => {
        el.style.outline = "2px solid #e11d48";
        el.style.boxShadow = "0 0 8px rgba(225, 29, 72, 0.45)";
      });
    } catch {
      logger.debug("Could not highlight element");
    }
  }
}

/** Alias for UDC naming */
export { CommonUtils as commonUtils };
