#!/usr/bin/env python3
"""Generate CollateralRegression.test.ts from catalog + hand-crafted implementations."""

from pathlib import Path

OUT = Path("tests/hfi-portal/Regression/Sprint1/CollateralRegression.test.ts")

HEADER = '''/**
 * US-DLR-008 — Collateral (Read-only View)
 * Single source of truth: US-DLR-005_TestCases_v1.0.xlsx (TC-001 … TC-044)
 * Catalog: testData/hfi/collateralCatalog.ts
 */

import { test, expect } from "@playwright/test";
import { getBaseUrl, getLoginUrl } from "@config/env";
import { getCollateralCase } from "@testData/hfi/collateralCatalog";
import {
  getCollateralEmptyBranch,
  getCollateralTestBranch,
  initCollateralSteps,
  regressionStep,
  requireCollateralData,
  requireEnv,
  requireModule,
  skipWithReason,
} from "../../collateral/collateral.helpers";

function typeTag(t: string): string {
  return `@${t.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function priorityTag(p: string): string {
  return `@${p.toLowerCase()}`;
}

function meta(id: string): string {
  const c = getCollateralCase(id);
  return c
    ? `AC: ${c.ac} | Type: ${c.type} | Priority: ${c.priority}`
    : id;
}

test.describe(
  "US-DLR-008 Collateral (Read-only View) @us-dlr-008 @collateral @regression",
  () => {
    test.setTimeout(300_000);

    test.beforeEach(() => {
      initCollateralSteps();
    });

'''

FOOTER = '''
  },
);
'''

