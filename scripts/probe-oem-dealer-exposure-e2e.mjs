/**
 * OEM → Dealer Portal exposure/limit propagation probe.
 * Usage: node scripts/probe-oem-dealer-exposure-e2e.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const DEALER_ID = "dp1056723eaf82453e";
const DEALER_PASS = "test@1234567890";
const OEM_USER = process.env.OEM_MAKER_USERNAME || "ved.prakash";
const OEM_PASS = process.env.OEM_MAKER_PASSWORD || "Secure@Pass2";
const BASE = "http://devdealerportal.centralindia.cloudapp.azure.com";
const OUT_DIR = path.join(process.cwd(), "reports", "oem-dealer-e2e");
const SYNC_WAIT_MS = 15_000;

function parseExposureValues(text) {
  const pick = (label) => {
    const re = new RegExp(`${label}[^\\n₹]*₹\\s*([\\d,.]+\\s*(?:L|Cr|cr|l)?)`, "i");
    const m = text.match(re);
    return m?.[1]?.trim() ?? null;
  };
  const pct = text.match(/(\d+(?:\.\d+)?)\s*%\s*utilised/i);
  return {
    sanctioned: pick("sanctioned"),
    utilised: pick("utilised"),
    available: pick("available"),
    pctUtilised: pct?.[1] ?? null,
    normalLimit: text.match(/normal limit[\s\S]{0,200}?₹\s*([\d,.]+\s*(?:L|Cr|cr|l)?)/i)?.[1] ?? null,
    adhocLimit: text.match(/adhoc limit[\s\S]{0,200}?₹\s*([\d,.]+\s*(?:L|Cr|cr|l)?)/i)?.[1] ?? null,
  };
}

async function screenshot(page, name) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`SCREENSHOT: ${file}`);
  return file;
}

const report = {
  dealerId: DEALER_ID,
  oemUser: OEM_USER,
  timestamp: new Date().toISOString(),
  oem: {},
  dealer: {},
  e2e: { status: "PENDING", reason: "" },
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  // ── OEM login ──
  console.log("\n=== OEM Portal — Dealer Limits ===");
  await page.goto(`${BASE}/oem/login`);
  await page.getByRole("textbox", { name: /maker-id|checker-id|user-?id/i }).or(page.locator("input[type='text']").first()).fill(OEM_USER);
  await page.locator("input[type='password']").first().fill(OEM_PASS);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
  console.log("OEM post-login:", page.url());

  const dlLink = page.locator("nav, aside").getByRole("link", { name: /dealer limit/i }).first();
  if (await dlLink.isVisible().catch(() => false)) {
    await dlLink.click();
  } else {
    await page.goto(`${BASE}/oem/dealer-limits`);
  }
  await page.waitForTimeout(5000);
  await page.getByText(/loading dealer limits/i).waitFor({ state: "hidden", timeout: 60_000 }).catch(() => undefined);

  const search = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox")).first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill(DEALER_ID);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
  }

  const bodyOem = await page.locator("body").innerText();
  const dealerFound = new RegExp(DEALER_ID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(bodyOem);
  report.oem.dealerFound = dealerFound;
  report.oem.pageUrl = page.url();

  const editButtons = await page.getByRole("button", { name: /^edit$/i }).count();
  const limitActions = await page.getByRole("button", { name: /raise limit|approve limit|limit change|update limit/i }).count();
  const editableInputs = await page.locator("input:not([type='hidden']), textarea, [contenteditable='true']").count();
  report.oem.editControls = { editButtons, limitActions, editableInputs };
  report.oem.readOnly = editButtons === 0 && limitActions === 0 && editableInputs === 0;

  const rowMatch = bodyOem.match(
    new RegExp(`${DEALER_ID}[\\s\\S]{0,500}`, "i"),
  );
  report.oem.dealerRowSnippet = rowMatch?.[0]?.slice(0, 400) ?? "NOT FOUND";

  const crAmounts = [...bodyOem.matchAll(/(\d+(?:\.\d+)?)\s*(?:cr|Cr)/g)].map((m) => m[0]);
  const lakhAmounts = [...bodyOem.matchAll(/₹\s*([\d,.]+)\s*L/gi)].map((m) => m[0]);
  report.oem.amountsVisible = { cr: crAmounts.slice(0, 10), lakh: lakhAmounts.slice(0, 10) };

  await screenshot(page, "01-oem-dealer-limits");

  // Scan OEM nav for any exposure/limit edit module
  const navText = await page.locator("nav, aside").innerText().catch(() => "");
  report.oem.navItems = navText.split("\n").map((l) => l.trim()).filter(Boolean);

  const exposureLinks = page.getByRole("link", { name: /exposure|limit management|dealer limit/i });
  report.oem.exposureNavCount = await exposureLinks.count();

  if (report.oem.readOnly) {
    report.e2e.status = "BLOCKED";
    report.e2e.reason =
      "OEM Dealer Limits dashboard is read-only — no edit/raise/approve limit controls. Cannot perform OEM-side limit change through UI.";
    console.log("\nOEM CHANGE: BLOCKED — read-only dashboard, no edit controls.");
  } else {
    console.log("\nOEM CHANGE: Edit controls detected — attempting controlled change...");
    // Placeholder for future if edit UI appears
    report.e2e.status = "BLOCKED";
    report.e2e.reason = "Edit controls found but change flow not automated — manual investigation required.";
  }

  // ── Dealer Portal — baseline exposure values ──
  console.log("\n=== Dealer Portal — Exposure Settings (before/after OEM) ===");
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder("dealer-id or email").fill(DEALER_ID);
  await page.getByPlaceholder("••••••••").fill(DEALER_PASS);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
  console.log("Dealer post-login:", page.url());

  const dfTab = page.getByRole("button", { name: /dealer finance/i }).or(page.getByText(/^dealer finance$/i));
  if (await dfTab.first().isVisible().catch(() => false)) {
    await dfTab.first().click();
    await page.waitForTimeout(1500);
  }

  const expNav = page.getByText(/^exposure settings$/i).first();
  if (await expNav.isVisible().catch(() => false)) {
    await expNav.click();
  } else {
    await page.goto(`${BASE}/financials/exposure`);
  }
  await page.waitForTimeout(5000);
  await page.getByText(/loading/i).waitFor({ state: "hidden", timeout: 60_000 }).catch(() => undefined);

  let dealerBody = await page.locator("main, body").innerText();
  report.dealer.before = parseExposureValues(dealerBody);
  report.dealer.beforeRaw = dealerBody.slice(0, 2000);
  await screenshot(page, "02-dealer-exposure-before");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(SYNC_WAIT_MS);
  dealerBody = await page.locator("main, body").innerText();
  report.dealer.afterRefresh = parseExposureValues(dealerBody);
  await screenshot(page, "03-dealer-exposure-after-refresh");

  if (report.e2e.status === "BLOCKED") {
    report.e2e.dealerPortalRead = report.dealer.afterRefresh;
    report.e2e.note =
      "Dealer Portal values captured for reference; OEM change could not be executed (read-only OEM UI).";
  }
} catch (err) {
  report.e2e.status = "FAIL";
  report.e2e.reason = err instanceof Error ? err.message : String(err);
  await screenshot(page, "error").catch(() => undefined);
  console.error("PROBE ERROR:", report.e2e.reason);
} finally {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const jsonPath = path.join(OUT_DIR, "probe-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\nREPORT: ${jsonPath}`);
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
