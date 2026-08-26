import { expect, type Locator, type Page } from "@playwright/test";
import { getAppOrigin } from "@config/env";
import { adminConsoleMessages } from "@testData/admin/messages";
import { AdminConsoleBasePage } from "@pages/admin-console/AdminConsoleBasePage";

/** UC-ADM-001 — Support & Communication (Login & Comms) module. */
export class AdminLoginCommsPage extends AdminConsoleBasePage {
  readonly saveChangesButton: Locator;
  readonly headlineInput: Locator;
  readonly subHeadlineInput: Locator;
  readonly ctaLabelInput: Locator;
  readonly ctaUrlInput: Locator;
  readonly imageUrlInput: Locator;
  readonly supportPhoneInput: Locator;
  readonly supportHoursInput: Locator;
  readonly supportEmailInput: Locator;
  readonly escalationEmailInput: Locator;

  constructor(page: Page) {
    super(page);
    this.saveChangesButton = page.getByRole("button", { name: /save changes/i });
    this.headlineInput = page
      .getByLabel(/^headline$/i)
      .or(page.getByText(/^headline$/i).locator("xpath=ancestor::div[1]").getByRole("textbox"))
      .or(page.getByPlaceholder(/headline/i))
      .first();
    this.subHeadlineInput = page
      .getByLabel(/sub-?headline/i)
      .or(page.getByText(/^sub-?headline$/i).locator("xpath=ancestor::div[1]").getByRole("textbox"))
      .or(page.getByPlaceholder(/sub-?headline/i))
      .first();
    this.ctaLabelInput = page
      .getByLabel(/cta label/i)
      .or(page.getByText(/^cta label$/i).locator("xpath=ancestor::div[1]").getByRole("textbox"))
      .or(page.getByPlaceholder(/cta label/i))
      .first();
    this.ctaUrlInput = page
      .getByLabel(/cta url/i)
      .or(page.getByText(/^cta url$/i).locator("xpath=ancestor::div[1]").getByRole("textbox"))
      .or(page.getByPlaceholder(/cta url|url/i))
      .first();
    this.imageUrlInput = page
      .getByLabel(/image url/i)
      .or(page.getByText(/^image url$/i).locator("xpath=ancestor::div[1]").getByRole("textbox"))
      .or(page.getByPlaceholder(/image url/i))
      .first();
    this.supportPhoneInput = this.dealerPortalField("Support phone");
    this.supportHoursInput = this.dealerPortalField("Support hours");
    this.supportEmailInput = this.dealerPortalField("Support email");
    this.escalationEmailInput = page
      .getByLabel(/escalation email/i)
      .or(page.getByText(/^escalation email$/i).locator("xpath=ancestor::div[1]").getByRole("textbox"))
      .or(page.getByPlaceholder(/escalation/i))
      .first();
  }

  protected stepLogPrefix(): string {
    return "Admin Console — Support & Comms";
  }

  private dealerPortalSection(): Locator {
    return this.page
      .locator("div")
      .filter({
        has: this.page.getByRole("heading", { name: /dealer portal.*support/i }),
      })
      .filter({ has: this.page.getByRole("textbox") })
      .first();
  }

  private oemPortalSection(): Locator {
    return this.page
      .locator("div")
      .filter({
        has: this.page.getByRole("heading", { name: /oem portal.*support/i }),
      })
      .filter({ has: this.page.getByRole("textbox") })
      .first();
  }

  private portalField(section: Locator, label: string): Locator {
    return section
      .getByText(new RegExp(`^${label}$`, "i"))
      .locator("xpath=ancestor::div[1]")
      .getByRole("textbox")
      .first();
  }

  private dealerPortalField(label: string): Locator {
    return this.portalField(this.dealerPortalSection(), label);
  }

  async waitForSupportCommsLoaded(): Promise<void> {
    this.logStep("Wait for support & comms details to finish loading");
    await this.page
      .getByText(/loading support details/i)
      .waitFor({ state: "hidden", timeout: 60_000 })
      .catch(() => undefined);
    await expect(this.saveChangesButton).toBeVisible({ timeout: 60_000 });
    await expect(
      this.page.getByRole("heading", { name: /dealer portal.*support/i }),
    ).toBeVisible({ timeout: 60_000 });
  }

  async expectModuleLoaded(): Promise<void> {
    const text = await this.getPageText();
    expect(text).toMatch(/support\s*&\s*comm/i);
    await this.waitForSupportCommsLoaded();
  }

