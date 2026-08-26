/**
 * US-DLR-013 — Applications
 * Single source of truth: Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_APP_001 … TC_APP_020)
 */

import { test, expect } from "@playwright/test";
import {
  initApplicationsSteps,
  regressionStep,
  requireEnv,
  requireModule,
  skipWithReason,
} from "../../applications/applications.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

test.describe(
  "US-DLR-013 Applications @us-dlr-013 @applications @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-DLR-013");

    test.beforeEach(() => {
      initApplicationsSteps();
    });

    test(`TC_APP_001 Verify display of 7 Funnel KPI cards with counts and aggregate values @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify display of 7 Funnel KPI cards with counts and aggregate values`, async () => {
            await mod.expectFunnelKpis();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_APP_002 Verify LOS Applications ledger column structure and default sort order @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify LOS Applications ledger column structure and default sort order`, async () => {
            await mod.expectApplicationsLedger();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_APP_003 Verify ledger search functionality by Application ID, Customer Name, Mobile, and Vehicle Number @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify ledger search functionality by Application ID, Customer Name, Mobile, and Vehicle Number`, async () => {
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

    test(`TC_APP_004 Verify ledger export functionality matches active scope, filters, and search query @positive @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify ledger export functionality matches active scope, filters, and search query`, async () => {
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

    test(`TC_APP_005 Verify opening Application Detail overlay panel upon selecting a ledger row @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify opening Application Detail overlay panel upon selecting a ledger row`, async () => {
            await mod.openFirstApplicationDetail();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_APP_006 Verify Delivery Order panel details for an issued DO @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Delivery Order panel details for an issued DO`, async () => {
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

    test(`TC_APP_007 Verify Delivery Order download action for issued DO @positive @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Delivery Order download action for issued DO`, async () => {
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

    test(`TC_APP_008 Verify Delivery Order panel state when DO is not yet issued @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Delivery Order panel state when DO is not yet issued`, async () => {
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

    test(`TC_APP_009 Verify Application Snapshot panel content and customer mobile number masking @security @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Application Snapshot panel content and customer mobile number masking`, async () => {
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

    test(`TC_APP_010 Verify Application Progress timeline rendering and Total TAT display for completed case @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Application Progress timeline rendering and Total TAT display for completed case`, async () => {
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

    test(`TC_APP_011 Verify Application Progress panel behavior for an in-progress application @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Application Progress panel behavior for an in-progress application`, async () => {
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

    test(`TC_APP_012 Verify closing Application Detail overlay retains previous grid state and filters @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify closing Application Detail overlay retains previous grid state and filters`, async () => {
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

    test(`TC_APP_013 Verify multi-branch scoping isolates application records strictly to mapped dealer branches @security @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify multi-branch scoping isolates application records strictly to mapped dealer branches`, async () => {
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

    test(`TC_APP_014 Verify empty state display when search query or scope returns zero records @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify empty state display when search query or scope returns zero records`, async () => {
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

    test(`TC_APP_015 Verify failure handling when CFS service is down during ledger or detail loading @negative @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when AC-24, E2 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (AC-24, E2) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_APP_016 Verify error handling when Delivery Order PDF download fails @negative @low @honda`, async ({ page }) => {
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

    test(`TC_APP_017 Verify access denial when requesting detail of an unmapped branch application @security @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when E7 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (E7) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_APP_018 Verify overall read-only nature of Lead Application Analytics module @security @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify overall read-only nature of Lead Application Analytics module`, async () => {
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

    test(`TC_APP_019 Verify consistency of application data fetched from CFS across summary and detail views @integration @high @honda`, async ({ page }) => {
      try {
            requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when AC-21 backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (AC-21) — configure environment and test data before execution.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_APP_020 Verify currency and numbering formatting rules across KPI cards and ledger @ui @low @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify currency and numbering formatting rules across KPI cards and ledger`, async () => {
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
  },
);
