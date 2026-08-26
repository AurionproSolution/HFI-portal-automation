import { chromium } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const base =
  process.env.BASE_URL?.trim() ||
  "http://devdealerportal.centralindia.cloudapp.azure.com/login";
const origin = base.replace(/\/login\/?$/, "");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const paths = [
    "/dealer-finance/purchase-orders",
    "/dealer-finance/purchase-orders-vins",
    "/dealer-finance/po-vin",
    "/dealer-finance/purchase-orders-and-vins",
    "/purchase-orders",
    "/purchase-orders-vins",
    "/dealer-finance",
    "/consumer-finance",
  ];

  await page.goto(`${origin}/login`);
  await page.getByPlaceholder("dealer-id or email").fill("dealer8@gmail.com");
  await page.getByPlaceholder("••••••••").fill("Secure@Pass4");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(8000);
  console.log("After login URL:", page.url());

  const navText = await page.locator("nav, aside").innerText().catch(() => "");
  console.log("Nav links snippet:", navText.slice(0, 500));

  for (const p of paths) {
    await page.goto(`${origin}${p}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const body = await page.locator("body").innerText();
    const hit =
      /purchase order|po\s*&\s*vin|total pos|total vins|payment pending/i.test(
        body,
      );
    console.log(p, "=>", page.url(), hit ? "MATCH" : "no");
    if (hit) console.log(body.slice(0, 1200));
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
