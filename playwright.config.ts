/**
 * HondaDealerAutomation — Playwright Configuration (UDC-aligned / HFI portal)
 */

import { defineConfig, devices } from "@playwright/test";
import { getAppOrigin, getCurrentEnv, isCI } from "./config/env";
import { getHfiAuthStoragePath } from "./config/hfi-portal-auth.config";
import { ortoniReportConfig } from "./config/ortoni-report.config";
import { settings } from "./config/settings";

const authStorage = getHfiAuthStoragePath();
const testEnv = getCurrentEnv();

const maximizedChrome = {
  ...devices["Desktop Chrome"],
  viewport: null,
  deviceScaleFactor: undefined,
  launchOptions: {
    args: ["--start-maximized"],
  },
};

/** HFI sprint/full compose entry points — import feature modules only. */
const hfiRegressionComposeIgnore =
  /hfi-portal\/Regression\/(FullRegression|Sprint1\/Sprint1Regression|Sprint2\/Sprint2Regression|Sprint3\/Sprint3Regression)\.test\.ts/;

/** OEM sprint/full compose entry points — import feature modules only. */
const oemRegressionComposeIgnore =
  /oem-portal\/Regression\/(FullRegression|Sprint2\/Sprint2Regression|Sprint3\/Sprint3Regression)\.test\.ts/;

/** Ops Console sprint compose entry points. */
const opsRegressionComposeIgnore =
  /ops-console\/Regression\/(Sprint3\/Sprint3Regression)\.test\.ts/;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.test.ts",
  fullyParallel: true,
  forbidOnly: isCI(),
  retries: settings.retries,
  workers: settings.workers,
  timeout: settings.defaultTimeout,
  expect: {
    timeout: settings.expectTimeout,
  },
  outputDir: "test-results",
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "my-report",
        open: process.env.CI ? "never" : "on-failure",
      },
    ],
    ["ortoni-report", ortoniReportConfig],
    ["./playwright/reporters/step-failure-reporter.ts"],
  ],
  use: {
    baseURL: getAppOrigin(),
    trace: settings.traceOnFirstRetry ? "on-first-retry" : "off",
    screenshot: settings.screenshotOnFailure ? "only-on-failure" : "off",
    video: settings.videoOnFailure ? "retain-on-failure" : "off",
    actionTimeout: settings.actionTimeout,
    navigationTimeout: settings.navigationTimeout,
    headless: process.env.HEADLESS !== "false",
    launchOptions: {
      slowMo: process.env.SLOW_MO
        ? Number.parseInt(process.env.SLOW_MO, 10)
        : 0,
    },
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: /playwright\/auth\/.*\.auth\.setup\.ts/,
    },
    {
      name: "login-chromium",
      testMatch: /hfi-portal\/Regression\/Sprint1\/LoginRegression\.test\.ts/,
      testIgnore: /_probe_/,
      use: { ...maximizedChrome },
    },
    {
      name: "reset-password-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint1\/ResetPasswordRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "onboarding-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint1\/(Onboarding|InPrincipal)Regression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "collateral-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint1\/CollateralRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "dealer-finance-dashboard-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint1\/DealerFinanceDashboardRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "profile-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint1\/ProfileRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "contact-info-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint1\/ContactInfoUpdateRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "transaction-history-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint2\/TransactionHistoryRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "purchase-orders-vins-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint2\/PurchaseOrdersVINsRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "exposure-settings-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint2\/ExposureSettingsRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "dealer-login-chromium",
      testMatch:
        /hfi-portal\/Regression\/Sprint2\/DealerLoginRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "oem-invoice-financing-chromium",
      testMatch:
        /oem-portal\/Regression\/Sprint2\/InvoiceFinancingRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "oem-dealer-limits-chromium",
      testMatch:
        /oem-portal\/Regression\/Sprint2\/DealerLimitsRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "admin-console-chromium",
      testMatch:
        /admin-console\/Regression\/Sprint2\/AdminConsoleRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "oem-sprint2-regression",
      testMatch: /oem-portal\/Regression\/Sprint2\/Sprint2Regression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "oem-regression",
      testMatch: /oem-portal\/Regression\/Sprint\d+\/.*\.test\.ts/,
      testIgnore: oemRegressionComposeIgnore,
      use: { ...maximizedChrome },
    },
    {
      name: "oem-full-regression",
      testMatch: /oem-portal\/Regression\/FullRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "oem-probes",
      testMatch: /oem-portal\/probes\/.*\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "sprint1-regression",
      testMatch: /hfi-portal\/Regression\/Sprint1\/Sprint1Regression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "sprint2-regression",
      testMatch: /hfi-portal\/Regression\/Sprint2\/Sprint2Regression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "sprint3-regression",
      testMatch: /hfi-portal\/Regression\/Sprint3\/Sprint3Regression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "oem-sprint3-regression",
      testMatch: /oem-portal\/Regression\/Sprint3\/Sprint3Regression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "ops-sprint3-regression",
      testMatch: /ops-console\/Regression\/Sprint3\/Sprint3Regression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "ops-regression",
      testMatch: /ops-console\/Regression\/Sprint\d+\/.*\.test\.ts/,
      testIgnore: opsRegressionComposeIgnore,
      use: { ...maximizedChrome },
    },
    {
      name: "hfi-regression",
      testMatch: /hfi-portal\/Regression\/Sprint\d+\/.*\.test\.ts/,
      testIgnore: hfiRegressionComposeIgnore,
      use: { ...maximizedChrome },
    },
    {
      name: "hfi-full-regression",
      testMatch: /hfi-portal\/Regression\/FullRegression\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "hfi-probes",
      testMatch: /hfi-portal\/probes\/.*\.test\.ts/,
      use: { ...maximizedChrome },
    },
    {
      name: "portal-chromium",
      dependencies: ["auth-setup"],
      testMatch: /(smoke|sanity|e2e)\/.*\.test\.ts/,
      use: {
        ...maximizedChrome,
        storageState: authStorage,
      },
    },
    {
      name: "smoke",
      dependencies: ["auth-setup"],
      grep: /@smoke/,
      testIgnore: /hfi-portal\/probes\/|seed\.spec/,
      use: {
        ...maximizedChrome,
        storageState: authStorage,
      },
    },
    {
      name: "regression",
      testMatch: /hfi-portal\/Regression\/FullRegression\.test\.ts/,
      testIgnore: /_probe_|hfi-portal\/probes\/|seed\.spec/,
      use: { ...maximizedChrome },
    },
  ],
  metadata: {
    environment: testEnv,
    application: "Honda Financial Services Dealer Portal",
    portal: "hfi-portal",
  },
});
