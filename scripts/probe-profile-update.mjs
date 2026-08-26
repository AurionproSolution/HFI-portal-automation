import { chromium } from "@playwright/test";

const base = "http://devdealerportal.centralindia.cloudapp.azure.com";
const user = "PB00018";
const pass = "Secure@Pass4";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${base}/login`);
await page.getByPlaceholder("dealer-id or email").fill(user);
await page.getByPlaceholder("••••••••").fill(pass);
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
await page.goto(`${base}/profile`);
await page.waitForTimeout(2000);

const updates = page.getByRole("button", { name: /^update$/i }).or(page.getByRole("link", { name: /^update$/i }));
console.log("update count", await updates.count());
if ((await updates.count()) > 0) {
  await updates.first().click();
  await page.waitForTimeout(2000);
  console.log("AFTER EMAIL UPDATE CLICK:", page.url());
  const body = await page.locator("body").innerText();
  console.log(body.slice(0, 2000));
}
await browser.close();
