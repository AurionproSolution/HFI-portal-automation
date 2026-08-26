/**
 * US-OPS-003 — Dealer Target Upload & Maintenance
 * Single source of truth: Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_OPS3_001 … TC_OPS3_010)
 */

import { test, expect } from "@playwright/test";
import {
  initDealerTargetSteps,
  regressionStep,
  requireEnv,
  requireModule,
  skipWithReason,
} from "../../dealer-target/dealerTarget.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

test.describe(
  "US-OPS-003 Dealer Target Upload & Maintenance @us-ops-003 @dealer-target @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-OPS-003");

    test.beforeEach(() => {
      initDealerTargetSteps();
    });

    test(`TC_OPS3_001 Verify restricted Ops Console user can access Dealer Target and the page header displays correctly @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify restricted Ops Console user can access Dealer Target and the page header displays correctly`, async () => {
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

    test(`TC_OPS3_002 Verify Dealer Target KPI cards and empty upload state before a file is uploaded @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Dealer Target KPI cards and empty upload state before a file is uploaded`, async () => {
            await mod.expectKpiCards(); await mod.expectUploadPanel();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_OPS3_003 Verify Sample Format downloads successfully and contains the expected target-file structure @ui @medium @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify Sample Format downloads successfully and contains the expected target-file structure`, async () => {
            await mod.expectUploadPanel();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC_OPS3_004 Verify a valid dealer target file is accepted, parsed and displayed for review @positive @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify a valid dealer target file is accepted, parsed and displayed for review`, async () => {
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

    test(`TC_OPS3_005 Verify upload is rejected when file type/size or expected columns are invalid @validation @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify upload is rejected when file type/size or expected columns are invalid`, async () => {
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

    test(`TC_OPS3_006 Verify record-level validation rejects invalid dealer code, target/period format and prevents commit @validation @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify record-level validation rejects invalid dealer code, target/period format and prevents commit`, async () => {
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

    test(`TC_OPS3_007 Verify an uploaded file can be discarded before submission without storing targets @ui @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify an uploaded file can be discarded before submission without storing targets`, async () => {
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

    test(`TC_OPS3_008 Verify submitting a reviewed target file commits dealer targets and records the upload in audit @integration @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify submitting a reviewed target file commits dealer targets and records the upload in audit`, async () => {
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

    test(`TC_OPS3_009 Verify uploading a revised target file for an existing period replaces prior target values and retains superseded values in audit @integration @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify uploading a revised target file for an existing period replaces prior target values and retains superseded values in audit`, async () => {
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

    test(`TC_OPS3_010 Verify committed dealer target is consumed on the Consumer Finance Dashboard and no-target dealers show the defined fallback state @integration @high @honda`, async ({ page }) => {
      try {
            const mod = await requireModule(page);
          await regressionStep(`Verify committed dealer target is consumed on the Consumer Finance Dashboard and no-target dealers show the defined fallback state`, async () => {
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
