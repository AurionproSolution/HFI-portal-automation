import type { Browser, BrowserContext, Page } from "@playwright/test";
import { chromium, firefox, webkit } from "@playwright/test";
import { isHeadless } from "../config/env";
import { logger } from "./logger";

export type BrowserName = "chromium" | "firefox" | "webkit";

export async function launchBrowser(
  name: BrowserName = "chromium",
): Promise<Browser> {
  const headless = isHeadless();
  logger.info(`Launching ${name} (headless=${headless})`);

  switch (name) {
    case "firefox":
      return firefox.launch({ headless });
    case "webkit":
      return webkit.launch({ headless });
    default:
      return chromium.launch({
        headless,
        args: headless ? undefined : ["--start-maximized"],
      });
  }
}

export async function createContext(
  browser: Browser,
): Promise<BrowserContext> {
  return browser.newContext({
    viewport: null,
    ignoreHTTPSErrors: true,
  });
}

export async function createPage(browser: Browser): Promise<Page> {
  const context = await createContext(browser);
  return context.newPage();
}
