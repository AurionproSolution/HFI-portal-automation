/**
 * E2E placeholder — extend with cross-module journeys.
 */
import { test, expect } from "@playwright/test";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";

test.describe("Honda Dealer Portal - E2E @honda @e2e", () => {
  test("dealer can access portal home after auth setup @e2e @honda", async ({
    page,
  }) => {
    await page.goto("/");
    const dashboard = new HFIDashboardPage(page);
    await dashboard.verifyDashboardLoaded();
    expect(page.url()).toBeTruthy();
  });
});
