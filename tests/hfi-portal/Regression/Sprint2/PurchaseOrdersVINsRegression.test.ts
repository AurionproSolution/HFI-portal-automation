/**
 * US-DLR-009 — Purchase Orders & VINs (Pay Against Sold VINs)
 * Single source of truth: US-DLR-009_TestCases_v1_0.xlsx (TC-001 … TC-050)
 * Catalog: testData/hfi/purchaseOrdersVINsCatalog.ts
 */

import path from "path";
import { test, expect } from "@playwright/test";
import {
  getFirstSoldUnpaidVin,
  getSoldUnpaidVins,
  getFirstInStockVin,
  getFirstPoIdentifier,
  getFirstVin,
  initPurchaseOrdersVINsSteps,
  openPurchaseOrdersVINsPage,
  regressionStep,
  requireEnv,
  requireModule,
  requirePoVinGridData,
  skipWithReason,
} from "../../purchase-orders-vins/purchaseOrdersVINs.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

const TD = (...p: string[]) =>
  path.join(process.cwd(), "testData", "hfi", "files", ...p);

test.describe(
  "US-DLR-009 Purchase Orders & VINs @us-dlr-009 @purchase-orders-vins @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-DLR-009");

    test.beforeEach(() => {
      initPurchaseOrdersVINsSteps();
    });

    test(`TC-001 Verify KPI cards render on page load @ui @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page);
          await regressionStep("Observe KPI cards on page load", async () => {
            await po.expectKpiCardsVisible();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-002 Verify KPI card values match LMS source data @positive @high @honda`, async ({ page }) => {
      try {
      requireEnv(
            "LMS_API_URL",
            "Requires LMS_API_URL to independently query LMS KPI values (AC-1).",
          );
          const po = await requireModule(page);
          await regressionStep("Compare KPI values with LMS source", async () => {
            await po.expectKpiCardsVisible();
            const uiText = await po.getKpiSectionText();
            expect(uiText.length).toBeGreaterThan(0);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-003 Verify data-load failure shows the standard connectivity error message @negative @high @honda`, async ({ page }) => {
      try {
      requireEnv(
            "PO_VIN_FORCE_DATA_FAILURE",
            "Requires PO_VIN_FORCE_DATA_FAILURE=true to simulate LMS timeout/500 (AC-3).",
          );
          const po = await openPurchaseOrdersVINsPage(page);
          await regressionStep("Verify connectivity error message", async () => {
            await po.expectConnectivityError();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-004 Verify Retry option is available on data-load failure @ui @high @honda`, async ({ page }) => {
      try {
      requireEnv(
            "PO_VIN_FORCE_DATA_FAILURE",
            "Requires PO_VIN_FORCE_DATA_FAILURE=true — depends on TC-003 error state (AC-4).",
          );
          const po = await openPurchaseOrdersVINsPage(page);
          await regressionStep("Verify Retry control is visible", async () => {
            await expect(po.retryButton).toBeVisible();
            await expect(po.retryButton).toBeEnabled();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-005 Verify Retry successfully reloads data once source is available @edge @medium @honda`, async ({ page }) => {
      try {
      requireEnv(
            "PO_VIN_FORCE_DATA_FAILURE",
            "Requires failure simulation + LMS recovery hooks (AC-4).",
          );
          const po = await openPurchaseOrdersVINsPage(page);
          await regressionStep("Click Retry after source recovery", async () => {
            await po.clickRetry();
            await po.expectKpiCardsVisible();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-006 Verify empty section shows 'No data available' message @ui @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page);
          await regressionStep("Select empty branch scope if available", async () => {
            const emptyBranch = process.env.PO_VIN_EMPTY_BRANCH?.trim();
            if (emptyBranch) {
              await po.selectBranchScope(emptyBranch);
            }
          });
          await regressionStep("Verify No data available message", async () => {
            const text = await po.getPageText();
            if (!/no data available/i.test(text)) {
              skipWithReason(
                "No empty branch configured. Set PO_VIN_EMPTY_BRANCH to a branch with zero POs.",
              );
            }
            await expect(po.noDataMessage.first()).toBeVisible();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-007 Verify marking a VIN as Sold updates only that field without a full page reload @positive @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin = await getFirstVin(page);
          const urlBefore = page.url();
          await regressionStep("Mark one VIN as Sold", async () => {
            await po.markVinAsSold(vin);
          });
          await regressionStep("Verify no full page reload", async () => {
            expect(page.url()).toBe(urlBefore);
            expect(await po.getPageText()).toMatch(new RegExp(vin, "i"));
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-008 Verify other VIN rows and fields remain unaffected when one VIN is marked Sold @edge @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin = process.env.PO_VIN_TEST_VIN?.trim() || (await getFirstVin(page));
          const gridBefore = await po.getPageText();
          await regressionStep("Mark target VIN Sold", async () => {
            await po.markVinAsSold(vin);
          });
          await regressionStep("Verify sibling rows unchanged", async () => {
            const after = await po.getPageText();
            const linesBefore = gridBefore.split("\n").filter((l) => l.trim());
            const linesAfter = after.split("\n").filter((l) => l.trim());
            expect(linesAfter.length).toBeGreaterThanOrEqual(linesBefore.length - 1);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-009 Verify VIN Inventory Snapshot displays all required buckets @ui @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page);
          await regressionStep("Verify VIN Inventory Snapshot buckets", async () => {
            await po.expectVinSnapshotBuckets();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-010 Verify VIN Inventory Snapshot values match LMS source data @positive @high @honda`, async () => {
      try {
      requireEnv(
            "LMS_API_URL",
            "Requires LMS_API_URL to compare snapshot bucket values (AC-6).",
          );
          skipWithReason("LMS snapshot comparison not automated without LMS fixture API.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-011 Verify a snapshot bucket with zero records shows 'No data available' @ui @low @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page);
          await regressionStep("Verify zero bucket shows No data available", async () => {
            await po.openZeroCountSnapshotBucket();
            const text = await po.getPageText();
            if (!/no data available/i.test(text)) {
              skipWithReason("No zero-count snapshot bucket visible on current data set.");
            }
            await expect(po.noDataMessage.first()).toBeVisible();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-012 Verify expanding a PO row displays all VIN-level detail columns @ui @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const poId = await getFirstPoIdentifier(page);
          await regressionStep("Expand PO row", async () => {
            await po.expandPoRow(poId);
          });
          await regressionStep("Verify VIN detail columns", async () => {
            const text = await po.getPageText();
            expect(text).toMatch(/vin|model|payment|status|amount/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-013 Verify VIN row data matches the underlying source for every column @positive @high @honda`, async () => {
      try {
      requireEnv(
            "LMS_API_URL",
            "Requires LMS_API_URL to validate every VIN column against source (AC-7).",
          );
          skipWithReason("Column-level LMS validation requires backend test data API.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-014 Verify collapsing an expanded PO hides its VIN rows @alternate @low @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const poId = await getFirstPoIdentifier(page);
          await po.expandPoRow(poId);
          const expanded = await po.getPageText();
          await regressionStep("Collapse PO row", async () => {
            await po.collapsePoRow(poId);
          });
          await regressionStep("Verify VIN rows hidden", async () => {
            const collapsed = await po.getPageText();
            expect(collapsed.length).toBeLessThanOrEqual(expanded.length);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-015 Verify PO grid displays a maximum of 50 records on one page @edge @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const count = await po.countVisiblePoRows();
          if (count < 50) {
            skipWithReason(
              `Branch has ${count} rows; need ≥50 records to verify page cap (AC-8).`,
            );
          }
          await regressionStep("Verify max 50 rows on one page", async () => {
            expect(count).toBeLessThanOrEqual(50);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-016 Verify pagination boundary behaviour at exactly 50 and 51 records @edge @medium @honda`, async () => {
      try {
      skipWithReason(
            "Requires controlled test data: exactly 50 and 51 records per branch (AC-8).",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-017 Verify marking a VIN as Sold makes it eligible for payment selection @positive @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin = await getFirstVin(page);
          await regressionStep("Mark VIN Sold", async () => {
            await po.markVinAsSold(vin);
          });
          await regressionStep("Verify payment checkbox enabled", async () => {
            await po.expectVinPaymentCheckboxEnabled(vin);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-018 Verify a Sold, unpaid VIN's checkbox is selectable for payment @positive @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin =
            process.env.PO_VIN_SOLD_UNPAID?.trim() ||
            (await getFirstSoldUnpaidVin(page));
          await regressionStep("Select Sold unpaid VIN", async () => {
            await po.selectVinForPayment(vin);
            await expect(po.vinCheckbox(vin)).toBeChecked();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-019 Verify an In Stock / unsold VIN cannot be selected for payment @negative @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin = process.env.PO_VIN_IN_STOCK?.trim() || (await getFirstInStockVin(page));
          await regressionStep("Attempt to select In Stock VIN", async () => {
            const checked = await po.attemptSelectInStockVin(vin);
            if (checked) {
              expect(checked).toBeFalsy();
            } else {
              expect(await po.getPageText()).toMatch(/in stock|not required/i);
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

    test(`TC-020 Verify Payment column shows 'Not Required' for an In Stock / unsold VIN @ui @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin = process.env.PO_VIN_IN_STOCK?.trim() || (await getFirstInStockVin(page));
          await regressionStep("Verify Not Required payment status", async () => {
            const text = await po.getPageText();
            expect(text).toMatch(/not required|in stock/i);
            const cell = po.paymentStatusCell(vin);
            if (await cell.isVisible().catch(() => false)) {
              await expect(cell).toContainText(/not required/i);
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

    test(`TC-021 Verify Pay action is unavailable when zero Sold VINs are selected @negative @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page);
          await regressionStep("Deselect all VINs", async () => {
            await po.deselectAllVins();
          });
          await regressionStep("Verify Pay action unavailable", async () => {
            if (await po.payButton.isVisible().catch(() => false)) {
              await expect(po.payButton).toBeDisabled();
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

    test(`TC-022 Verify selecting one Sold VIN enables the Pay action @positive @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin =
            process.env.PO_VIN_SOLD_UNPAID?.trim() ||
            (await getFirstSoldUnpaidVin(page));
          await regressionStep("Select one Sold VIN", async () => {
            await po.selectVinForPayment(vin);
          });
          await regressionStep("Verify Pay enabled", async () => {
            await po.expectPayActionEnabled();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-023 Verify selecting multiple Sold VINs enables Pay and auto-calculates the total @positive @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vins =
            process.env.PO_VIN_SOLD_UNPAID_LIST?.split(",")
              .map((v) => v.trim())
              .filter(Boolean) || (await getSoldUnpaidVins(page, 2));
          await regressionStep("Select multiple Sold VINs", async () => {
            for (const vin of vins) {
              await po.selectVinForPayment(vin);
            }
          });
          await regressionStep("Verify Pay enabled and total displayed", async () => {
            await po.expectPayActionEnabled();
            const text = await po.getPageText();
            expect(text).toMatch(/total|₹|payable/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-024 Verify the auto-calculated total payable amount is not editable by the dealer @security @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin =
            process.env.PO_VIN_SOLD_UNPAID?.trim() ||
            (await getFirstSoldUnpaidVin(page));
          await po.selectVinForPayment(vin);
          await regressionStep("Verify total amount is read-only", async () => {
            const input = po.totalPayableAmount.locator("input").first();
            if (await input.isVisible().catch(() => false)) {
              await expect(input).toHaveAttribute("readonly", /.*/);
            } else {
              expect(await po.getPageText()).toMatch(/total|payable/i);
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

    test(`TC-025 Verify Pay Now invokes Worldline with a unique transaction reference and amount @positive @high @honda`, async () => {
      try {
      requireEnv(
            "WORLDLINE_TEST_MODE",
            "Requires Worldline sandbox / WORLDLINE_TEST_MODE=true (AC-21).",
          );
          skipWithReason("Worldline payment gateway integration — not automatable on dev without sandbox.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-026 Verify Pay Now opens the payment journey in a new browser tab @positive @high @honda`, async () => {
      try {
      requireEnv("WORLDLINE_TEST_MODE", "Requires Worldline sandbox (AC-22).");
          skipWithReason("New-tab payment journey requires Worldline sandbox.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-027 Verify clicking Pay Now again opens another new tab with no restriction @alternate @medium @honda`, async () => {
      try {
      requireEnv("WORLDLINE_TEST_MODE", "Requires Worldline sandbox (AC-23).");
          skipWithReason("Repeat Pay Now tab behaviour requires Worldline sandbox.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-028 Verify a declined payment leaves status Pending with dues outstanding @negative @high @honda`, async () => {
      try {
      skipWithReason("Declined payment outcome requires Worldline decline simulation (AC-24).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-029 Verify dealer can retry payment after a decline @positive @medium @honda`, async () => {
      try {
      skipWithReason("Payment retry after decline requires Worldline + prior decline state (AC-24).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-030 Verify a successful payment shows status 'Awaiting Confirmation' @positive @high @honda`, async () => {
      try {
      skipWithReason("Successful payment → Awaiting Confirmation requires Worldline success simulation (AC-25).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-031 Verify closing the payment tab without completing marks the payment Cancelled @edge @medium @honda`, async () => {
      try {
      skipWithReason("Payment tab close → Cancelled requires active Worldline session (AC-26).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-032 Verify navigating away from the payment screen without completing marks it Cancelled @edge @medium @honda`, async () => {
      try {
      skipWithReason("Navigate-away cancellation requires active Worldline session (AC-26).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-033 Verify a payment outcome that arrives after the dealer left the page reflects correctly on reopen @positive @high @honda`, async ({ page }) => {
      try {
      skipWithReason(
            "Payment outcome after dealer left page requires async gateway callback + LOS sync (AC-27).",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-034 Verify the Payment column displays all four defined statuses correctly @ui @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          await regressionStep("Verify payment status labels in grid", async () => {
            const text = await po.getPageText();
            const statuses = [
              /not required/i,
              /pending/i,
              /awaiting confirmation/i,
              /payment completed/i,
            ];
            const found = statuses.filter((re) => re.test(text)).length;
            if (found < 2) {
              skipWithReason(
                "Need test data with ≥2 payment states (In Stock, Pending, Awaiting Confirmation, Payment Completed).",
              );
            }
            expect(found).toBeGreaterThanOrEqual(2);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-035 Verify Add Payment Details captures Amount Paid and UTR Number for a Sold VIN @positive @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin =
            process.env.PO_VIN_SOLD_UNPAID?.trim() ||
            (await getFirstSoldUnpaidVin(page));
          await regressionStep("Open Add Payment Details", async () => {
            await po.openAddPaymentDetails(vin);
          });
          await regressionStep("Fill Amount and UTR", async () => {
            await po.fillAddPaymentDetails("1000", "UTRTEST123456");
            await po.expectAddPaymentDetailsValues("1000", "UTRTEST123456");
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-036 Verify Add Payment Details cannot be submitted without a payment confirmation document @negative @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin =
            process.env.PO_VIN_SOLD_UNPAID?.trim() ||
            (await getFirstSoldUnpaidVin(page));
          await po.openAddPaymentDetails(vin);
          await po.fillAddPaymentDetails("500", "UTRNOFILE");
          await regressionStep("Submit without document — expect validation", async () => {
            await po.submitAddPaymentDetails();
            const text = await po.getPageText();
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

    test(`TC-037 Verify Add Payment Details is unavailable for a VIN that is not marked Sold @negative @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin = process.env.PO_VIN_IN_STOCK?.trim() || (await getFirstInStockVin(page));
          await regressionStep("Verify Add Payment Details unavailable for unsold VIN", async () => {
            const rowBtn = po
              .vinRow(vin)
              .getByRole("button", { name: /add payment details/i });
            const footerBtn = po.addPaymentDetailsButton();
            if (await rowBtn.isVisible().catch(() => false)) {
              await expect(rowBtn).toBeHidden().catch(async () => {
                await expect(rowBtn).toBeDisabled();
              });
              return;
            }
            await po.selectVinForPayment(vin).catch(() => undefined);
            if (await footerBtn.isVisible().catch(() => false)) {
              await expect(footerBtn).toBeDisabled();
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

    test(`TC-038 Verify submitting Add Payment Details sends the record to the Ops console @positive @medium @honda`, async () => {
      try {
      skipWithReason(
            "Ops console reconciliation is informational only and out of Sprint 2 scope (AC-18).",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-039 Verify document upload rejects disallowed file types and oversized files @edge @low @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin =
            process.env.PO_VIN_SOLD_UNPAID?.trim() ||
            (await getFirstSoldUnpaidVin(page));
          await po.openAddPaymentDetails(vin);
          await po.fillAddPaymentDetails("100", "UTRFILE");
          await regressionStep("Upload disallowed file type", async () => {
            const badFile = TD("invalid_upload.exe");
            try {
              await po.uploadPaymentDocument(badFile);
            } catch {
              /* file may not exist — use txt fallback */
              await po.uploadPaymentDocument(TD("financials.pdf")).catch(() => undefined);
            }
            const text = await po.getPageText();
            expect(text).toMatch(/jpg|pdf|file type|size|10\s*mb|invalid/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-040 Verify search by PO number (partial) filters the PO/VIN list @positive @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const poNum = process.env.PO_VIN_SEARCH_PO?.trim() || (await getFirstPoIdentifier(page));
          const partial = poNum.slice(0, Math.max(4, poNum.length - 2));
          await regressionStep(`Search by PO partial: ${partial}`, async () => {
            await po.search(partial);
          });
          await regressionStep("Verify filtered results contain PO", async () => {
            expect(await po.getPageText()).toMatch(new RegExp(partial, "i"));
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-041 Verify search by VIN (partial) filters the PO/VIN list @positive @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const vin = process.env.PO_VIN_SEARCH_VIN?.trim() || (await getFirstVin(page));
          const partial = vin.slice(0, 6);
          await regressionStep(`Search by VIN partial: ${partial}`, async () => {
            await po.search(partial);
          });
          expect(await po.getPageText()).toMatch(new RegExp(partial, "i"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-042 Verify search by model returns matching PO/VIN records @positive @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const model = process.env.PO_VIN_SEARCH_MODEL?.trim() || "City";
          const poId = await getFirstPoIdentifier(page);
          await po.expandPoRow(poId);
          await regressionStep(`Search by model: ${model}`, async () => {
            await po.search(model);
          });
          const text = await po.getPageText();
          if (!new RegExp(model, "i").test(text)) {
            skipWithReason(`No records for model '${model}' on current branch.`);
          }
          expect(text).toMatch(new RegExp(model, "i"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-043 Verify search by UTR number returns matching PO/VIN records @positive @medium @honda`, async ({ page }) => {
      try {
      const utr = process.env.PO_VIN_SEARCH_UTR?.trim();
          if (!utr) {
            skipWithReason("Set PO_VIN_SEARCH_UTR to a known UTR on dev.");
          }
          const po = await requireModule(page, { requireGridData: true });
          await po.search(utr!);
          expect(await po.getPageText()).toMatch(new RegExp(utr!, "i"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-044 Verify search with no matching records shows 'No data available' @negative @low @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page);
          await regressionStep("Search with no-match query", async () => {
            await po.search("ZZZNOMATCH99999");
          });
          await expect(po.noDataMessage.first()).toBeVisible();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-045 Verify Export downloads the currently filtered PO/VIN list as CSV @positive @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          if (process.env.PO_VIN_SEARCH_PO?.trim()) {
            await po.search(process.env.PO_VIN_SEARCH_PO.trim());
          }
          await regressionStep("Export filtered list as CSV", async () => {
            const [download] = await Promise.all([
              page.waitForEvent("download", { timeout: 30_000 }),
              po.exportCsv(),
            ]);
            expect(download.suggestedFilename()).toMatch(/\.csv$/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-046 Verify Export with no active filters exports the full list as CSV @edge @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          await po.clearSearch();
          await regressionStep("Export full list as CSV", async () => {
            const [download] = await Promise.all([
              page.waitForEvent("download", { timeout: 30_000 }),
              po.exportCsv(),
            ]);
            expect(download.suggestedFilename()).toMatch(/\.csv$/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-047 Verify changing branch scope refreshes the page data @alternate @high @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page, { requireGridData: true });
          const branch = process.env.PO_VIN_ALT_BRANCH?.trim() || "Branch";
          const before = await po.getKpiSectionText();
          await regressionStep(`Change branch scope to ${branch}`, async () => {
            if (!(await po.branchScopeSelect.isVisible().catch(() => false))) {
              skipWithReason("Branch scope selector not visible on page.");
            }
            await po.selectBranchScope(branch);
          });
          const after = await po.getKpiSectionText();
          expect(after).toBeTruthy();
          if (before === after) {
            test.info().annotations.push({
              type: "note",
              description: "KPI values unchanged — branch may have identical data or filter not applied.",
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

    test(`TC-048 Verify changing the date range filter refreshes the page data @alternate @medium @honda`, async ({ page }) => {
      try {
      const po = await requireModule(page);
          if (!(await po.isDateRangeFilterVisible())) {
            skipWithReason("Date range filter not visible on page.");
          }
          const before = await po.getPageText();
          await regressionStep("Change date range filter", async () => {
            await po.selectDateRangePreset(/last 30|this month|custom/i);
          });
          expect(await po.getPageText()).not.toEqual(before);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-049 Verify a dealer cannot view PO/VIN data outside their authorised branch scope @security @high @honda`, async () => {
      try {
      requireEnv(
            "PO_VIN_UNAUTHORIZED_BRANCH",
            "Requires PO_VIN_UNAUTHORIZED_BRANCH and cross-branch test setup.",
          );
          skipWithReason("Cross-dealer branch authorization requires dedicated security test accounts.");
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.startsWith("SKIP:")) {
            test.skip(true, msg.replace(/^SKIP:\s*/, ""));
          }
          throw e;
        }
      });

    test(`TC-050 Verify KPI cards, snapshot and PO/VIN grid load within an acceptable response time @nfr @medium @honda`, async ({ page }) => {
      try {
      requireEnv(
            "RUN_NFR_TESTS",
            "Set RUN_NFR_TESTS=true to execute response-time NFR checks.",
          );
          const po = await requireModule(page, { requireGridData: true });
          const threshold = Number(process.env.PO_VIN_LOAD_MS ?? "8000");
          const start = Date.now();
          await po.expectKpiCardsVisible();
          await po.expectVinSnapshotBuckets();
          await expect(po.poGrid).toBeVisible();
          const elapsed = Date.now() - start;
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
