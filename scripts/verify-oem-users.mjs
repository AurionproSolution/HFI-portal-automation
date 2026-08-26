/**
 * Verifies OEM users in testData/oem/users.json by logging into the OEM portal.
 * Passwords: set OEM_<KEY>_PASSWORD in .env (key = sanitized username) or password field in users.json.
 *
 * Usage: npm run verify:oem-users
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const REGISTRY_PATH = path.join(process.cwd(), "testData", "oem", "users.json");
const REPORT_PATH = path.join(
  process.cwd(),
  "reports",
  "oem-user-verification-report.md",
);

const LOGIN_URL =
  process.env.OEM_LOGIN_URL?.trim() ||
  "http://devdealerportal.centralindia.cloudapp.azure.com/oem/login";

function envPasswordKey(username) {
  return `OEM_${username.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}_PASSWORD`;
}

function getPassword(profile, username) {
  const fromProfile = profile.password?.trim();
  if (fromProfile) return fromProfile;
  const fromEnv = process.env[envPasswordKey(username)]?.trim();
  if (fromEnv) return fromEnv;
  return process.env.OEM_PROBE_PASSWORD?.trim() || "";
}

function extractRole(text) {
  const maker = /\bMaker\b/i.test(text);
  const checker = /\bChecker\b/i.test(text);
  if (maker && !checker) return "Maker";
  if (checker && !maker) return "Checker";
  if (maker && checker) return "Maker|Checker (ambiguous UI)";
  return "unknown";
}

function extractOemScope(text) {
  const oem = text.match(/OEM[:\s]+([^\n|]+)/i);
  if (oem?.[1]) return oem[1].trim();
  const brand = text.match(/(Honda|HMCL|HMSI)[^\n|]*/i);
  return brand?.[0]?.trim() || "unknown";
}

async function verifyUser(browser, username, profile) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const password = getPassword(profile, username);
  const apiHints = [];

  page.on("response", async (res) => {
    const u = res.url();
    if (/user|profile|auth|me|role|oem|session/i.test(u) && res.status() === 200) {
      try {
        apiHints.push({ url: u, json: await res.json() });
      } catch {
        /* non-json */
      }
    }
  });

  let status = "❌";
  let role = "unknown";
  let oemScope = "unknown";
  let notes = "";

  if (!password) {
    notes = "No password configured — set password in users.json or " + envPasswordKey(username);
    await context.close();
    return { username, status, role, oemScope, notes, apiHints };
  }

  try {
    await page.goto(LOGIN_URL, { waitUntil: "networkidle", timeout: 120_000 });
    await page.getByRole("textbox", { name: /maker-id/i }).fill(username);
    await page.locator("input[type='password']").fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((u) => !u.pathname.includes("/login"), {
      timeout: 30_000,
    }).catch(() => undefined);
    await page.waitForTimeout(2_000);

    const body = await page.locator("body").innerText();
    if (/suspended/i.test(body)) {
      notes = "Account suspended — contact OEM IT admin";
    } else if (/invalid credentials/i.test(body) && page.url().includes("/login")) {
      notes = "Invalid credentials";
    } else if (!page.url().includes("/login")) {
      status = "✅";
      role = extractRole(body);
      oemScope = extractOemScope(body);

      await page.goto(
        LOGIN_URL.replace("/login", "/dealer-limits"),
        { waitUntil: "networkidle", timeout: 60_000 },
      ).catch(() => undefined);
      await page.waitForTimeout(2_000);
      const limitsBody = await page.locator("body").innerText();
      if (/dealer limit/i.test(limitsBody)) {
        notes = "Dealer Limits module accessible";
      } else {
        notes = `Logged in — post-login URL: ${page.url()}`;
      }
      role = extractRole(limitsBody + "\n" + body) || role;
      oemScope = extractOemScope(limitsBody + "\n" + body) || oemScope;
    } else {
      notes = "Login did not complete — remained on login page";
    }
  } catch (e) {
    notes = e instanceof Error ? e.message : String(e);
  }

  await context.close();
  return { username, status, role, oemScope, notes, apiHints: apiHints.slice(0, 3) };
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const browser = await chromium.launch({
  headless: process.env.HEADLESS !== "false",
});

const results = [];
for (const [key, profile] of Object.entries(registry.users)) {
  const username = profile.username || key;
  const result = await verifyUser(browser, username, profile);
  results.push(result);
  registry.users[key].role = result.role;
  registry.users[key].oemScope = result.oemScope;
  registry.users[key].verificationStatus =
    result.status === "✅" ? "verified" : result.notes.includes("suspended") ? "suspended" : "failed";
  registry.users[key].notes = result.notes;
  registry.meta.lastVerified = new Date().toISOString();
}

await browser.close();

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

const lines = [
  "# OEM User Verification Report",
  "",
  `**Login URL:** ${LOGIN_URL}`,
  `**Verified at:** ${registry.meta.lastVerified}`,
  "",
  "| User | Status | Role | OEM Scope | Notes |",
  "|---|---|---|---|---|",
  ...results.map(
    (r) =>
      `| ${r.username} | ${r.status} | ${r.role} | ${r.oemScope} | ${r.notes} |`,
  ),
  "",
];

fs.writeFileSync(REPORT_PATH, lines.join("\n"));
console.log(lines.join("\n"));
