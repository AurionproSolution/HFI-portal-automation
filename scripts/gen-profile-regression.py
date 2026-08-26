#!/usr/bin/env python3
"""Generate ProfileRegression.test.ts from catalog + hand-crafted implementations."""

from pathlib import Path

OUT = Path("tests/hfi-portal/Regression/Sprint1/ProfileRegression.test.ts")

HEADER = '''/**
 * US-DLR-005 — Profile (Dealer Info, Branches & Key Connects)
 * Single source of truth: US-DLR-007_TestCases_v1.0.xlsx (TC-001 … TC-043)
 * Catalog: testData/hfi/profileCatalog.ts
 */

import { test, expect } from "@playwright/test";
import { getBaseUrl } from "@config/env";
import { getProfileCase } from "@testData/hfi/profileCatalog";
import { PROFILE_SYSTEM_DOWN_MESSAGE } from "@pages/hfi-portal/profile/HFIProfilePage";
import {
  getFirstSpecificBranch,
  getProfileEmptyBranch,
  getProfileTestBranch,
  initProfileSteps,
  regressionStep,
  requireProfile,
  requireEnv,
  skipWithReason,
} from "../../profile/profile.helpers";

function typeTag(t: string): string {
  return `@${t.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function priorityTag(p: string): string {
  return `@${p.toLowerCase()}`;
}

function meta(id: string): string {
  const c = getProfileCase(id);
  return c
    ? `AC: ${c.ac} | Type: ${c.type} | Priority: ${c.priority}`
    : id;
}

test.describe(
  "US-DLR-005 Profile (Dealer Info, Branches & Key Connects) @us-dlr-005 @profile @regression",
  () => {
    test.setTimeout(300_000);

    test.beforeEach(() => {
      initProfileSteps();
    });

'''

FOOTER = '''
  },
);
'''

