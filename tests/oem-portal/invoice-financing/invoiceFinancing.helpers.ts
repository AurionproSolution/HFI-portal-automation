import fs from "fs";
import path from "path";
import { expect, test, type Download, type Page } from "@playwright/test";
import { OEMInvoiceFinancingPage } from "@pages/oem-portal/invoice-financing/OEMInvoiceFinancingPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const INVOICE_FINANCING_STEP_PREFIX = "OEM Portal — Invoice Financing";

/** Column headers present in Invoice Batches grid XLSX exports on DEV. */
const BATCH_GRID_XLSX_COLUMNS =
  /Batch No|File Name|Uploaded At|Uploaded By|Invoices|Qty|Amount|Status/i;

export function initInvoiceFinancingSteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(INVOICE_FINANCING_STEP_PREFIX, title);
  await test.step(title, fn);
}

export function skipWithReason(reason: string): never {
  throw new Error(`SKIP: ${reason}`);
}

export function requireEnv(name: string, reason: string): void {
  if (!process.env[name]?.trim()) {
    skipWithReason(reason);
  }
}

export function requireUploadFile(envKey: string, reason: string): string {
  const raw = process.env[envKey]?.trim();
  if (!raw) {
    skipWithReason(reason);
  }
  const resolved = path.isAbsolute(raw!)
    ? raw!
    : path.join(process.cwd(), raw!);
  if (!fs.existsSync(resolved)) {
    skipWithReason(`${reason} (file not found: ${resolved})`);
  }
  return resolved;
}

export async function openInvoiceFinancingPage(
  page: Page,
): Promise<OEMInvoiceFinancingPage> {
  const inv = new OEMInvoiceFinancingPage(page);
  await inv.openFromLogin();
  return inv;
}

export async function requireModule(
  page: Page,
): Promise<OEMInvoiceFinancingPage> {
  const inv = await openInvoiceFinancingPage(page);
  if (!(await inv.isModuleAvailable())) {
    skipWithReason(
      "Invoice Financing module not available on current OEM environment. Set INVOICE_FINANCING_PATH and OEM Maker credentials.",
    );
  }
  return inv;
}

function assertValidXlsxFile(filePath: string): void {
  const buf = fs.readFileSync(filePath);
  expect(buf.subarray(0, 2).toString()).toBe("PK");
  const embedded = buf.toString("utf8");
  expect(embedded).toMatch(BATCH_GRID_XLSX_COLUMNS);
}

/** Grid Export — `invoice-batches-YYYY-MM-DD.xlsx` with batch summary columns. */
export async function assertInvoiceBatchesGridXlsxExport(
  download: Download,
  outputDir: string,
): Promise<string> {
  const filename = download.suggestedFilename();
  expect(filename).toMatch(/invoice-batches-.*\.xlsx$/i);
  const savePath = path.join(outputDir, filename);
  await download.saveAs(savePath);
  assertValidXlsxFile(savePath);
  return savePath;
}

/** Per-batch Download — `OEM-BATCH-N.csv` or `.xlsx` with that batch's invoice rows. */
export async function assertSingleBatchExport(
  download: Download,
  outputDir: string,
  expectedBatchId?: string,
): Promise<{ path: string; isCsv: boolean }> {
  const filename = download.suggestedFilename();
  expect(filename).toMatch(/OEM-BATCH-\d+\.(csv|xlsx)$/i);
  if (expectedBatchId) {
    expect(filename).toMatch(
      new RegExp(expectedBatchId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    );
  }
  const savePath = path.join(outputDir, filename);
  await download.saveAs(savePath);
  const isCsv = /\.csv$/i.test(filename);
  if (!isCsv) {
    const buf = fs.readFileSync(savePath);
    expect(buf.subarray(0, 2).toString()).toBe("PK");
  }
  return { path: savePath, isCsv };
}

/** @deprecated Use assertSingleBatchExport — kept as alias. */
export async function assertSingleBatchXlsxExport(
  download: Download,
  outputDir: string,
  expectedBatchId?: string,
): Promise<string> {
  const result = await assertSingleBatchExport(download, outputDir, expectedBatchId);
  return result.path;
}

export function readBatchExportText(filePath: string, isCsv: boolean): string {
  if (isCsv) {
    return fs.readFileSync(filePath, "utf8");
  }
  return readXlsxEmbeddedText(filePath);
}

export function readXlsxEmbeddedText(filePath: string): string {
  return fs.readFileSync(filePath).toString("utf8");
}

/** Resolve search query from env or first visible batch / invoice on page. */
export function resolveInvoiceSearchQuery(pageText: string): string | undefined {
  return (
    process.env.OEM_SEARCH_INVOICE?.trim() ||
    process.env.OEM_SEARCH_DEALER?.trim() ||
    pageText.match(/OEM-BATCH-\d+/i)?.[0] ||
    pageText.match(/OEM-INV-\d+/i)?.[0] ||
    pageText.match(/\b[A-Z]{2}\d{5,6}\b/)?.[0]
  );
}
