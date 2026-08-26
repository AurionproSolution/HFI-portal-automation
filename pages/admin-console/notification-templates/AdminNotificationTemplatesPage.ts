import { expect, type Locator, type Page } from "@playwright/test";
import { adminConsoleMessages } from "@testData/admin/messages";
import { AdminConsoleBasePage } from "@pages/admin-console/AdminConsoleBasePage";

/** UC-ADM-001 — Notification Templates module. */
export class AdminNotificationTemplatesPage extends AdminConsoleBasePage {
  readonly emailTab: Locator;
  readonly smsTab: Locator;
  readonly newTemplateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailTab = page.getByRole("button", { name: /^email/i });
    this.smsTab = page.getByRole("button", { name: /^sms/i });
    this.newTemplateButton = page.getByRole("button", { name: /new template/i });
  }

  protected stepLogPrefix(): string {
    return "Admin Console — Notification Templates";
  }

  /** Inline add/edit template panel (not a modal dialog). */
  private templateFormPanel(): Locator {
    return this.page
      .getByRole("heading", { name: /new (email|sms) template|^edit /i })
      .locator("xpath=ancestor::div[1]/parent::div");
  }

  private formHeaderRow(): Locator {
    return this.page
      .getByRole("heading", { name: /new (email|sms) template|^edit /i })
      .locator("xpath=ancestor::div[1]");
  }

  private formFieldInput(label: string): Locator {
    const panel = this.templateFormPanel();
    return panel
      .getByText(new RegExp(`^${label}$`, "i"))
      .locator("xpath=ancestor::div[1]")
      .getByRole("textbox")
      .first();
  }

  private formBodyInput(): Locator {
    return this.templateFormPanel().locator("textarea").first();
  }

  private formSaveButton(): Locator {
    return this.formHeaderRow()
      .getByRole("button", { name: /^save$/i })
      .or(this.formHeaderRow().getByRole("button").last());
  }

  private formCancelButton(): Locator {
    return this.formHeaderRow()
      .getByRole("button", { name: /^cancel$/i })
      .or(this.formHeaderRow().getByRole("button").first());
  }

  async expectModuleLoaded(): Promise<void> {
    const text = await this.getPageText();
    expect(text).toMatch(/notification templates/i);
    await expect(this.newTemplateButton).toBeVisible({ timeout: 60_000 });
    await this.waitForTemplatesLoaded();
  }

  async waitForTemplatesLoaded(): Promise<void> {
    this.logStep("Wait for notification templates to finish loading");
    await this.page
      .getByText(/loading notification templates/i)
      .waitFor({ state: "hidden", timeout: 60_000 })
      .catch(() => undefined);
    await expect(
      this.page
        .getByRole("button", { name: /edit template/i })
        .or(this.page.getByText(/no templates|0 templates/i))
        .first(),
    ).toBeVisible({ timeout: 60_000 });
  }

  firstTemplateCard(): Locator {
    return this.page.locator("app-notification-template-card").first();
  }

  async expectTemplateCardsShowCodeTitleStatus(): Promise<void> {
    await this.waitForTemplatesLoaded();
    const editButtons = this.page.getByRole("button", { name: /edit template/i });
    if ((await editButtons.count()) === 0) {
      throw new Error(
        "SKIP: No notification templates on DEV — precondition 'page is loaded with data' not met.",
      );
    }
    const card = this.firstTemplateCard();
    await expect(card).toBeVisible({ timeout: 30_000 });
    const text = await card.innerText();
    expect(text).toMatch(/\bACTIVE\b|\bINACTIVE\b|\bDRAFT\b/i);
    expect(text.length).toBeGreaterThan(10);
  }

  async getChannelTabCount(channel: "Email" | "SMS"): Promise<string | null> {
    const tab = channel === "Email" ? this.emailTab : this.smsTab;
    const text = (await tab.textContent()) || "";
    const match = text.match(/(\d+)/);
    return match?.[1] ?? null;
  }

  async switchToChannel(channel: "Email" | "SMS"): Promise<void> {
    const tab = channel === "Email" ? this.emailTab : this.smsTab;
    await this.common.click(tab);
    await this.waitForLoader();
    await this.waitForTemplatesLoaded();
  }

  async expectTemplateFormOpen(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: /new (email|sms) template|^edit /i }),
    ).toBeVisible({ timeout: 15_000 });
  }

  async openNewTemplate(): Promise<void> {
    await this.common.click(this.newTemplateButton);
    await this.expectTemplateFormOpen();
  }

  async fillTemplateForm(fields: {
    channel?: "Email" | "SMS";
    code?: string;
    name?: string;
    subject?: string;
    body?: string;
  }): Promise<void> {
    await this.expectTemplateFormOpen();
    if (fields.code) {
      await this.common.clearAndFill(this.formFieldInput("Template code"), fields.code);
    }
    if (fields.name) {
      await this.common.clearAndFill(this.formFieldInput("Template name"), fields.name);
    }
    if (fields.subject) {
      await this.common.clearAndFill(this.formFieldInput("Subject"), fields.subject);
    }
    if (fields.body) {
      const body = this.formBodyInput();
      await body.click();
      await body.press("Control+A");
      await this.common.fillElement(body, fields.body);
    }
  }

  async attemptSaveTemplate(): Promise<void> {
    await this.common.click(this.formSaveButton());
    await this.waitForLoader();
  }

  async saveTemplate(): Promise<void> {
    await this.attemptSaveTemplate();
    await this.page
      .getByRole("heading", { name: /new (email|sms) template|^edit /i })
      .waitFor({ state: "hidden", timeout: 30_000 })
      .catch(() => undefined);
    await this.waitForTemplatesLoaded();
  }

  async cancelTemplateForm(): Promise<void> {
    const heading = this.page.getByRole("heading", {
      name: /new (email|sms) template|^edit /i,
    });
    if (await heading.isVisible().catch(() => false)) {
      await this.common.click(this.formCancelButton());
      await heading.waitFor({ state: "hidden", timeout: 15_000 }).catch(() => undefined);
    }
  }

  templateCard(codeOrTitle: string): Locator {
    const pattern = codeOrTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.page
      .locator("app-notification-template-card")
      .filter({ hasText: new RegExp(pattern, "i") })
      .first();
  }

  async openTemplate(codeOrTitle: string): Promise<void> {
    const card = this.templateCard(codeOrTitle);
    await expect(card).toBeVisible({ timeout: 15_000 });
    await this.common.click(card);
    await this.waitForLoader();
  }

  async expectTemplateDetailFields(): Promise<void> {
    const text = await this.getPageText();
    expect(text).toMatch(/template code|INVOICE_|AUTO-/i);
    expect(text).toMatch(/template name|batch submitted/i);
    expect(text).toMatch(/subject/i);
    expect(text).toMatch(/{{dealer_name}}|body/i);
  }

  async clickTemplateAction(
    codeOrTitle: string,
    action: "Edit" | "Deactivate" | "Delete" | "View",
  ): Promise<void> {
    const card = this.templateCard(codeOrTitle);
    await expect(card).toBeVisible({ timeout: 15_000 });
    const buttonName =
      action === "Edit"
        ? "Edit template"
        : action === "Delete"
          ? "Delete template"
          : action;
    await this.common.click(
      card.getByRole("button", { name: new RegExp(`^${buttonName}$`, "i") }),
    );
    if (action === "Edit") {
      await expect(
        this.page.getByRole("heading", { name: /^edit /i }),
      ).toBeVisible({ timeout: 15_000 });
    }
  }

  async createDisposableTemplate(fields: {
    code: string;
    name?: string;
    subject: string;
    body: string;
    channel?: "Email" | "SMS";
  }): Promise<void> {
    if (fields.channel) {
      await this.switchToChannel(fields.channel);
    }
    await this.openNewTemplate();
    await this.fillTemplateForm({
      code: fields.code,
      name: fields.name ?? `Automation ${fields.code}`,
      subject: fields.subject,
      body: fields.body,
    });
    await this.saveTemplate();
    await expect(this.templateCard(fields.code)).toBeVisible({ timeout: 30_000 });
  }

  private templateConfirmDialog(): Locator {
    return this.page.getByRole("dialog").filter({
      has: this.page.getByText(/only active template|delete anyway|deactivating\/deleting/i),
    });
  }

  async expectOnlyActiveTemplateWarning(): Promise<void> {
    await expect(
      this.templateConfirmDialog().getByText(adminConsoleMessages.onlyActiveTemplateWarning),
    ).toBeVisible({ timeout: 15_000 });
  }

  async confirmWarningDialog(): Promise<void> {
    const dialog = this.templateConfirmDialog();
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog
      .getByRole("button", {
        name: /delete anyway|deactivate anyway|confirm|proceed|yes/i,
      })
      .click();
    await this.waitForLoader();
  }

  async cancelWarningDialog(): Promise<void> {
    const dialog = this.templateConfirmDialog();
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByRole("button", { name: /^cancel$/i }).click();
  }

  async deleteTemplate(code: string): Promise<void> {
    await this.clickTemplateAction(code, "Delete");
    const dialog = this.templateConfirmDialog();
    if (await dialog.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await this.confirmWarningDialog();
    }
    await this.waitForTemplatesLoaded();
  }

  async expectMergeFieldVisible(field: string): Promise<void> {
    await expect(this.page.getByText(field).first()).toBeVisible({ timeout: 15_000 });
  }

  generateTemplateCode(prefix = "AUTO-TPL"): string {
    return `${prefix}-${Date.now()}`;
  }
}
