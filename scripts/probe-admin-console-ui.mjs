import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { chromium } from "playwright";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ADMIN_BASE =
  process.env.ADMIN_BASE_URL?.trim() ||
  "http://devdealerportal.centralindia.cloudapp.azure.com/admin";
const LOGIN_URL = process.env.ADMIN_LOGIN_URL?.trim() || `${ADMIN_BASE}/login`;
const ORIGIN = new URL(ADMIN_BASE).origin;

const PATHS = [
  "/admin",
  "/admin/login",
  "/admin/system-configuration/oem-users",
  "/admin/notification-templates",
  "/admin/login-comms",
  "/admin/system-configuration/portal-users",
];

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const report = {
    loginUrl: LOGIN_URL,
    adminBase: ADMIN_BASE,
    probedAt: new Date().toISOString(),
    credentialsConfigured: Boolean(username && password),
    login: null,
    paths: [],
    navLinks: [],
  };

  if (!username || !password) {
    report.login = { ok: false, reason: "ADMIN_USERNAME/ADMIN_PASSWORD not in .env" };
    writeReport(report);
    return;
  }

  const browser = await chromium.launch({ headless: process.env.HEADLESS !== "false" });
  const page = await browser.newPage();

  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 120_000 });
  const userField = page
    .getByRole("textbox", { name: /username|admin|email|user/i })
    .or(page.locator("input[type='text'], input[type='email']").first());
  await userField.fill(username);
  await page.locator("input[type='password']").fill(password);
  await page.getByRole("button", { name: /sign in|log in|login/i }).click();
  await page.waitForTimeout(5000);

  const bodyAfterLogin = await page.locator("body").innerText();
  report.login = {
    ok:
      !page.url().includes("/login") &&
      !/invalid credentials|incorrect password/i.test(bodyAfterLogin),
    url: page.url(),
    isAdminConsole: /admin|system configuration|oem users|notification templates|login\s*&\s*comms/i.test(
      bodyAfterLogin,
    ),
    snippet: bodyAfterLogin.slice(0, 1200),
  };

  const navText = await page.locator("nav, aside, [role='navigation']").first().innerText().catch(() => "");
  report.navLinks = navText.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const p of PATHS) {
    await page.goto(`${ORIGIN}${p}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(2500);
    const body = await page.locator("body").innerText();
    const buttons = await page.getByRole("button").allTextContents().catch(() => []);
    const headings = await page.getByRole("heading").allTextContents().catch(() => []);
    report.paths.push({
      path: p,
      url: page.url(),
      headings: headings.slice(0, 10),
      buttons: buttons.slice(0, 25),
      bodySnippet: body.slice(0, 2000),
    });
  }

  await browser.close();
  writeReport(report);
  console.log(JSON.stringify({ ...report, login: report.login, pathCount: report.paths.length }));
}

function writeReport(report) {
  const out = path.join(process.cwd(), "reports", "admin-console-probe.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
