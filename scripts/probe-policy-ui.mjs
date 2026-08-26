import { chromium } from "playwright";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env"), override: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(process.env.BASE_URL);
await page.getByPlaceholder("dealer-id or email").fill(process.env.MUST_RESET_USERNAME);
await page.getByPlaceholder("••••••••").fill(process.env.MUST_RESET_PASSWORD);
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL(/reset-password/);
const newPwd = page.getByLabel(/new password/i).or(page.locator('input').nth(1));
await newPwd.fill("a");
console.log(await page.locator("body").innerText());
await browser.close();
