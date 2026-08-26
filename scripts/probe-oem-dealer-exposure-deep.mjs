/**
 * Deep OEM ↔ Dealer exposure probe — maps dealer codes and captures limit values.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const DEALER_ID = "dp1056723eaf82453e";
const DEALER_PASS = "test@1234567890";
const OEM_USER = process.env.OEM_MAKER_USERNAME || "ved.prakash";
const OEM_PASS = process.env.OEM_MAKER_PASSWORD || "Secure@Pass2";
const BASE = "http://devdealerportal.centralindia.cloudapp.azure.com";
const OUT = path.join(process.cwd(), "reports", "oem-dealer-e2e");

async function oemLogin(page) {
  await page.goto(`${BASE}/oem/login`);
  await page
    .getByRole("textbox", { name: /maker-id|checker-id|user-?id/i })
    .or(page.locator("input[type='text']").first())
    .fill(OEM_USER);
  await page.locator("input[type='password']").first().fill(OEM_PASS);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
}

async function dealerLogin(page) {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder("dealer-id or email").fill(DEALER_ID);
  await page.getByPlaceholder("••••••••").fill(DEALER_PASS);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
}

async function openExposure(page) {
  const df = page.getByRole("button", { name: /dealer finance/i }).or(page.getByText(/^dealer finance$/i));
  if (await df.first().isVisible().catch(() => false)) {
    await df.first().click();
    await page.waitForTimeout(2000);
  }
  const link = page.getByText(/^exposure settings$/i).first();
  if (await link.isVisible().catch(() => false)) {
    await link.click();
  } else {
    await page.goto(`${BASE}/financials/exposure`);
  }
  await page.waitForTimeout(5000);
}

function extractValues(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    sanctioned: lines.find((l) => /^sanctioned$/i.test(l)) ? text.match(/sanctioned[\s\S]{0,80}?₹\s*([\d,.]+\s*(?:L|Cr)?)/i)?.[1] : null,
    utilised: text.match(/utilised[\s\S]{0,80}?₹\s*([\d,.]+\s*(?:L|Cr)?)/i)?.[1],
    available: text.match(/available[\s\S]{0,80}?₹\s*([\d,.]+\s*(?:L|Cr)?)/i)?.[1],
    pctUtilised: text.match(/(\d+(?:\.\d+)?)\s*%/)?.[1],
    dealerCodes: [...text.matchAll(/\b([A-Z]{2}\d{4,6}|dp[a-f0-9]{10,}|HMD-\d+)\b/gi)].map((m) => m[1]),
    snippet: text.slice(0, 3000),
  };
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const out = { dealerId: DEALER_ID, oemUser: OEM_USER, timestamp: new Date().toISOString() };

try {
  await dealerLogin(page);
  out.dealerPostLoginUrl = page.url();
  await openExposure(page);
  out.dealerExposureUrl = page.url();
  const dealerText = await page.locator("body").innerText();
  out.dealerExposure = extractValues(dealerText);
  await page.screenshot({ path: path.join(OUT, "dealer-exposure.png"), fullPage: true });

  await oemLogin(page);
  const dl = page.locator("nav, aside").getByRole("link", { name: /dealer limit/i }).first();
  if (await dl.isVisible().catch(() => false)) await dl.click();
  else await page.goto(`${BASE}/oem/dealer-limits`);
  await page.getByText(/loading dealer limits/i).waitFor({ state: "hidden", timeout: 60_000 }).catch(() => undefined);
  await page.waitForTimeout(5000);

  const oemBefore = await page.locator("body").innerText();
  out.oemDashboard = {
    headroom: oemBefore.match(/available headroom[\s\S]{0,60}/i)?.[0],
    rowCount: await page.locator("[role='grid'], table").first().locator("[role='row']").count().catch(() => 0),
    allNavLinks: await page.locator("nav a, aside a").allTextContents().catch(() => []),
  };

  const searchTerms = [
    DEALER_ID,
    DEALER_ID.slice(0, 12),
    ...(out.dealerExposure.dealerCodes || []),
  ];
  for (const term of [...new Set(searchTerms)]) {
    const search = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox")).first();
    if (!(await search.isVisible().catch(() => false))) break;
    await search.fill("");
    await search.fill(term);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
    const txt = await page.locator("body").innerText();
    if (new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(txt)) {
      out.oemMatch = { searchTerm: term, snippet: txt.slice(0, 2500) };
      break;
    }
  }

  const tableEditable = await page
    .locator("[role='grid'], table")
    .first()
    .locator("input:not([type='hidden']), textarea, [contenteditable='true']")
    .count();
  const globalEdit = await page.getByRole("button", { name: /^edit$|raise limit|approve limit|update limit/i }).count();
  out.oemEditCapability = {
    tableEditable,
    actionButtons: globalEdit,
    canChangeLimitInUi: tableEditable > 0 || globalEdit > 0,
    note: "US-OEM-002 AC: dashboard is read-only; editable inputs may be search/filter only",
  };

  await page.screenshot({ path: path.join(OUT, "oem-dealer-limits.png"), fullPage: true });

  out.e2eVerdict = out.oemMatch
    ? out.oemEditCapability.canChangeLimitInUi
      ? "READY — dealer found in OEM; edit UI present (manual change flow TBD)"
      : "BLOCKED — dealer found but OEM Dealer Limits UI is read-only (no limit-change action)"
    : "BLOCKED — dealer dp1056723eaf82453e not found in OEM Dealer Limits scope for ved.prakash (4W)";
} catch (e) {
  out.error = e instanceof Error ? e.message : String(e);
  await page.screenshot({ path: path.join(OUT, "probe-error.png"), fullPage: true }).catch(() => undefined);
} finally {
  const p = path.join(OUT, "deep-probe.json");
  fs.writeFileSync(p, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
}
