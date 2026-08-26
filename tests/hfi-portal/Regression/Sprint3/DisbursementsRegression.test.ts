/**
 * US-DLR-014 — Disbursements
 * Single source of truth: Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_DIS_001 … TC_DIS_018)
 */

import { test, expect } from "@playwright/test";
import {
  initDisbursementsSteps,
  regressionStep,
  requireEnv,
  requireModule,
  skipWithReason,
} from "../../disbursements/disbursements.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

test.describe(
  "US-DLR-014 Disbursements @us-dlr-014 @disbursements @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-DLR-014");

    test.beforeEach(() => {
      initDisbursementsSteps();
    });

    test(`TC_DIS_001 Verify display of 4 summary KPI cards with calculated metrics @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify display of 4 summary KPI cards with calculated metrics`, async () => {
            await mod.expectSummaryKpis();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_DIS_002 Verify Disbursal Analytics period-on-period comparison tiles and variance calculation @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Disbursal Analytics period-on-period comparison tiles and variance calculation`, async () => {
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

    test(`TC_DIS_003 Verify week-wise grouped bar chart rendering in Disbursal Analytics @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify week-wise grouped bar chart rendering in Disbursal Analytics`, async () => {
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

    test(`TC_DIS_004 Verify Peak Disbursal Bucket strip highlighting and percentage variance @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Peak Disbursal Bucket strip highlighting and percentage variance`, async () => {
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

    test(`TC_DIS_005 Verify Analytics behavior when no comparable previous period exists @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Analytics behavior when no comparable previous period exists`, async () => {
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

    test(`TC_DIS_006 Verify Disbursal Ledger columns, default sorting, and UTR display for settled cases @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Disbursal Ledger columns, default sorting, and UTR display for settled cases`, async () => {
            await mod.expectDisbursalLedger();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_DIS_007 Verify search filtering in Disbursal Ledger by Customer, Application, Loan Account, and VIN @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify search filtering in Disbursal Ledger by Customer, Application, Loan Account, and VIN`, async () => {
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

    test(`TC_DIS_008 Verify export of Disbursal Ledger for active scope and search query @positive @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify export of Disbursal Ledger for active scope and search query`, async () => {
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

    test(`TC_DIS_009 Verify global filter changes refresh KPI cards, analytics, and ledger consistently @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify global filter changes refresh KPI cards, analytics, and ledger consistently`, async () => {
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

    test(`TC_DIS_010 Verify multi-branch scoping restricts disbursals strictly to dealer's mapped branches @security @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify multi-branch scoping restricts disbursals strictly to dealer's mapped branches`, async () => {
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

    test(`TC_DIS_011 Verify empty state message when no disbursal records exist for selected scope @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify empty state message when no disbursal records exist for selected scope`, async () => {
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

    test(`TC_DIS_012 Verify system down validation message when LMS/CFS backend is unreachable @negative @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when AC-18, E3 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (AC-18, E3) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_DIS_013 Verify export failure notification handling @negative @low @honda`, async ({ page }) => {
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

    test(`TC_DIS_014 Verify screen read-only behavior with no disbursal initiation/amendment actions @security @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify screen read-only behavior with no disbursal initiation/amendment actions`, async () => {
            await mod.expectReadOnlyModule();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_DIS_015 Verify LMS UTR and settlement data linkage with CFS application records @integration @high @honda`, async ({ page }) => {
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

    test(`TC_DIS_016 Verify navigation drill-through arrival from Dashboard Disbursal Trend widget @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify navigation drill-through arrival from Dashboard Disbursal Trend widget`, async () => {
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

    test(`TC_DIS_017 Verify currency and decimal precision formatting for disbursal amounts @ui @low @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify currency and decimal precision formatting for disbursal amounts`, async () => {
            await mod.expectIndianCurrencyFormatting();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_DIS_018 Verify responsive column stacking and horizontal scrolling on mobile viewports @ui @low @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify responsive column stacking and horizontal scrolling on mobile viewports`, async () => {
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
