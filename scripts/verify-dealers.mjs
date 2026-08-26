/**
 * Verifies all dealers in testData/hfi/dealers.json by logging into the dev portal.
 * Updates dealers.json groups, meta.lastVerified, and writes reports/dealer-verification-report.md
 *
 * Usage: npm run verify:dealers
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const REGISTRY_PATH = path.join(process.cwd(), "testData", "hfi", "dealers.json");
const REPORT_PATH = path.join(process.cwd(), "reports", "dealer-verification-report.md");

const GROUPS = [
  "applicationCompleted",
  "applicationIncomplete",
  "resetPassword",
  "invalid",
];

function getLoginPassword(profile) {
  const permanent = profile.password?.trim();
  if (permanent) return permanent;
  const temp = profile.temporaryPassword?.trim();
  if (temp) return temp;
  return "";
}

async function classifyLanding(page, profile) {
  await page.waitForTimeout(3_000);
  const url = page.url();
  const text = (await page.locator("body").innerText().catch(() => "")).toLowerCase();

  if (/invalid credentials|attempts remaining|suspended|account locked/i.test(text)) {
    return { state: "invalid", reason: "Login rejected — invalid credentials or locked account" };
  }
  if (url.includes("reset-password") || /set a new password|new password/i.test(text)) {
    return { state: "resetPassword", reason: "Redirected to Set New Password screen" };
  }
  if (
    url.includes("onboarding") ||
    /my tasks|dealer onboarding|limited access|application in progress|document collection/i.test(
      text,
    )
  ) {
    return {
      state: "applicationIncomplete",
      reason: "Onboarding / limited-access dashboard visible",
    };
  }
  if (
    url.includes("consumer") ||
    url.includes("dealer-finance") ||
    url.includes("dashboard") ||
    /consumer finance|dealer finance|purchase orders|exposure/i.test(text)
  ) {
    if (profile.isDealerFinanceEnabled) {
      return {
        state: "applicationCompleted",
        reason: "Authenticated — Consumer/Dealer Finance portal visible",
      };
    }
    return {
      state: "applicationIncomplete",
      reason: "Authenticated but IsDealerFinanceEnabled=false — expected onboarding path",
    };
  }
  if (url.includes("/login")) {
    return { state: "invalid", reason: "Remained on login page after sign-in attempt" };
  }
  return { state: "invalid", reason: `Unclassified landing URL: ${url}` };
}

async function verifyDealer(browser, registry, key, profile, loginUrl) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const password = getLoginPassword(profile);
  const username = profile.email?.trim() || profile.dealerCode;

  let actualState = "invalid";
  let reason = "";
  let status = "❌";

  try {
    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.getByPlaceholder("dealer-id or email").fill(username);
    await page.getByPlaceholder("••••••••").fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/login|reset-password|onboarding|consumer|dashboard|dealer-finance/i, {
      timeout: 90_000,
    }).catch(() => undefined);

    const result = await classifyLanding(page, profile);
    actualState = result.state;
    reason = result.reason;

    const expected = profile.expectedState || profile.assignedGroup;
    status = actualState === expected ? "✅" : "⚠️";
  } catch (e) {
    actualState = "invalid";
    reason = e instanceof Error ? e.message : String(e);
    status = "❌";
  } finally {
    await context.close();
  }

  return {
    key,
    label: profile.label,
    dealerCode: profile.dealerCode,
    expectedState: profile.expectedState || profile.assignedGroup,
    actualState,
    status,
    assignedGroup: actualState,
    reason,
    profile: {
      ...profile,
      actualState,
      assignedGroup: actualState,
      verificationStatus: status === "✅" ? "verified" : "needs-review",
      notes: reason,
      ...(actualState === "invalid" ? { invalidReason: reason } : {}),
    },
  };
}

function rebuildRegistry(registry, results) {
  const next = {
    meta: {
      ...registry.meta,
      lastVerified: new Date().toISOString(),
    },
    applicationCompleted: {},
    applicationIncomplete: {},
    resetPassword: {},
    invalid: {},
  };

  for (const r of results) {
    const group =
      r.actualState === "applicationCompleted" ||
      r.actualState === "applicationIncomplete" ||
      r.actualState === "resetPassword"
        ? r.actualState
        : "invalid";
    next[group][r.key] = r.profile;
  }
  return next;
}

function renderReport(results) {
  const lines = [
    "# HFI Dealer Verification Report",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Portal:** ${JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8")).meta.baseUrl}`,
    "",
    "| Dealer | Code | Expected State | Actual State | Status | Assigned Group | Notes |",
    "|--------|------|----------------|--------------|--------|----------------|-------|",
  ];
  for (const r of results) {
    lines.push(
      `| ${r.label} | ${r.dealerCode} | ${r.expectedState} | ${r.actualState} | ${r.status} | ${r.assignedGroup} | ${r.reason.replace(/\|/g, "/")} |`,
    );
  }
  lines.push("");
  lines.push("## Switch active dealer");
  lines.push("");
  lines.push("Set in `.env`:");
  lines.push("");
  lines.push("```");
  lines.push("ACTIVE_DEALER=dealer8");
  lines.push("```");
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const base = registry.meta.baseUrl.replace(/\/$/, "");
  const loginPath = registry.meta.loginPath || "/login";
  const loginUrl = `${base}${loginPath}`;

  const allDealers = [];
  for (const group of GROUPS) {
    for (const [key, profile] of Object.entries(registry[group] || {})) {
      allDealers.push({ key, profile });
    }
  }

  console.log(`Verifying ${allDealers.length} dealers at ${loginUrl}...`);

  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const { key, profile } of allDealers) {
    console.log(`  → ${profile.label} (${profile.dealerCode})...`);
    const result = await verifyDealer(browser, registry, key, profile, loginUrl);
    results.push(result);
    console.log(`     ${result.status} ${result.actualState} — ${result.reason}`);
  }
  await browser.close();

  const updated = rebuildRegistry(registry, results);
  fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf8");

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, renderReport(results), "utf8");

  console.log(`\nUpdated: ${REGISTRY_PATH}`);
  console.log(`Report:  ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
