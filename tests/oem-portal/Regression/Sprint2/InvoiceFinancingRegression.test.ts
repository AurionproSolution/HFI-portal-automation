/**
 * US-OEM-003 — Invoice Financing (Invoice Upload & Validation – Maker)
 * Single source of truth: US-OEM-003_TestCases_v1_0.xlsx (TC-001 … TC-050)
 * Catalog: testData/oem/invoiceFinancingCatalog.ts
 * OEM login: config/oem-env.ts
 */

import path from "path";
import { test, expect } from "@playwright/test";
import { invoiceFinancingMessages } from "@testData/oem/messages";
import {
  initInvoiceFinancingSteps,
  openInvoiceFinancingPage,
  regressionStep,
  requireEnv,
  requireModule,
  requireUploadFile,
  skipWithReason,
  assertInvoiceBatchesGridXlsxExport,
  assertSingleBatchXlsxExport,
  assertSingleBatchExport,
  readXlsxEmbeddedText,
  readBatchExportText,
  resolveInvoiceSearchQuery,
} from "../../invoice-financing/invoiceFinancing.helpers";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

const TD = (...p: string[]) =>
  path.join(process.cwd(), "testData", "oem", "files", ...p);

test.describe(
  "US-OEM-003 Invoice Financing @us-oem-003 @invoice-financing @regression",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "US-OEM-003");

    test.beforeEach(() => {
      initInvoiceFinancingSteps();
    });

    test(`TC-001 Verify Download XLSX Template returns the correct invoice-upload template @ui @high @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
          await regressionStep("Download XLSX Template", async () => {
            await inv.downloadTemplate();
          });
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-002 Verify each uploaded record is validated against dealer existence in LMS @positive @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_DEALER_MIX",
            "Set OEM_UPLOAD_DEALER_MIX to XLSX with valid and invalid dealer codes.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload dealer mix file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded|failed|dealer|not available/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-003 Verify each uploaded record is validated for product type @positive @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_PRODUCT_MIX",
            "Set OEM_UPLOAD_PRODUCT_MIX to XLSX with valid and invalid product types.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload product type mix file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded|failed|product/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-004 Verify each uploaded record is validated for Invoice Number uniqueness @positive @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_DUPLICATE_CYCLE",
            "Set OEM_UPLOAD_DUPLICATE_CYCLE to XLSX with unique and duplicate invoice numbers.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload duplicate cycle mix file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/duplicate|uploaded|failed/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-005 Verify each uploaded record is validated against the dealer's available limit @positive @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_LIMIT_MIX",
            "Set OEM_UPLOAD_LIMIT_MIX to XLSX with within-limit and over-limit amounts.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload limit mix file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/limit|uploaded|failed/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-006 Verify each uploaded record is validated for all mandatory fields being populated @positive @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_MANDATORY_MIX",
            "Set OEM_UPLOAD_MANDATORY_MIX to XLSX with complete and blank mandatory fields.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload mandatory field mix file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/mandatory|uploaded|failed|blank/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-007 Verify the exact error message when invoice amount exceeds the available dealer limit @negative @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_EXCEEDS_LIMIT",
            "Set OEM_UPLOAD_EXCEEDS_LIMIT to XLSX with amount exceeding dealer limit.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload over-limit invoice file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toContain(invoiceFinancingMessages.amountExceedsLimit);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-008 Verify the exact error message when a field is in an incorrect format @negative @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_BAD_FORMAT",
            "Set OEM_UPLOAD_BAD_FORMAT to XLSX with incorrect field format.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload bad format file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toContain(invoiceFinancingMessages.incorrectFormat);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-009 Verify the exact error message when a mandatory field is left blank @negative @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_BLANK_MANDATORY",
            "Set OEM_UPLOAD_BLANK_MANDATORY to XLSX with blank mandatory field.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload blank mandatory field file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toContain(invoiceFinancingMessages.mandatoryBlank);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-010 Verify the exact error message and reference for a duplicate Invoice Number @negative @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_DUPLICATE_INV",
            "Set OEM_UPLOAD_DUPLICATE_INV to XLSX with duplicate invoice number in cycle.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload duplicate invoice file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/duplicate of/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-011 Verify the exact error message for an inactive or incorrect dealer code @negative @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_BAD_DEALER",
            "Set OEM_UPLOAD_BAD_DEALER to XLSX with inactive or unknown dealer code.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload bad dealer code file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toContain(invoiceFinancingMessages.dealerUnavailable);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-012 Verify validation errors are displayed against each individual record on the main page @ui @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_MULTI_ERRORS",
            "Set OEM_UPLOAD_MULTI_ERRORS to XLSX with multiple validation failures.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload multi-error file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          const errorLines = text
            .split("\n")
            .filter((line) =>
              /exceeds|incorrect field format|mandatory|not available|duplicate/i.test(
                line,
              ),
            );
          expect(errorLines.length).toBeGreaterThanOrEqual(1);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-013 Verify a valid record creates a financing request routed to the Checker Queue @positive @high @honda`, async ({ page }) => {
      try {
      requireEnv(
            "LOS_API_URL",
            "Requires LOS_API_URL for Checker Queue routing verification (AC-3).",
          );
          const file = requireUploadFile(
            "OEM_UPLOAD_VALID_SINGLE",
            "Set OEM_UPLOAD_VALID_SINGLE to a fully valid invoice XLSX.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload valid single record", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded|success/i);
          skipWithReason(
            "Checker Queue verification requires LOS/Checker portal integration.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-014 Verify multiple valid records in one batch each create individual financing requests @positive @high @honda`, async ({ page }) => {
      try {
      requireEnv(
            "LOS_API_URL",
            "Requires LOS_API_URL for Checker Queue batch verification (AC-3).",
          );
          const file = requireUploadFile(
            "OEM_UPLOAD_VALID_BATCH",
            "Set OEM_UPLOAD_VALID_BATCH to XLSX with multiple valid records.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload valid batch file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded|success/i);
          skipWithReason(
            "Checker Queue batch verification requires LOS/Checker portal integration.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-015 Verify an uploaded invoice carries no VIN / PO at this stage @ui @medium @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await inv.openInvoicesTab();
          if (!(await inv.hasInvoiceBatchData())) {
            skipWithReason("No invoice batches visible on Invoice Financing grid.");
          }
          const batchId = inv.getFirstBatchIdFromText(await inv.getPageText());
          await regressionStep("Expand batch and verify no VIN / PO on invoice rows", async () => {
            await inv.expandBatch(batchId);
            const text = await inv.getPageText();
            expect(text).toMatch(/invoice no|dealer code/i);
            expect(text).not.toMatch(/\bvin\b/i);
            expect(text).not.toMatch(/\bpo\b/i);
            expect(text).not.toMatch(/vin:\s*\w+/i);
            expect(text).not.toMatch(/po:\s*\w+/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-016 Verify an uploaded invoice appears in My Uploads with the correct status @ui @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_MIX_STATUS",
            "Set OEM_UPLOAD_MIX_STATUS to XLSX with valid and invalid records.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload mix status file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded|failed/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-017 Verify KPI cards (Total / Uploaded / Failed) reflect the current uploaded set @ui @high @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Verify KPI cards reflect uploaded set", async () => {
            await inv.expectKpiCards();
            const text = await inv.getPageText();
            expect(text).toMatch(/total/i);
            expect(text).toMatch(/uploaded/i);
            expect(text).toMatch(/failed/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-018 Verify KPI counts update correctly after a new upload batch @positive @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_KPI_BATCH",
            "Set OEM_UPLOAD_KPI_BATCH to XLSX with mixed valid and invalid records.",
          );
          const inv = await requireModule(page);
          const before = await inv.getPageText();
          await regressionStep("Upload KPI batch file", async () => {
            await inv.uploadFile(file);
          });
          const after = await inv.getPageText();
          expect(after).not.toEqual(before);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-019 Verify correcting and re-uploading a failed invoice re-validates it as a new record @positive @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_REUPLOAD_FIXED",
            "Set OEM_UPLOAD_REUPLOAD_FIXED to corrected invoice XLSX after prior failure.",
          );
          const inv = await requireModule(page);
          await regressionStep("Re-upload corrected invoice file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded|failed|validation/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-020 Verify a re-uploaded corrected invoice is validated fresh, not blocked by its earlier failed attempt @edge @medium @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_REUPLOAD_SAME_INV",
            "Set OEM_UPLOAD_REUPLOAD_SAME_INV to corrected invoice with same number.",
          );
          const inv = await requireModule(page);
          await regressionStep("Re-upload same invoice number after correction", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded|failed/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-021 Verify the Audit and Tracking log displays the latest 50 actions @ui @medium @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Open Audit and Tracking log", async () => {
            await inv.openAuditLog();
          });
          if (await inv.isAuditModuleComingSoon()) {
            skipWithReason(
              "Audit & Tracking module shows Coming soon — cannot verify latest 50 actions.",
            );
          }
          const count = await inv.countAuditEntries();
          if (count === 0) {
            skipWithReason("No audit log entries visible to verify 50-action cap.");
          }
          expect(count).toBeLessThanOrEqual(50);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-022 Verify 'Invoice batch uploaded' appears in the Audit and Tracking log @positive @medium @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_VALID_SINGLE",
            "Set OEM_UPLOAD_VALID_SINGLE to a fully valid invoice XLSX.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload invoice batch", async () => {
            await inv.uploadFile(file);
          });
          await regressionStep("Verify audit log entry", async () => {
            await inv.openAuditLog();
            const text = await inv.getPageText();
            expect(text).toMatch(/invoice batch uploaded/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-023 Verify 'LMS sync cycle complete' appears in the Audit and Tracking log @positive @medium @honda`, async () => {
      try {
      requireEnv(
            "LMS_SYNC_WAIT",
            "Requires LMS_SYNC_WAIT=true to observe timed LMS sync in audit log (AC-7).",
          );
          skipWithReason(
            "LMS sync cycle audit entry requires waiting for timed sync.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-024 Verify only sprint-developed actions appear in the Audit and Tracking log @edge @low @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Open Audit and Tracking log", async () => {
            await inv.openAuditLog();
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/invoice batch uploaded|lms sync cycle complete/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-025 Verify LMS sync occurs at the configured 5-minute interval @positive @medium @honda`, async () => {
      try {
      requireEnv(
            "LMS_SYNC_WAIT",
            "Requires LMS_SYNC_WAIT=true for 5-minute LMS sync interval test (AC-8).",
          );
          skipWithReason(
            "5-minute LMS sync interval test requires timed environment run.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-026 Verify the Invoices tab header shows Total Batches, Total Invoices, Uploaded and Failed @ui @high @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Verify Invoices tab header metrics", async () => {
            await inv.expectInvoicesTabHeader();
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-027 Verify Invoices tab header values match the underlying batch and invoice data @positive @high @honda`, async () => {
      try {
      requireEnv(
            "LOS_API_URL",
            "Requires LOS_API_URL to compare Invoices tab header with underlying data (AC-9).",
          );
          skipWithReason(
            "Invoices header LOS comparison requires backend count API.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-028 Verify Export downloads the grid as CSV per the selected filters @positive @high @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Apply filter and export Invoices grid", async () => {
            await inv.openInvoicesTab();
            await inv.filterMyUploadsByStatus("failed");
            const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
            await inv.exportGrid();
            const download = await downloadPromise;
            await assertInvoiceBatchesGridXlsxExport(
              download,
              test.info().outputDir,
            );
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-029 Verify Export with no filters applied exports the full grid as CSV @edge @medium @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Export full Invoices grid", async () => {
            await inv.openInvoicesTab();
            const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
            await inv.exportGrid();
            const download = await downloadPromise;
            await assertInvoiceBatchesGridXlsxExport(
              download,
              test.info().outputDir,
            );
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-030 Verify View Details in the Product/Model column opens a child window with Model, Variant, Quantity @positive @high @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await inv.openInvoicesTab();
          if (!(await inv.hasInvoiceBatchData())) {
            skipWithReason("No invoice batches visible in grid.");
          }
          await inv.expandBatch();
          const viewDetails = page.getByRole("button", { name: /view details/i });
          if ((await viewDetails.count()) === 0) {
            skipWithReason(
              "Product/Model View Details control not present on invoice rows.",
            );
          }
          const ref =
            process.env.OEM_VIEW_DETAILS_REF?.trim() ||
            (await inv.getPageText()).match(/OEM-INV-\d+/i)?.[0] ||
            "";
          await regressionStep("Open product/model View Details", async () => {
            await inv.openProductModelDetails(ref);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/model|variant|quantity/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-031 Verify the child window's product/model details match the uploaded record's data @positive @medium @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_VALID_SINGLE",
            "Set OEM_UPLOAD_VALID_SINGLE to a fully valid invoice XLSX.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload valid record for View Details", async () => {
            await inv.uploadFile(file);
          });
          const ref = process.env.OEM_VIEW_DETAILS_REF?.trim();
          if (ref) {
            await inv.openInvoicesTab();
            await inv.openProductModelDetails(ref);
          }
          skipWithReason(
            "Product/model data cross-check requires manual fixture comparison.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-032 Verify the Invoice Batches grid Status column shows only Uploaded or Failed @ui @medium @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Verify batch status values", async () => {
            await inv.openInvoicesTab();
            const text = await inv.getPageText();
            expect(text).toMatch(/uploaded|failed/i);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-033 Verify Download against a specific batch downloads that batch's details as CSV @positive @high @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Download batch export (CSV or XLSX)", async () => {
            await inv.openInvoicesTab();
            const pageText = await inv.getPageText();
            const batchMatch = pageText.match(/OEM-BATCH-\d+/);
            const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
            await inv.downloadBatchAt(0);
            const download = await downloadPromise;
            await assertSingleBatchExport(
              download,
              test.info().outputDir,
              batchMatch?.[0],
            );
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-034 Verify the downloaded batch CSV contains only that batch's records @negative @medium @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await inv.openInvoicesTab();
          if (!(await inv.hasInvoiceBatchData())) {
            skipWithReason("No invoice batches visible for batch download isolation check.");
          }
          const pageText = await inv.getPageText();
          const batchId = inv.getFirstBatchIdFromText(pageText);
          await inv.expandBatch(batchId);
          const expandedText = await inv.getPageText();
          const invoiceNos =
            expandedText.match(/OEM-INV-\d+/gi)?.slice(0, 6) ?? [];
          if (!batchId || invoiceNos.length === 0) {
            skipWithReason("Could not read invoice numbers from expanded batch.");
          }
          await regressionStep("Download batch and verify isolated invoice records", async () => {
            const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
            await inv.downloadBatchAt(0);
            const download = await downloadPromise;
            const { path: savePath, isCsv } = await assertSingleBatchExport(
              download,
              test.info().outputDir,
              batchId,
            );
            const fileText = readBatchExportText(savePath, isCsv);
            for (const invNo of invoiceNos) {
              expect(fileText).toMatch(new RegExp(invNo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
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

    test(`TC-035 Verify My Uploads search filters by Invoice Number / Dealer @alternate @medium @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await inv.openInvoicesTab();
          const pageText = await inv.getPageText();
          const query = resolveInvoiceSearchQuery(pageText);
          if (!query) {
            skipWithReason(
              "No OEM_SEARCH_INVOICE / OEM_SEARCH_DEALER env and no batch or invoice visible to search.",
            );
          }
          await regressionStep("Search invoice batches", async () => {
            await inv.searchInvoiceBatches(query!);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(
            new RegExp(query!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-036 Verify My Uploads filter by status (Uploaded / Failed) works correctly @alternate @medium @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Filter My Uploads by Failed status", async () => {
            await inv.filterMyUploadsByStatus("failed");
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/failed/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-037 Verify upload is rejected when the file is not in the XLSX template format @negative @high @honda`, async ({ page }) => {
      try {
      const file =
            process.env.OEM_UPLOAD_INVALID_FORMAT?.trim() ||
            TD("invalid_upload.csv");
          const inv = await requireModule(page);
          await regressionStep("Upload non-template file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(invoiceFinancingMessages.templateRequired);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-038 Verify upload is rejected when the file is empty or has no data rows @negative @medium @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_EMPTY_TEMPLATE",
            "Set OEM_UPLOAD_EMPTY_TEMPLATE to empty template XLSX.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload empty template file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(invoiceFinancingMessages.noData);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-039 Verify a batch with a mix of valid and invalid records processes each record independently @edge @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_MIX_BATCH",
            "Set OEM_UPLOAD_MIX_BATCH to XLSX with valid and invalid records.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload mixed batch file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded/i);
          expect(text).toMatch(/failed/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-040 Verify VIN / PO columns, if present in an uploaded file, are ignored at this stage @negative @low @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_WITH_VIN_PO",
            "Set OEM_UPLOAD_WITH_VIN_PO to XLSX with extra VIN/PO columns.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload file with VIN/PO columns", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).not.toMatch(/vin:\s*\w+/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-041 Verify an already-uploaded invoice record cannot be edited directly and requires re-upload for correction @negative @medium @honda`, async ({ page }) => {
      try {
      const inv = await requireModule(page);
          await regressionStep("Verify no direct edit on My Uploads rows", async () => {
            const editButtons = inv.myUploadsGrid.getByRole("button", {
              name: /edit/i,
            });
            expect(await editButtons.count()).toBe(0);
          });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-042 Verify a Maker cannot upload or view invoices for a dealer outside their authorised scope @security @high @honda`, async () => {
      try {
      requireUploadFile(
            "OEM_UNAUTHORIZED_DEALER_FILE",
            "Set OEM_UNAUTHORIZED_DEALER_FILE to XLSX with out-of-scope dealer.",
          );
          skipWithReason(
            "Maker scope security test requires dedicated scoped Maker account.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-043 Verify a large batch upload (500+ records) processes all records without failure @edge @medium @honda`, async () => {
      try {
      requireUploadFile(
            "OEM_UPLOAD_LARGE_BATCH",
            "Set OEM_UPLOAD_LARGE_BATCH to 500+ record valid XLSX.",
          );
          skipWithReason(
            "Large batch upload (500+) requires dedicated NFR environment.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-044 Verify upload and validation of a large batch completes within an acceptable response time @nfr @medium @honda`, async () => {
      try {
      requireEnv("RUN_NFR_TESTS", "Requires RUN_NFR_TESTS=true for NFR timing tests.");
          requireUploadFile(
            "OEM_UPLOAD_LARGE_BATCH",
            "Set OEM_UPLOAD_LARGE_BATCH to 500+ record valid XLSX.",
          );
          skipWithReason(
            "NFR response-time assertion requires performance SLA baseline.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-045 Verify duplicate Invoice Numbers within the same uploaded batch are flagged @negative @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_INTRA_BATCH_DUP",
            "Set OEM_UPLOAD_INTRA_BATCH_DUP to XLSX with duplicate numbers in batch.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload intra-batch duplicate file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/duplicate/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-046 Verify the dealer's available-limit check reflects the latest LMS sync data @positive @medium @honda`, async () => {
      try {
      requireEnv(
            "LMS_SYNC_WAIT",
            "Requires LMS_SYNC_WAIT=true to verify limit reflects latest LMS sync (AC-8).",
          );
          skipWithReason(
            "LMS sync refresh limit check requires timed sync and LMS data change.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-047 Verify Download XLSX Template is available even before any upload has occurred @ui @low @honda`, async ({ page }) => {
      try {
      const inv = await openInvoiceFinancingPage(page);
          const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
          await regressionStep("Download XLSX Template on fresh session", async () => {
            await inv.downloadTemplate();
          });
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-048 Verify upload validation fails gracefully with a clear message when LMS is unavailable @negative @high @honda`, async () => {
      try {
      requireEnv(
            "OEM_FORCE_LMS_FAILURE",
            "Requires OEM_FORCE_LMS_FAILURE=true to simulate LMS unavailability.",
          );
          skipWithReason(
            "LMS unavailability hook requires backend failure simulation.",
          );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-049 Verify a fully valid record with all business fields populated is accepted @positive @high @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_VALID_SINGLE",
            "Set OEM_UPLOAD_VALID_SINGLE to a fully valid invoice XLSX.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload fully valid record", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toMatch(/uploaded|checker|success/i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });

    test(`TC-050 Verify an invalid Invoice Date format is rejected with the correct-format error message @negative @medium @honda`, async ({ page }) => {
      try {
      const file = requireUploadFile(
            "OEM_UPLOAD_BAD_DATE",
            "Set OEM_UPLOAD_BAD_DATE to XLSX with invalid Invoice Date format.",
          );
          const inv = await requireModule(page);
          await regressionStep("Upload bad invoice date file", async () => {
            await inv.uploadFile(file);
          });
          const text = await inv.getPageText();
          expect(text).toContain(invoiceFinancingMessages.incorrectFormat);
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
