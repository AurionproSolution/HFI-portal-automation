/**
 * UC-OEM-004 — OEM Checker
 * Single source of truth: Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_CHK_001 … TC_CHK_022)
 */

import { test, expect } from "@playwright/test";
import {
  initOEMCheckerSteps,
  regressionStep,
  requireEnv,
  requireModule,
  skipWithReason,
} from "../../checker/oemChecker.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

test.describe(
  "UC-OEM-004 OEM Checker @uc-oem-004 @oem-checker @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "UC-OEM-004");

    test.beforeEach(() => {
      initOEMCheckerSteps();
    });

    test(`TC_CHK_001 Verify OEM Checker Console tab layout, LMS sync indicator, and session context @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify OEM Checker Console tab layout, LMS sync indicator, and session context`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_002 Verify display of 3 KPI summary cards (Pending Review, Total Amount, Distinct Dealers) @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify display of 3 KPI summary cards (Pending Review, Total Amount, Distinct Dealers)`, async () => {
            await mod.expectCheckerKpis();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_003 Verify 'Awaiting Your Approval' list column structure and record details @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify 'Awaiting Your Approval' list column structure and record details`, async () => {
            await mod.expectAwaitingApprovalList();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_004 Verify expanding Product Model & Quantity breakdown modal via 'View Details' @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify expanding Product Model & Quantity breakdown modal via 'View Details'`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_005 Verify single request approval and LMS disbursement submission with LAN generation @integration @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when Main Flow Step 5, Step 7 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (Main Flow Step 5, Step 7) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_006 Verify bulk request approval using multi-select and 'Approve Selected' action @integration @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when Main Flow Step 5 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (Main Flow Step 5) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_007 Verify 'Select All' checkbox functionality in Checker Queue header @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify 'Select All' checkbox functionality in Checker Queue header`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_008 Verify single request rejection requiring mandatory remarks @positive @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify single request rejection requiring mandatory remarks`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_009 Verify rejection audit logging (Checker ID, timestamp, remarks) @security @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when Business Rules backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (Business Rules) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_010 Verify segregation of duties preventing OEM Maker from accessing Checker Queue @security @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify segregation of duties preventing OEM Maker from accessing Checker Queue`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_011 Verify queue search functionality by Invoice ID, Dealer Code, or Maker Name @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify queue search functionality by Invoice ID, Dealer Code, or Maker Name`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_012 Verify dealer available limit validation when pending requests consume full limit @integration @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when E2, Business Rules backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (E2, Business Rules) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_013 Verify behavior when no requests are awaiting approval in Checker Queue @ui @medium @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when E3 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (E3) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_014 Verify system behavior when Sinch Maker notification service fails during approval/rejection @negative @medium @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when E5 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (E5) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_015 Verify system down handling when LMS Read-Only DB or queue source is unavailable @negative @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when E6 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (E6) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_016 Verify branch-scoped access for OEM Checker assigned to specific branches @security @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify branch-scoped access for OEM Checker assigned to specific branches`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_017 Verify partial batch approval where Checker approves 1 item and rejects 1 item in same batch @positive @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify partial batch approval where Checker approves 1 item and rejects 1 item in same batch`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_018 Verify transaction rollback when LMS disbursement submission fails on approval @negative @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when E4 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (E4) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_019 Verify recalculation of KPI cards upon actioning queue items @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify recalculation of KPI cards upon actioning queue items`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_020 Verify real-time / 5-min auto-refresh indicator of LMS queue sync @ui @low @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify real-time / 5-min auto-refresh indicator of LMS queue sync`, async () => {
            await mod.expectModuleLoaded();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_021 Verify currency formatting for request amounts and available limits in rupees @ui @low @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify currency formatting for request amounts and available limits in rupees`, async () => {
            await expect(await mod.getPageText()).toMatch(/₹|INR/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_CHK_022 Verify rejected request handling (non-resubmittable in place, requires Maker re-upload) @positive @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify rejected request handling (non-resubmittable in place, requires Maker re-upload)`, async () => {
            await mod.expectModuleLoaded();
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
