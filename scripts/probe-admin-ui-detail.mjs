import { chromium } from "playwright";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const origin = "http://devdealerportal.centralindia.cloudapp.azure.com";

async function main() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto(`${origin}/admin/login`);
  await p.getByRole("textbox").first().fill(process.env.ADMIN_USERNAME);
  await p.locator("input[type=password]").fill(process.env.ADMIN_PASSWORD);
  await p.getByRole("button", { name: /sign in|log in/i }).click();
  await p.waitForTimeout(4000);

  const inputs = await p.locator("input").evaluateAll((els) =>
    els.map((e) => ({
      ph: e.placeholder,
      type: e.type,
      aria: e.getAttribute("aria-label"),
    })),
  );
  console.log("PORTAL USERS INPUTS:", JSON.stringify(inputs, null, 2));

  await p.getByRole("button", { name: /add oem user/i }).click();
  await p.waitForTimeout(2000);
  const dialogText = await p.locator("[role='dialog'], form").first().innerText().catch(() => "");
  console.log("ADD USER DIALOG:", dialogText.slice(0, 2000));
  const dialogInputs = await p.locator("[role='dialog'] input, [role='dialog'] select").evaluateAll((els) =>
    els.map((e) => ({ tag: e.tagName, ph: e.placeholder, aria: e.getAttribute("aria-label") })),
  );
  console.log("DIALOG INPUTS:", JSON.stringify(dialogInputs, null, 2));

  await p.goto(`${origin}/admin/support-comms`);
  await p.waitForTimeout(2000);
  const scInputs = await p.locator("input, textarea").evaluateAll((els) =>
    els.map((e) => ({
      ph: e.placeholder,
      aria: e.getAttribute("aria-label"),
      id: e.id,
      val: (e.value || "").slice(0, 40),
    })),
  );
  console.log("SUPPORT COMMS FIELDS:", JSON.stringify(scInputs, null, 2));
  console.log("SUPPORT BODY:", (await p.locator("body").innerText()).slice(0, 2500));

  await b.close();
}

main();
