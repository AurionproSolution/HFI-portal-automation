import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(path.join(__dirname, ".."));
process.env.ACTIVE_DEALER = process.env.ACTIVE_DEALER || "dealer8";
process.env.TEST_ENV = "dev";

await import("../config/env.ts");

const { HFIPurchaseOrdersVINsPage } = await import(
  "../pages/hfi-portal/dealer-finance/HFIPurchaseOrdersVINsPage.ts"
);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const po = new HFIPurchaseOrdersVINsPage(page);
await po.openFromLogin();
const text = await po.getPageText();
console.log("URL:", page.url());
console.log("--- PAGE TEXT SAMPLE (first 3000 chars) ---");
console.log(text.slice(0, 3000));
console.log("--- PO PATTERNS ---");
const poMatches = [...text.matchAll(/PO[^\n]{0,30}/gi)].slice(0, 15);
poMatches.forEach((m) => console.log(m[0]));
console.log("--- VIN PATTERNS ---");
const vinMatches = [...text.matchAll(/\b[A-HJ-NPR-Z0-9]{11,17}\b/g)].slice(0, 10);
vinMatches.forEach((m) => console.log(m[0]));
await page.screenshot({ path: "test-results/po-vins-probe.png", fullPage: true });
await browser.close();
