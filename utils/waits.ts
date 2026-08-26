import type { Locator, Page } from "@playwright/test";
import { selectors } from "@testData/hfi/selectors";
import { settings } from "@config/settings";
import { logger } from "./logger";

export class Waits {
  constructor(private readonly page: Page) {}

  async forVisible(
    locator: Locator,
    timeout = settings.defaultTimeout,
  ): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
  }

  async forHidden(
    locator: Locator,
    timeout = settings.defaultTimeout,
  ): Promise<void> {
    await locator.waitFor({ state: "hidden", timeout });
  }

  async forUrl(
    pattern: string | RegExp,
    timeout = settings.navigationTimeout,
  ): Promise<void> {
    await this.page.waitForURL(pattern, { timeout });
  }

  async forLoaderToDisappear(timeout = settings.navigationTimeout): Promise<void> {
    const loader = this.page.locator(selectors.loader).first();
    const count = await loader.count();
    if (count === 0) {
      return;
    }
    try {
      await loader.waitFor({ state: "hidden", timeout });
    } catch {
      logger.debug("Loader still visible or detached after timeout");
    }
  }

  async forNetworkIdle(timeout = settings.navigationTimeout): Promise<void> {
    await this.page.waitForLoadState("networkidle", { timeout });
  }
}
