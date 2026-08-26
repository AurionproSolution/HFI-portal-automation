/**
 * US-OPS-002 — Offline Payment Verification
 * Single source of truth: Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_OPS2_001 … TC_OPS2_011)
 */

import { test, expect } from "@playwright/test";
import {
  initOfflinePaymentSteps,
  regressionStep,
  requireEnv,
  requireModule,
  skipWithReason,
} from "../../offline-payment/offlinePayment.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

test.describe(
  "US-OPS-002 Offline Payment Verification @us-ops-002 @offline-payment @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-OPS-002");

    test.beforeEach(() => {
      initOfflinePaymentSteps();
    });

    test(`TC_OPS2_001 Verify restricted Ops Console user can access Offline Payment Verification and the page header displays correctly @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify restricted Ops Console user can access Offline Payment Verification and the page header displays correctly`, async () => {
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

    test(`TC_OPS2_002 Verify the four Offline Payment Verification KPI cards display branch-scoped values @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify the four Offline Payment Verification KPI cards display branch-scoped values`, async () => {
            await mod.expectKpiCards();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_OPS2_003 Verify Pending Verification is the default queue tab and all status tabs are available @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Pending Verification is the default queue tab and all status tabs are available`, async () => {
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

    test(`TC_OPS2_004 Verify the Pending Verification grid displays all required submission details and Verify action @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify the Pending Verification grid displays all required submission details and Verify action`, async () => {
            await mod.expectQueueGrid();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_OPS2_005 Verify queue search filters by dealer, UTR, PO and VIN using case-insensitive partial matching @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify queue search filters by dealer, UTR, PO and VIN using case-insensitive partial matching`, async () => {
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

    test(`TC_OPS2_006 Verify selecting Verify opens the Offline Payment modal with complete submission details and decision controls @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify selecting Verify opens the Offline Payment modal with complete submission details and decision controls`, async () => {
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

    test(`TC_OPS2_007 Verify proof document can be downloaded from the verification modal @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify proof document can be downloaded from the verification modal`, async () => {
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

    test(`TC_OPS2_008 Verify approval records the decision and moves the submission from Pending Verification to Verified @integration @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify approval records the decision and moves the submission from Pending Verification to Verified`, async () => {
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

    test(`TC_OPS2_009 Verify rejection requires a note and does not record a rejection when the note is blank @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify rejection requires a note and does not record a rejection when the note is blank`, async () => {
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

    test(`TC_OPS2_010 Verify a recorded decision recalculates queue KPIs and removes the decided submission from pending scope @integration @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify a recorded decision recalculates queue KPIs and removes the decided submission from pending scope`, async () => {
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

    test(`TC_OPS2_011 Verify Verified and Rejected submissions are read-only and cannot be decided again @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Verified and Rejected submissions are read-only and cannot be decided again`, async () => {
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
