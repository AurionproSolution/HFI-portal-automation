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
console.log("POST-LOGIN:", page.url());

// Dealer Finance tab if needed
const dfTab = page.getByRole("button", { name: /dealer finance/i }).or(page.getByText(/^dealer finance$/i));
if (await dfTab.first().isVisible().catch(() => false)) {
  await dfTab.first().click();
  await page.waitForTimeout(1500);
  console.log("AFTER DF TAB:", page.url());
}

const locators = [
  ["link in nav/aside", page.locator("nav, aside").getByRole("link", { name: /exposure settings/i })],
  ["any link", page.getByRole("link", { name: /exposure settings/i })],
  ["any button", page.getByRole("button", { name: /exposure settings/i })],
  ["getByText", page.getByText(/^exposure settings$/i)],
  ["sidebar text", page.locator("aside, nav, [class*='sidebar']").getByText(/exposure settings/i)],
];

for (const [name, loc] of locators) {
  const count = await loc.count();
  const vis = count > 0 ? await loc.first().isVisible().catch(() => false) : false;
  console.log(`LOC ${name}: count=${count} visible=${vis}`);
}

const before = page.url();
const target = page.getByText(/^exposure settings$/i).first();
if (await target.isVisible().catch(() => false)) {
  await target.click();
  await page.waitForTimeout(3000);
  console.log("BEFORE CLICK:", before);
  console.log("AFTER CLICK:", page.url());
  const body = await page.locator("body").innerText();
  console.log("MARKERS:", {
    visibility: /visibility preference/i.test(body),
    pending: /pending limit requests/i.test(body),
    normal: /normal limit/i.test(body),
    sanctioned: /sanctioned/i.test(body),
  });
}

await browser.close();
