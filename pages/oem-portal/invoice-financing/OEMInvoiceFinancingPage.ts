import { expect, type Locator, type Page } from "@playwright/test";
import {
  getAuditTrackingPath,
  getInvoiceFinancingPath,
  getOemAppOrigin,
  getOemMakerCredentials,
} from "@config/oem-env";
import { BasePage } from "@pages/common/BasePage";
import { OEMLoginPage } from "@pages/oem-portal/login/OEMLoginPage";

/** US-OEM-003 — Invoice Financing (Invoice Upload & Validation – Maker). */
export class OEMInvoiceFinancingPage extends BasePage {
  readonly pageHeading: Locator;
  readonly downloadTemplateButton: Locator;
  readonly uploadInput: Locator;
  readonly invoicesTab: Locator;
  readonly myUploadsTab: Locator;
  readonly uploadExcelButton: Locator;
  readonly auditLogButton: Locator;
  readonly exportButton: Locator;
  readonly myUploadsGrid: Locator;
  readonly myUploadsStatusFilter: Locator;
  readonly myUploadsSearchInput: Locator;
  readonly batchDownloadButtons: Locator;
  readonly kpiTotal: Locator;
  readonly kpiUploaded: Locator;
  readonly kpiFailed: Locator;
  readonly invoicesTabHeader: Locator;
  readonly auditLogPanel: Locator;
  readonly auditLogEntries: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page
      .getByRole("heading", { name: /invoice financing/i })
      .or(page.getByText(/invoice financing/i).first());
    this.downloadTemplateButton = page
      .getByRole("button", { name: /download xlsx template|xlsx template/i })
      .or(
        page
          .locator("main")
          .filter({ has: page.getByRole("heading", { name: /invoice financing/i }) })
          .getByRole("button")
          .first(),
      );
    this.uploadInput = page.locator("input[type='file']").first();
    this.uploadExcelButton = page
      .getByRole("button", { name: /upload excel/i })
      .or(
        page
          .locator("main")
          .filter({ has: page.getByRole("heading", { name: /invoice financing/i }) })
          .getByRole("button")
          .nth(1),
      );
    this.invoicesTab = page
      .getByRole("tab", { name: /^invoices$/i })
      .or(page.getByRole("button", { name: /^invoices$/i }))
      .first();
    this.myUploadsTab = page
      .getByRole("tab", { name: /my uploads/i })
      .or(page.getByRole("button", { name: /my uploads/i }))
      .first();
    this.auditLogButton = page
      .getByRole("link", { name: /audit.*tracking/i })
      .or(page.getByRole("button", { name: /audit.*tracking|audit log/i }))
      .or(page.getByRole("tab", { name: /audit/i }))
      .first();
    this.exportButton = page.getByRole("button", { name: /^export$/i });
    this.myUploadsGrid = page
      .locator("table, [role='table']")
      .filter({ hasText: /invoice|dealer|status|uploaded|failed|batch no/i })
      .first();
    this.myUploadsStatusFilter = page
      .getByLabel(/status/i)
      .or(page.getByRole("combobox", { name: /status/i }))
      .first();
    this.myUploadsSearchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"))
      .first();
    this.batchDownloadButtons = page
      .getByRole("button", { name: /^download$/i })
      .or(page.getByRole("link", { name: /^download$/i }));
    this.kpiTotal = page.locator("main, section").filter({ hasText: /^total$/i }).first();
    this.kpiUploaded = page
      .locator("main, section")
      .filter({ hasText: /^uploaded$/i })
      .first();
    this.kpiFailed = page
      .locator("main, section")
      .filter({ hasText: /^failed$/i })
      .first();
    this.invoicesTabHeader = page
      .locator("main, section, header")
      .filter({ hasText: /total batches|total invoices/i })
      .first();
    this.auditLogPanel = page
      .getByRole("dialog")
      .filter({ hasText: /audit|tracking/i })
      .or(page.locator("section, div").filter({ hasText: /audit.*tracking/i }))
      .first();
    this.auditLogEntries = this.auditLogPanel
      .locator("tr, li, [role='row'], [data-testid*='audit']")
      .filter({ hasNot: page.locator("th") });
  }

  protected stepLogPrefix(): string {
    return "OEM Portal — Invoice Financing";
  }

  async signInWithMakerCredentials(): Promise<void> {
    this.logStep("Sign in with OEM Maker credentials");
    const creds = getOemMakerCredentials();
    if (!creds) {
      throw new Error(
        "SKIP: Set OEM_MAKER_USERNAME and OEM_MAKER_PASSWORD for OEM Invoice Financing tests.",
      );
    }
    const login = new OEMLoginPage(this.page);
    await login.open();
    await login.loginWithCredentials(creds.username, creds.password);
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/login"),
      { timeout: 90_000 },
    );
  }

  async navigateToModule(): Promise<void> {
    this.logStep(`Navigate to Invoice Financing (${getInvoiceFinancingPath()})`);
    const navLink = this.page
      .locator("nav, aside")
      .getByRole("link", { name: /invoice financing/i })
      .first();
    if (await navLink.isVisible().catch(() => false)) {
      await this.common.click(navLink);
    } else if (!/\/oem\/invoices|invoice-financing/i.test(this.page.url())) {
      await this.navigateTo(getInvoiceFinancingPath());
    }
    await this.waitForLoader();
    await this.waitForModuleLoaded();
  }

  async waitForModuleLoaded(): Promise<void> {
    this.logStep("Wait for Invoice Financing module to load");
    await expect(
      this.page.getByRole("heading", { name: /invoice financing/i }),
    ).toBeVisible({ timeout: 60_000 });
    await this.page
      .getByText(/loading invoice batches/i)
      .waitFor({ state: "hidden", timeout: 60_000 })
      .catch(() => undefined);
  }

  async openFromLogin(): Promise<void> {
    this.logStep("Open Invoice Financing from OEM login");
    await this.signInWithMakerCredentials();
    await this.navigateToModule();
  }

  async isModuleAvailable(): Promise<boolean> {
    const urlOk = /\/oem\/invoices|invoice-financing/i.test(this.page.url());
    const heading = await this.page
      .getByRole("heading", { name: /invoice financing/i })
      .isVisible()
      .catch(() => false);
    const uploadUi =
      (await this.downloadTemplateButton.isVisible().catch(() => false)) ||
      (await this.uploadInput.isVisible().catch(() => false)) ||
      (await this.uploadExcelButton.isVisible().catch(() => false));
    return urlOk && heading && uploadUi;
  }

  async getPageText(): Promise<string> {
    this.logStep("Read page body text");
    return this.page.locator("body").innerText();
  }

  async downloadTemplate(): Promise<void> {
    this.logStep("Click Download XLSX Template");
    await expect(this.downloadTemplateButton).toBeVisible({ timeout: 30_000 });
    await this.common.click(this.downloadTemplateButton);
  }

  async uploadFile(filePath: string): Promise<void> {
    this.logStep(`Upload invoice file: ${this.stepValueDisplay("file", filePath)}`);
    if (await this.uploadExcelButton.isVisible().catch(() => false)) {
      await this.common.click(this.uploadExcelButton);
    }
    const input =
      (await this.uploadInput.count()) > 0
        ? this.uploadInput
        : this.page.locator("input[type='file']").first();
    await input.setInputFiles(filePath);
    await this.waitForLoader();
    await this.page
      .getByText(/uploading|validating|processing/i)
      .waitFor({ state: "hidden", timeout: 120_000 })
      .catch(() => undefined);
    await this.page.waitForTimeout(2_000);
  }

  async expectKpiCards(): Promise<void> {
    this.logStep("Verify KPI cards (Total / Uploaded / Failed)");
    const text = await this.getPageText();
    expect(text).toMatch(/total batches|total invoices/i);
    expect(text).toMatch(/uploaded/i);
    expect(text).toMatch(/failed/i);
    if (await this.kpiTotal.isVisible().catch(() => false)) {
      await expect(this.kpiTotal).toBeVisible();
    }
  }

  async openAuditLog(): Promise<void> {
    this.logStep(`Open Audit and Tracking (${getAuditTrackingPath()})`);
    const auditPath = getAuditTrackingPath();
    const auditUrl = new RegExp(auditPath.replace(/\//g, "\\/"), "i");
    if (!auditUrl.test(this.page.url())) {
      if (await this.auditLogButton.isVisible().catch(() => false)) {
        await this.common.click(this.auditLogButton);
        await this.page
          .waitForURL(auditUrl, { timeout: 30_000 })
          .catch(() => undefined);
      }
      if (!auditUrl.test(this.page.url())) {
        await this.navigateTo(`${getOemAppOrigin()}${auditPath}`);
      }
    }
    await this.waitForLoader();
    await this.page
      .getByText(/loading/i)
      .waitFor({ state: "hidden", timeout: 60_000 })
      .catch(() => undefined);
  }

  async isAuditModuleComingSoon(): Promise<boolean> {
    const text = await this.getPageText();
    const onAudit =
      /\/audit/i.test(this.page.url()) || /audit.*tracking/i.test(text);
    return onAudit && /coming soon/i.test(text);
  }

  async hasInvoiceBatchData(): Promise<boolean> {
    const text = await this.getPageText();
    return (
      /OEM-BATCH-\d+/i.test(text) ||
      (await this.myUploadsGrid.isVisible().catch(() => false))
    );
  }

  getFirstBatchIdFromText(text: string): string | undefined {
    return text.match(/OEM-BATCH-\d+/i)?.[0];
  }

  async expandBatch(batchId?: string): Promise<void> {
    const id = batchId ?? this.getFirstBatchIdFromText(await this.getPageText());
    if (!id) {
      throw new Error("No invoice batch id found to expand.");
    }
    this.logStep(`Expand invoice batch: ${id}`);
    const row = this.page
      .locator("tr, [role='row']")
      .filter({ hasText: new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") })
      .first();
    await this.common.click(row);
    await this.waitForLoader();
    await this.page
      .getByText(new RegExp(`invoices in ${id}`, "i"))
      .waitFor({ state: "visible", timeout: 30_000 })
      .catch(() => undefined);
  }

  async searchInvoiceBatches(query: string): Promise<void> {
    this.logStep(`Search invoice batches: ${this.stepValueDisplay("query", query)}`);
    await this.openInvoicesTab();
    await this.common.clearAndFill(this.myUploadsSearchInput, query);
    await this.common.pressKey("Enter").catch(() => undefined);
    await this.waitForLoader();
    await this.page.waitForTimeout(1_500);
  }

  async countAuditEntries(): Promise<number> {
    this.logStep("Count audit log entries");
    if (await this.isAuditModuleComingSoon()) {
      return 0;
    }
    if ((await this.auditLogEntries.count()) > 0) {
      return await this.auditLogEntries.count();
    }
    const text = await this.getPageText();
    const lines = text
      .split("\n")
      .filter((line) => /invoice batch uploaded|lms sync cycle complete/i.test(line));
    return lines.length;
  }

  async openInvoicesTab(): Promise<void> {
    this.logStep("Open Invoices tab");
    if (await this.invoicesTab.isVisible().catch(() => false)) {
      await this.common.click(this.invoicesTab);
    }
    await this.waitForLoader();
  }

  async expectInvoicesTabHeader(): Promise<void> {
    this.logStep("Verify Invoices tab header metrics");
    await this.openInvoicesTab();
    const text = await this.getPageText();
    expect(text).toMatch(/total batches/i);
    expect(text).toMatch(/total invoices/i);
    expect(text).toMatch(/uploaded/i);
    expect(text).toMatch(/failed/i);
    if (await this.invoicesTabHeader.isVisible().catch(() => false)) {
      await expect(this.invoicesTabHeader).toBeVisible({ timeout: 30_000 });
    }
  }

  async exportGrid(): Promise<void> {
    this.logStep("Export invoices grid");
    await this.common.click(this.exportButton);
  }

  viewDetailsButton(ref: string): Locator {
    return this.page
      .getByRole("button", { name: /view details/i })
      .filter({ has: this.page.getByText(new RegExp(ref, "i")) })
      .or(
        this.page
          .locator("tr, [role='row']")
          .filter({ hasText: new RegExp(ref, "i") })
          .getByRole("button", { name: /view details/i }),
      )
      .first();
  }

  async openProductModelDetails(ref: string): Promise<void> {
    this.logStep(`Open product/model details for: ${ref}`);
    await this.common.click(this.viewDetailsButton(ref));
    await this.waitForLoader();
  }

  async downloadBatchAt(index: number): Promise<void> {
    this.logStep(`Download invoice batch at index ${index}`);
    await this.common.click(this.batchDownloadButtons.nth(index));
  }

  async searchMyUploads(query: string): Promise<void> {
    this.logStep(`Search My Uploads: ${this.stepValueDisplay("query", query)}`);
    if (await this.myUploadsTab.isVisible().catch(() => false)) {
      await this.common.click(this.myUploadsTab);
    }
    await this.common.clearAndFill(this.myUploadsSearchInput, query);
    await this.common.pressKey("Enter").catch(() => undefined);
    await this.waitForLoader();
    await this.page.waitForTimeout(1_500);
  }

  async filterMyUploadsByStatus(status: "uploaded" | "failed"): Promise<void> {
    this.logStep(`Filter invoice batches by status: ${status}`);
    await this.openInvoicesTab();
    const statusChip = this.page.getByRole("button", {
      name: new RegExp(`^${status}$`, "i"),
    });
    if (await statusChip.isVisible().catch(() => false)) {
      await this.common.click(statusChip.first());
    } else if (await this.myUploadsStatusFilter.isVisible().catch(() => false)) {
      await this.common.click(this.myUploadsStatusFilter);
      await this.page
        .getByRole("option", { name: new RegExp(`^${status}$`, "i") })
        .or(this.page.getByRole("menuitem", { name: new RegExp(status, "i") }))
        .first()
        .click();
    }
    await this.waitForLoader();
    await this.page.waitForTimeout(1_500);
  }
}
