/**
 * Smoke — post-login sanity (uses authenticated storageState).
 */
import { test, expect } from "@playwright/test";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";

test.describe("Honda Dealer Portal - Smoke @honda @smoke", () => {
  test("should load dashboard for authenticated dealer @smoke @honda", async ({
    page,
  }) => {
    const dashboard = new HFIDashboardPage(page);
    await page.goto("/");
    await dashboard.verifyDashboardLoaded();
    expect(page.url()).not.toMatch(/\/login/i);
  });
});
