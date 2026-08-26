import { chromium } from "@playwright/test";

const base = "http://devdealerportal.centralindia.cloudapp.azure.com";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const apis = [];
page.on("response", async (r) => {
  const u = r.url();
  if (/otp|contact|email|mobile|update|verify|send/i.test(u)) {
    apis.push({ s: r.status(), u, m: r.request().method() });
  }
});

await page.goto(`${base}/login`);
await page.getByPlaceholder("dealer-id or email").fill("PB00018");
await page.getByPlaceholder("••••••••").fill("Secure@Pass4");
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
await page.goto(`${base}/profile`);
await page.waitForTimeout(3000);

const newEmailInput = () =>
  page.locator('main input[placeholder="new.email@dealer.com"]');

async function openEmail() {
  await page.locator("main").getByRole("button", { name: /^update$/i }).first().click();
  await page.waitForTimeout(500);
}

async function openMobile() {
  await page.locator("main").getByRole("button", { name: /^update$/i }).nth(1).click();
  await page.waitForTimeout(500);
}

await openEmail();
console.log("EMAIL PANEL LABELS:");
console.log(
  await page
    .locator("main")
    .innerText()
    .then((t) =>
      t
        .split("\n")
        .filter((l) => /current|new email|send otp|cancel/i.test(l))
        .join(" | "),
    ),
);

const currentEmail = await page.locator("main input").first().inputValue();
console.log("current email value:", currentEmail);

await newEmailInput().fill("dealerexample.com");
await newEmailInput().blur();
await page.waitForTimeout(600);
console.log(
  "invalid @ error:",
  await page
    .locator("main")
    .getByText(/invalid format/i)
    .textContent()
    .catch(() => null),
);
console.log(
  "send disabled:",
  await page.getByRole("button", { name: /send otp/i }).isDisabled(),
);

await newEmailInput().fill("dealer@");
await newEmailInput().blur();
await page.waitForTimeout(400);
console.log(
  "missing domain error count:",
  await page.locator("main").getByText(/invalid format/i).count(),
);

await newEmailInput().fill("  newtest@gmail.com  ");
await page.waitForTimeout(400);
console.log(
  "whitespace send enabled:",
  !(await page.getByRole("button", { name: /send otp/i }).isDisabled()),
);

await newEmailInput().fill(currentEmail);
await page.waitForTimeout(400);
console.log(
  "same email error:",
  await page
    .locator("main")
    .getByText(/same as the current|cannot be the same/i)
    .textContent()
    .catch(() => null),
);

await page.getByRole("button", { name: /cancel/i }).click();
await page.waitForTimeout(400);

await openMobile();
const mobileInputs = page.locator("main input");
console.log("MOBILE input count", await mobileInputs.count());
for (let i = 0; i < (await mobileInputs.count()); i++) {
  console.log(
    "inp",
    i,
    await mobileInputs.nth(i).getAttribute("placeholder"),
    await mobileInputs.nth(i).inputValue(),
  );
}
const newMob = mobileInputs.nth(1);
await newMob.fill("9876543211");
await page.waitForTimeout(400);
console.log(
  "valid mobile send enabled:",
  !(await page.getByRole("button", { name: /send otp/i }).isDisabled()),
);

await newMob.fill("987654321");
await page.waitForTimeout(400);
console.log(
  "9 digit error:",
  await page
    .locator("main")
    .getByText(/invalid format/i)
    .textContent()
    .catch(() => null),
);

await newMob.fill("98765432110");
await page.waitForTimeout(400);
console.log("11 digit error count:", await page.locator("main").getByText(/invalid format/i).count());

await newMob.fill("98765abcde");
await page.waitForTimeout(400);
console.log(
  "alpha error:",
  await page
    .locator("main")
    .getByText(/invalid format/i)
    .textContent()
    .catch(() => null),
);
console.log("alpha input value:", await newMob.inputValue());

await page.getByRole("button", { name: /cancel/i }).click();
await openEmail();
await newEmailInput().fill("automation.contact.test@gmail.com");
const sendResp = page.waitForResponse((r) => /otp|send/i.test(r.url()), { timeout: 15_000 }).catch(() => null);
await page.getByRole("button", { name: /send otp/i }).click();
const resp = await sendResp;
if (resp) {
  console.log("SEND OTP API:", resp.status(), resp.url());
  try {
    const body = await resp.json();
    console.log("SEND OTP body keys:", Object.keys(body || {}));
    console.log("SEND OTP body sample:", JSON.stringify(body).slice(0, 500));
  } catch {
    console.log("SEND OTP body: non-json");
  }
}
await page.waitForTimeout(2000);
console.log(
  "OTP UI:",
  await page
    .locator("main")
    .innerText()
    .then((t) =>
      t
        .split("\n")
        .filter((l) => /otp|resend|attempt|verify|enter|digit|submit/i.test(l))
        .join(" | "),
    ),
);
const otpInputs = page.locator("main input");
for (let i = 0; i < (await otpInputs.count()); i++) {
  const ph = await otpInputs.nth(i).getAttribute("placeholder");
  const max = await otpInputs.nth(i).getAttribute("maxlength");
  const type = await otpInputs.nth(i).getAttribute("type");
  if (/otp|digit|code|\d{1}/i.test(ph || "") || max === "6") {
    console.log("OTP input", { ph, max, type });
  }
}
console.log("buttons after send:");
for (const b of await page.locator("main button").all()) {
  const t = (await b.innerText()).trim();
  if (t) console.log(t, "disabled=", await b.isDisabled());
}

// wrong OTP
const otpField = page
  .getByPlaceholder(/otp|enter.*code|digit/i)
  .or(page.locator('main input[inputmode="numeric"]'))
  .first();
if (await otpField.isVisible().catch(() => false)) {
  await otpField.fill("000000");
  const verifyBtn = page
    .getByRole("button", { name: /verify|submit|confirm/i })
    .first();
  if (await verifyBtn.isVisible().catch(() => false)) {
    await verifyBtn.click();
    await page.waitForTimeout(1500);
    console.log(
      "wrong otp msg:",
      await page
        .locator("main")
        .getByText(/incorrect otp|attempts remaining/i)
        .textContent()
        .catch(() => null),
    );
  }
}

console.log("APIs:", apis);
await browser.close();
