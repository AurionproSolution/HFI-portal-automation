import { test } from "@playwright/test";
import { HFIOnboardingDashboardPage } from "@pages/hfi-portal/onboarding/HFIOnboardingDashboardPage";

test("probe UP00010", async ({ page }) => {
  const dash = new HFIOnboardingDashboardPage(page);
  await dash.signInWithOnboardingCredentials();
  await page.waitForURL(/onboarding|consumer|dashboard/i, { timeout: 90_000 });
  await page.waitForTimeout(5000);
  console.log("URL", page.url());
  if (!page.url().includes("onboarding")) {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
  }
  console.log("URL2", page.url());
  const t = await page.locator("body").innerText();
  console.log("IP", /in principal/i.test(t));
  await page.getByText(/in principal sanction letter/i).first().click();
  await page.waitForTimeout(3000);
  const t2 = await page.locator("body").innerText();
  console.log("PANEL", t2.slice(0, 8000));
});
