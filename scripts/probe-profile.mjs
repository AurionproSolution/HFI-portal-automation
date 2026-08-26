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

const dfTab = page.getByRole("link", { name: /dealer finance/i }).or(page.getByRole("button", { name: /dealer finance/i }));
if (await dfTab.first().isVisible().catch(() => false)) {
  await dfTab.first().click();
  await page.waitForTimeout(1500);
}

await page.goto(`${base}/profile`);
await page.waitForTimeout(3000);
console.log("URL:", page.url());
const body = await page.locator("body").innerText();
console.log("--- SAMPLE ---");
console.log(body.slice(0, 10000));
for (const re of [
  /dealer information/i,
  /dealer branches/i,
  /key connects/i,
  /escalation/i,
  /all branches/i,
  /registered email/i,
  /registered mobile/i,
  /gstin/i,
  /last login/i,
  /update/i,
  /l1|level 1/i,
  /l2|level 2/i,
]) {
  console.log(re, "=>", re.test(body));
}
await page.screenshot({ path: "test-results/profile-probe.png", fullPage: true });
await browser.close();
