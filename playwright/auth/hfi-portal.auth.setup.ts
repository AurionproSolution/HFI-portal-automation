/**
 * HFI Dealer Portal — authenticated session for smoke / regression / e2e suites.
 */
import { test as setup } from "@playwright/test";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { getCredentials } from "@config/env";
import { getHfiAuthStoragePath } from "@config/hfi-portal-auth.config";

setup("authenticate HFI dealer user @setup", async ({ page }) => {
  const authFile = getHfiAuthStoragePath();
  const loginPage = new HFILoginPage(page);
  const { username, password } = getCredentials();

  await loginPage.open();
  await loginPage.login(username, password);
  await loginPage.verifyDashboardLoaded();

  await page.context().storageState({ path: authFile });
});
