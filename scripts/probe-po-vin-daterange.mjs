import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { chromium } from "playwright";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
process.env.ACTIVE_DEALER = process.env.ACTIVE_DEALER?.trim() || "dealer2";

const registry = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "testData/hfi/dealers.json"), "utf8"),
);

const dealerKey = process.env.ACTIVE_DEALER;
let profile;
for (const group of ["applicationCompleted", "applicationIncomplete"]) {
  if (registry[group][dealerKey]) {
    profile = registry[group][dealerKey];
    break;
  }
}
if (!profile) throw new Error("dealer not found");

const loginUrl = "http://devdealerportal.centralindia.cloudapp.azure.com/login";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 120000 });
await page.getByPlaceholder("dealer-id or email").fill(profile.email);
await page.locator("input[type='password']").fill(profile.password);
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL(/consumer|dashboard|login/i, { timeout: 90000 });
if (page.url().includes("/login")) {
  console.log(JSON.stringify({ login: "failed", dealer: profile.dealerCode }));
  process.exit(1);
}
await page.getByRole("button", { name: /dealer finance/i }).first().click().catch(() => undefined);
await page.waitForTimeout(1500);
await page.locator("nav, aside").getByRole("link", { name: /purchase orders/i }).first().click();
await page.waitForURL(/purchase-orders/i, { timeout: 30000 });
await page.waitForTimeout(2000);

async function snapshot(label) {
  await page.getByText(label, { exact: true }).click();
  await page.waitForTimeout(2500);
  const tables = await page.locator("table").count();
  const tbodyRows = await page.locator("table tbody tr").count();
  const roleRows = await page.locator("[role='row']").count();
  const main = await page.locator("main").innerText();
  const poMatch = /PO[-\s]?\d{4,}/i.test(main);
  const vinMatch = /\b[A-HJ-NPR-Z0-9]{11,17}\b/.test(main);
  return {
    label,
    tables,
    tbodyRows,
    roleRows,
    poMatch,
    vinMatch,
    snippet: main.slice(0, 500).replace(/\n/g, "|"),
  };
}

const results = [await snapshot("30D"), await snapshot("90D")];
console.log(JSON.stringify({ dealer: profile.dealerCode, results }));

await browser.close();