  async getFieldValue(locator: Locator): Promise<string> {
    if (await locator.isVisible().catch(() => false)) {
      return locator.inputValue().catch(async () => (await locator.textContent())?.trim() ?? "");
    }
    return "";
  }

  async setHeadline(value: string): Promise<void> {
    await expect(this.headlineInput).toBeVisible({ timeout: 15_000 });
    await this.common.clearAndFill(this.headlineInput, value);
  }

  async setSupportPhone(value: string): Promise<void> {
    await expect(this.supportPhoneInput).toBeVisible({ timeout: 15_000 });
    await this.common.clearAndFill(this.supportPhoneInput, value);
  }

  async setSupportHours(value: string): Promise<void> {
    await expect(this.supportHoursInput).toBeVisible({ timeout: 15_000 });
    await this.common.clearAndFill(this.supportHoursInput, value);
  }

  async setSupportEmail(value: string): Promise<void> {
    await expect(this.supportEmailInput).toBeVisible({ timeout: 15_000 });
    await this.common.clearAndFill(this.supportEmailInput, value);
  }

  async setCtaUrl(value: string): Promise<void> {
    if (await this.ctaUrlInput.isVisible().catch(() => false)) {
      await this.common.clearAndFill(this.ctaUrlInput, value);
    }
  }

  async clearMandatoryField(label: RegExp): Promise<void> {
    if (/support email/i.test(label.source)) {
      await this.common.clearAndFill(this.supportEmailInput, "");
      return;
    }
    const field = this.page.getByLabel(label).first();
    if (await field.isVisible().catch(() => false)) {
      await this.common.clearAndFill(field, "");
      return;
    }
    const byText = this.page
      .getByText(label)
      .locator("xpath=ancestor::div[1]")
      .getByRole("textbox")
      .first();
    if (await byText.isVisible().catch(() => false)) {
      await this.common.clearAndFill(byText, "");
    }
  }

  async saveChanges(): Promise<void> {
    this.logStep("Click Save Changes");
    await this.common.click(this.saveChangesButton);
    await this.waitForLoader();
    await this.waitForSupportCommsLoaded();
  }

  async expectMandatoryFieldsError(): Promise<void> {
    await expect(
      this.page.getByText(adminConsoleMessages.mandatoryFieldsBlank),
    ).toBeVisible({ timeout: 15_000 });
  }

  async expectInvalidUrlError(): Promise<void> {
    const text = await this.getPageText();
    expect(text).toMatch(adminConsoleMessages.invalidUrl);
  }

  private contactPreviewNear(section: Locator): Locator {
    return section
      .locator("xpath=following::*")
      .filter({ has: this.page.getByRole("heading", { name: /^contact preview$/i }) })
      .first();
  }

  private dealerContactPreview(): Locator {
    return this.page
      .locator("div")
      .filter({
        has: this.page.getByRole("heading", { name: /^contact preview$/i }),
      })
      .filter({ hasText: /\d/ })
      .first();
  }

  async getLivePreviewText(): Promise<string> {
    const bannerPreview = this.page
      .getByRole("heading", { name: /live preview|dealer portal.*preview/i })
      .locator("xpath=ancestor::div[1]");
    if (await bannerPreview.isVisible().catch(() => false)) {
      return bannerPreview.innerText();
    }
    const dealerSection = this.dealerPortalSection();
    const contactPreview = this.contactPreviewNear(dealerSection);
    if (await contactPreview.isVisible().catch(() => false)) {
      return contactPreview.innerText();
    }
    return dealerSection.innerText();
  }

  async getContactPreviewText(): Promise<string> {
    await this.waitForSupportCommsLoaded();
    return this.dealerContactPreview().innerText();
  }

  async setBannerEnabled(enabled: boolean): Promise<void> {
    const toggle = this.page
      .getByRole("switch")
      .or(this.page.getByLabel(/banner enabled|enable banner/i))
      .first();
    if (await toggle.isVisible().catch(() => false)) {
      const checked = await toggle.isChecked().catch(() => false);
      if (checked !== enabled) await toggle.click();
    }
  }

  async openDealerLoginInNewPage(): Promise<Page> {
    const loginPage = await this.page.context().newPage();
    await loginPage.goto(`${getAppOrigin()}/login`, {
      waitUntil: "domcontentloaded",
    });
    await loginPage.waitForLoadState("networkidle").catch(() => undefined);
    return loginPage;
  }

  async expectNoBranchOrDealerScopeControls(): Promise<void> {
    const text = await this.getPageText();
    expect(text).not.toMatch(/per branch|per dealer|branch-specific|dealer-specific/i);
  }
}
