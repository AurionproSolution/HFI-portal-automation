import { chromium } from "@playwright/test";

const base = "http://devdealerportal.centralindia.cloudapp.azure.com";
const user = process.env.DEALER_CODE || "PB00018";
const pass = process.env.DEALER_PASS || "Secure@Pass4";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${base}/login`);
await page.getByPlaceholder("dealer-id or email").fill(user);
await page.getByPlaceholder("••••••••").fill(pass);
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
console.log("POST-LOGIN:", page.url());

const dfTab = page
  .getByRole("button", { name: /dealer finance/i })
  .or(page.getByText(/^dealer finance$/i));
if (await dfTab.first().isVisible().catch(() => false)) {
  await dfTab.first().click();
  await page.waitForTimeout(1500);
  console.log("AFTER DF TAB:", page.url());
}

const paths = [
  "/financials/collateral",
  "/dealer-finance/collateral",
  "/operations/collateral",
  "/collateral",
];

for (const p of paths) {
  await page.goto(`${base}${p}`);
  await page.waitForTimeout(2000);
  const body = await page.locator("body").innerText();
  console.log(`PATH ${p}:`, page.url(), {
    collateral: /collateral/i.test(body),
    kpi: /total collateral/i.test(body),
    login: /sign in/i.test(body),
  });
}

const navLink = page
  .locator("nav, aside")
  .getByRole("link", { name: /collateral/i });
console.log("NAV collateral links:", await navLink.count());
if ((await navLink.count()) > 0) {
  await navLink.first().click();
  await page.waitForTimeout(3000);
  console.log("AFTER NAV CLICK:", page.url());
}

const body = await page.locator("body").innerText();
console.log("--- SAMPLE ---");
console.log(body.slice(0, 5000));
for (const re of [
  /total collateral/i,
  /active collateral/i,
  /expiring soon/i,
  /coverage ratio/i,
  /collateral securities/i,
  /bank guarantee/i,
  /all branches/i,
  /honda finance/i,
]) {
  console.log(re, "=>", re.test(body));
}

await page.screenshot({
  path: "test-results/collateral-probe.png",
  fullPage: true,
});
await browser.close();
