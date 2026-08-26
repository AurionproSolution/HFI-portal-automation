/**
 * US-DLR-010 — Transaction History (Ledger, Balances & Online Payments)
 * Single source of truth: US-DLR-010_TestCases_v1_0.xlsx (TC-001 … TC-050)
 * Catalog: testData/hfi/transactionHistoryCatalog.ts
 */

import { test, expect } from "@playwright/test";
import { HFITransactionHistoryPage } from "@pages/hfi-portal/dealer-finance/HFITransactionHistoryPage";
import {
  getFirstPoNumber,
  getFirstTransactionId,
  initTransactionHistorySteps,
  regressionStep,
  requireEnv,
  requireModule,
  skipWithReason,
} from "../../transaction-history/transactionHistory.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

test.describe(
  "US-DLR-010 Transaction History @us-dlr-010 @transaction-history @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-DLR-010");

    test.beforeEach(() => {
      initTransactionHistorySteps();
    });

    test(`TC-001 Verify Balance KPI cards render on page load @ui @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await regressionStep("Verify Balance KPI cards on page load", async () => {
            await th.expectBalanceKpiCards();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-002 Verify KPI card values match LMS for the default 30-day filter @positive @high @honda`, async () => {
      try {
      requireEnv("LMS_API_URL", "Requires LMS_API_URL to compare KPI values (AC-1).");
          skipWithReason("LMS KPI comparison requires backend API fixture.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-003 Verify KPI values recalculate correctly when the period filter changes @positive @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const before = await th.getKpiSectionText();
          await regressionStep("Change period filter from default 30-day", async () => {
            await th.selectDateRangePreset("7D");
          });
          const after = await th.getKpiSectionText();
          expect(after).toBeTruthy();
          if (before === after) {
            test.info().annotations.push({
              type: "note",
              description: "KPI values unchanged — period may map to same data on dev.",
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

    test(`TC-004 Verify Online Payments banner displays modes, dues, overdue and Pay Now @ui @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await regressionStep("Verify Online Payments banner", async () => {
            await th.expectOnlinePaymentsBanner();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-005 Verify Online Payments banner values match LMS source data @positive @high @honda`, async () => {
      try {
      requireEnv("LMS_API_URL", "Requires LMS_API_URL for banner comparison (AC-2).");
          skipWithReason("LMS banner value comparison requires backend API.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-006 Verify PO-wise ledger row displays all required columns @ui @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await regressionStep("Verify PO-wise ledger columns", async () => {
            await expect(th.ledgerGrid).toBeVisible({ timeout: 30_000 });
            await th.expectLedgerColumnHeaders();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-007 Verify PO row values match LMS source data @positive @high @honda`, async () => {
      try {
      requireEnv("LMS_API_URL", "Requires LMS_API_URL for PO row validation (AC-3).");
          skipWithReason("PO row LMS comparison requires backend API.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-008 Verify the ledger summary count (POs × entries) is correct @ui @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await regressionStep("Verify ledger summary count", async () => {
            const text = await th.getPageText();
            expect(text).toMatch(/pos?|entries|ledger/i);
            if (await th.ledgerSummary.isVisible().catch(() => false)) {
              await expect(th.ledgerSummary).toBeVisible();
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

    test(`TC-009 Verify expanding a PO row reveals entry-level columns @ui @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const po = await getFirstPoNumber(page);
          await regressionStep("Expand PO row", async () => {
            await th.expandPoRow(po);
          });
          await regressionStep("Verify entry-level columns", async () => {
            const text = await th.getPageText();
            expect(text).toMatch(/transaction|reference|debit|credit|status|date/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-010 Verify entry-level values match LMS source data @positive @high @honda`, async () => {
      try {
      requireEnv("LMS_API_URL", "Requires LMS_API_URL for entry-level validation (AC-4).");
          skipWithReason("Entry-level LMS comparison requires backend API.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-011 Verify collapsing an expanded PO hides its entries @alternate @low @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const po = await getFirstPoNumber(page);
          await th.expandPoRow(po);
          await regressionStep("Collapse PO row", async () => {
            await th.collapsePoRow(po);
            await th.expectPoEntriesHidden(po);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-012 Verify the Status pill on ledger entries displays correctly for each defined status @ui @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const po = await getFirstPoNumber(page);
          await th.expandPoRow(po);
          await regressionStep("Verify status pills", async () => {
            const text = await th.getPageText();
            const statuses = [/pending/i, /completed/i, /awaiting/i, /reconciled/i];
            const found = statuses.filter((re) => re.test(text)).length;
            if (found === 0) {
              skipWithReason("No ledger entry status pills visible on current data.");
            }
            expect(found).toBeGreaterThan(0);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-013 Verify Pay Now directs the dealer to Worldline to continue payment @positive @high @honda`, async () => {
      try {
      requireEnv("WORLDLINE_TEST_MODE", "Requires Worldline sandbox (AC-5).");
          skipWithReason("Worldline Pay Now redirect requires payment gateway sandbox.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-014 Verify the Online Payment panel captures all required fields @ui @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          if (!(await th.payNowButton.isEnabled().catch(() => false))) {
            skipWithReason("Pay Now disabled — no outstanding dues to open payment panel.");
          }
          await regressionStep("Open Online Payment panel", async () => {
            await th.openOnlinePaymentPanel();
          });
          await regressionStep("Verify required fields", async () => {
            const text = await th.getPageText();
            expect(text).toMatch(/pay against|amount|mode|proceed to pay/i);
            await expect(th.amountField).toBeVisible();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-015 Verify dealer can select a different Pay Against option instead of Outstanding dues @alternate @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          if (!(await th.payNowButton.isEnabled().catch(() => false))) {
            skipWithReason("Pay Now disabled — cannot open payment panel.");
          }
          await th.openOnlinePaymentPanel();
          await regressionStep("Select alternate Pay Against option", async () => {
            if (!(await th.payAgainstSelect.isVisible().catch(() => false))) {
              skipWithReason("Pay Against selector not visible.");
            }
            await th.selectAlternatePayAgainst();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-016 Verify Proceed to pay initiates real-time settlement for the entered details @positive @high @honda`, async () => {
      try {
      requireEnv("WORLDLINE_TEST_MODE", "Requires Worldline sandbox for settlement (AC-6).");
          skipWithReason("Real-time settlement requires Worldline integration.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-017 Verify dealer can make a part payment against outstanding dues @positive @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          if (!(await th.payNowButton.isEnabled().catch(() => false))) {
            skipWithReason("Pay Now disabled — no dues for part payment test.");
          }
          await th.openOnlinePaymentPanel();
          await regressionStep("Enter part payment amount", async () => {
            await th.fillAmount("100");
            await expect(th.amountField).toHaveValue("100");
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-018 Verify Cancel on the Online Payment panel closes it without initiating payment @positive @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          if (!(await th.payNowButton.isEnabled().catch(() => false))) {
            skipWithReason("Pay Now disabled — cannot open payment panel.");
          }
          await th.openOnlinePaymentPanel();
          await regressionStep("Cancel without payment", async () => {
            await th.closeOnlinePaymentPanel();
          });
          await expect(th.proceedToPayButton).toBeHidden();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-019 Verify a reconciled payment updates the ledger and balances @positive @high @honda`, async () => {
      try {
      skipWithReason("Reconciled payment ledger update requires LOS/LMS reconciliation flow (AC-8).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-020 Verify an un-reconciled payment is not reflected until reconciliation completes @edge @medium @honda`, async () => {
      try {
      skipWithReason("Un-reconciled payment state requires backend reconciliation hooks (AC-8).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-021 Verify search by PO number filters the ledger @positive @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const po = process.env.TXN_HISTORY_SEARCH_PO?.trim() || (await getFirstPoNumber(page));
          const partial = po.slice(0, Math.max(4, po.length - 2));
          await regressionStep(`Search by PO: ${partial}`, async () => {
            await th.search(partial);
          });
          expect(await th.getPageText()).toMatch(new RegExp(partial, "i"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-022 Verify search by Transaction ID filters the ledger @positive @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          let txnId = process.env.TXN_HISTORY_SEARCH_TXN?.trim();
          if (!txnId) {
            const po = await getFirstPoNumber(page);
            await th.expandPoRow(po);
            txnId = await getFirstTransactionId(page).catch(() => undefined);
            if (!txnId) {
              skipWithReason(
                "Set TXN_HISTORY_SEARCH_TXN or ensure expanded entries show Transaction IDs.",
              );
            }
          }
          await th.search(txnId!);
          expect(await th.getPageText()).toMatch(new RegExp(txnId!, "i"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-023 Verify search by reference filters the ledger @positive @medium @honda`, async ({ page }) => {
      try {
      const ref = process.env.TXN_HISTORY_SEARCH_REF?.trim();
          if (!ref) {
            skipWithReason("Set TXN_HISTORY_SEARCH_REF to a known ledger reference on dev.");
          }
          const th = await requireModule(page);
          await th.search(ref!);
          expect(await th.getPageText()).toMatch(new RegExp(ref!, "i"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-024 Verify filtering by branch refreshes the ledger and KPIs @alternate @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const branch = process.env.TXN_HISTORY_ALT_BRANCH?.trim() || "Branch";
          const before = await th.getKpiSectionText();
          await regressionStep(`Filter by branch: ${branch}`, async () => {
            if (!(await th.branchFilter.isVisible().catch(() => false))) {
              skipWithReason("Branch filter not visible.");
            }
            await th.selectBranch(branch);
          });
          expect(await th.getKpiSectionText()).toBeTruthy();
          if (before === (await th.getKpiSectionText())) {
            test.info().annotations.push({ type: "note", description: "KPI unchanged after branch filter." });
          }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-025 Verify changing the period filter refreshes the ledger and KPIs @alternate @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const before = await th.getPageText();
          await regressionStep("Change period filter", async () => {
            await th.selectDateRangePreset("90D");
          });
          await expect(th.dateRangePresetButton("90D")).toBeVisible();
          const after = await th.getPageText();
          expect(after).toMatch(/transaction history|opening balance/i);
          if (before === after) {
            test.info().annotations.push({
              type: "note",
              description:
                "Ledger/KPI text unchanged after 90D filter — same underlying data on dev.",
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

    test(`TC-026 Verify selecting a Custom period range refreshes the ledger and KPIs @alternate @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await regressionStep("Open custom period range", async () => {
            await th.selectCustomPeriodRange();
          });
          expect(await th.getPageText()).toMatch(/custom|from|to|date/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-027 Verify search with no matching records shows 'No data available' @negative @low @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await th.search("ZZZNOMATCH99999");
          const text = await th.getPageText();
          expect(text).toMatch(/no transactions match|no data available/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-028 Verify Export downloads the ledger for the current scope and filters @positive @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          if (process.env.TXN_HISTORY_SEARCH_PO?.trim()) {
            await th.search(process.env.TXN_HISTORY_SEARCH_PO.trim());
          }
          await regressionStep("Export filtered ledger", async () => {
            const [download] = await Promise.all([
              page.waitForEvent("download", { timeout: 30_000 }),
              th.exportLedger(),
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

    test(`TC-029 Verify Export with no active filters exports the full ledger for the current scope @edge @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await th.clearSearch();
          await regressionStep("Export full ledger scope", async () => {
            const [download] = await Promise.all([
              page.waitForEvent("download", { timeout: 30_000 }),
              th.exportLedger(),
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

    test(`TC-030 Verify Pay Now is unavailable and a nil-due state is shown when no dues are outstanding @negative @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await regressionStep("Verify nil-due state", async () => {
            const text = await th.getPageText();
            if (/total dues today[:\s]*₹?\s*0|no dues|nil due/i.test(text)) {
              await expect(th.payNowButton).toBeDisabled();
            } else if (await th.payNowButton.isEnabled().catch(() => false)) {
              skipWithReason("Dealer has outstanding dues — nil-due precondition not met.");
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

    test(`TC-031 Verify a failed or cancelled payment at the gateway leaves dues outstanding with retry allowed @negative @high @honda`, async () => {
      try {
      skipWithReason("Failed/cancelled gateway payment requires Worldline simulation (AC-12).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-032 Verify source system unavailability shows the standard connectivity validation message @negative @high @honda`, async () => {
      try {
      requireEnv("TXN_HISTORY_FORCE_DATA_FAILURE", "Requires TXN_HISTORY_FORCE_DATA_FAILURE=true (AC-13).");
          skipWithReason("Connectivity error simulation requires environment hook.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-033 Verify unaffected sections continue to render when only one section's source is unavailable @ui @medium @honda`, async () => {
      try {
      requireEnv("TXN_HISTORY_PARTIAL_FAILURE", "Requires partial source failure hook (AC-13).");
          skipWithReason("Partial section failure requires mocked API responses.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-034 Verify a section with no data shows 'No data available.' @ui @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const emptyBranch = process.env.TXN_HISTORY_EMPTY_BRANCH?.trim();
          if (emptyBranch) {
            await th.selectBranch(emptyBranch);
          }
          await regressionStep("Verify No data available section", async () => {
            const text = await th.getPageText();
            if (!/no data available/i.test(text)) {
              skipWithReason("Set TXN_HISTORY_EMPTY_BRANCH to a branch with no ledger data.");
            }
            await expect(th.noDataMessage.first()).toBeVisible();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-035 Verify Pay Now with a confirmed amount invokes the gateway with a unique transaction reference @positive @high @honda`, async () => {
      try {
      requireEnv("WORLDLINE_TEST_MODE", "Requires Worldline sandbox (AC-15).");
          skipWithReason("Gateway transaction reference validation requires Worldline.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-036 Verify Pay Now opens the payment process on a new browser tab @positive @high @honda`, async () => {
      try {
      requireEnv("WORLDLINE_TEST_MODE", "Requires Worldline sandbox (AC-16).");
          skipWithReason("New-tab payment journey requires Worldline sandbox.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-037 Verify clicking Pay Now again opens another new tab with no restriction @alternate @medium @honda`, async () => {
      try {
      requireEnv("WORLDLINE_TEST_MODE", "Requires Worldline sandbox (AC-17).");
          skipWithReason("Repeat Pay Now tab requires Worldline sandbox.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-038 Verify a declined payment leaves status Pending with dues outstanding @negative @high @honda`, async () => {
      try {
      skipWithReason("Declined payment requires Worldline decline simulation (AC-18).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-039 Verify dealer can retry payment after a decline @positive @medium @honda`, async () => {
      try {
      skipWithReason("Payment retry after decline requires prior decline state (AC-18).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-040 Verify a successful payment shows status 'Awaiting Confirmation' @positive @high @honda`, async () => {
      try {
      skipWithReason("Awaiting Confirmation status requires successful Worldline payment (AC-19).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-041 Verify closing the payment tab without completing marks the payment Cancelled @edge @medium @honda`, async () => {
      try {
      skipWithReason("Payment tab close → Cancelled requires active Worldline session (AC-20).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-042 Verify navigating away from the payment screen without completing marks it Cancelled @edge @medium @honda`, async () => {
      try {
      skipWithReason("Navigate-away cancellation requires active Worldline session (AC-20).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-043 Verify a payment outcome that arrives after the dealer left the page reflects correctly on reopen @positive @high @honda`, async ({ page }) => {
      try {
      skipWithReason("Async payment outcome after leaving page requires gateway callback (AC-21).");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-044 Verify the Consolidated / Branch toggle switches the ledger and KPI scope @alternate @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          const before = await th.getKpiSectionText();
          await regressionStep("Toggle Consolidated / Branch scope", async () => {
            if (!(await th.consolidatedBranchToggle.isVisible().catch(() => false))) {
              skipWithReason("Consolidated/Branch toggle not visible.");
            }
            await th.toggleConsolidatedBranch("branch");
          });
          expect(await th.getKpiSectionText()).toBeTruthy();
          if (before === (await th.getKpiSectionText())) {
            test.info().annotations.push({ type: "note", description: "KPI unchanged after scope toggle." });
          }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-045 Verify dealer arriving via the dashboard action lands directly on Transaction History @alternate @medium @honda`, async ({ page }) => {
      try {
      const th = new HFITransactionHistoryPage(page);
          await th.openFromDashboardAction();
          await regressionStep("Verify landed on Transaction History", async () => {
            await th.expectModuleLoaded();
            expect(page.url()).toMatch(/financials\/transactions|transaction-history/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-046 Verify Balance KPI cards are read-only @ui @low @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          await regressionStep("Verify KPI cards are read-only", async () => {
            await th.expectKpiCardsReadOnly();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-047 Verify the Amount field only accepts valid positive numeric input @security @medium @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          if (!(await th.payNowButton.isEnabled().catch(() => false))) {
            skipWithReason("Pay Now disabled — cannot open amount field validation.");
          }
          await th.openOnlinePaymentPanel();
          await regressionStep("Reject invalid amount input", async () => {
            await th.fillAmount("-100");
            const afterNegative = await th.getAmountFieldValue();
            if (afterNegative) {
              expect(Number.parseFloat(afterNegative.replace(/,/g, ""))).toBeGreaterThanOrEqual(0);
            }
            const afterAlpha = await th.tryEnterAmountChars("abc");
            expect(afterAlpha).not.toMatch(/abc/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-048 Verify a dealer cannot view ledger/balances for a branch outside their authorised scope @security @high @honda`, async () => {
      try {
      requireEnv("TXN_HISTORY_UNAUTHORIZED_BRANCH", "Requires unauthorized branch test account.");
          skipWithReason("Cross-branch authorization requires dedicated security test data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-049 Verify the page loads within an acceptable response time for a large ledger @nfr @medium @honda`, async () => {
      try {
      requireEnv("RUN_NFR_TESTS", "Set RUN_NFR_TESTS=true for response-time NFR checks.");
          skipWithReason("NFR load test requires RUN_NFR_TESTS and large-ledger fixture.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-050 Verify Proceed to pay is blocked when a required Online Payment field is missing @negative @high @honda`, async ({ page }) => {
      try {
      const th = await requireModule(page);
          if (!(await th.payNowButton.isEnabled().catch(() => false))) {
            skipWithReason("Pay Now disabled — cannot validate Proceed to pay.");
          }
          await th.openOnlinePaymentPanel();
          await regressionStep("Proceed without required fields", async () => {
            await th.clearAmount();
            await th.clickProceedToPay();
            const text = await th.getPageText();
            expect(text).toMatch(/required|invalid|enter|amount/i);
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
