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

await page.locator("main").getByRole("button", { name: /^update$/i }).first().click();
await page.waitForTimeout(400);
await page.locator('main input[placeholder="new.email@dealer.com"]').fill("ciu.probe.test@gmail.com");
await page.getByRole("button", { name: /send otp/i }).click();
await page.waitForTimeout(2000);

const otpInput = page.locator('main input[placeholder="6-digit OTP"]');
console.log("otp visible", await otpInput.isVisible());
console.log("resend visible", await page.getByRole("button", { name: /resend otp/i }).isVisible().catch(() => false));
console.log("resend text", await page.locator("main").getByText(/resend|second|\\d+s/i).allTextContents());

await otpInput.fill("111111");
await page.getByRole("button", { name: /verify otp/i }).click();
await page.waitForTimeout(2000);
const t = await page.locator("main").innerText();
console.log("after wrong otp:", t.split("\n").filter(l => /incorrect|attempt|remaining|invalid|unsuccessful/i.test(l)).join(" | "));

console.log("verify disabled empty:", await page.getByRole("button", { name: /verify otp/i }).isDisabled());
await otpInput.fill("");
console.log("verify disabled cleared:", await page.getByRole("button", { name: /verify otp/i }).isDisabled());

const resend = page.getByRole("button", { name: /resend otp/i });
if (await resend.isVisible().catch(() => false)) {
  console.log("resend disabled:", await resend.isDisabled());
  console.log("countdown:", await page.locator("main").getByText(/\\d+\\s*s/i).textContent().catch(() => null));
}

// storage check
const storage = await page.evaluate(() => ({
  local: Object.keys(localStorage),
  session: Object.keys(sessionStorage),
}));
console.log("storage keys", storage);

await browser.close();
