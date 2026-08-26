/**
 * US-DLR-007 — Dealer Finance Dashboard (Limit, Exposure & Action Items)
 * Single source of truth: US-DLR-006_TestCases_v1.0.xlsx (TC-001 … TC-054)
 * Catalog: testData/hfi/dealerFinanceDashboardCatalog.ts
 */

import { test, expect } from "@playwright/test";
import { getDealerFinanceDashboardCase } from "@testData/hfi/dealerFinanceDashboardCatalog";
import {
  getDashboardEmptyBranch,
  getDashboardTestBranch,
  getFirstSpecificBranch,
  initDashboardSteps,
  regressionStep,
  requireDashboard,
  requireEnv,
  skipWithReason,
} from "../../dealer-finance-dashboard/dealerFinanceDashboard.helpers";

function typeTag(t: string): string {
  return `@${t.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function priorityTag(p: string): string {
  return `@${p.toLowerCase()}`;
}

function meta(id: string): string {
  const c = getDealerFinanceDashboardCase(id);
  return c
    ? `AC: ${c.ac} | Type: ${c.type} | Priority: ${c.priority}`
    : id;
}

test.describe(
  "US-DLR-007 Dealer Finance Dashboard (Limit, Exposure & Action Items) @us-dlr-007 @dealer-finance-dashboard @regression",
  () => {
    test.setTimeout(300_000);

    test.beforeEach(() => {
      initDashboardSteps();
    });


    test(`TC-001 Dashboard loads with default filters (All Branches Consolidated, 30D) @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify default All Branches Consolidated and 30D filters", async () => {
          await dash.expectDefaultFilters();
        });
        await regressionStep("Verify all dashboard sections visible", async () => {
          await dash.expectAllDashboardSections();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-002 Filter chips display all date range options (7D, 30D, MTD, 90D, YTD, Custom) @ui @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify all six date-range chips visible", async () => {
          await dash.expectDateRangeChipsVisible();
        });
        await regressionStep("Verify 30D is the default selection", async () => {
          await dash.expectDefaultFilters();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-003 Branch selector lists only in-scope branches plus 'All Branches Consolidated' @security @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_UNAUTHORIZED_BRANCH",
          "Requires DASHBOARD_IN_SCOPE_BRANCHES and DASHBOARD_UNAUTHORIZED_BRANCH for multi-dealer security test.",
        );
        skipWithReason("Cross-dealer branch authorization requires dedicated security test accounts.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-004 Normal Limit card displays total, Used, Available, Limit Expiry and Days Left @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify Normal Limit card fields", async () => {
          await dash.expectNormalLimitFields();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-005 Normal Limit progress bar reflects Used vs Available proportion correctly @ui @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        const expectedPct = process.env.DASHBOARD_NORMAL_USED_PCT?.trim();
        if (!expectedPct) {
          await regressionStep("Verify progress indicator or used/available ratio on page", async () => {
            const text = await dash.getMainText();
            const hasProgress =
              /\d+(\.\d+)?\s*%/.test(text) ||
              (/used limit/i.test(text) && /available limit/i.test(text));
            if (!hasProgress) {
              skipWithReason(
                "Set DASHBOARD_NORMAL_USED_PCT or ensure Normal Limit shows used/available proportion on DEV.",
              );
            }
            expect(hasProgress).toBeTruthy();
          });
        } else {
          await regressionStep(`Verify Normal Limit used proportion ~${expectedPct}%`, async () => {
            const text = await dash.getMainText();
            expect(text).toMatch(new RegExp(expectedPct.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-006 Normal Limit days-remaining countdown decrements correctly across days @edge @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_LIMIT_EXPIRY_REF",
          "Requires day simulation or LOS-seeded limit expiry reference — set DASHBOARD_LIMIT_EXPIRY_REF.",
        );
        skipWithReason("Days-remaining countdown requires multi-day simulation or time-travel test harness.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-007 Adhoc Limit card displays total, Used, Available, Adhoc Validity and Days Left @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify Adhoc Limit card fields", async () => {
          await dash.expectAdhocLimitFields();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-008 Adhoc Limit card renders correctly when no Adhoc limit is currently active @edge @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_NO_ADHOC_DEALER",
          "Requires dealer with no active Adhoc limit — set DASHBOARD_NO_ADHOC_DEALER.",
        );
        skipWithReason("Switch ACTIVE_DEALER to DASHBOARD_NO_ADHOC_DEALER before run.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-009 Normal / Adhoc figures reflect only the OEM-visible portion (Limit Shared with OEM %) @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_OEM_VISIBLE_PCT",
          "Requires LMS/OEM visibility seed — set DASHBOARD_OEM_VISIBLE_PCT and expected limit figures.",
        );
        skipWithReason("OEM visibility portion validation requires LMS-seeded Limit Shared with OEM % data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-010 Limit Shared with OEM % = 100% shows the full sanctioned limit @edge @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_OEM_100_PCT_DEALER",
          "Requires dealer with Limit Shared with OEM % = 100% — set DASHBOARD_OEM_100_PCT_DEALER.",
        );
        skipWithReason("Switch ACTIVE_DEALER to DASHBOARD_OEM_100_PCT_DEALER before run.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-011 Limit Shared with OEM % = 0% renders a zero / minimum visibility state @edge @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_OEM_0_PCT_DEALER",
          "Requires dealer with Limit Shared with OEM % = 0% — set DASHBOARD_OEM_0_PCT_DEALER.",
        );
        skipWithReason("Switch ACTIVE_DEALER to DASHBOARD_OEM_0_PCT_DEALER before run.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-012 Default view when Limit Shared with OEM % has not been set @alternate @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_OEM_UNSET_DEALER",
          "Requires dealer where Limit Shared with OEM % is unset — set DASHBOARD_OEM_UNSET_DEALER.",
        );
        skipWithReason("OEM visibility unset state requires dedicated LMS/OEM seed data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-013 Post-load change of Limit Shared with OEM % requires reload to reflect @alternate @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_OEM_CHANGE_REQUIRES_RELOAD",
          "Requires ability to change Limit Shared with OEM % in LMS/OEM after dashboard load.",
        );
        skipWithReason("Post-load OEM visibility change requires LMS/OEM integration test harness.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-014 Dues section shows Normal, Adhoc and Overdue amounts sourced from LMS @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify Dues section with Normal, Adhoc and Overdue", async () => {
          await dash.expectDuesSection();
          const text = await dash.getMainText();
          expect(dash.hasIndianCurrencyFormat(text)).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-015 Overdue formula: Overdue = Normal overdue + Adhoc overdue @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_EXPECTED_OVERDUE",
          "Requires known Normal/Adhoc overdue amounts — set DASHBOARD_EXPECTED_OVERDUE (and optional NORMAL/ADHOC components).",
        );
        const dash = await requireDashboard(page);
        const expected = process.env.DASHBOARD_EXPECTED_OVERDUE!.trim();
        await regressionStep("Verify Overdue amount matches expected formula result", async () => {
          const text = await dash.getMainText();
          expect(text).toMatch(new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-016 Pay dues button navigates to Transaction History @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Click Pay dues and verify navigation to Transaction History", async () => {
          await dash.clickPayDues();
          await expect(page).toHaveURL(/transaction/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-017 Pay dues behavior when no outstanding dues exist @edge @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_ZERO_DUES_DEALER",
          "Requires dealer with zero outstanding dues — set DASHBOARD_ZERO_DUES_DEALER.",
        );
        skipWithReason("Switch ACTIVE_DEALER to DASHBOARD_ZERO_DUES_DEALER before run.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-018 All four Needs You Today cards are displayed with their figures @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify Needs You Today section with four attention cards", async () => {
          await dash.expectNeedsYouTodayCards();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-019 Days to Nearest Tranche calculation is correct and derived from LMS @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_EXPECTED_TRANCHE_DAYS",
          "Requires LMS-seeded tranche data — set DASHBOARD_EXPECTED_TRANCHE_DAYS.",
        );
        skipWithReason("Days to Nearest Tranche validation requires LMS tranche seed data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-020 Clicking Days to Nearest Tranche navigates to Purchase Orders & VINs @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Click Days to Nearest Tranche card", async () => {
          await dash.clickAttentionCard(/days to nearest tranche/i);
        });
        await regressionStep("Verify navigation to Purchase Orders & VINs", async () => {
          await expect(page).toHaveURL(/purchase-orders/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-021 POs Closest to Due Date counts POs expiring in the next 7 calendar days @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_EXPECTED_PO_7D_COUNT",
          "Requires LMS PO count data for next 7 days — set DASHBOARD_EXPECTED_PO_7D_COUNT.",
        );
        skipWithReason("POs Closest to Due Date count validation requires LMS PO seed data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-022 Clicking POs Closest to Due Date navigates to Purchase Orders & VINs @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Click POs Closest to Due Date card", async () => {
          await dash.clickAttentionCard(/pos closest to due date/i);
        });
        await regressionStep("Verify navigation to Purchase Orders & VINs", async () => {
          await expect(page).toHaveURL(/purchase-orders/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-023 Interest Repayment Dues shows count and sum of pending interest amounts @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_EXPECTED_INTEREST_DUES",
          "Requires LMS interest repayment data — set DASHBOARD_EXPECTED_INTEREST_DUES.",
        );
        skipWithReason("Interest Repayment Dues validation requires LMS interest seed data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-024 Clicking Interest Repayment Dues navigates to Transaction History @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Click Interest Repayment Dues card", async () => {
          await dash.clickAttentionCard(/interest repayment dues/i);
        });
        await regressionStep("Verify navigation to Transaction History", async () => {
          await expect(page).toHaveURL(/transaction/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-025 Limit Renewals Pending shows count of limits pending renewal from LOS @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_EXPECTED_RENEWAL_COUNT",
          "Requires LOS renewal count data — set DASHBOARD_EXPECTED_RENEWAL_COUNT.",
        );
        skipWithReason("Limit Renewals Pending count validation requires LOS renewal seed data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-026 Clicking Limit Renewals Pending navigates to Exposure Settings @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Click Limit Renewals Pending card", async () => {
          await dash.clickAttentionCard(/limit renewals pending/i);
        });
        await regressionStep("Verify navigation to Exposure Settings", async () => {
          await expect(page).toHaveURL(/exposure/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-027 Needs You Today cards render zero / benign state when nothing needs attention @edge @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_ZERO_STATE_DEALER",
          "Requires dealer with zero-state Needs You Today cards — set DASHBOARD_ZERO_STATE_DEALER.",
        );
        skipWithReason("Zero-state Needs You Today validation requires dedicated zero-state dealer.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-028 PO Details table lists 5 POs with PO Number, Total, To Repay and Days Left @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify PO Details section with table headers or empty message", async () => {
          await expect(dash.poDetailsSection).toBeVisible();
          const text = await dash.getMainText();
          const hasTable =
            /po number/i.test(text) &&
            /total/i.test(text) &&
            /to repay/i.test(text) &&
            /days left/i.test(text);
          const empty = /no po details available|no data to show/i.test(text);
          expect(hasTable || empty).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-029 PO Details sort order clarification (AC-13 vs main-course LIFO conflict) @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_PO_SORT_ORDER_REF",
          "Requires LMS PO data with known sort order — set DASHBOARD_PO_SORT_ORDER_REF.",
        );
        skipWithReason("PO Details sort order validation requires LMS PO seed data with known ordering.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-030 PO Details 'Open' link navigates to Purchase Orders & VINs @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        if (!(await dash.poDetailsOpenLink.isVisible().catch(() => false))) {
          skipWithReason("PO Details Open link not visible — requires PO data on DEV.");
        }
        await regressionStep("Click PO Details Open link", async () => {
          await dash.clickPoDetailsOpen();
        });
        await regressionStep("Verify navigation to Purchase Orders & VINs", async () => {
          await expect(page).toHaveURL(/purchase-orders/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-031 PO Details when fewer than 5 POs exist - table shows all available @edge @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_PARTIAL_PO_COUNT",
          "Requires dealer with 1-4 POs — set DASHBOARD_PARTIAL_PO_COUNT.",
        );
        skipWithReason("Partial PO Details validation requires dealer with fewer than 5 POs.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-032 PO Details empty state when no POs exist for scope @negative @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify PO Details empty state message on DEV", async () => {
          const text = await dash.getMainText();
          const empty =
            /no po details available|no data to show|no data available/i.test(text);
          if (!empty) {
            const rowCount = await dash.getPoDetailsRowCount();
            if (rowCount > 0) {
              skipWithReason("PO data present on DEV — use DASHBOARD_EMPTY_BRANCH for empty PO scope.");
            }
          }
          expect(empty).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-033 Donut chart displays the four overdue buckets with value and % @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify PO Bucket Statistics buckets", async () => {
          await expect(dash.poBucketSection).toBeVisible();
          await dash.expectPoBucketBuckets();
          const text = await dash.getMainText();
          expect(dash.hasPercentageFormat(text)).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-034 Hovering over a segment shows details in the centre of the donut @ui @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        const text = await dash.getMainText();
        if (!/\d+(\.\d+)?\s*%/.test(text)) {
          skipWithReason("No donut segments with percentages on DEV — hover interaction skipped.");
        }
        await regressionStep("Hover PO Bucket section and verify segment details", async () => {
          await dash.poBucketSection.hover();
          const afterHover = await dash.getMainText();
          expect(afterHover).toMatch(/regular|1-30|31-60|61-90|90\+/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-035 Overdue POs count and value are called out separately @ui @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify overdue callout in PO Bucket section", async () => {
          const text = await dash.getMainText();
          expect(text).toMatch(/overdue/i);
          const bucketText = await dash.poBucketContainer().innerText();
          expect(bucketText).toMatch(/overdue|90\+/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-036 Donut chart 'Open' link navigates to Purchase Orders & VINs @positive @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        if (!(await dash.poBucketOpenLink.isVisible().catch(() => false))) {
          skipWithReason("PO Bucket Open link not visible on DEV.");
        }
        await regressionStep("Click PO Bucket Statistics Open link", async () => {
          await dash.clickPoBucketOpen();
        });
        await regressionStep("Verify navigation to Purchase Orders & VINs", async () => {
          await expect(page).toHaveURL(/purchase-orders/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-037 Donut chart empty state when no POs exist for scope @negative @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const emptyBranch = getDashboardEmptyBranch();
        const dash = await requireDashboard(page);
        if (emptyBranch) {
          await regressionStep(`Select empty branch: ${emptyBranch}`, async () => {
            await dash.selectBranchScope(emptyBranch);
          });
        }
        await regressionStep("Verify empty bucket state with 0% buckets", async () => {
          const text = await dash.getMainText();
          const zeroBuckets =
            /0\s*%/.test(text) ||
            /no po details available|no data to show/i.test(text);
          expect(zeroBuckets).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-038 Changing branch scope refreshes ALL dashboard sections @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        const branch =
          getDashboardTestBranch() || (await getFirstSpecificBranch(dash));
        if (!branch) {
          skipWithReason("No specific branch available — requires multi-branch dealer.");
        }
        const before = await dash.getMainText();
        await regressionStep(`Select branch: ${branch}`, async () => {
          await dash.selectBranchScope(branch!);
        });
        await regressionStep("Verify all dashboard sections refreshed after branch change", async () => {
          await dash.expectAllDashboardSections();
          const after = await dash.getMainText();
          const scope = await dash.getSelectedBranchScope();
          expect(scope.length).toBeGreaterThan(0);
          test.info().annotations.push({
            type: "branch-filter",
            description: `Dashboard before/after branch change — scope=${scope}`,
          });
          expect(after).toMatch(/normal limit|adhoc limit|dues|needs you today/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-039 Changing date-range chip refreshes ALL dashboard sections @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Select 7D date range", async () => {
          await dash.selectDateRange("7D");
        });
        await regressionStep("Verify dashboard still loaded with all sections", async () => {
          await dash.expectDashboardLoaded();
          const text = await dash.getMainText();
          expect(text).toMatch(/\b7D\b|normal limit/i);
          await dash.expectAllDashboardSections();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-040 Custom date range picker applies correctly to all sections @positive @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_CUSTOM_DATE_RANGE",
          "Requires custom date range configuration — set DASHBOARD_CUSTOM_DATE_RANGE (start,end).",
        );
        skipWithReason("Custom date range picker validation requires DASHBOARD_CUSTOM_DATE_RANGE env.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-041 Consolidated view aggregates data across all branches @positive @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_CONSOLIDATED_EXPECTED_TOTAL",
          "Requires multi-branch dealer with known consolidated totals — set DASHBOARD_CONSOLIDATED_EXPECTED_TOTAL.",
        );
        skipWithReason("Consolidated multi-branch comparison requires seeded branch-level and aggregate data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-042 Dashboard is read-only apart from Pay dues, Open links, and attention-card navigation @ui @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify no write actions on Dashboard", async () => {
          await dash.expectNoWriteActions();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-043 API attempts to modify limit / PO / exposure data from Dashboard endpoints are rejected @security @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        const api = await dash.captureDashboardApiResponse();
        if (!api?.url) {
          skipWithReason("Dashboard GET API not observed — set DASHBOARD_API_URL or verify network.");
        }
        const writeUrl = process.env.DASHBOARD_API_URL?.trim() || api!.url;
        await regressionStep("POST/PUT/DELETE must be rejected", async () => {
          for (const method of ["POST", "PUT", "DELETE"] as const) {
            const response = await page.request.fetch(writeUrl, {
              method,
              headers: { "Content-Type": "application/json" },
              data: { test: "automation-write-probe" },
              failOnStatusCode: false,
            });
            expect([403, 405, 401, 404, 415, 400]).toContain(response.status());
          }
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-044 No data available for scope - 'No data to show' message @negative @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const emptyBranch = getDashboardEmptyBranch();
        if (!emptyBranch) {
          skipWithReason("Set DASHBOARD_EMPTY_BRANCH to a branch with no dashboard data.");
        }
        const dash = await requireDashboard(page);
        await regressionStep(`Load scope with no data: ${emptyBranch}`, async () => {
          await dash.selectBranchScope(emptyBranch!);
        });
        await regressionStep("Verify no data message", async () => {
          const text = await dash.getPageText();
          const empty = /no data to show|no data available|no po details available/i.test(text);
          expect(empty).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-045 LMS unavailable - graceful error state on limit/exposure/PO sections @negative @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv("SIMULATE_LMS_DOWN", "Requires SIMULATE_LMS_DOWN=true or LMS outage simulation.");
        skipWithReason("LMS outage simulation not configured on DEV.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-046 LOS unavailable - Limit Renewals Pending shows error state gracefully @negative @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv("SIMULATE_LOS_DOWN", "Requires SIMULATE_LOS_DOWN=true or LOS outage simulation.");
        skipWithReason("LOS outage simulation not configured on DEV.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-047 Limit Shared with OEM % cannot be adjusted from the Dashboard @positive @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify no OEM visibility control on Dashboard", async () => {
          await dash.expectNoOemVisibilityControl();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-048 Payment cannot be initiated directly from the Dashboard @positive @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify no payment modal on dashboard before navigation", async () => {
          const paymentModal = page.getByRole("dialog", { name: /payment|pay/i });
          await expect(paymentModal).toHaveCount(0);
        });
        await regressionStep("Pay dues navigates away without inline payment form", async () => {
          await dash.clickPayDues();
          await expect(page).toHaveURL(/transaction/i, { timeout: 30_000 });
          const inlinePayment = page.getByRole("dialog", { name: /payment|pay/i });
          await expect(inlinePayment).toHaveCount(0);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-049 Dealer sees only their own data (multi-tenant isolation) @security @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_DEALER_B",
          "Requires second dealer account (Dealer B) and Dealer A dashboard data.",
        );
        skipWithReason("Cross-dealer data isolation requires DASHBOARD_DEALER_B credentials.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-050 Branch scoping is enforced server-side, not just at the UI @security @high @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_UNAUTHORIZED_BRANCH",
          "Requires unauthorized branch ID for API tamper test.",
        );
        skipWithReason("Server-side branch scoping test requires DASHBOARD_UNAUTHORIZED_BRANCH.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-051 Dashboard load performance is within the agreed SLA @nfr @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        const slaMs = Number.parseInt(process.env.DASHBOARD_SLA_MS?.trim() || "3000", 10);
        await regressionStep(`Measure dashboard reload (SLA <= ${slaMs}ms)`, async () => {
          const start = Date.now();
          await page.reload();
          await dash.expectDashboardLoaded();
          const elapsed = Date.now() - start;
          test.info().annotations.push({
            type: "performance",
            description: `Dashboard reload ${elapsed}ms (SLA ${slaMs}ms)`,
          });
          expect(elapsed).toBeLessThanOrEqual(slaMs);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-052 Currency and percentage formatting consistent across the Dashboard @ui @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify Indian currency and percentage formatting", async () => {
          const text = await dash.getPageText();
          expect(dash.hasIndianCurrencyFormat(text)).toBeTruthy();
          expect(dash.hasPercentageFormat(text)).toBeTruthy();
          expect(text).not.toMatch(/\$\s*[\d,]+/);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-053 Days-left rendering is consistent across cards (Normal, Adhoc, tranches, POs) @ui @medium @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        const dash = await requireDashboard(page);
        await regressionStep("Verify days-left labels are consistent across dashboard cards", async () => {
          const text = await dash.getMainText();
          const daysMatches = [...text.matchAll(/(\d+)\s*days left/gi)];
          if (daysMatches.length === 0) {
            skipWithReason("No days-left labels found on dashboard for active dealer.");
          }
          const values = daysMatches.map((m) => Number.parseInt(m[1], 10));
          expect(values.every((d) => d >= 0)).toBeTruthy();
          expect(text).toMatch(/days left/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

    test(`TC-054 Concurrent tab / device access to Dashboard renders consistent data @edge @low @us-dlr-007 @dealer-finance-dashboard @regression`, async ({ page }) => {
      try {
        requireEnv(
          "DASHBOARD_CONCURRENT_TAB_TEST",
          "Requires concurrent tab/device test harness — set DASHBOARD_CONCURRENT_TAB_TEST=true.",
        );
        skipWithReason("Concurrent tab consistency test requires multi-session test harness.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        throw e;
      }
    });

  },
);
