import { chromium } from "playwright";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env"), override: true });

const base = process.env.BASE_URL;
const user = process.env.MUST_RESET_USERNAME;
const pass = process.env.MUST_RESET_PASSWORD;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(base, { waitUntil: "domcontentloaded" });
await page.getByRole("link", { name: /forgot password/i }).click();
await page.waitForTimeout(2000);
console.log("after forgot click url:", page.url());
console.log("headings:", await page.getByRole("heading").allTextContents());
console.log("buttons:", await page.getByRole("button").allTextContents());

if (user && pass) {
  await page.goto(base);
  await page.getByPlaceholder("dealer-id or email").fill(user);
  await page.getByPlaceholder("••••••••").fill(pass);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/reset-password|set-password|password/i, { timeout: 60000 }).catch(() => {});
  console.log("after login url:", page.url());
  console.log("labels:", await page.locator("label").allTextContents().catch(() => []));
  console.log("buttons2:", await page.getByRole("button").allTextContents());
}
await browser.close();
