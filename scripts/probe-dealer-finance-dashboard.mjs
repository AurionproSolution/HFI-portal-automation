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

const dfTab = page
  .getByRole("link", { name: /dealer finance/i })
  .or(page.getByRole("button", { name: /dealer finance/i }));
if (await dfTab.first().isVisible().catch(() => false)) {
  await dfTab.first().click();
  await page.waitForTimeout(2000);
}
console.log("URL:", page.url());
const body = await page.locator("body").innerText();
console.log("--- SAMPLE ---");
console.log(body.slice(0, 8000));
for (const re of [
  /normal limit/i,
  /adhoc limit/i,
  /needs you today/i,
  /pay dues/i,
  /po details/i,
  /po bucket/i,
  /donut|overdue/i,
  /all branches/i,
  /\b30D\b/,
  /days to nearest tranche/i,
  /interest repayment/i,
  /limit renewals/i,
]) {
  console.log(re, "=>", re.test(body));
}
await page.screenshot({ path: "test-results/dashboard-probe.png", fullPage: true });
await browser.close();
