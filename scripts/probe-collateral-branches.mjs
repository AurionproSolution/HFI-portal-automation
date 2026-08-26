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
await page.goto(`${base}/collateral`);
await page.waitForTimeout(3000);
const trigger = page.getByRole("button", { name: /all branches/i });
await trigger.click();
await page.waitForTimeout(1000);
const options = await page.getByRole("option").allInnerTexts();
const menuitems = await page.getByRole("menuitem").allInnerTexts();
const listbox = await page.locator("[role='listbox'] *").allInnerTexts();
console.log("options:", options);
console.log("menuitems:", menuitems);
console.log("listbox:", listbox.slice(0, 20));
await browser.close();
