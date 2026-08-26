import { test, type Page } from "@playwright/test";
import {
  HFIPurchaseOrdersVINsPage,
  type PoVinDateRangePreset,
} from "@pages/hfi-portal/dealer-finance/HFIPurchaseOrdersVINsPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const PO_VIN_STEP_PREFIX = "HFI Portal — Purchase Orders & VINs";

export function initPurchaseOrdersVINsSteps(): void {
  resetStepCounter();
}

/** UDC-style step logging — visible in terminal, Ortoni (stdIO), and Playwright HTML steps. */
export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(PO_VIN_STEP_PREFIX, title);
  await test.step(title, fn);
}

function vinCountFromPoRowText(rowText: string): number | undefined {
  const soldMatch = rowText.match(/\b(\d+)\s*·\s*\d+\s+sold\b/i);
  if (soldMatch) {
    return Number.parseInt(soldMatch[1], 10);
  }

  const statusMatch = rowText.match(
    /(?:Received|Amended|Created|Dispatched|Cancelled)[\s\S]*?\b(\d+)\b[\s\S]*?₹/i,
  );
  if (statusMatch) {
    return Number.parseInt(statusMatch[1], 10);
  }

  const legacyMatch = rowText.match(
    /(?:Received|Amended|Created|Dispatched|Cancelled)\s+(\d+)\s+₹/i,
  );
  if (legacyMatch) {
    return Number.parseInt(legacyMatch[1], 10);
  }

  return undefined;
}

function isPoRowWithVins(rowText: string): boolean {
  const vinCount = vinCountFromPoRowText(rowText);
  return typeof vinCount === "number" && vinCount > 0;
}

export function skipWithReason(reason: string): never {
  throw new Error(`SKIP: ${reason}`);
}

export async function openPurchaseOrdersVINsPage(
  page: Page,
): Promise<HFIPurchaseOrdersVINsPage> {
  const po = new HFIPurchaseOrdersVINsPage(page);
  await po.openFromLogin();
  return po;
}

/**
 * Opens module and applies 30D/90D (etc.) when needed — does not skip KPI-only tests.
 */
export async function requireModule(
  page: Page,
  options?: { requireGridData?: boolean },
): Promise<HFIPurchaseOrdersVINsPage> {
  const po = await openPurchaseOrdersVINsPage(page);
  await po.expectModuleLoaded();
  await po.ensurePoVinGridData(["30D", "90D", "7D", "MTD", "YTD"]);
  if (options?.requireGridData) {
    await requirePoVinGridData(po);
  }
  return po;
}

export function requireEnv(name: string, reason: string): void {
  if (!process.env[name]?.trim()) {
    skipWithReason(reason);
  }
}

/** Apply date-range presets until PO grid rows appear; skip only when still empty. */
export async function requirePoVinGridData(
  po: HFIPurchaseOrdersVINsPage,
): Promise<PoVinDateRangePreset | undefined> {
  if (!(await po.hasPoGridRows())) {
    await po.ensurePoVinGridData(["30D", "90D", "7D", "MTD", "YTD"]);
  }
  if (!(await po.hasPoGridRows())) {
    skipWithReason(
      "No PO/VIN rows after checking date ranges 30D and 90D (and 7D, MTD, YTD).",
    );
  }
  return undefined;
}

export async function getFirstPoIdentifier(page: Page): Promise<string> {
  const po = new HFIPurchaseOrdersVINsPage(page);
  await requirePoVinGridData(po);

  const rows = page.getByRole("row").filter({
    has: page.getByRole("button", { name: /^PO-/i }),
  });
  const candidates: Array<{ id: string; vinCount: number }> = [];
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const rowText = await rows.nth(i).innerText();
    const id = po.extractPoIdentifierFromText(rowText);
    const vinCount = vinCountFromPoRowText(rowText) ?? 0;
    if (id) {
      candidates.push({ id, vinCount });
    }
  }

  const withVins = candidates
    .filter((c) => c.vinCount > 0)
    .sort((a, b) => b.vinCount - a.vinCount);
  if (withVins[0]?.id) {
    return withVins[0].id;
  }

  if (candidates[0]?.id) {
    return candidates[0].id;
  }

  const poButton = page.getByRole("button", { name: /^PO-/i }).first();
  if (await poButton.isVisible().catch(() => false)) {
    const label = (await poButton.innerText()).trim();
    if (label) {
      return label;
    }
  }

  const pageText = await po.getPageText();
  const fromPage = po.extractPoIdentifierFromText(pageText);
  if (fromPage) {
    return fromPage;
  }

  skipWithReason(
    "No PO number found in grid after checking date ranges 30D and 90D.",
  );
}

export async function getFirstInStockVin(page: Page): Promise<string> {
  const po = new HFIPurchaseOrdersVINsPage(page);
  await requirePoVinGridData(po);

  const rows = page.getByRole("row").filter({
    has: page.getByRole("button", { name: /^PO-/i }),
  });
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const rowText = await rows.nth(i).innerText();
    const poId = po.extractPoIdentifierFromText(rowText);
    if (!poId || !isPoRowWithVins(rowText)) {
      continue;
    }
    await po.expandPoRow(poId);
    await page.waitForTimeout(1_000);

    const fromRow = await po.getFirstExpandedVin();
    if (fromRow) {
      return fromRow;
    }
    await po.closePoDetailDrawerIfOpen();
  }

  skipWithReason(
    "No In Stock VIN found after expanding PO rows with VINs (checked 30D/90D presets).",
  );
}

export async function getFirstSoldUnpaidVin(page: Page): Promise<string> {
  const po = new HFIPurchaseOrdersVINsPage(page);
  await requirePoVinGridData(po);

  const rows = page.getByRole("row").filter({
    has: page.getByRole("button", { name: /^PO-/i }),
  });
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const rowText = await rows.nth(i).innerText();
    const poId = po.extractPoIdentifierFromText(rowText);
    if (!poId || !isPoRowWithVins(rowText)) {
      continue;
    }
    await po.expandPoRow(poId);
    await page.waitForTimeout(1_000);

    const soldVin = await po.getFirstSoldUnpaidVin();
    if (soldVin) {
      return soldVin;
    }
    await po.closePoDetailDrawerIfOpen();
  }

  skipWithReason(
    "No Sold unpaid VIN found after expanding PO rows (set PO_VIN_SOLD_UNPAID if known).",
  );
}

export async function getSoldUnpaidVins(
  page: Page,
  min = 1,
): Promise<string[]> {
  const po = new HFIPurchaseOrdersVINsPage(page);
  await requirePoVinGridData(po);

  const rows = page.getByRole("row").filter({
    has: page.getByRole("button", { name: /^PO-/i }),
  });
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const rowText = await rows.nth(i).innerText();
    const poId = po.extractPoIdentifierFromText(rowText);
    const vinCount = vinCountFromPoRowText(rowText) ?? 0;
    if (!poId || vinCount <= 0) {
      continue;
    }
    await po.expandPoRow(poId);
    await page.waitForTimeout(1_000);

    const vins = await po.getAllSoldUnpaidVins();
    if (vins.length >= min) {
      return vins;
    }
    await po.closePoDetailDrawerIfOpen();
  }

  skipWithReason(
    `Need at least ${min} Sold unpaid VIN(s) after expanding PO rows on DEV.`,
  );
}

export async function getFirstVin(page: Page): Promise<string> {
  try {
    return await getFirstInStockVin(page);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.startsWith("SKIP:")) {
      throw e;
    }
  }
  return getFirstSoldUnpaidVin(page);
}
