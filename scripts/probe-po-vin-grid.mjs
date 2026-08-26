/**
 * One-shot probe: PO grid row count and identifiers (no secrets logged).
 * Usage: ACTIVE_DEALER=dealer8 npx tsx scripts/probe-po-vin-grid.mjs
 */
import dotenv from "dotenv";
import path from "path";
import { chromium } from "playwright";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const dealerKey = process.env.ACTIVE_DEALER?.trim() || "dealer8";
process.env.ACTIVE_DEALER = dealerKey;
process.env.TEST_ENV = "dev";

const { applyActiveDealerToProcessEnv, findDealerEntry, getDealerLoginPassword, getLoginUsername } =
  await import("../config/dealer-registry.ts");
const { getLoginUrl } = await import("../config/hfi-env.ts");

applyActiveDealerToProcessEnv();
const entry = findDealerEntry(dealerKey);
if (!entry) {
  console.log("DEALER_NOT_FOUND", dealerKey);
  process.exit(1);
}

const username = getLoginUsername(entry.profile);
const password = getDealerLoginPassword(entry.profile);
const dealerCode = entry.profile.dealerCode;

const browser = await chromium.launch({
  headless: process.env.HEADLESS !== "false",
});
const page = await browser.newPage();

await page.goto(getLoginUrl(), { waitUntil: "networkidle", timeout: 120_000 });
await page.getByPlaceholder("dealer-id or email").fill(username);
await page.locator("input[type='password']").fill(password);
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL(/consumer|dashboard|login/i, { timeout: 90_000 });
if (page.url().includes("/login")) {
  console.log("LOGIN_FAILED", dealerCode);
  await browser.close();
  process.exit(1);
}

const dfTab = page.getByRole("button", { name: /dealer finance/i }).first();
if (await dfTab.isVisible().catch(() => false)) {
  await dfTab.click();
  await page.waitForTimeout(2000);
}

const nav = page.locator("nav, aside").getByRole("link", { name: /purchase orders/i }).first();
await nav.click();
await page.waitForURL(/purchase-orders|operations/i, { timeout: 30_000 });
await page.waitForTimeout(3000);

const rowCount = await page.locator("table tbody tr, [role='row']").count();
const firstRowText = await page.locator("table tbody tr").first().innerText().catch(() => "");
const mainText = await page.locator("main").innerText();
const poMatch = mainText.match(/PO[-\s]?\d{4,}/i);
const vinMatch = mainText.match(/\b[A-HJ-NPR-Z0-9]{11,17}\b/);

// Try expand first row
const firstRow = page.locator("table tbody tr").first();
if (await firstRow.isVisible().catch(() => false)) {
  await firstRow.click();
  await page.waitForTimeout(1500);
}
const afterExpand = await page.locator("main").innerText();
const vinAfter = afterExpand.match(/\b[A-HJ-NPR-Z0-9]{11,17}\b/);

console.log(
  JSON.stringify({
    dealer: dealerCode,
    rowCount,
    firstRowSnippet: firstRowText.slice(0, 120).replace(/\n/g, "|"),
    poRegexMatch: poMatch?.[0] ?? null,
    vinBeforeExpand: vinMatch?.[0] ?? null,
    vinAfterExpand: vinAfter?.[0] ?? null,
    hasBranchSelect: await page.getByLabel(/branch/i).isVisible().catch(() => false),
    hasDateRange: await page.getByLabel(/date range/i).isVisible().catch(() => false),
  }),
);

await browser.close();