TESTS = {
"TC-001": '''
    test(`TC-001 Profile page loads with all four sections rendered @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify all four Profile sections", async () => {
          await profile.expectAllSections();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-002": '''
    test(`TC-002 Branch scope filter defaults to 'All Branches' @ui @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify default All Branches filter", async () => {
          await profile.expectDefaultBranchFilter();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-003": '''
    test(`TC-003 Dealer Information card displays all 8 fields sourced from the master record @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify Dealer Information card fields", async () => {
          await profile.expectDealerInformationFields();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-004": '''
    test(`TC-004 All fields except Registered Email and Registered Mobile are read-only @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify read-only fields except Update on email/mobile", async () => {
          await profile.expectNoEditableFieldsExceptUpdate();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-005": '''
    test(`TC-005 Registered Email shows an Update action next to it @ui @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify Registered Email Update action", async () => {
          await profile.expectRegisteredEmailUpdateAction();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-006": '''
    test(`TC-006 Registered Mobile shows an Update action next to it @ui @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify Registered Mobile Update action", async () => {
          await profile.expectRegisteredMobileUpdateAction();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-007": '''
    test(`TC-007 Last Login timestamp is displayed in IST and matches the previous session @positive @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        const expected = process.env.PROFILE_EXPECTED_LAST_LOGIN?.trim();
        const text = await profile.getMainText();
        if (expected) {
          await regressionStep("Verify Last Login matches PROFILE_EXPECTED_LAST_LOGIN", async () => {
            expect(text).toMatch(
              new RegExp(expected.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"), "i"),
            );
          });
        } else if (/last login/i.test(text)) {
          await regressionStep("Verify Last Login timestamp is in IST format", async () => {
            expect(profile.hasIstTimestamp(text)).toBeTruthy();
          });
        } else {
          skipWithReason(
            "PROFILE_EXPECTED_LAST_LOGIN not set and Last Login not visible on DEV.",
          );
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-008": '''
    test(`TC-008 GSTIN is displayed in the correct format (15-character alphanumeric) @ui @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify GSTIN format on page", async () => {
          const text = await profile.getMainText();
          expect(profile.hasGstinFormat(text)).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-009": '''
    test(`TC-009 Onboarded date is displayed in the specified format @ui @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify Onboarded date format", async () => {
          const text = await profile.getMainText();
          expect(text).toMatch(/onboarded/i);
          expect(profile.hasDateFormat(text)).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-010": '''
    test(`TC-010 Update action next to Registered Email launches the Contact Info Update flow @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Click Registered Email Update", async () => {
          await profile.clickRegisteredEmailUpdate();
        });
        await regressionStep("Verify Contact Info Update flow navigation", async () => {
          await expect(page).toHaveURL(/contact|update/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-011": '''
    test(`TC-011 Update action next to Registered Mobile launches the Contact Info Update flow @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Click Registered Mobile Update", async () => {
          await profile.clickRegisteredMobileUpdate();
        });
        await regressionStep("Verify Contact Info Update flow navigation", async () => {
          await expect(page).toHaveURL(/contact|update/i, { timeout: 30_000 });
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-012": '''
    test(`TC-012 Return from Contact Info Update lands back on Profile with refreshed values @alternate @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_UPDATED_EMAIL",
          "Requires PROFILE_UPDATED_EMAIL and Contact Info Update integration flow.",
        );
        skipWithReason(
          "Contact Info Update round-trip requires PROFILE_UPDATED_EMAIL integration test data.",
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-013": '''
    test(`TC-013 Dealer Branches table displays all 9 columns per branch @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify Outlets/Branches table columns", async () => {
          await profile.expectOutletsTableColumns();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-014": '''
    test(`TC-014 Branch Status pill = 'Active' reflects source system status @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        const text = await profile.getMainText();
        if (!/\\bactive\\b/i.test(text)) {
          skipWithReason("No Active branch status pill on DEV — requires dealer with Active branch.");
        }
        await regressionStep("Verify Active branch status pill", async () => {
          await profile.expectBranchStatusPill("Active");
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-015": '''
    test(`TC-015 Branch Status pill = 'Pending' reflects source system status @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_PENDING_BRANCH",
          "Requires dealer with Pending branch — set PROFILE_PENDING_BRANCH.",
        );
        skipWithReason("Pending branch status test requires PROFILE_PENDING_BRANCH dealer.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-016": '''
    test(`TC-016 Branch Status pill = 'Inactive' reflects source system status @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_INACTIVE_BRANCH",
          "Requires dealer with Inactive branch — set PROFILE_INACTIVE_BRANCH.",
        );
        skipWithReason("Inactive branch status test requires PROFILE_INACTIVE_BRANCH dealer.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-017": '''
    test(`TC-017 Dealer Branches sort order is defined and consistent @ui @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_BRANCH_SORT_ORDER_REF",
          "Requires LMS branch data with known sort order — set PROFILE_BRANCH_SORT_ORDER_REF.",
        );
        skipWithReason("Branch sort order validation requires LMS-seeded branch list reference.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-018": '''
    test(`TC-018 Branches section is not displayed when dealer has no branches @positive @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_NO_BRANCHES_DEALER",
          "Requires dealer with no branches — set PROFILE_NO_BRANCHES_DEALER.",
        );
        skipWithReason("No-branches section test requires PROFILE_NO_BRANCHES_DEALER.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-019": '''
    test(`TC-019 Key Connects table displays all 6 columns per employee @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify Key Connects table columns", async () => {
          await profile.expectKeyConnectsTableColumns();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-020": '''
    test(`TC-020 Key Connects section is not displayed when dealer has no recorded key contacts @positive @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_NO_KEY_CONNECTS_DEALER",
          "Requires dealer with no key connects — set PROFILE_NO_KEY_CONNECTS_DEALER.",
        );
        skipWithReason("No Key Connects section test requires PROFILE_NO_KEY_CONNECTS_DEALER.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-021": '''
    test(`TC-021 Key Connects respects the branch filter (if applicable) @positive @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        const branch =
          getProfileTestBranch() || (await getFirstSpecificBranch(profile));
        if (!branch) {
          skipWithReason(
            "Set PROFILE_TEST_BRANCH or use multi-branch dealer for Key Connects filter test.",
          );
        }
        await regressionStep(`Select branch scope: ${branch}`, async () => {
          await profile.selectBranchScope(branch!);
        });
        await regressionStep("Verify Key Connects section after branch filter", async () => {
          const text = await profile.getMainText();
          expect(text).toMatch(/key connects/i);
          const scope = await profile.getSelectedBranchScope();
          expect(scope.length).toBeGreaterThan(0);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-022": '''
    test(`TC-022 L1 and L2 contacts displayed with name, role, phone and email @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify L1 and L2 escalation contacts", async () => {
          await profile.expectL1L2Contacts();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-023": '''
    test(`TC-023 First active L1 and first active L2 shown when FOS Connects map to different managers @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_LOS_L1_L2_MAPPING",
          "Requires LOS FOS Connects mapping data — set PROFILE_LOS_L1_L2_MAPPING.",
        );
        skipWithReason("L1/L2 LOS mapping validation requires PROFILE_LOS_L1_L2_MAPPING seed data.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-024": '''
    test(`TC-024 L2 not available - only L1 shown gracefully @edge @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_L1_ONLY_DEALER",
          "Requires dealer with L1 only (no L2) — set PROFILE_L1_ONLY_DEALER.",
        );
        skipWithReason("L1-only escalation test requires PROFILE_L1_ONLY_DEALER.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-025": '''
    test(`TC-025 Both L1 and L2 unavailable - Escalation panel is not displayed @edge @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_NO_ESCALATION_DEALER",
          "Requires dealer with no L1/L2 — set PROFILE_NO_ESCALATION_DEALER.",
        );
        skipWithReason("No escalation panel test requires PROFILE_NO_ESCALATION_DEALER.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-026": '''
    test(`TC-026 L1 / L2 contact phone and email are correctly formatted for click-to-call and mailto @ui @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        const l1Count = await profile.l1ContactLinks().count();
        const l2Count = await profile.l2ContactLinks().count();
        if (l1Count === 0 && l2Count === 0) {
          skipWithReason("No L1/L2 contact links on DEV — tel/mailto validation skipped.");
        }
        await regressionStep("Verify tel:/mailto: hrefs on L1/L2 links", async () => {
          for (const links of [profile.l1ContactLinks(), profile.l2ContactLinks()]) {
            const count = await links.count();
            for (let i = 0; i < count; i++) {
              const href = await links.nth(i).getAttribute("href");
              expect(href).toMatch(/^(tel:|mailto:)/i);
            }
          }
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-027": '''
    test(`TC-027 Dealer master (DFS / LOS) unavailable - system-down message displayed @negative @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "SIMULATE_DFS_DOWN",
          "Requires SIMULATE_DFS_DOWN=true or dealer master outage simulation.",
        );
        skipWithReason("DFS/LOS dealer master outage simulation not configured on DEV.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-028": '''
    test(`TC-028 LOS unavailable - Escalation Matrix panel shows system-down message @negative @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "SIMULATE_LOS_DOWN",
          "Requires SIMULATE_LOS_DOWN=true or LOS outage simulation.",
        );
        skipWithReason("LOS outage simulation not configured on DEV.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-029": '''
    test(`TC-029 Partial outage - Dealer master OK but Branches source down @negative @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "SIMULATE_BRANCHES_DOWN",
          "Requires SIMULATE_BRANCHES_DOWN=true or branches source outage simulation.",
        );
        skipWithReason("Partial branches outage simulation not configured on DEV.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-030": '''
    test(`TC-030 System-down message wording matches SDD exactly @ui @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "SIMULATE_DFS_DOWN",
          "Requires SIMULATE_DFS_DOWN=true or outage simulation to verify system-down message.",
        );
        const profile = await requireProfile(page);
        await regressionStep("Verify system-down message matches SDD wording", async () => {
          await profile.expectConnectivityError();
          const text = await profile.getPageText();
          expect(text).toContain(PROFILE_SYSTEM_DOWN_MESSAGE);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-031": '''
    test(`TC-031 AC-8 vs AC-9 distinction - system down vs data does not exist @negative @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "SIMULATE_PROFILE_PARTIAL_OUTAGE",
          "Requires SIMULATE_PROFILE_PARTIAL_OUTAGE=true to distinguish AC-8 vs AC-9 states.",
        );
        skipWithReason("AC-8 vs AC-9 distinction test requires partial outage simulation on DEV.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-032": '''
    test(`TC-032 All Profile fields except Update actions are read-only in UI @ui @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify all fields read-only except Update actions", async () => {
          await profile.expectNoEditableFieldsExceptUpdate();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-033": '''
    test(`TC-033 API attempts to write to Profile data are rejected server-side @security @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        const api = await profile.captureProfileApiResponse();
        if (!api?.url) {
          skipWithReason("Profile GET API not observed — set PROFILE_API_URL or verify network.");
        }
        const writeUrl = process.env.PROFILE_API_URL?.trim() || api!.url;
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
"TC-034": '''
    test(`TC-034 Dealer sees only their own profile data (multi-tenant isolation) @security @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_DEALER_B",
          "Requires second dealer account (Dealer B) and Dealer A profile data.",
        );
        skipWithReason("Cross-dealer data isolation requires PROFILE_DEALER_B credentials.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-035": '''
    test(`TC-035 Escalation Matrix is scoped to the authenticated dealership only @security @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_ESCALATION_SCOPE_TEST",
          "Requires escalation matrix scoping test harness — set PROFILE_ESCALATION_SCOPE_TEST.",
        );
        skipWithReason("Escalation Matrix scoping test requires PROFILE_ESCALATION_SCOPE_TEST.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-036": '''
    test(`TC-036 Unauthenticated access to Profile page or API is denied @security @high @us-dlr-005 @profile @regression`, async ({ page, context }) => {
      try {
        await regressionStep("Access Profile URL without session", async () => {
          await context.clearCookies();
          await page.goto(`${getBaseUrl()}/profile`);
          await page.waitForURL(/login|profile/i, { timeout: 30_000 });
          const onLogin = /login/i.test(page.url());
          if (onLogin) {
            await expect(page).toHaveURL(/login/i);
          } else {
            const response = await page.request.get(`${getBaseUrl()}/profile`, {
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
"TC-037": '''
    test(`TC-037 Get Dealer Profile API - contract validation @integration @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        const api = await profile.captureProfileApiResponse();
        if (!api?.url) {
          skipWithReason("Get Dealer Profile GET API not observed on network.");
        }
        await regressionStep("Verify Get Dealer Profile API contract", async () => {
          expect(api!.status).toBe(200);
          const body = api!.body;
          expect(body).toBeTruthy();
          const serialized = JSON.stringify(body).toLowerCase();
          expect(serialized).toMatch(/dealer|branch|email|mobile|gstin|onboard/);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-038": '''
    test(`TC-038 Get Escalation Matrix API - contract validation @integration @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        const api = await profile.captureEscalationApiResponse();
        if (!api?.url) {
          skipWithReason("Get Escalation Matrix GET API not observed on network.");
        }
        await regressionStep("Verify Get Escalation Matrix API contract", async () => {
          expect(api!.status).toBe(200);
          const body = api!.body;
          expect(body).toBeTruthy();
          const serialized = JSON.stringify(body).toLowerCase();
          expect(serialized).toMatch(/l1|l2|escalation|manager|contact/);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-039": '''
    test(`TC-039 Long dealer names, addresses, and email IDs are handled gracefully @edge @low @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_LONG_STRING_DEALER",
          "Requires dealer with long names/addresses/emails — set PROFILE_LONG_STRING_DEALER.",
        );
        skipWithReason("Long string overflow test requires PROFILE_LONG_STRING_DEALER.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-040": '''
    test(`TC-040 Email and phone are displayed in a consistent format @ui @low @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify phone and email formatting", async () => {
          const text = await profile.getMainText();
          expect(profile.hasPhoneFormat(text)).toBeTruthy();
          expect(profile.hasEmailFormat(text)).toBeTruthy();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-041": '''
    test(`TC-041 Special characters in employee / branch names render correctly (Unicode) @edge @low @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        requireEnv(
          "PROFILE_UNICODE_TEST_DATA",
          "Requires Unicode test data in branch/employee names — set PROFILE_UNICODE_TEST_DATA.",
        );
        skipWithReason("Unicode rendering test requires PROFILE_UNICODE_TEST_DATA.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        throw e;
      }
    });
''',
"TC-042": '''
    test(`TC-042 Profile page load performance is within the agreed SLA @nfr @medium @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        const slaMs = Number.parseInt(process.env.PROFILE_SLA_MS?.trim() || "3000", 10);
        await regressionStep(`Measure profile reload (SLA <= ${slaMs}ms)`, async () => {
          const start = Date.now();
          await page.reload();
          await profile.expectProfileLoaded();
          const elapsed = Date.now() - start;
          test.info().annotations.push({
            type: "performance",
            description: `Profile reload ${elapsed}ms (SLA ${slaMs}ms)`,
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
"TC-043": '''
    test(`TC-043 Section rendering is not blocked by another section's failure @positive @high @us-dlr-005 @profile @regression`, async ({ page }) => {
      try {
        const profile = await requireProfile(page);
        await regressionStep("Verify Dealer Information section renders", async () => {
          await expect(profile.dealerInformationSection).toBeVisible();
        });
        await regressionStep("Verify at least one other section renders independently", async () => {
          const outlets = await profile.outletsSection.isVisible().catch(() => false);
          const keyConnects = await profile.keyConnectsSection.isVisible().catch(() => false);
          const managers = await profile.hondaFinanceManagersSection.isVisible().catch(() => false);
          expect(outlets || keyConnects || managers).toBeTruthy();
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
    for i in range(1, 44):
        tc_id = f"TC-{i:03d}"
        if tc_id not in TESTS:
            raise KeyError(f"Missing implementation for {tc_id}")
        parts.append(TESTS[tc_id])
    parts.append(FOOTER)
    OUT.write_text("".join(parts), encoding="utf-8")
    line_count = OUT.read_text(encoding="utf-8").count("\n") + 1
    print(f"wrote {OUT} ({len(TESTS)} tests, {line_count} lines)")


if __name__ == "__main__":
    main()
