import type { Locator, Page } from "@playwright/test";
import { selectors } from "@testData/hfi/selectors";
import { CommonUtils } from "@utils/commonUtils";
import { Waits } from "@utils/waits";
import { logTestStep, stepValueDisplay } from "@utils/testStepLog";
import { logger } from "@utils/logger";

export abstract class BasePage {
  readonly page: Page;
  readonly utils: CommonUtils;
  readonly waits: Waits;
  readonly loader: Locator;
  readonly toast: Locator;
  readonly pagination: Locator;
  readonly tableRows: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new CommonUtils(page);
    this.waits = new Waits(page);
    this.loader = page.locator(selectors.loader).first();
    this.toast = page.locator(selectors.toast).first();
    this.pagination = page.locator(selectors.pagination).first();
    this.tableRows = page.locator(selectors.tableRow);
    this.spinner = page.locator(selectors.spinner).first();
  }

  protected stepLogPrefix(): string {
    return "HFI Portal";
  }

  protected logStep(message: string): void {
    logTestStep(this.stepLogPrefix(), message);
  }

  protected stepValueDisplay(label: string, value: string): string {
    return stepValueDisplay(label, value);
  }

  protected get common(): CommonUtils {
    return this.utils;
  }

  protected async navigateTo(url: string): Promise<void> {
    this.logStep(`Navigate to ${url}`);
    logger.info(`Navigating to ${url}`);
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await this.waitForLoadingComplete();
  }

  async waitForLoadingComplete(): Promise<void> {
    await this.waits.forLoaderToDisappear();
  }

  async waitForLoader(): Promise<void> {
    await this.waitForLoadingComplete();
  }

  async waitForToast(timeout = 10_000): Promise<void> {
    await this.toast.waitFor({ state: "visible", timeout }).catch(() => undefined);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    await this.waitForLoadingComplete();
  }

  protected async clickElement(locator: Locator): Promise<void> {
    await this.utils.clickElement(locator);
  }

  protected async fillElement(locator: Locator, value: string): Promise<void> {
    await this.utils.fillElement(locator, value);
  }

  protected async typeElement(
    locator: Locator,
    value: string,
    options?: { delay?: number },
  ): Promise<void> {
    await this.utils.type(locator, value, options);
  }

  getCurrentUrl(): string {
    return this.page.url();
  }
}
