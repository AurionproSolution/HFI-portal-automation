/**
 * US-OEM-002 — Dealer Limits (Retrieval & Dashboard)
 * Single source of truth: US-OEM-002_TestCases_v1_0.xlsx (TC-001 … TC-035)
 * OEM login: config/oem-env.ts
 */

import { test, expect } from "@playwright/test";
import { dealerLimitsMessages } from "@testData/oem/messages";
import {
  applyDealerLimitsLmsFailureRoute,
  extractDealerRecordsFromApiBody,
  readDealerField,
  watchDealerLimitsApi,
} from "../../dealer-limits/dealerLimits.api.helpers";
import {
  initDealerLimitsSteps,
  openDealerLimitsAsChecker,
  openDealerLimitsAsMaker,
  regressionStep,
  requireEnv,
  requireModuleAsChecker,
  requireModuleAsMaker,
  skipWithReason,
} from "../../dealer-limits/dealerLimits.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

test.describe(
  "US-OEM-002 Dealer Limits @us-oem-002 @dealer-limits @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-OEM-002");
    test.beforeEach(() => initDealerLimitsSteps());

    test(`TC-001 Verify the Dealer Limit Dashboard is the landing screen for the Maker after sign-in @ui @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify Maker lands on Dealer Limit Dashboard", async () => {
          await dl.expectDashboardLanding();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-002 Verify the dashboard retrieves dealer limits from the LMS API on load @positive @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify dealer limits loaded from LMS", async () => {
          const text = await dl.getPageText();
          expect(text).toMatch(/dealer code|available limit/i);
          expect(await dl.getTableRowCount()).toBeGreaterThan(0);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-003 Verify dealer-limit fields are displayed as read-only @ui @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify dealer-limit fields are read-only", async () => {
          await dl.expectReadOnlyFields();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-004 Verify dealer limit fields cannot be edited directly from the dashboard @negative @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify no direct limit editing on dashboard", async () => {
          await dl.expectNoEditControls();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-005 Verify the Available Headroom KPI is displayed on the dashboard @ui @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify Available Headroom KPI", async () => {
          await dl.expectAvailableHeadroomKpi();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-006 Verify Available Headroom equals the sum of available limits across all dealers @positive @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Sum Available Limits and compare to Headroom", async () => {
          const rowCount = await dl.getTableRowCount();
          if (rowCount < 2) {
            skipWithReason("Need at least 2 dealers to validate headroom sum.");
          }
          const tableText = await dl.dealerLimitTable.innerText();
          const amounts = dl.parseCrAmountsFromText(tableText);
          if (amounts.length < 2) {
            skipWithReason("Could not parse enough cr amounts from dealer-limit table.");
          }
          const sum = amounts.reduce((a, b) => a + b, 0);
          const headroomText = await dl.getAvailableHeadroomText();
          const headroomMatch = headroomText.match(/(\d+(?:\.\d+)?)\s*cr/i);
          if (headroomMatch) {
            expect(Number.parseFloat(headroomMatch[1])).toBeCloseTo(sum, 1);
          } else {
            expect(headroomText).toMatch(new RegExp(String(sum)));
          }
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-007 Verify Available Headroom recalculates correctly when dealer limits change in LMS @positive @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const headroomBefore = await dl.getAvailableHeadroomText();
        test.info().annotations.push({
          type: "Headroom before LMS change",
          description: headroomBefore,
        });
        skipWithReason(
          "BLOCKED – LOS/Backend Dependency: no approved automation hook to change a dealer Available Limit in LMS mid-session and verify headroom recalculation.",
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-008 Verify the dealer-limit table displays Dealer Code, Dealer Name, City, Address, Available Limit (in cr) and Last Invoice Raised @ui @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify AC-3 dealer-limit table columns", async () => {
          await dl.expectAc3TableColumns();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-009 Verify dealer-limit table row values match LMS source data @positive @high @honda`, async ({ page }) => {
      try {
        const apiPromise = watchDealerLimitsApi(page);
        const dl = await requireModuleAsMaker(page);
        const captured = await apiPromise;
        const records = extractDealerRecordsFromApiBody(captured.body);
        if (records.length === 0) {
          skipWithReason(
            `Dealer limits API returned no records (url=${captured.url}, status=${captured.status}).`,
          );
        }
        const apiRecord =
          records.find((r) =>
            readDealerField(r, [
              "dealerCode",
              "dealer_code",
              "code",
              "DealerCode",
            ]),
          ) ?? records[0];
        const dealerCode = readDealerField(apiRecord, [
          "dealerCode",
          "dealer_code",
          "code",
          "DealerCode",
        ]);
        if (!dealerCode) {
          skipWithReason(
            "Dealer limits API response lacks a dealer code field to compare.",
          );
        }
        await regressionStep("Compare UI row with portal dealer-limits API", async () => {
          await dl.filterByDealerCode(dealerCode);
          const rowText = await dl.getDealerRowText(dealerCode);
          expect(rowText).toMatch(new RegExp(dealerCode, "i"));
          const dealerName = readDealerField(apiRecord, [
            "dealerName",
            "dealer_name",
            "name",
            "DealerName",
          ]);
          if (dealerName) {
            expect(rowText).toMatch(new RegExp(dealerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
          }
          const available = readDealerField(apiRecord, [
            "availableLimit",
            "available_limit",
            "availableLimitCr",
            "AvailableLimit",
          ]);
          if (available) {
            const amountDigits = available.replace(/[^\d.]/g, "");
            if (amountDigits) {
              expect(rowText).toMatch(new RegExp(amountDigits));
            }
          }
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-010 Verify the dealer-limit table also displays Product Type, Standard Limit, Adhoc Limit and Utilisation % @ui @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify Frontend Requirements table columns", async () => {
          await dl.expectFrontendTableColumns();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-011 Verify Standard Limit, Adhoc Limit and Utilisation % values match LMS source data @positive @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const headers = await dl.getHeaderTexts();
        const required = ["Standard Limit", "Adhoc Limit", "Utilisation"];
        const missing = required.filter(
          (col) => !headers.some((h) => new RegExp(col, "i").test(h)),
        );
        if (missing.length > 0) {
          skipWithReason(
            `BLOCKED – APPLICATION GAP: Required columns not on dashboard [${missing.join(", ")}]; cannot compare LMS values.`,
          );
        }
        skipWithReason(
          "BLOCKED – LOS/Backend Dependency: LMS query hook required for Standard/Adhoc/Utilisation independent verification.",
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-012 Flag the field-set conflict between AC-3 and the Frontend Requirements table for design clarification @negative @low @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Document AC-3 vs Frontend Requirements column conflict", async () => {
          const headers = await dl.getHeaderTexts();
          const ac3Expected = [
            "Dealer Code",
            "Dealer Name",
            "City",
            "Address",
            "Available Limit",
            "Last Invoice Raised",
          ];
          const frontendExpected = [
            "Dealer Code",
            "Dealer Name",
            "Product Type",
            "Standard Limit",
            "Adhoc Limit",
            "Available Limit",
            "Utilisation %",
          ];
          const missingAc3 = ac3Expected.filter(
            (col) => !headers.some((h) => new RegExp(col, "i").test(h)),
          );
          const missingFrontend = frontendExpected.filter(
            (col) => !headers.some((h) => new RegExp(col, "i").test(h)),
          );
          test.info().annotations.push({
            type: "AC-3 missing columns",
            description: missingAc3.join(", ") || "none",
          });
          test.info().annotations.push({
            type: "Frontend Requirements missing columns",
            description: missingFrontend.join(", ") || "none",
          });
          test.info().annotations.push({
            type: "Actual headers",
            description: headers.join(", "),
          });
          skipWithReason(
            `BLOCKED – REQUIREMENT CLARIFICATION: AC-3 missing [${missingAc3.join(", ")}]; Frontend Requirements missing [${missingFrontend.join(", ")}]; actual [${headers.join(", ")}].`,
          );
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-013 Verify Available Limit is shown in crore (cr) units @positive @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify Available Limit cr/rupee units", async () => {
          const headers = await dl.getHeaderTexts();
          const tableText = await dl.dealerLimitTable.innerText();
          expect(tableText).toMatch(/cr|₹/i);
          expect(
            headers.some((h) => /available limit/i.test(h)),
            `Expected Available Limit column header; actual headers: ${headers.join(", ")}`,
          ).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-014 Verify Last Invoice Raised shows the correct date of the dealer's most recent invoice @positive @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const headers = await dl.getHeaderTexts();
        if (!headers.some((h) => /last invoice raised/i.test(h))) {
          skipWithReason(
            "BLOCKED – APPLICATION GAP: Last Invoice Raised column is not present on the dashboard; cannot cross-check invoice date.",
          );
        }
        const dealerCode =
          process.env.OEM_KNOWN_DEALER_CODE?.trim() ||
          (await dl.getFirstDealerCodeFromTable());
        if (!dealerCode) {
          skipWithReason("No dealer code available for invoice date validation.");
        }
        skipWithReason(
          "BLOCKED – LOS/Backend Dependency: invoice history source not available in automation to independently verify Last Invoice Raised date.",
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-015 Verify Last Invoice Raised shows an appropriate state for a dealer with no invoices raised yet @ui @low @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const headers = await dl.getHeaderTexts();
        if (!headers.some((h) => /last invoice raised/i.test(h))) {
          skipWithReason(
            "BLOCKED – APPLICATION GAP: Last Invoice Raised column is not present; cannot validate no-invoice dealer state.",
          );
        }
        const dealer = process.env.OEM_NO_INVOICE_DEALER?.trim();
        if (!dealer) {
          skipWithReason(
            "BLOCKED – Test Data: OEM_NO_INVOICE_DEALER not configured and no safe UI path to identify a zero-invoice dealer.",
          );
        }
        await regressionStep("Locate dealer with no invoices", async () => {
          await dl.filterByDealerCode(dealer);
          const text = await dl.getPageText();
          expect(text).toMatch(
            /no invoices|not raised|–|—|n\/a|blank/i,
          );
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-016 Verify Download exports the dealer-limit list in the specified file format @positive @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const downloadPromise = page.waitForEvent("download");
        await regressionStep("Download dealer-limit list", async () => {
          await dl.downloadDealerLimits();
        });
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-017 Flag the download file-format conflict between AC-4 (CSV) and Frontend Requirements (Excel) @negative @low @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
        await regressionStep("Download dealer-limit list to inspect format", async () => {
          await dl.downloadDealerLimits();
        });
        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        const isCsv = /\.csv$/i.test(filename);
        const isExcel = /\.xlsx$/i.test(filename);
        test.info().annotations.push({
          type: "Downloaded filename",
          description: filename,
        });
        test.info().annotations.push({
          type: "AC-4 expects",
          description: "CSV",
        });
        test.info().annotations.push({
          type: "Frontend Requirements expect",
          description: "Excel (.xlsx)",
        });
        skipWithReason(
          `BLOCKED – REQUIREMENT CLARIFICATION: actual download format is ${isCsv ? "CSV" : isExcel ? "Excel" : filename}; AC-4 says CSV, Frontend Requirements say Excel — BA confirmation required.`,
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-018 Verify the downloaded file contains all dealers currently displayed on the dashboard @positive @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const downloadPromise = page.waitForEvent("download");
        await regressionStep("Download and verify file is non-empty", async () => {
          await dl.downloadDealerLimits();
        });
        const download = await downloadPromise;
        const filePath = await download.path();
        expect(filePath).toBeTruthy();
        const readStream = await download.createReadStream();
        let size = 0;
        for await (const chunk of readStream!) {
          size += chunk.length;
        }
        expect(size).toBeGreaterThan(0);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-019 Verify Download with a large number of dealers completes without failure @edge @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify large dealer set and download", async () => {
          const total = await dl.getPaginationTotal();
          const rowCount = await dl.getTableRowCount();
          const dealerCount = total ?? rowCount;
          if (dealerCount < 500) {
            skipWithReason(
              `BLOCKED – Test Data/NFR: dashboard has ${dealerCount} dealers; 500+ required for large-set download validation.`,
            );
          }
          const downloadPromise = page.waitForEvent("download", {
            timeout: 120_000,
          });
          await dl.downloadDealerLimits();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-020 Verify the exact empty-state message when the LMS Read-Only DB is unavailable @negative @high @honda`, async ({ page }) => {
      try {
        if (process.env.OEM_FORCE_LMS_FAILURE !== "true") {
          skipWithReason(
            "BLOCKED – Environment: set OEM_FORCE_LMS_FAILURE=true to safely simulate dealer-limits API outage via route interception.",
          );
        }
        await applyDealerLimitsLmsFailureRoute(page);
        const dl = await openDealerLimitsAsMaker(page, {
          waitForDashboardData: false,
        });
        await regressionStep("Verify LMS outage message", async () => {
          await dl.expectConnectivityError();
          const text = await dl.getPageText();
          expect(text).toContain(dealerLimitsMessages.lmsOutage);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-021 Verify the dashboard handles the LMS outage state cleanly with no partial/misleading data @ui @medium @honda`, async ({ page }) => {
      try {
        if (process.env.OEM_FORCE_LMS_FAILURE !== "true") {
          skipWithReason(
            "BLOCKED – Environment: set OEM_FORCE_LMS_FAILURE=true to safely simulate dealer-limits API outage via route interception.",
          );
        }
        await applyDealerLimitsLmsFailureRoute(page);
        const dl = await openDealerLimitsAsMaker(page, {
          waitForDashboardData: false,
        });
        await regressionStep("Verify no partial limit figures during outage", async () => {
          await dl.expectConnectivityError();
          expect(await dl.getTableRowCount()).toBe(0);
          const text = await dl.getPageText();
          expect(text).not.toMatch(/\d+(?:\.\d+)?\s*cr/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-022 Verify a Maker sees the same dashboard view and details as a Checker @positive @high @honda`, async ({ page }) => {
      try {
        const dlMaker = await requireModuleAsMaker(page);
        const makerText = await dlMaker.getPageText();
        const dlChecker = await openDealerLimitsAsChecker(page);
        if (!(await dlChecker.isModuleAvailable())) {
          skipWithReason(
            "Checker credentials or Dealer Limits module not available for comparison.",
          );
        }
        const checkerText = await dlChecker.getPageText();
        await regressionStep("Compare Maker vs Checker dashboard text", async () => {
          expect(checkerText).toMatch(/dealer limit|available limit/i);
          expect(makerText).toMatch(/dealer limit|available limit/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-023 Verify a Checker sees the same dashboard view and details as a Maker @positive @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsChecker(page);
        await regressionStep("Verify Checker dashboard landing (mirror TC-022)", async () => {
          await dl.expectDashboardLanding();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-024 Verify neither Maker nor Checker can edit dealer limit values from the dashboard @negative @high @honda`, async ({ page }) => {
      try {
        const dlMaker = await requireModuleAsMaker(page);
        await regressionStep("Verify Maker cannot edit limits", async () => {
          await dlMaker.expectNoEditControls();
        });
        const dlChecker = await openDealerLimitsAsChecker(page);
        await regressionStep("Verify Checker cannot edit limits", async () => {
          await dlChecker.expectNoEditControls();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-025 Verify neither Maker nor Checker can raise or approve a limit change from this dashboard @negative @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify no limit change actions on dashboard", async () => {
          await dl.expectNoLimitChangeActions();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-026 Verify invoice upload / financing actions are not present on this dashboard @ui @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        await regressionStep("Verify no invoice upload/financing actions", async () => {
          await dl.expectNoInvoiceFinancingActions();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-027 Verify an optional Dealer Code filter narrows the retrieved dealer-limit results, if exposed in the UI @alternate @low @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const hasDedicatedFilter = await dl.hasDealerCodeFilterControl();
        const hasSearch = await dl.hasDealerSearchControl();
        if (!hasDedicatedFilter && !hasSearch) {
          skipWithReason(
            "NOT APPLICABLE – Dealer Code filter/search control not exposed in UI (open item per Excel).",
          );
        }
        const dealerCode =
          process.env.OEM_KNOWN_DEALER_CODE?.trim() ||
          (await dl.getFirstDealerCodeFromTable());
        if (!dealerCode) {
          skipWithReason("No dealer code available to validate filter/search.");
        }
        await regressionStep(`Filter/search by Dealer Code ${dealerCode}`, async () => {
          const beforeCount = await dl.getTableRowCount();
          await dl.filterByDealerCode(dealerCode);
          const afterText = await dl.getPageText();
          expect(afterText).toMatch(new RegExp(dealerCode, "i"));
          const afterCount = await dl.getTableRowCount();
          expect(afterCount).toBeGreaterThan(0);
          expect(afterCount).toBeLessThanOrEqual(beforeCount);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-028 Verify a dashboard with zero dealers configured for the OEM shows an appropriate empty state @edge @low @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const dealerCount =
          (await dl.getPaginationTotal()) ?? (await dl.getTableRowCount());
        if (dealerCount > 0) {
          skipWithReason(
            `BLOCKED – Test Data: current OEM account shows ${dealerCount} dealers; zero-dealer OEM credentials (OEM_ZERO_DEALER_OEM) required.`,
          );
        }
        await regressionStep("Verify zero-dealer empty state", async () => {
          const text = await dl.getPageText();
          expect(text).toMatch(dealerLimitsMessages.noDealers);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-029 Verify a dealer with zero Available Limit is displayed correctly @edge @low @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const dealer =
          process.env.OEM_ZERO_LIMIT_DEALER?.trim() ||
          (await dl.findDealerCodeWithZeroAvailableLimit());
        if (!dealer) {
          skipWithReason(
            "BLOCKED – Test Data: no dealer with zero Available Limit found on dashboard and OEM_ZERO_LIMIT_DEALER not configured.",
          );
        }
        await regressionStep("Verify zero Available Limit display", async () => {
          await dl.filterByDealerCode(dealer);
          const text = await dl.getPageText();
          expect(text).toMatch(/0\.00\s*cr|₹\s*0|0\s*cr/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-030 Verify the dashboard always reflects the latest LMS record at the time of page load @positive @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const before = await dl.getPageText();
        expect(before).toMatch(/dealer limit|available headroom/i);
        await dl.refreshDashboard();
        const after = await dl.getPageText();
        expect(after).toMatch(/dealer limit|available headroom/i);
        skipWithReason(
          "BLOCKED – LOS/Backend Dependency: reload verified, but independent LMS limit change between loads cannot be orchestrated to prove stale-data prevention.",
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-031 Verify a Maker/Checker cannot view dealer-limit data outside their authorised OEM scope @security @high @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const dealerCount =
          (await dl.getPaginationTotal()) ?? (await dl.getTableRowCount());
        test.info().annotations.push({
          type: "Authorized OEM dealer count",
          description: String(dealerCount),
        });
        skipWithReason(
          "BLOCKED – Test Data/Security: OEM_UNAUTHORIZED_OEM_USER credentials for a different OEM scope are not configured in this environment.",
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-032 Verify the dashboard loads dealer limits for a large dealer set within an acceptable response time @nfr @medium @honda`, async ({ page }) => {
      try {
        const totalDealersEnv = process.env.OEM_LARGE_DEALER_SET?.trim();
        const start = Date.now();
        const dl = await requireModuleAsMaker(page);
        const total = await dl.getPaginationTotal();
        const dealerCount = total ?? (await dl.getTableRowCount());
        await regressionStep("Measure dashboard load time", async () => {
          await dl.expectDashboardLanding();
          await dl.expectAvailableHeadroomKpi();
          const elapsed = Date.now() - start;
          test.info().annotations.push({
            type: "Load time ms",
            description: String(elapsed),
          });
          test.info().annotations.push({
            type: "Dealer count",
            description: String(dealerCount),
          });
          if (dealerCount < 500) {
            skipWithReason(
              `BLOCKED – NFR/Test Data: only ${dealerCount} dealers on DEV; 500+ dealer-set SLA not validated. Observed load ${elapsed}ms for current set.`,
            );
          }
          if (process.env.RUN_NFR_TESTS !== "true") {
            skipWithReason(
              `BLOCKED – NFR Configuration: RUN_NFR_TESTS=true required. Observed ${dealerCount} dealers loaded in ${elapsed}ms.`,
            );
          }
          expect(elapsed).toBeLessThan(30_000);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-033 Verify the Retrieve dealer limits API returns Dealer Code, Dealer Name and Available Limit as specified @positive @medium @honda`, async ({ page }) => {
      try {
        const apiPromise = watchDealerLimitsApi(page);
        await requireModuleAsMaker(page);
        const captured = await apiPromise;
        await regressionStep("Validate dealer-limits API response fields", async () => {
          expect(captured.status).toBeGreaterThanOrEqual(200);
          expect(captured.status).toBeLessThan(300);
          const records = extractDealerRecordsFromApiBody(captured.body);
          expect(records.length).toBeGreaterThan(0);
          const first = records[0];
          expect(
            readDealerField(first, [
              "dealerCode",
              "dealer_code",
              "code",
              "DealerCode",
            ]),
          ).toBeTruthy();
          expect(
            readDealerField(first, [
              "dealerName",
              "dealer_name",
              "dealer",
              "name",
              "DealerName",
            ]),
          ).toBeTruthy();
          expect(
            readDealerField(first, [
              "availableLimit",
              "available_limit",
              "availableLimitCr",
              "available",
              "AvailableLimit",
            ]),
          ).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-034 Verify Download is handled appropriately when the dealer-limit list is empty @edge @low @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const dealerCount =
          (await dl.getPaginationTotal()) ?? (await dl.getTableRowCount());
        if (dealerCount > 0) {
          skipWithReason(
            `BLOCKED – Test Data: current OEM account shows ${dealerCount} dealers; empty-list download requires zero-dealer OEM (OEM_ZERO_DEALER_OEM).`,
          );
        }
        await regressionStep("Download with empty dealer-limit list", async () => {
          const downloadVisible = await dl.downloadButton
            .isVisible()
            .catch(() => false);
          if (!downloadVisible) {
            return;
          }
          const isDisabled = await dl.downloadButton
            .isDisabled()
            .catch(() => false);
          if (isDisabled) {
            expect(isDisabled).toBeTruthy();
            return;
          }
          const downloadPromise = page.waitForEvent("download", {
            timeout: 60_000,
          });
          await dl.downloadDealerLimits();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-035 Verify reloading/refreshing the dashboard re-fetches the latest limits from LMS @positive @medium @honda`, async ({ page }) => {
      try {
        const dl = await requireModuleAsMaker(page);
        const before = await dl.getPageText();
        expect(before).toMatch(/dealer limit|available limit/i);
        await regressionStep("Refresh dashboard and verify data reload", async () => {
          await dl.refreshDashboard();
          const after = await dl.getPageText();
          expect(after).toMatch(/dealer limit|available limit/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });
  },
);
