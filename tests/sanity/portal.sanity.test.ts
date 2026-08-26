/**
 * Sanity checks — lightweight authenticated flows.
 */
import { test, expect } from "@playwright/test";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";

test.describe("Honda Dealer Portal - Sanity @honda @sanity", () => {
  test("authenticated user sees application shell @sanity @honda", async ({
    page,
  }) => {
    await page.goto("/");
    const dashboard = new HFIDashboardPage(page);
    await dashboard.verifyDashboardLoaded();
    await expect(page.locator("body")).toBeVisible();
  });
});
