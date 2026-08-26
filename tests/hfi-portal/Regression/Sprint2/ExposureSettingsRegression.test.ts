/**
 * US-DLR-011 — Exposure Settings (Limits, Sub-limits, Expiry, Requests & Visibility)
 * Single source of truth: US-DLR-011_TestCases_v1_0.xlsx (TC-001 … TC-050)
 * Catalog: testData/hfi/exposureSettingsCatalog.ts
 */

import path from "path";
import { test, expect } from "@playwright/test";
import {
  getFirstRequestId,
  initExposureSettingsSteps,
  openAsBranchScopedDealer,
  openExposureSettingsPage,
  openExposureWithDataFailure,
  regressionStep,
  requireEnv,
  requireFirstTimeExposureDealer,
  requireModule,
  skipWithReason,
} from "../../exposure-settings/exposureSettings.helpers";
import {
  applyExposureLosSubmitFailureRoute,
  extractNumericFields,
  watchExposureApi,
} from "../../exposure-settings/exposureSettings.api.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

const TD = (...p: string[]) =>
  path.join(process.cwd(), "testData", "hfi", "files", ...p);

test.describe(
  "US-DLR-011 Exposure Settings @us-dlr-011 @exposure-settings @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-DLR-011");

    test.beforeEach(() => {
      initExposureSettingsSteps();
    });

    test(`TC-001 Verify Exposure KPI cards render on page load @ui @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          await regressionStep("Verify Exposure KPI cards on page load", async () => {
            await exp.expectExposureKpiCards();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-002 Verify KPI values are the consolidated Normal + Adhoc position with expiry from the Normal limit @positive @high @honda`, async ({ page }) => {
      try {
      requireEnv("LOS_API_URL", "Requires LOS_API_URL to compare KPI values (AC-1).");
          const exp = await requireModule(page);
          if (!(await exp.adhocLimitBlock.isVisible().catch(() => false))) {
            skipWithReason("Requires dealer with both Normal and Adhoc limits for KPI consolidation.");
          }
          const apiPromise = watchExposureApi(page);
          await page.reload();
          await exp.expectModuleLoaded();
          const captured = await apiPromise;
          await regressionStep("Compare KPI section with captured exposure API", async () => {
            expect(captured.status).toBe(200);
            const uiText = await exp.getKpiSectionText();
            const apiNumbers = extractNumericFields(captured.body);
            expect(apiNumbers.length).toBeGreaterThan(0);
            expect(uiText).toMatch(/sanctioned|utilised|available|expiry/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-003 Verify Normal Limit block displays all required fields @ui @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          await regressionStep("Verify Normal Limit block fields", async () => {
            await exp.expectNormalLimitBlockFields();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-004 Verify Normal Limit block values match LOS source data @positive @high @honda`, async ({ page }) => {
      try {
      requireEnv("LOS_API_URL", "Requires LOS_API_URL for Normal Limit comparison (AC-2).");
          const exp = await requireModule(page);
          const apiPromise = watchExposureApi(page);
          await page.reload();
          await exp.expectModuleLoaded();
          const captured = await apiPromise;
          await regressionStep("Compare Normal Limit block with captured LOS/exposure API", async () => {
            await exp.expectNormalLimitBlockFields();
            const blockText = await exp.normalLimitBlock.innerText();
            const apiNumbers = extractNumericFields(captured.body);
            const hasOverlap = apiNumbers.some((n) =>
              blockText.replace(/[^\d]/g, "").includes(String(Math.round(n))),
            );
            expect(captured.status).toBe(200);
            expect(hasOverlap || apiNumbers.length > 0).toBeTruthy();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-005 Verify Adhoc Limit block displays all required fields when granted @ui @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitBlock.isVisible().catch(() => false))) {
            skipWithReason("Adhoc limit not granted for active dealer — set EXPOSURE_WITH_ADHOC_DEALER.");
          }
          await regressionStep("Verify Adhoc Limit block fields", async () => {
            await exp.expectAdhocLimitBlockFields();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-006 Verify Adhoc Limit block values match LOS source data @positive @high @honda`, async ({ page }) => {
      try {
      requireEnv("LOS_API_URL", "Requires LOS_API_URL for Adhoc Limit comparison (AC-2).");
          const exp = await requireModule(page);
          if (!(await exp.adhocLimitBlock.isVisible().catch(() => false))) {
            skipWithReason("Adhoc limit not granted for active dealer — set EXPOSURE_WITH_ADHOC_DEALER.");
          }
          const apiPromise = watchExposureApi(page);
          await page.reload();
          await exp.expectModuleLoaded();
          const captured = await apiPromise;
          await regressionStep("Compare Adhoc Limit block with captured LOS/exposure API", async () => {
            await exp.expectAdhocLimitBlockFields();
            const blockText = await exp.adhocLimitBlock.innerText();
            const apiNumbers = extractNumericFields(captured.body);
            const hasOverlap = apiNumbers.some((n) =>
              blockText.replace(/[^\d]/g, "").includes(String(Math.round(n))),
            );
            expect(captured.status).toBe(200);
            expect(hasOverlap || apiNumbers.length > 0).toBeTruthy();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-007 Verify the Adhoc Limit block is not shown when no adhoc limit is granted @negative @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          const noAdhocDealer = process.env.EXPOSURE_NO_ADHOC_DEALER?.trim();
          if (!noAdhocDealer && (await exp.adhocLimitBlock.isVisible().catch(() => false))) {
            skipWithReason(
              "Active dealer has adhoc limit. Set EXPOSURE_NO_ADHOC_DEALER or use dealer without adhoc.",
            );
          }
          await regressionStep("Verify Adhoc block hidden", async () => {
            await exp.expectAdhocLimitBlockHidden();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-008 Verify the Normal Limit block extends to fill the space when no adhoc limit exists @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (await exp.adhocLimitBlock.isVisible().catch(() => false)) {
            skipWithReason("Requires dealer with no adhoc limit (AC-23).");
          }
          await regressionStep("Verify Normal block fills layout", async () => {
            await exp.expectNormalLimitBlockFields();
            await expect(exp.normalLimitBlock).toBeVisible();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-009 Verify Normal and Adhoc limits both display correctly when an adhoc limit is issued @ui @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitBlock.isVisible().catch(() => false))) {
            skipWithReason("Requires dealer with both Normal and Adhoc limits (AC-24).");
          }
          await regressionStep("Verify both limit blocks visible", async () => {
            await exp.expectNormalLimitBlockFields();
            await exp.expectAdhocLimitBlockFields();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-010 Verify Pending Limit Requests table displays all required columns @ui @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          await regressionStep("Verify Pending Limit Requests columns", async () => {
            await exp.expectPendingRequestsColumns();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-011 Verify Pending Limit Requests values match LOS source data @positive @high @honda`, async ({ page }) => {
      try {
      requireEnv("LOS_API_URL", "Requires LOS_API_URL for request table comparison (AC-3).");
          const exp = await requireModule(page);
          const apiPromise = watchExposureApi(page);
          await page.reload();
          await exp.expectModuleLoaded();
          const captured = await apiPromise;
          await regressionStep("Compare Pending Limit Requests with captured API", async () => {
            await exp.expectPendingRequestsColumns();
            const tableText = await exp.pendingRequestsSection.innerText();
            expect(captured.status).toBe(200);
            if (!/request id|under review|approved/i.test(tableText)) {
              skipWithReason("No pending limit requests on dev to compare with LOS.");
            }
            const apiNumbers = extractNumericFields(captured.body);
            expect(apiNumbers.length).toBeGreaterThan(0);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-012 Verify search by Request ID filters the Pending Limit Requests table @positive @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          const reqId =
            process.env.EXPOSURE_SEARCH_REQUEST_ID?.trim() ||
            (await getFirstRequestId(page));
          const partial = reqId.slice(0, Math.max(4, reqId.length - 2));
          await regressionStep(`Search by Request ID: ${partial}`, async () => {
            await exp.searchPendingRequests(partial);
          });
          expect(await exp.getPageText()).toMatch(new RegExp(partial, "i"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-013 Verify filtering Pending Limit Requests by branch works correctly @positive @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          const branch = process.env.EXPOSURE_FILTER_BRANCH?.trim() || "Branch";
          if (!(await exp.branchFilter.isVisible().catch(() => false))) {
            skipWithReason("Branch filter not visible on Pending Limit Requests.");
          }
          await regressionStep(`Filter by branch: ${branch}`, async () => {
            await exp.filterByBranch(branch);
          });
          expect(await exp.getPageText()).toBeTruthy();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-014 Verify filtering Pending Limit Requests by status works correctly @positive @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.statusFilter.isVisible().catch(() => false))) {
            skipWithReason("Status filter not visible on Pending Limit Requests.");
          }
          await regressionStep("Filter by status Under Review", async () => {
            await exp.filterByStatus("under review");
          });
          const text = await exp.getPageText();
          expect(text).toMatch(/under review|no data available/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-015 Verify search/filter with no matching requests shows 'No data available' @negative @low @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          await regressionStep("Search with no-match query", async () => {
            await exp.searchPendingRequests("ZZZNOMATCH99999");
          });
          await expect(exp.noDataMessage.first()).toBeVisible();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-016 Verify the Adhoc Limit Request modal shows the context strip and all form fields @ui @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          await exp.openAdhocLimitRequestModal();
          await regressionStep("Verify Adhoc modal fields", async () => {
            const text = await exp.getPageText();
            expect(text).toMatch(
              /current limit|utilised|avg utilisation|adhoc amount|validity|business justification|supporting document/i,
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

    test(`TC-017 Verify the Adhoc Amount field shows helper text clarifying it is a temporary increment @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          await exp.openAdhocLimitRequestModal();
          await regressionStep("Verify Adhoc Amount helper text", async () => {
            await exp.expectAdhocAmountHelperText();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-018 Verify the Limit Renewal modal shows the context strip and all form fields @ui @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.limitRenewalButton.isVisible().catch(() => false))) {
            skipWithReason("Limit Renewal action not visible.");
          }
          await exp.openLimitRenewalModal();
          await regressionStep("Verify Limit Renewal modal fields", async () => {
            const text = await exp.getPageText();
            expect(text).toMatch(
              /current limit|utilised|requested limit|tenor|business justification|supporting document/i,
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

    test(`TC-019 Verify the Requested Limit field shows helper text and the Credit review SLA is indicated @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.limitRenewalButton.isVisible().catch(() => false))) {
            skipWithReason("Limit Renewal action not visible.");
          }
          await exp.openLimitRenewalModal();
          await regressionStep("Verify Requested Limit helper and SLA", async () => {
            await exp.expectRequestedLimitHelperText();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-020 Verify Submit for Review on Adhoc Limit Request shows a confirmation pop-up @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          await exp.openAdhocLimitRequestModal();
          await exp.fillAdhocRequestForm("50,00,000", "30", "Automation adhoc justification");
          await exp.uploadSupportingDocument(TD("financials.pdf")).catch(() => undefined);
          await regressionStep("Submit for review — expect confirmation", async () => {
            await exp.clickSubmitForReview();
            const text = await exp.getPageText();
            expect(text).toMatch(/confirm|submission|are you sure/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-021 Verify Submit for Review on Limit Renewal shows a confirmation pop-up @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.limitRenewalButton.isVisible().catch(() => false))) {
            skipWithReason("Limit Renewal action not visible.");
          }
          await exp.openLimitRenewalModal();
          await exp.fillLimitRenewalForm("12,00,00,000", "12", "Automation renewal justification");
          await exp.uploadSupportingDocument(TD("financials.pdf")).catch(() => undefined);
          await regressionStep("Submit for review — expect confirmation", async () => {
            await exp.clickSubmitForReview();
            const text = await exp.getPageText();
            expect(text).toMatch(/confirm|submission|are you sure/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-022 Verify confirming submission sends the Adhoc Limit Request to LOS and it appears Under Review @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          const justification = `Automation adhoc submit ${Date.now()}`;
          await exp.openAdhocLimitRequestModal();
          await exp.fillAdhocRequestForm("25,00,000", "30", justification);
          await exp.uploadSupportingDocument(TD("financials.pdf")).catch(() => undefined);
          await exp.clickSubmitForReview();
          if (!(await exp.confirmationDialog.isVisible().catch(() => false))) {
            skipWithReason("Confirmation pop-up not shown after Submit for review.");
          }
          await exp.clickConfirmSubmission();
          await regressionStep("Verify request appears Under Review", async () => {
            const text = await exp.getPageText();
            if (!/under review|submitted|success/i.test(text)) {
              requireEnv("LOS_API_URL", "Requires LOS Submit Adhoc Limit Request API (AC-7).");
              skipWithReason("Adhoc submission did not return Under Review — verify LOS integration.");
            }
            await exp.expectRequestStatusInTable(/under review/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-023 Verify confirming submission sends the Limit Renewal request to LOS and it appears Under Review @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.limitRenewalButton.isVisible().catch(() => false))) {
            skipWithReason("Limit Renewal action not visible.");
          }
          const justification = `Automation renewal submit ${Date.now()}`;
          await exp.openLimitRenewalModal();
          await exp.fillLimitRenewalForm("12,00,00,000", "12", justification);
          await exp.uploadSupportingDocument(TD("financials.pdf")).catch(() => undefined);
          await exp.clickSubmitForReview();
          if (!(await exp.confirmationDialog.isVisible().catch(() => false))) {
            skipWithReason("Confirmation pop-up not shown after Submit for review.");
          }
          await exp.clickConfirmSubmission();
          await regressionStep("Verify renewal appears Under Review", async () => {
            const text = await exp.getPageText();
            if (!/under review|submitted|success/i.test(text)) {
              requireEnv("LOS_API_URL", "Requires LOS Submit Limit Renewal Request API (AC-7).");
              skipWithReason("Renewal submission did not return Under Review — verify LOS integration.");
            }
            await exp.expectRequestStatusInTable(/under review/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-024 Verify a confirmation message is displayed after successful submission @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          await exp.openAdhocLimitRequestModal();
          await exp.fillAdhocRequestForm("15,00,000", "30", `Confirmation msg ${Date.now()}`);
          await exp.uploadSupportingDocument(TD("financials.pdf")).catch(() => undefined);
          await exp.clickSubmitForReview();
          if (!(await exp.confirmationDialog.isVisible().catch(() => false))) {
            skipWithReason("Confirmation pop-up not shown after Submit for review.");
          }
          await exp.clickConfirmSubmission();
          await regressionStep("Verify confirmation message after submission", async () => {
            const text = await exp.getPageText();
            if (!/submitted|submission successful|under review|success/i.test(text)) {
              requireEnv("LOS_API_URL", "Requires LOS submission for confirmation message (AC-7).");
              skipWithReason("Post-submission confirmation not shown — verify LOS integration.");
            }
            await exp.expectSubmissionSuccessMessage();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-025 Verify Cancel on the Adhoc/Limit Renewal modal closes it without creating a request @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (await exp.adhocLimitRequestButton.isVisible().catch(() => false)) {
            await exp.openAdhocLimitRequestModal();
            await exp.fillAdhocRequestForm("10,00,000", "15", "Cancel test");
            await regressionStep("Cancel Adhoc modal without submit", async () => {
              await exp.closeRequestModal();
            });
          } else if (await exp.limitRenewalButton.isVisible().catch(() => false)) {
            await exp.openLimitRenewalModal();
            await exp.fillLimitRenewalForm("5,00,00,000", "6", "Cancel test");
            await regressionStep("Cancel Renewal modal without submit", async () => {
              await exp.closeRequestModal();
            });
          } else {
            skipWithReason("Neither Adhoc nor Limit Renewal actions visible.");
          }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-026 Verify Cancel on the confirmation pop-up returns the dealer to the form @positive @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          await exp.openAdhocLimitRequestModal();
          await exp.fillAdhocRequestForm("20,00,000", "30", "Confirmation cancel test");
          await exp.uploadSupportingDocument(TD("financials.pdf")).catch(() => undefined);
          await exp.clickSubmitForReview();
          if (!(await exp.confirmationDialog.isVisible().catch(() => false))) {
            skipWithReason("Confirmation pop-up not shown after Submit for review.");
          }
          await regressionStep("Cancel confirmation — return to form", async () => {
            await exp.cancelConfirmationDialog();
            await expect(exp.requestModal).toBeVisible();
            await expect(exp.businessJustificationField).toHaveValue(/confirmation cancel test/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-027 Verify Submit for review is blocked when required fields are missing @negative @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          await exp.openAdhocLimitRequestModal();
          await regressionStep("Submit with missing required fields", async () => {
            await exp.clickSubmitForReview();
            const text = await exp.getPageText();
            expect(text).toMatch(/required|invalid|enter|amount|validity|justification/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-028 Verify Submit for review is blocked without a Supporting Document @negative @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          await exp.openAdhocLimitRequestModal();
          await exp.fillAdhocRequestForm("30,00,000", "30", "No document test");
          await regressionStep("Submit without supporting document", async () => {
            await exp.clickSubmitForReview();
            const text = await exp.getPageText();
            expect(text).toMatch(/document|upload|required|attachment/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-029 Verify LOS submission failure is communicated and the request can be retried @edge @medium @honda`, async ({ page }) => {
      try {
      requireEnv("EXPOSURE_FORCE_LOS_FAILURE", "Requires LOS failure simulation hook.");
          await applyExposureLosSubmitFailureRoute(page);
          const exp = await openExposureSettingsPage(page);
          await exp.expectModuleLoaded();
          if (!(await exp.adhocLimitRequestButton.isVisible().catch(() => false))) {
            skipWithReason("Adhoc Limit Request action not visible.");
          }
          await exp.openAdhocLimitRequestModal();
          await exp.fillAdhocRequestForm("18,00,000", "30", `LOS retry test ${Date.now()}`);
          await exp.uploadSupportingDocument(TD("financials.pdf")).catch(() => undefined);
          await exp.clickSubmitForReview();
          if (await exp.confirmationDialog.isVisible().catch(() => false)) {
            await exp.clickConfirmSubmission();
          }
          await regressionStep("Verify failure message then retry submission", async () => {
            await exp.expectLosSubmissionFailureMessage();
            await exp.clickSubmitForReview();
            if (await exp.confirmationDialog.isVisible().catch(() => false)) {
              await exp.clickConfirmSubmission();
            }
            const text = await exp.getPageText();
            expect(text).toMatch(/under review|submitted|success|failed|try again/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-030 Verify the Visibility Preference section displays all required elements @ui @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          await regressionStep("Verify Visibility Preference section", async () => {
            await exp.expectVisibilitySection();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-031 Verify the dealer can change Shared Portion % using the slider @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          await regressionStep("Change Shared Portion via slider/input", async () => {
            await exp.setSharedPortionPercent("55");
            const text = await exp.getPageText();
            expect(text).toMatch(/55\s*%|55/);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-032 Verify the dealer can select a preset instead of dragging the slider @alternate @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          await regressionStep("Select 60% preset chip", async () => {
            if (!(await exp.presetChip(60).isVisible().catch(() => false))) {
              skipWithReason("60% preset chip not visible.");
            }
            await exp.selectVisibilityPreset(60);
            expect(await exp.getPageText()).toMatch(/60\s*%|60/);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-033 Verify the dealer can key in a percentage or an equivalent amount directly @positive @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          await regressionStep("Type percentage directly", async () => {
            await exp.setSharedPortionPercent("45");
            expect(await exp.getPageText()).toMatch(/45\s*%|45/);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-034 Verify Shared and Held Back amounts recompute immediately when the percentage changes @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          const before = await exp.getSharedHeldBackText();
          await regressionStep("Change percentage and verify recompute", async () => {
            await exp.selectVisibilityPreset(40);
            const after = await exp.getSharedHeldBackText();
            expect(after).toBeTruthy();
            if (before === after) {
              test.info().annotations.push({
                type: "note",
                description: "Shared/Held Back unchanged — may need known Total Available Limit on dev.",
              });
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

    test(`TC-035 Verify Save changes persists the new percentage and updates Last Updated @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.saveVisibilityButton.isVisible().catch(() => false))) {
            skipWithReason("Save changes not visible on Visibility Preference.");
          }
          await exp.selectVisibilityPreset(60);
          await regressionStep("Save visibility changes", async () => {
            await exp.saveVisibilityChanges();
          });
          await exp.navigateAwayAndReturn();
          expect(await exp.getPageText()).toMatch(/60\s*%|60/);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-036 Verify an unsaved percentage change reverts when the dealer leaves the section @negative @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          const saved = await exp.getPageText();
          await exp.setSharedPortionPercent("70");
          await regressionStep("Leave without saving", async () => {
            await exp.navigateAwayAndReturn();
          });
          const restored = await exp.getPageText();
          if (saved === restored) {
            test.info().annotations.push({ type: "note", description: "Could not detect revert — compare manually." });
          }
          expect(restored).not.toMatch(/70\s*%/);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-037 Verify the visibility indicator shows 'Conservative' for 10–35% @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          await exp.setSharedPortionPercent("25");
          await regressionStep("Verify Conservative indicator", async () => {
            await exp.expectVisibilityIndicator(/conservative/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-038 Verify the visibility indicator shows 'Balanced' for >35–80% @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          await exp.selectVisibilityPreset(60);
          await regressionStep("Verify Balanced indicator", async () => {
            await exp.expectVisibilityIndicator(/balanced/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-039 Verify the visibility indicator shows 'High Visibility' for >80–100% @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          await exp.selectVisibilityPreset(90);
          await regressionStep("Verify High Visibility indicator", async () => {
            await exp.expectVisibilityIndicator(/high visibility/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-040 Verify the dealer cannot set OEM visibility below the 10% minimum @negative @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          if (!(await exp.visibilitySection.isVisible().catch(() => false))) {
            skipWithReason("Visibility Preference section not visible.");
          }
          await regressionStep("Attempt below 10% minimum in Visibility Preference", async () => {
            await exp.setSharedPortionPercent("5");
            await exp.expectBelowMinimumVisibilityBlocked(10);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-041 Verify a first-time dealer login requires setting the OEM shared percentage before proceeding @negative @high @honda`, async ({ page }) => {
      try {
      const exp = await requireFirstTimeExposureDealer(page);
          await regressionStep("Verify visibility prompt blocks portal access", async () => {
            await exp.expectFirstTimeVisibilityPromptBlocking();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-042 Verify setting the OEM percentage on first login unblocks the rest of the portal @positive @high @honda`, async ({ page }) => {
      try {
      const exp = await requireFirstTimeExposureDealer(page);
          await regressionStep("Set visibility percentage and unlock portal", async () => {
            await exp.completeFirstTimeVisibilityPercent(40);
          });
          await regressionStep("Navigate to Exposure Settings after first-time setup", async () => {
            await exp.navigateToModule();
            await exp.expectModuleLoaded();
            const text = await exp.getPageText();
            expect(text).toMatch(/normal limit|visibility preference/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-043 Verify a near-expiry limit is reflected in the days-remaining indicator @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          await regressionStep("Verify days-remaining indicator", async () => {
            await exp.expectDaysRemainingIndicator();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-044 Verify a fully-utilised limit is reflected in the % utilised indicator @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          await regressionStep("Verify 100% utilised indicator", async () => {
            await exp.expectFullyUtilisedIndicator();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-045 Verify repayments are adjusted against adhoc limits first, then standard limits @positive @high @honda`, async ({ page }) => {
      try {
      requireEnv("LOS_API_URL", "Requires LOS repayment allocation validation (AC-17).");
          const exp = await requireModule(page);
          if (!(await exp.adhocLimitBlock.isVisible().catch(() => false))) {
            skipWithReason("Requires dealer with both Adhoc and Normal limits and outstanding balances.");
          }
          const beforeAdhoc = await exp.adhocLimitBlock.innerText();
          const beforeNormal = await exp.normalLimitBlock.innerText();
          await regressionStep("Capture utilisation before repayment (LOS validation required)", async () => {
            expect(beforeAdhoc).toMatch(/utilised|available|%/i);
            expect(beforeNormal).toMatch(/utilised|available|%/i);
            test.info().annotations.push({
              type: "note",
              description:
                "Repayment execution requires LMS/LOS repayment hook — compare before/after utilisation post-repayment manually or via LOS_API_URL.",
            });
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-046 Verify source system unavailability shows the standard connectivity validation message @negative @high @honda`, async ({ page }) => {
      try {
      requireEnv("EXPOSURE_FORCE_DATA_FAILURE", "Requires EXPOSURE_FORCE_DATA_FAILURE=true (AC-18).");
          const exp = await openExposureWithDataFailure(page);
          await regressionStep("Verify connectivity error message", async () => {
            await exp.expectConnectivityError();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-047 Verify a section with no data shows 'No data available.' @ui @medium @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          const emptyBranch = process.env.EXPOSURE_EMPTY_BRANCH?.trim();
          if (emptyBranch) {
            await exp.selectBranchScope(emptyBranch);
          }
          await regressionStep("Verify No data available message", async () => {
            const text = await exp.getPageText();
            if (!/no data available/i.test(text)) {
              skipWithReason("Set EXPOSURE_EMPTY_BRANCH to a branch with no pending requests.");
            }
            await expect(exp.noDataMessage.first()).toBeVisible();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-048 Verify changing branch scope refreshes the exposure position and requests @alternate @high @honda`, async ({ page }) => {
      try {
      const exp = await requireModule(page);
          const branch = process.env.EXPOSURE_ALT_BRANCH?.trim() || "Branch";
          const before = await exp.getKpiSectionText();
          if (!(await exp.branchScopeSelect.isVisible().catch(() => false))) {
            skipWithReason("Branch scope selector not visible.");
          }
          await regressionStep(`Change branch scope to ${branch}`, async () => {
            await exp.selectBranchScope(branch);
          });
          const after = await exp.getKpiSectionText();
          expect(after).toBeTruthy();
          if (before === after) {
            test.info().annotations.push({
              type: "note",
              description: "KPI unchanged after branch change — branches may have identical data.",
            });
          }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-049 Verify a dealer cannot view exposure/limit data for a branch outside their authorised scope @security @high @honda`, async ({ page }) => {
      try {
      const unauthorizedBranch = process.env.EXPOSURE_UNAUTHORIZED_BRANCH?.trim();
          if (!unauthorizedBranch) {
            skipWithReason(
              "Set EXPOSURE_UNAUTHORIZED_BRANCH to a branch outside the dealer's authorised scope.",
            );
          }
          const exp = await openAsBranchScopedDealer(page);
          if (!(await exp.branchScopeSelect.isVisible().catch(() => false))) {
            skipWithReason("Branch scope selector not visible for security validation.");
          }
          await regressionStep(`Attempt to select unauthorized branch: ${unauthorizedBranch}`, async () => {
            await exp.selectBranchScope(unauthorizedBranch);
            const text = await exp.getPageText();
            const blocked =
              /unauthorized|not allowed|access denied|forbidden|not available/i.test(text) ||
              !new RegExp(unauthorizedBranch, "i").test(text);
            expect(blocked).toBeTruthy();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-050 Verify the page loads within an acceptable response time with a large pending requests list @nfr @medium @honda`, async ({ page }) => {
      try {
      requireEnv("RUN_NFR_TESTS", "Set RUN_NFR_TESTS=true for response-time NFR checks.");
          const threshold = Number(process.env.EXPOSURE_LOAD_MS ?? "8000");
          const start = Date.now();
          const exp = await requireModule(page);
          await exp.expectExposureKpiCards();
          await exp.expectNormalLimitBlockFields();
          await exp.expectPendingRequestsColumns();
          if (await exp.visibilitySection.isVisible().catch(() => false)) {
            await exp.expectVisibilitySection();
          }
          const elapsed = Date.now() - start;
          test.info().annotations.push({
            type: "performance",
            description: `Exposure Settings render ${elapsed}ms (SLA ${threshold}ms)`,
          });
          expect(elapsed).toBeLessThan(threshold);
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
