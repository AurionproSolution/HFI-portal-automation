import { chromium } from "@playwright/test";

const base = "http://devdealerportal.centralindia.cloudapp.azure.com";
const user = process.env.PROBE_USER || "PB00018";
const pass = process.env.PROBE_PASS || "Secure@Pass4";
const paths = [
  "/dealer-finance/exposure",
  "/dealer-finance/exposure-settings",
  "/consumer-finance/exposure",
  "/exposure",
  "/dealer-finance",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${base}/login`);
await page.getByPlaceholder("dealer-id or email").fill(user);
await page.getByPlaceholder("••••••••").fill(pass);
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
console.log("POST-LOGIN URL:", page.url());

const navText = await page.locator("nav, aside").innerText().catch(() => "");
console.log("NAV LINKS (snippet):", navText.slice(0, 500).replace(/\n/g, " | "));

for (const p of paths) {
  await page.goto(`${base}${p}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const body = await page.locator("body").innerText();
  const hits = [
    /exposure settings/i.test(body) ? "heading" : null,
    /sanctioned/i.test(body) ? "sanctioned-kpi" : null,
    /normal limit/i.test(body) ? "normal-limit" : null,
    /visibility preference/i.test(body) ? "visibility" : null,
  ].filter(Boolean);
  console.log(`PATH ${p} -> ${page.url()} | markers: ${hits.join(", ") || "none"}`);
}

await browser.close();
