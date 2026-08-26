import { test } from "@playwright/test";
import { getOnboardingCredentials } from "@config/env";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";

test("probe UP00010 onboarding UI", async ({ page }) => {
  test.setTimeout(180_000);
  const ob = getOnboardingCredentials();
  const loginPage = new HFILoginPage(page);
  await page.goto("/login");
  await loginPage.loginWithCredentials(ob.email, ob.password);
  await page.waitForTimeout(10_000);
  console.log("URL", page.url());
  const text = await page.locator("body").innerText();
  console.log("LIMITED", /limited access|application in progress/i.test(text));
  console.log("APP", text.match(/APP-[A-Z0-9-]+/gi));
  console.log("STAGE", /document collection/i.test(text));
  console.log("MY_TASKS", /my tasks/i.test(text));
  console.log("SNIP", text.slice(0, 3500));
  await page.screenshot({ path: "test-results/onboarding-up00010.png", fullPage: true });
});
