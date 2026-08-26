import { chromium } from "@playwright/test";

const base = "http://devdealerportal.centralindia.cloudapp.azure.com";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${base}/login`);
await page.getByPlaceholder("dealer-id or email").fill("PB00018");
await page.getByPlaceholder("••••••••").fill("Secure@Pass4");
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
await page.goto(`${base}/profile`);
await page.waitForTimeout(2500);

const openEmail = async () => {
  await page.locator("main").getByRole("button", { name: /^update$/i }).first().click();
  await page.waitForTimeout(400);
};
const newEmail = () => page.locator('main input[placeholder="new.email@dealer.com"]');
const sendOtp = () => page.getByRole("button", { name: /send otp/i });
const allText = async () => page.locator("main").innerText();

async function dump(label) {
  const t = await allText();
  const errors = t
    .split("\n")
    .filter((l) => /invalid|same|cannot|error|format|please enter/i.test(l));
  console.log(`\n=== ${label} ===`);
  console.log("errors:", errors.join(" | ") || "(none)");
  console.log("send disabled:", await sendOtp().isDisabled());
}

await openEmail();
await newEmail().fill("dealerexample.com");
await newEmail().blur();
await page.waitForTimeout(500);
await dump("invalid no @ blur");
await sendOtp().click({ force: true }).catch(() => {});
await page.waitForTimeout(500);
await dump("invalid no @ click send");

await newEmail().fill("dealer@");
await newEmail().blur();
await page.waitForTimeout(500);
await dump("invalid no domain");

await newEmail().fill("dealer8@gmail.com");
await newEmail().blur();
await page.waitForTimeout(500);
await dump("same email blur");
await sendOtp().click({ force: true }).catch(() => {});
await page.waitForTimeout(500);
await dump("same email click send");

await page.getByRole("button", { name: /cancel/i }).click();
await page.locator("main").getByRole("button", { name: /^update$/i }).nth(1).click();
await page.waitForTimeout(400);
const mob = page.locator("main input").nth(1);
const curMob = await page.locator("main input").first().inputValue();
console.log("\ncurrent mobile:", curMob);

await mob.fill("987654321");
await mob.blur();
await page.waitForTimeout(500);
await dump("9 digit mobile");

await mob.fill("98765432110");
await mob.blur();
await page.waitForTimeout(500);
await dump("11 digit mobile");

await mob.fill(curMob.replace(/\D/g, "").slice(-10));
await mob.blur();
await page.waitForTimeout(500);
await dump("same mobile");

await browser.close();