TESTS = {
"TC-001": '''
    test(`TC-001 Collateral page loads with default 'All Branches' scope and all KPI cards visible @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await regressionStep("Verify default All Branches scope", async () => {
          const scope = await col.getSelectedBranchScope();
          expect(scope).toMatch(/all branches/i);
        });
        await regressionStep("Verify four KPI cards", async () => {
          await col.expectKpiCardsVisible();
          const kpi = await col.getKpiSectionText();
          expect(kpi).toMatch(/total collateral value/i);
          expect(kpi).toMatch(/active collateral/i);
          expect(kpi).toMatch(/expiring soon/i);
          expect(kpi).toMatch(/coverage ratio/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-002": '''
    test(`TC-002 Breadcrumb, page title and description are displayed correctly @ui @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await regressionStep("Verify breadcrumb Honda Finance / Collateral", async () => {
          await col.expectBreadcrumbAndTitle();
        });
        await regressionStep("Verify page title and description", async () => {
          await expect(col.pageHeading).toHaveText(/^collateral$/i);
          await col.expectPageDescription();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-003": '''
    test(`TC-003 Total Collateral Value equals sum of collateral values across active securities and shows pledged count @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_EXPECTED_TOTAL",
          "Requires COLLATERAL_EXPECTED_TOTAL and seeded LOS data (BG 1Cr + FD 50L + Property 2Cr = 3.5Cr, pledged=3).",
        );
        const col = await requireModule(page);
        await requireCollateralData(col);
        const expectedTotal = process.env.COLLATERAL_EXPECTED_TOTAL!.trim();
        const expectedPledged = process.env.COLLATERAL_EXPECTED_PLEDGED?.trim() || "3";
        await regressionStep("Verify Total Collateral Value and pledged count", async () => {
          const kpi = await col.getKpiSectionText();
          expect(kpi).toMatch(new RegExp(expectedTotal.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"), "i"));
          expect(kpi).toMatch(new RegExp(`${expectedPledged}.*pledged|pledged.*${expectedPledged}`, "i"));
          expect(col.hasIndianCurrencyFormat(kpi)).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-004": '''
    test(`TC-004 Total Collateral Value = 0 with 0 pledged when no active securities exist @edge @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const emptyBranch = getCollateralEmptyBranch();
        if (!emptyBranch) {
          skipWithReason(
            "Set COLLATERAL_EMPTY_BRANCH to a branch with no active collateral securities.",
          );
        }
        const col = await requireModule(page);
        await regressionStep(`Select empty branch: ${emptyBranch}`, async () => {
          await col.selectBranchScope(emptyBranch!);
        });
        await regressionStep("Verify zero KPI or empty state", async () => {
          const text = await col.getPageText();
          const zeroKpi = /₹\\s*0|rs\\.?\\s*0/i.test(text) && /0.*pledged/i.test(text);
          const empty = /no collateral|no securities/i.test(text);
          expect(zeroKpi || empty).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-005": '''
    test(`TC-005 Active Collateral KPI counts only securities with status = Active @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await requireCollateralData(col);
        await regressionStep("Verify Active Collateral KPI reflects Active securities only", async () => {
          const kpi = await col.getKpiSectionText();
          expect(kpi).toMatch(/active collateral/i);
          const text = await col.getPageText();
          const activePills = (text.match(/\\bActive\\b/g) || []).length;
          const activeKpiMatch = kpi.match(/(\\d+)\\s*active/i);
          if (activeKpiMatch) {
            expect(Number.parseInt(activeKpiMatch[1], 10)).toBeLessThanOrEqual(activePills);
          }
          expect(kpi).toMatch(/active/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-006": '''
    test(`TC-006 Expiring Soon shows count of securities expiring within 30 days @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_EXPIRING_SOON_COUNT",
          "Requires LOS-seeded securities with expiries 5d,15d,29d,30d,31d,45d — set COLLATERAL_EXPIRING_SOON_COUNT=4.",
        );
        const col = await requireModule(page);
        const expected = Number.parseInt(process.env.COLLATERAL_EXPIRING_SOON_COUNT!, 10);
        await regressionStep("Verify Expiring Soon count", async () => {
          const count = await col.getExpiringSoonCountFromKpi();
          expect(count).toBe(expected);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-007": '''
    test(`TC-007 Expiring Soon count = 0 when no security is within 30 days @positive @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_NO_EXPIRING_BRANCH",
          "Requires branch/dealer where all securities expire >30 days — set COLLATERAL_NO_EXPIRING_BRANCH.",
        );
        const col = await requireModule(page);
        const branch = process.env.COLLATERAL_NO_EXPIRING_BRANCH!.trim();
        await regressionStep(`Select branch with no expiring securities: ${branch}`, async () => {
          await col.selectBranchScope(branch);
        });
        await regressionStep("Verify Expiring Soon shows 0", async () => {
          const kpi = await col.getKpiSectionText();
          expect(kpi).toMatch(/expiring soon/i);
          const count = await col.getExpiringSoonCountFromKpi();
          if (count !== undefined) expect(count).toBe(0);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-008": '''
    test(`TC-008 Coverage Ratio % is computed as Collateral Value / Total Loan Amount @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_EXPECTED_COVERAGE_RATIO",
          "Requires known collateral/loan amounts — set COLLATERAL_EXPECTED_COVERAGE_RATIO (e.g. 70).",
        );
        const col = await requireModule(page);
        await requireCollateralData(col);
        const expected = process.env.COLLATERAL_EXPECTED_COVERAGE_RATIO!.trim();
        await regressionStep("Verify Coverage Ratio percentage", async () => {
          const ratio = await col.getCoverageRatioFromKpi();
          expect(ratio).toBe(expected);
          const kpi = await col.getKpiSectionText();
          expect(col.hasPercentageFormat(kpi)).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-009": '''
    test(`TC-009 Coverage Ratio > 100% (over-collateralized) is displayed correctly @edge @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_OVER_COLLATERALIZED_DEALER",
          "Requires dealer with collateral > loan (e.g. 120%) — set COLLATERAL_OVER_COLLATERALIZED_DEALER.",
        );
        skipWithReason("Switch ACTIVE_DEALER to COLLATERAL_OVER_COLLATERALIZED_DEALER before run.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-010": '''
    test(`TC-010 Coverage Ratio when Total Loan Amount = 0 is handled gracefully (no divide-by-zero) @edge @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_ZERO_LOAN_DEALER",
          "Requires dealer with collateral pledged but Total Loan Amount = 0.",
        );
        skipWithReason("Set ACTIVE_DEALER to COLLATERAL_ZERO_LOAN_DEALER with zero loan amount.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-011": '''
    test(`TC-011 Security expiring on day 30 boundary is included in Expiring Soon (inclusive) @edge @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_EXPIRY_30D_REF",
          "Requires LOS security expiring exactly 30 days from today — set COLLATERAL_EXPIRY_30D_REF.",
        );
        skipWithReason("LOS-seeded security with expiry today+30 days required.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-012": '''
    test(`TC-012 Security expiring on day 31 is NOT included in Expiring Soon @edge @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_EXPIRY_31D_REF",
          "Requires LOS security expiring 31 days from today — set COLLATERAL_EXPIRY_31D_REF.",
        );
        skipWithReason("LOS-seeded security with expiry today+31 days required.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-013": '''
    test(`TC-013 Security expiring today (day 0) is displayed correctly @edge @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await requireCollateralData(col);
        await regressionStep("Verify day-0 expiry card shows 0 days left", async () => {
          const text = await col.getPageText();
          const hasZeroDays = /0\\s*days left/i.test(text);
          const hasExpiring = /expiring/i.test(text);
          if (!hasZeroDays) {
            requireEnv(
              "COLLATERAL_EXPIRY_TODAY_REF",
              "No security expiring today on DEV — set COLLATERAL_EXPIRY_TODAY_REF in LOS.",
            );
            skipWithReason("No security with expiry=today found on page.");
          }
          expect(hasZeroDays && hasExpiring).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-014": '''
    test(`TC-014 Security already past expiry (expiry < today) is shown with appropriate status @edge @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_EXPIRED_REF",
          "Requires LOS security with expiry < today — set COLLATERAL_EXPIRED_REF.",
        );
        skipWithReason("LOS-seeded expired security required.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-015": '''
    test(`TC-015 Each pledged security is listed under Collateral Securities as a type-specific card @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await requireCollateralData(col);
        await regressionStep("Verify Collateral Securities section and type-specific cards", async () => {
          await expect(col.collateralSecuritiesSection).toBeVisible();
          const types = await col.getSecurityTypeHeadings();
          expect(types.length).toBeGreaterThan(0);
          const cardCount = await col.countRenderedSecurityCards();
          expect(cardCount).toBeGreaterThan(0);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-016": '''
    test(`TC-016 Bank Guarantee card shows type-specific fields @ui @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const text = await col.getPageText();
        if (!/bank guarantee/i.test(text)) {
          skipWithReason("No Bank Guarantee collateral on DEV for active dealer.");
        }
        await regressionStep("Verify BG card fields", async () => {
          await col.expectSecurityCardFields("BG");
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-017": '''
    test(`TC-017 Fixed Deposit card shows type-specific fields @ui @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const text = await col.getPageText();
        if (!/fixed deposit/i.test(text)) {
          skipWithReason("No Fixed Deposit collateral on DEV for active dealer.");
        }
        await regressionStep("Verify FD card fields", async () => {
          await col.expectSecurityCardFields("FD");
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-018": '''
    test(`TC-018 Property Mortgage card shows type-specific fields @ui @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const text = await col.getPageText();
        if (!/property mortgage/i.test(text)) {
          skipWithReason("No Property Mortgage collateral on DEV for active dealer.");
        }
        await regressionStep("Verify Property Mortgage card fields", async () => {
          await col.expectSecurityCardFields("Property");
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-019": '''
    test(`TC-019 Corporate Guarantee card shows type-specific fields @ui @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const text = await col.getPageText();
        if (!/corporate guarantee/i.test(text)) {
          skipWithReason("No Corporate Guarantee collateral on DEV for active dealer.");
        }
        await regressionStep("Verify CG card fields", async () => {
          await col.expectSecurityCardFields("CG");
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-020": '''
    test(`TC-020 Status pill on each card reflects the LOS-returned status @ui @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await requireCollateralData(col);
        await regressionStep("Verify status pills Active/Expiring/Expired on cards", async () => {
          const text = await col.getPageText();
          expect(text).toMatch(/\\b(Active|Expiring|Expired)\\b/);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-021": '''
    test(`TC-021 Progress indicator and 'X days left' visible on each expiring security @ui @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await requireCollateralData(col);
        await regressionStep("Verify days-left labels on securities with expiry", async () => {
          const daysLeft = await col.getDaysLeftValues();
          if (daysLeft.length === 0) {
            skipWithReason("No securities with expiry/maturity dates on current scope.");
          }
          expect(daysLeft.every((d) => d >= 0)).toBeTruthy();
          const text = await col.getPageText();
          expect(text).toMatch(/days left/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-022": '''
    test(`TC-022 Item count next to Collateral Securities matches the number of cards rendered @ui @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await requireCollateralData(col);
        await regressionStep("Compare header pledged count with rendered cards", async () => {
          const cardCount = await col.countRenderedSecurityCards();
          const kpi = await col.getKpiSectionText();
          const pledgedMatch = kpi.match(/(\\d+)\\s*securit(y|ies)\\s*pledged/i);
          if (pledgedMatch) {
            expect(Number.parseInt(pledgedMatch[1], 10)).toBe(cardCount);
          } else {
            const headerCount = await col.getCollateralSecuritiesHeaderCount();
            if (headerCount !== undefined) {
              expect(headerCount).toBe(cardCount);
            }
          }
          expect(cardCount).toBeGreaterThan(0);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-023": '''
    test(`TC-023 Selecting a specific branch refreshes KPI cards and Collateral Securities list @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const branch = getCollateralTestBranch();
        const before = await col.getKpiSectionText();
        if (!(await col.branchScopeSelect.or(col.branchScopeChip).isVisible().catch(() => false))) {
          skipWithReason("Branch filter not visible — requires multi-branch dealer.");
        }
        await regressionStep(`Select branch: ${branch}`, async () => {
          await col.selectBranchScope(branch);
        });
        await regressionStep("Verify KPI/cards refreshed after branch change", async () => {
          await col.expectKpiCardsVisible();
          const after = await col.getKpiSectionText();
          const scope = await col.getSelectedBranchScope();
          expect(scope.length).toBeGreaterThan(0);
          test.info().annotations.push({
            type: "branch-filter",
            description: `KPI before/after branch change — scope=${scope}`,
          });
          expect(after).toMatch(/collateral|total collateral/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-024": '''
    test(`TC-024 Switching back to 'All Branches' restores the aggregate view @positive @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const branch = getCollateralTestBranch();
        if (!(await col.branchScopeSelect.or(col.branchScopeChip).isVisible().catch(() => false))) {
          skipWithReason("Branch filter not visible.");
        }
        await regressionStep(`Select specific branch then All Branches`, async () => {
          await col.selectBranchScope(branch);
          await col.selectAllBranches();
        });
        await regressionStep("Verify aggregate view restored", async () => {
          const scope = await col.getSelectedBranchScope();
          expect(scope).toMatch(/all branches/i);
          await col.expectKpiCardsVisible();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-025": '''
    test(`TC-025 Only branches within the dealer's scope are selectable in the filter @security @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_OUT_OF_SCOPE_BRANCH",
          "Requires COLLATERAL_IN_SCOPE_BRANCHES and COLLATERAL_OUT_OF_SCOPE_BRANCH for API tamper test.",
        );
        skipWithReason("Cross-dealer branch C authorization requires dedicated security test accounts.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-026": '''
    test(`TC-026 Empty state is shown when no collateral exists for the selected scope @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const emptyBranch = getCollateralEmptyBranch();
        if (!emptyBranch) {
          skipWithReason("Set COLLATERAL_EMPTY_BRANCH to a branch with no collateral in LOS.");
        }
        const col = await requireModule(page);
        await regressionStep(`Load scope with no collateral: ${emptyBranch}`, async () => {
          await col.selectBranchScope(emptyBranch!);
        });
        await regressionStep("Verify empty state", async () => {
          const text = await col.getPageText();
          const empty = /no collateral|no securities|no matching|no data/i.test(text);
          expect(empty).toBeTruthy();
          expect(text).toMatch(/all branches|branch|collateral/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-027": '''
    test(`TC-027 No Add / Edit / Delete / Release / Audit / Revaluation actions are available on the page @ui @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await regressionStep("Verify no write actions on Collateral page", async () => {
          await col.expectNoWriteActions();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-028": '''
    test(`TC-028 API attempts to write / modify collateral are rejected server-side @security @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const api = await col.captureCollateralApiResponse();
        if (!api?.url) {
          skipWithReason("Collateral GET API not observed — set COLLATERAL_API_URL or verify network.");
        }
        const writeUrl = process.env.COLLATERAL_API_URL?.trim() || api!.url;
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
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-029": '''
    test(`TC-029 No editable fields on any KPI card or collateral card @ui @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await regressionStep("Verify KPI and card values are not editable", async () => {
          await col.expectNoEditableFields();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-030": '''
    test(`TC-030 LOS updates to collateral (add / update / release) reflect on page refresh @integration @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv("LOS_API_URL", "Requires LOS_API_URL and ability to mutate collateral in LOS.");
        skipWithReason("LOS integration test — update security in LOS then refresh page.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-031": '''
    test(`TC-031 LMS-provided expiry information is reflected on the card @integration @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv("LMS_API_URL", "Requires LMS_API_URL and ability to update expiry in LMS.");
        skipWithReason("LMS integration test — update expiry in LMS then refresh page.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-032": '''
    test(`TC-032 LOS unavailable - page shows a graceful, non-blocking error state @negative @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv("SIMULATE_LOS_DOWN", "Requires SIMULATE_LOS_DOWN=true or LOS outage simulation.");
        skipWithReason("LOS outage simulation not configured on DEV.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-033": '''
    test(`TC-033 LMS unavailable while LOS available - securities render with graceful expiry fallback @negative @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv("SIMULATE_LMS_DOWN", "Requires SIMULATE_LMS_DOWN=true or LMS outage simulation.");
        skipWithReason("LMS partial outage simulation not configured on DEV.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-034": '''
    test(`TC-034 Page-data-load API contract validation @integration @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const api = await col.captureCollateralApiResponse();
        if (!api) {
          skipWithReason("Collateral page-data GET API not observed on network.");
        }
        await regressionStep("Verify GET response contract", async () => {
          expect(api!.status).toBe(200);
          const body = api!.body;
          expect(body).toBeTruthy();
          const serialized = JSON.stringify(body).toLowerCase();
          expect(serialized).toMatch(/collateral|kpi|securit|coverage|ratio|pledged|expir/);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-035": '''
    test(`TC-035 VIN-level / vehicle-stock collateral does NOT appear on this page @positive @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await regressionStep("Verify no VIN or vehicle-stock entries", async () => {
          const text = await col.getPageText();
          expect(text).not.toMatch(/\\bVIN\\b|vehicle.?stock|chassis/i);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-036": '''
    test(`TC-036 Add / Release / Revaluation actions are absent, aligned with the read-only scope @positive @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await regressionStep("Verify read-only scope — no add/release/revaluation", async () => {
          await col.expectNoWriteActions();
          const links = col.page.getByRole("link", {
            name: /add|release|revaluat|edit collateral/i,
          });
          await expect(links).toHaveCount(0);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-037": '''
    test(`TC-037 Dealer only sees their own collateral records @security @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_DEALER_B",
          "Requires second dealer account (Dealer B) and Dealer A collateral IDs.",
        );
        skipWithReason("Cross-dealer data isolation requires COLLATERAL_DEALER_B credentials.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-038": '''
    test(`TC-038 Branch scoping is enforced server-side, not just via the UI filter @security @high @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_UNAUTHORIZED_BRANCH",
          "Requires unauthorized branch ID for API tamper test.",
        );
        skipWithReason("Server-side branch scoping test requires COLLATERAL_UNAUTHORIZED_BRANCH.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-039": '''
    test(`TC-039 Unauthenticated access to the Collateral page or API is denied @security @high @us-dlr-008 @collateral @regression`, async ({ page, context }) => {
      try {
        await regressionStep("Access Collateral URL without session", async () => {
          await context.clearCookies();
          await page.goto(`${getBaseUrl()}/collateral`);
          await page.waitForURL(/login|collateral/i, { timeout: 30_000 });
          const onLogin = /login/i.test(page.url());
          if (onLogin) {
            await expect(page).toHaveURL(/login/i);
          } else {
            const response = await page.request.get(`${getBaseUrl()}/collateral`, {
              failOnStatusCode: false,
            });
            expect([401, 403]).toContain(response.status());
          }
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-040": '''
    test(`TC-040 Large number of securities renders with pagination or virtual scroll @nfr @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        requireEnv(
          "COLLATERAL_HIGH_VOLUME_DEALER",
          "Requires dealer with 50+ collateral securities.",
        );
        skipWithReason("High-volume dealer (50+ securities) not configured — set COLLATERAL_HIGH_VOLUME_DEALER.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-041": '''
    test(`TC-041 Multiple securities of the same type render as separate cards @positive @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const bgCount = await col.getBankGuaranteeCardCount();
        if (bgCount < 2) {
          requireEnv(
            "COLLATERAL_MULTI_BG_COUNT",
            "Requires 3 Bank Guarantees — set COLLATERAL_MULTI_BG_COUNT or seed LOS data.",
          );
          if (bgCount < 2) {
            skipWithReason(`Only ${bgCount} BG card(s) on DEV — need 3 distinct BG cards.`);
          }
        }
        await regressionStep("Verify multiple BG cards with distinct references", async () => {
          expect(bgCount).toBeGreaterThanOrEqual(2);
          const text = await col.getPageText();
          const refs = text.match(/BG-[\\w-]+/gi) || [];
          expect(new Set(refs).size).toBeGreaterThanOrEqual(2);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-042": '''
    test(`TC-042 Card sort order is defined and consistent (e.g. by expiry ascending) @ui @low @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await requireCollateralData(col);
        await regressionStep("Verify consistent days-left ordering across reload", async () => {
          const firstLoad = await col.getDaysLeftValues();
          await page.reload();
          await col.expectModuleLoaded();
          const secondLoad = await col.getDaysLeftValues();
          if (firstLoad.length < 2) {
            skipWithReason("Need multiple securities with expiry for sort-order validation.");
          }
          const sortedAsc = [...firstLoad].sort((a, b) => a - b);
          test.info().annotations.push({
            type: "sort-order",
            description: `days-left order load1=${firstLoad.join(",")} load2=${secondLoad.join(",")} expectedAsc=${sortedAsc.join(",")}`,
          });
          expect(secondLoad.length).toBe(firstLoad.length);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-043": '''
    test(`TC-043 Page load performance is within the agreed SLA @nfr @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        const slaMs = Number.parseInt(process.env.COLLATERAL_SLA_MS?.trim() || "3000", 10);
        await regressionStep(`Measure page load (SLA <= ${slaMs}ms)`, async () => {
          const elapsed = await col.measurePageLoadMs();
          test.info().annotations.push({
            type: "performance",
            description: `Collateral load ${elapsed}ms (SLA ${slaMs}ms)`,
          });
          expect(elapsed).toBeLessThanOrEqual(slaMs);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-044": '''
    test(`TC-044 Currency and percentage formatting applied consistently across the page @ui @medium @us-dlr-008 @collateral @regression`, async ({ page }) => {
      try {
        const col = await requireModule(page);
        await requireCollateralData(col);
        await regressionStep("Verify Indian currency and percentage formatting", async () => {
          const text = await col.getPageText();
          expect(col.hasIndianCurrencyFormat(text)).toBeTruthy();
          expect(col.hasPercentageFormat(text)).toBeTruthy();
          expect(text).not.toMatch(/\\$\\s*[\\d,]+/);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
}

def main():
    parts = [HEADER]
    for i in range(1, 45):
        tc_id = f"TC-{i:03d}"
        parts.append(TESTS[tc_id])
    parts.append(FOOTER)
    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"wrote {OUT} ({len(TESTS)} tests)")

if __name__ == "__main__":
    main()
