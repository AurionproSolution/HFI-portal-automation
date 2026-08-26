import { expect, type Locator, type Page } from "@playwright/test";
import { adminConsoleMessages } from "@testData/admin/messages";
import { AdminConsoleBasePage } from "@pages/admin-console/AdminConsoleBasePage";

/** UC-ADM-001 — Portal Users (OEM Console Users) module. */
export class AdminPortalUsersPage extends AdminConsoleBasePage {
  readonly searchInput: Locator;
  readonly addUserButton: Locator;
  readonly accountsTable: Locator;
  readonly accountCountLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"))
      .or(page.getByLabel(/search/i))
      .first();
    this.addUserButton = page.getByRole("button", {
      name: /add oem user|add user/i,
    });
    this.accountsTable = page.locator("table").first();
    this.accountCountLabel = page.getByText(/\d+\s+of\s+\d+\s+accounts?/i);
  }

  protected stepLogPrefix(): string {
    return "Admin Console — Portal Users";
  }

  /** Inline add/edit panel (not a modal dialog). */
  private userFormPanel(): Locator {
    return this.page
      .getByRole("heading", { name: /new oem user|^edit /i })
      .locator("xpath=ancestor::div[1]/parent::div");
  }

  private formHeaderRow(): Locator {
    return this.page
      .getByRole("heading", { name: /new oem user|^edit /i })
      .locator("xpath=ancestor::div[1]");
  }

  private fullNameInput(): Locator {
    const panel = this.userFormPanel();
    return panel
      .getByText(/^full name$/i)
      .locator("xpath=ancestor::div[1]")
      .getByRole("textbox")
      .first();
  }

  private formFieldInput(label: string): Locator {
    if (/^full name$/i.test(label)) {
      return this.fullNameInput();
    }
    return this.userFormPanel()
      .getByText(new RegExp(`^${label}$`, "i"))
      .locator("xpath=ancestor::div[1]")
      .getByRole("textbox")
      .first();
  }

  roleCombobox(): Locator {
    return this.userFormPanel()
      .getByText(/^role$/i)
      .locator("xpath=ancestor::div[1]")
      .getByRole("combobox")
      .first();
  }

  statusCombobox(): Locator {
    return this.userFormPanel()
      .getByText(/^status$/i)
      .locator("xpath=ancestor::div[1]")
      .getByRole("combobox")
      .first();
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

  async attemptSaveUserForm(): Promise<void> {
    await this.common.click(this.formSaveButton());
    await this.waitForLoader();
  }

  async saveUserForm(): Promise<void> {
    await this.common.click(this.formSaveButton());
    await this.waitForLoader();
    await this.page
      .getByRole("heading", { name: /new oem user|^edit /i })
      .waitFor({ state: "hidden", timeout: 30_000 })
      .catch(() => undefined);
    await this.waitForUsersLoaded();
  }

  async cancelUserForm(): Promise<void> {
    const heading = this.page.getByRole("heading", { name: /new oem user|^edit /i });
    if (await heading.isVisible().catch(() => false)) {
      await this.common.click(this.formCancelButton());
      await heading.waitFor({ state: "hidden", timeout: 15_000 }).catch(() => undefined);
    }
  }

  async expectModuleLoaded(): Promise<void> {
    const text = await this.getPageText();
    expect(text).toMatch(/oem console users|oem users/i);
    await expect(this.addUserButton).toBeVisible({ timeout: 60_000 });
    await this.waitForUsersLoaded();
  }

  async waitForUsersLoaded(): Promise<void> {
    this.logStep("Wait for OEM users list to finish loading");
    await this.page
      .getByText(/loading oem users/i)
      .waitFor({ state: "hidden", timeout: 60_000 })
      .catch(() => undefined);
    await expect(this.accountCountLabel).toBeVisible({ timeout: 60_000 });
    await expect(this.accountsTable).toBeVisible({ timeout: 30_000 });
  }

  async expectRequiredColumns(): Promise<void> {
    await this.waitForUsersLoaded();
    const text = await this.getPageText();
    for (const col of ["NAME", "USERNAME", "EMAIL", "ROLE", "STATUS", "CREATED"]) {
      expect(text, `Expected column ${col}`).toMatch(new RegExp(col, "i"));
    }
  }

  async getDisplayedAccountCount(): Promise<{ shown: number; total: number } | null> {
    const label = await this.accountCountLabel.textContent().catch(() => null);
    if (!label) return null;
    const match = label.match(/(\d+)\s+of\s+(\d+)/i);
    if (!match) return null;
    return {
      shown: Number.parseInt(match[1], 10),
      total: Number.parseInt(match[2], 10),
    };
  }

  async getVisibleRowCount(): Promise<number> {
    const rows = this.accountsTable.locator("tbody tr");
    const count = await rows.count();
    return count > 0 ? count : this.page.locator("table tr").count();
  }

  async searchAccounts(query: string): Promise<void> {
    this.logStep(`Search Portal Users: ${this.stepValueDisplay("query", query)}`);
    await this.waitForUsersLoaded();
    const search = this.page
      .getByPlaceholder(/search/i)
      .or(this.page.getByRole("searchbox"))
      .or(this.page.locator("input").filter({ hasNot: this.page.locator("[type='password']") }))
      .first();
    await this.common.clearAndFill(search, query);
    await this.page.keyboard.press("Enter").catch(() => undefined);
    await this.waitForLoader();
    await this.page
      .getByText(/loading oem users/i)
      .waitFor({ state: "hidden", timeout: 30_000 })
      .catch(() => undefined);
  }

  async openAddUser(): Promise<void> {
    this.logStep("Open Add OEM User form");
    await this.common.click(this.addUserButton);
    await expect(
      this.page.getByRole("heading", { name: /new oem user/i }),
    ).toBeVisible({ timeout: 15_000 });
  }

  async expectUserFormOpen(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: /new oem user|^edit /i }),
    ).toBeVisible({ timeout: 15_000 });
  }

  async fillUserForm(fields: {
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  }): Promise<void> {
    await this.expectUserFormOpen();
    if (fields.name) {
      const field = this.fullNameInput();
      await field.click();
      await field.press("Control+A");
      await this.common.fillElement(field, fields.name);
      await expect(field).toHaveValue(fields.name, { timeout: 5_000 });
    }
    if (fields.username) {
      await this.common.clearAndFill(
        this.userFormPanel().getByPlaceholder(/maker-id/i),
        fields.username,
      );
    }
    if (fields.email) {
      await this.common.clearAndFill(this.formFieldInput("Email"), fields.email);
    }
    if (fields.role) {
      await this.roleCombobox().selectOption({ label: fields.role });
    }
  }

  async expectDuplicateUsernameMessage(): Promise<void> {
    await expect(
      this.page.getByText(adminConsoleMessages.duplicateUsername),
    ).toBeVisible({ timeout: 15_000 });
  }

  async getRoleOptionsFromOpenForm(): Promise<string[]> {
    await this.expectUserFormOpen();
    const options = await this.roleCombobox().locator("option").allTextContents();
    return options.map((o) => o.trim()).filter(Boolean);
  }

  async getRoleOptions(): Promise<string[]> {
    await this.openAddUser();
    const options = await this.getRoleOptionsFromOpenForm();
    await this.cancelUserForm();
    return options;
  }

  async isRoleSelectorExtensible(): Promise<boolean> {
    await this.expectUserFormOpen();
    const tagName = await this.roleCombobox().evaluate((el) => el.tagName.toLowerCase());
    return tagName === "select";
  }

  async findRowByUsername(username: string): Promise<Locator> {
    return this.page
      .getByRole("row")
      .filter({ hasText: new RegExp(username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") })
      .first();
  }

  async clickRowAction(username: string, action: "Edit" | "Delete"): Promise<void> {
    const row = await this.findRowByUsername(username);
    await expect(row).toBeVisible({ timeout: 15_000 });
    const buttonName = action === "Edit" ? "Edit user" : "Delete user";
    await this.common.click(row.getByRole("button", { name: buttonName }));
    if (action === "Edit") {
      await expect(
        this.page.getByRole("heading", { name: /^edit /i }),
      ).toBeVisible({ timeout: 15_000 });
    }
  }

  async setUserStatus(username: string, status: "Active" | "Suspended"): Promise<void> {
    this.logStep(`Set user status: ${username} -> ${status}`);
    await this.clickRowAction(username, "Edit");
    await this.statusCombobox().selectOption({ label: status });
    await this.saveUserForm();
    const row = await this.findRowByUsername(username);
    await expect(row).toContainText(new RegExp(status, "i"), { timeout: 15_000 });
  }

  async confirmDialogIfPresent(): Promise<void> {
    const confirm = this.page.getByRole("button", {
      name: /confirm|yes|proceed|delete/i,
    });
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click();
      await this.waitForLoader();
    }
  }

  async expectEmptySearchResult(): Promise<void> {
    const text = await this.getPageText();
    const rowCount = await this.getVisibleRowCount();
    expect(
      rowCount === 0 ||
        /no (results|accounts|data)|0 of \d+ accounts|not found/i.test(text),
    ).toBeTruthy();
  }

  async expectLastAdminBlocked(): Promise<void> {
    await expect(
      this.page.getByText(adminConsoleMessages.lastAdminBlocked),
    ).toBeVisible({ timeout: 15_000 });
  }

  generateAutomationUsername(prefix = "auto"): string {
    return `${prefix}.${Date.now()}`;
  }
}
