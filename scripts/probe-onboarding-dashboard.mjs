import { chromium } from "playwright";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const base = process.env.BASE_URL || "";
const loginUrl = base.includes("/login") ? base : `${base.replace(/\/$/, "")}/login`;
const user = process.env.USERNAME?.trim() || process.env.DEALER_CODE;
const pass = process.env.PASSWORD;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.getByPlaceholder("dealer-id or email").fill(user);
await page.getByPlaceholder("••••••••").fill(pass);
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForTimeout(8_000);
if (page.url().includes("reset-password")) {
  console.log("LANDING: reset-password mandatory");
} else {
  console.log("URL:", page.url());
}
const nav = await page.locator("nav a, aside a, [class*='sidebar'] a").allTextContents();
console.log("NAV_LINKS:", JSON.stringify(nav.filter(Boolean).slice(0, 30)));
const bodySnippet = (await page.locator("body").innerText()).slice(0, 4000);
console.log("BODY_SNIPPET:\n", bodySnippet);
await page.screenshot({ path: "test-results/probe-onboarding.png", fullPage: true });
await browser.close();
