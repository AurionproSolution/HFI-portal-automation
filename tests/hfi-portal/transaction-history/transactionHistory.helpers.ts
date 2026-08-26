import { test, type Page } from "@playwright/test";
import { HFITransactionHistoryPage } from "@pages/hfi-portal/dealer-finance/HFITransactionHistoryPage";
import { logTestStep, resetStepCounter } from "@utils/testStepLog";

export const TXN_HISTORY_STEP_PREFIX = "HFI Portal — Transaction History";

export function initTransactionHistorySteps(): void {
  resetStepCounter();
}

export async function regressionStep(
  title: string,
  fn: () => Promise<void>,
): Promise<void> {
  logTestStep(TXN_HISTORY_STEP_PREFIX, title);
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

export async function openTransactionHistoryPage(
  page: Page,
): Promise<HFITransactionHistoryPage> {
  const th = new HFITransactionHistoryPage(page);
  await th.openFromLogin();
  return th;
}

export async function requireModule(
  page: Page,
): Promise<HFITransactionHistoryPage> {
  const th = await openTransactionHistoryPage(page);
  if (!(await th.isModuleAvailable())) {
    skipWithReason(
      "Transaction History module not available. Use ACTIVE_DEALER=dealer8 and set TRANSACTION_HISTORY_PATH if needed.",
    );
  }
  return th;
}

export async function getFirstPoNumber(page: Page): Promise<string> {
  const th = new HFITransactionHistoryPage(page);
  if (!(await th.hasLedgerRows())) {
    await th.ensureLedgerData(["30D", "90D", "7D", "MTD", "YTD"]);
  }
  const text = await th.getPageText();
  const match = text.match(/PO-\d{4}-\d+/i);
  if (!match) {
    skipWithReason(
      "No PO number found in ledger after checking date ranges 30D/90D/7D/MTD/YTD.",
    );
  }
  return match[0];
}

export async function getFirstTransactionId(page: Page): Promise<string> {
  const text = await new HFITransactionHistoryPage(page).getPageText();
  const match = text.match(/TXN[-\s]?[A-Z0-9]{6,}/i);
  if (!match) {
    skipWithReason("No Transaction ID found in ledger.");
  }
  return match[0];
}
