import { test as base, type Page } from "@playwright/test";
import { CommonUtils } from "@utils/commonUtils";
import { TableUtils } from "@utils/tableUtils";
import { HFILoginPage } from "@pages/hfi-portal/login/HFILoginPage";
import { HFIDashboardPage } from "@pages/hfi-portal/dashboard/HFIDashboardPage";
import { getCredentials } from "@config/env";

export type HfiPortalFixtures = {
  utils: CommonUtils;
  tableUtils: TableUtils;
  hfiLoginPage: HFILoginPage;
  hfiDashboardPage: HFIDashboardPage;
  hfiAuthenticatedPage: Page;
};

export const test = base.extend<HfiPortalFixtures>({
  utils: async ({ page }, use) => {
    await use(new CommonUtils(page));
  },

  tableUtils: async ({ page }, use) => {
    await use(new TableUtils(page));
  },

  hfiLoginPage: async ({ page }, use) => {
    await use(new HFILoginPage(page));
  },

  hfiDashboardPage: async ({ page }, use) => {
    await use(new HFIDashboardPage(page));
  },

  hfiAuthenticatedPage: async ({ page }, use) => {
    const loginPage = new HFILoginPage(page);
    const { username, password } = getCredentials();
    await loginPage.open();
    await loginPage.login(username, password);
    await loginPage.verifyDashboardLoaded();
    await use(page);
  },
});

export { expect } from "@playwright/test";
