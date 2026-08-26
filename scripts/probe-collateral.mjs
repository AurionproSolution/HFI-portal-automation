import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(path.join(__dirname, ".."));
process.env.ACTIVE_DEALER = process.env.ACTIVE_DEALER || "dealer8";
process.env.TEST_ENV = "dev";

await import("../config/env.ts");

const { HFICollateralPage } = await import(
  "../pages/hfi-portal/dealer-finance/HFICollateralPage.ts"
);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const col = new HFICollateralPage(page);
await col.openFromLogin();
const text = await col.getPageText();
console.log("URL:", page.url());
console.log("--- PAGE TEXT SAMPLE (first 4000 chars) ---");
console.log(text.slice(0, 4000));
console.log("--- KPI / NAV ---");
for (const re of [
  /total collateral/i,
  /active collateral/i,
  /expiring soon/i,
  /coverage ratio/i,
  /collateral securities/i,
  /bank guarantee/i,
  /all branches/i,
]) {
  console.log(re, "=>", re.test(text));
}
await page.screenshot({ path: "test-results/collateral-probe.png", fullPage: true });
await browser.close();
