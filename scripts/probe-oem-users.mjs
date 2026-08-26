import { chromium } from "@playwright/test";

const loginUrl =
  "http://devdealerportal.centralindia.cloudapp.azure.com/oem/login";
const users = ["kiran.kumar", "manoj.kumar", "dealer15@gmail.com"];
const passwords = [
  process.env.OEM_PROBE_PASSWORD,
  "Secure@Pass1",
  "Secure@Pass2",
  "Secure@Pass3",
  "Secure@Pass4",
  "Secure@Pass5",
  "Secure@Pass6",
  "Temp@123",
  "Password@123",
  "Honda@123",
].filter(Boolean);

async function probeUser(page, username, password) {
  const apiHints = [];
  const onResponse = async (res) => {
    const u = res.url();
    if (/user|profile|auth|me|role|oem|session/i.test(u) && res.status() === 200) {
      try {
        const json = await res.json();
        apiHints.push({ url: u, json });
      } catch {
        /* non-json */
      }
    }
  };
  page.on("response", onResponse);

  await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 120_000 });
  await page.getByRole("textbox", { name: /maker-id/i }).fill(username);
  await page.locator("input[type='password']").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  try {
    await page.waitForURL((u) => !u.pathname.includes("/login"), {
      timeout: 25_000,
    });
    await page.waitForTimeout(2000);
    const url = page.url();
    const body = await page.locator("body").innerText();
    const roleMatch = body.match(/\b(Maker|Checker)\b/i);
    const oemMatch = body.match(/OEM[:\s]+([^\n]+)/i);

    // Try dealer limits for more context
    await page.goto(
      "http://devdealerportal.centralindia.cloudapp.azure.com/oem/dealer-limits",
      { waitUntil: "networkidle", timeout: 60_000 },
    );
    await page.waitForTimeout(2000);
    const limitsBody = await page.locator("body").innerText();

    page.off("response", onResponse);
    return {
      username,
      password,
      success: true,
      url,
      roleHint: roleMatch?.[0] ?? "not found in body",
      oemHint: oemMatch?.[1]?.trim() ?? "not found",
      limitsSnippet: limitsBody.slice(0, 1200).replace(/\n/g, " | "),
      apiHints: apiHints.slice(0, 5),
    };
  } catch {
    const alerts = await page
      .locator("[role=alert], .text-destructive")
      .allTextContents();
    page.off("response", onResponse);
    return {
      username,
      password,
      success: false,
      url: page.url(),
      alerts,
    };
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const user of users) {
  let loggedIn = null;
  for (const pass of passwords) {
    const result = await probeUser(page, user, pass);
    if (result.success) {
      loggedIn = result;
      break;
    }
    console.log(
      `FAIL ${user} / ${pass}: ${result.alerts?.join("; ") || "login timeout"}`,
    );
  }
  if (loggedIn) {
    console.log("SUCCESS", JSON.stringify(loggedIn, null, 2));
  } else {
    console.log("NO_LOGIN", user);
  }
}

await browser.close();
