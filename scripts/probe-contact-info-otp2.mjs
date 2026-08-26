import { chromium } from "@playwright/test";

const base = "http://devdealerportal.centralindia.cloudapp.azure.com";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const apis = [];
page.on("response", async (r) => {
  if (/otp|verify|contact|email|mobile|update/i.test(r.url())) {
    let body = "";
    try { body = JSON.stringify(await r.json()).slice(0, 300); } catch { body = ""; }
    apis.push({ s: r.status(), m: r.request().method(), u: r.url(), body });
  }
});

await page.goto(`${base}/login`);
await page.getByPlaceholder("dealer-id or email").fill("PB00018");
await page.getByPlaceholder("••••••••").fill("Secure@Pass4");
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
await page.goto(`${base}/profile`);
await page.waitForTimeout(2500);

await page.locator("main").getByRole("button", { name: /^update$/i }).first().click();
await page.locator('main input[placeholder="new.email@dealer.com"]').fill("ciu.probe2@gmail.com");
await page.getByRole("button", { name: /send otp/i }).click();
await page.waitForTimeout(2500);

const otpInput = page.locator('main input[placeholder="6-digit OTP"]');
await otpInput.fill("111111");
const verify = page.getByRole("button", { name: /verify otp/i });
console.log("before verify, disabled:", await verify.isDisabled());
await verify.click();
await page.waitForTimeout(3000);

console.log("buttons:", await page.locator("main button").allTextContents());
console.log("text:", (await page.locator("main").innerText()).split("\n").filter(l => /otp|incorrect|attempt|error|verify|resend|send/i.test(l)).join(" | "));
console.log("apis:", apis);

await browser.close();
