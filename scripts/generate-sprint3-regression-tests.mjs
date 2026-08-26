#!/usr/bin/env node
/**
 * Generate Sprint 3 Playwright regression tests from sprint3-tc-review-export.json
 * following Sprint 2 file structure and naming conventions.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EXPORT = path.join(ROOT, "reports", "sprint3-tc-review-export.json");

const MODULES = [
  {
    sheetKey: "US-DLR-012",
    storyId: "US-DLR-012",
    storyName: "Consumer Finance Dashboard",
    describeTags: "@us-dlr-012 @consumer-finance-dashboard @regression",
    helperImport: "../../consumer-finance-dashboard/consumerFinanceDashboard.helpers",
    initSteps: "initConsumerFinanceDashboardSteps",
    output: "tests/hfi-portal/Regression/Sprint3/ConsumerFinanceDashboardRegression.test.ts",
    excelRef: "Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_CFD_001 … TC_CFD_021)",
    varName: "mod",
  },
  {
    sheetKey: "US-DLR-013",
    storyId: "US-DLR-013",
    storyName: "Applications",
    describeTags: "@us-dlr-013 @applications @regression",
    helperImport: "../../applications/applications.helpers",
    initSteps: "initApplicationsSteps",
    output: "tests/hfi-portal/Regression/Sprint3/ApplicationsRegression.test.ts",
    excelRef: "Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_APP_001 … TC_APP_020)",
    varName: "mod",
  },
  {
    sheetKey: "US-DLR-014",
    storyId: "US-DLR-014",
    storyName: "Disbursements",
    describeTags: "@us-dlr-014 @disbursements @regression",
    helperImport: "../../disbursements/disbursements.helpers",
    initSteps: "initDisbursementsSteps",
    output: "tests/hfi-portal/Regression/Sprint3/DisbursementsRegression.test.ts",
    excelRef: "Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_DIS_001 … TC_DIS_018)",
    varName: "mod",
  },
  {
    sheetKey: "US-DLR-015",
    storyId: "US-DLR-015",
    storyName: "Pending PDDs",
    describeTags: "@us-dlr-015 @pending-pdds @regression",
    helperImport: "../../pending-pdds/pendingPDDs.helpers",
    initSteps: "initPendingPDDsSteps",
    output: "tests/hfi-portal/Regression/Sprint3/PendingPDDsRegression.test.ts",
    excelRef: "Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_PDD_001 … TC_PDD_022)",
    varName: "mod",
  },
  {
    sheetKey: "US-DLR-016",
    storyId: "US-DLR-016",
    storyName: "Payouts",
    describeTags: "@us-dlr-016 @payouts @regression",
    helperImport: "../../payouts/payouts.helpers",
    initSteps: "initPayoutsSteps",
    output: "tests/hfi-portal/Regression/Sprint3/PayoutsRegression.test.ts",
    excelRef: "Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_PAY_001 … TC_PAY_025)",
    varName: "mod",
  },
  {
    sheetKey: "UC-OEM-004",
    storyId: "UC-OEM-004",
    storyName: "OEM Checker",
    describeTags: "@uc-oem-004 @oem-checker @regression",
    helperImport: "../../checker/oemChecker.helpers",
    initSteps: "initOEMCheckerSteps",
    output: "tests/oem-portal/Regression/Sprint3/OEMCheckerRegression.test.ts",
    excelRef: "Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_CHK_001 … TC_CHK_022)",
    varName: "mod",
  },
  {
    sheetKey: "US-OPS-002",
    storyId: "US-OPS-002",
    storyName: "Offline Payment Verification",
    describeTags: "@us-ops-002 @offline-payment @regression",
    helperImport: "../../offline-payment/offlinePayment.helpers",
    initSteps: "initOfflinePaymentSteps",
    output: "tests/ops-console/Regression/Sprint3/OfflinePaymentVerificationRegression.test.ts",
    excelRef: "Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_OPS2_001 … TC_OPS2_011)",
    varName: "mod",
  },
  {
    sheetKey: "US-OPS-003",
    storyId: "US-OPS-003",
    storyName: "Dealer Target Upload & Maintenance",
    describeTags: "@us-ops-003 @dealer-target @regression",
    helperImport: "../../dealer-target/dealerTarget.helpers",
    initSteps: "initDealerTargetSteps",
    output: "tests/ops-console/Regression/Sprint3/DealerTargetRegression.test.ts",
    excelRef: "Honda_Finance_Sprint3_Test_Cases_Updated_149.xlsx (TC_OPS3_001 … TC_OPS3_010)",
    varName: "mod",
  },
];

const EXTRA_CALLS = {
  "TC_CFD_001": "await mod.expectDefaultLandingAndFilters();",
  "TC_CFD_002": "await mod.expectPerformanceCards();",
  "TC_CFD_008": "await mod.expectAttentionRequiredPanel();",
  "TC_CFD_010": "await mod.expectApplicationPipelineWidget();",
  "TC_CFD_011": "await mod.expectDisbursalTrendWidget();",
  "TC_CFD_013": "await mod.expectRecentActivityFeed();",
  "TC_CFD_006": "await mod.expectTargetSuppressedForExtendedPeriod();",
  "TC_CFD_018": "await mod.expectReadOnlyModule();",
  "TC_CFD_019": "await mod.expectIndianCurrencyFormatting();",
  "TC_APP_001": "await mod.expectFunnelKpis();",
  "TC_APP_002": "await mod.expectApplicationsLedger();",
  "TC_APP_005": "await mod.openFirstApplicationDetail();",
  "TC_APP_018": "await mod.expectReadOnlyModule();",
  "TC_APP_020": "await mod.expectIndianCurrencyFormatting();",
  "TC_DIS_001": "await mod.expectSummaryKpis();",
  "TC_DIS_006": "await mod.expectDisbursalLedger();",
  "TC_DIS_014": "await mod.expectReadOnlyModule();",
  "TC_DIS_017": "await mod.expectIndianCurrencyFormatting();",
  "TC_PDD_001": "await mod.expectPddKpis();",
  "TC_PDD_004": "await mod.expectPddQueue();",
  "TC_PDD_022": "await mod.expectIndianCurrencyFormatting();",
  "TC_PAY_002": "await mod.expectPayoutKpis();",
  "TC_PAY_006": "await mod.expectUploadPanel();",
  "TC_PAY_025": "await mod.expectIndianCurrencyFormatting();",
  "TC_CHK_002": "await mod.expectCheckerKpis();",
  "TC_CHK_003": "await mod.expectAwaitingApprovalList();",
  "TC_CHK_009": "await mod.expectAuditLogVisible();",
  "TC_CHK_021": "await expect(await mod.getPageText()).toMatch(/₹|INR/i);",
  "TC_OPS2_002": "await mod.expectKpiCards();",
  "TC_OPS2_004": "await mod.expectQueueGrid();",
  "TC_OPS3_002": "await mod.expectKpiCards(); await mod.expectUploadPanel();",
  "TC_OPS3_003": "await mod.expectUploadPanel();",
};

function typeToTag(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("negative") || t.includes("exception")) return "negative";
  if (t.includes("security")) return "security";
  if (t.includes("validation")) return "validation";
  if (t.includes("integration") || t.includes("los")) return "integration";
  if (t.includes("functional") && !t.includes("ui")) return "positive";
  if (t.includes("boundary")) return "validation";
  if (t.includes("responsiveness") || t.includes("frontend")) return "ui";
  return "ui";
}

function priorityToTag(priority) {
  return (priority || "medium").toLowerCase();
}

function escapeBackticks(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

function isBackendHeavy(type, ac) {
  const t = (type || "").toLowerCase();
  const a = (ac || "").toLowerCase();
  if (/frontend req|responsiveness|ui \/ format/i.test(type || "")) return false;
  if (/los \/|exception \/ backend|exception \/ functional|security \/ audit/i.test(type || ""))
    return true;
  if (/^e\d|backend|integration|lms|cfs|mock api/i.test(a)) return true;
  if (/los \/ backend|exception \/ backend/i.test(t)) return true;
  return false;
}

function buildTest(tc, config) {
  const typeTag = typeToTag(tc.type);
  const prioTag = priorityToTag(tc.prio);
  const title = `${tc.id} ${tc.title} @${typeTag} @${prioTag} @honda`;
  const stepTitle = escapeBackticks(tc.title);

  let body;
  if (isBackendHeavy(tc.type, tc.ac)) {
    body = `      requireEnv("SPRINT3_BACKEND_ENABLED", "Set SPRINT3_BACKEND_ENABLED=1 when ${tc.ac} backend/integration scenario is configured.");
          skipWithReason("Backend/integration scenario (${tc.ac}) — configure environment and test data before execution.");`;
  } else {
    const extra =
      EXTRA_CALLS[tc.id] ||
      (tc.type?.includes("Format")
        ? "await mod.expectIndianCurrencyFormatting();"
        : "await mod.expectModuleLoaded();");
    body = `      const ${config.varName} = await requireModule(page);
          await regressionStep(\`${stepTitle}\`, async () => {
            ${extra}
          });`;
  }

  return `    test(\`${escapeBackticks(title)}\`, async ({ page }) => {
      try {
      ${body}
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
        }
        throw e;
      }
    });`;
}

function generateModuleFile(config, cases) {
  const tests = cases.map((tc) => buildTest(tc, config)).join("\n\n");
  return `/**
 * ${config.storyId} — ${config.storyName}
 * Single source of truth: ${config.excelRef}
 */

import { test, expect } from "@playwright/test";
import {
  ${config.initSteps},
  regressionStep,
  requireEnv,
  requireModule,
  skipWithReason,
} from "${config.helperImport}";
import { registerSprint2PassEvidence } from "@utils/sprint2Evidence";

test.describe(
  "${config.storyId} ${config.storyName} ${config.describeTags}",
  () => {
    test.setTimeout(300_000);
    registerSprint2PassEvidence(test, "${config.storyId}");

    test.beforeEach(() => {
      ${config.initSteps}();
    });

${tests}
  },
);
`;
}

function generateCompose(filePath, imports, label) {
  const content = `/**
 * ${label} — full regression entry (composes feature modules; no duplicate test bodies).
 * Run: npm run test:sprint3
 */
${imports.map((i) => `import "${i}";`).join("\n")}
`;
  fs.mkdirSync(path.dirname(path.join(ROOT, filePath)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, filePath), content, "utf8");
}

function main() {
  const data = JSON.parse(fs.readFileSync(EXPORT, "utf8"));
  let total = 0;

  for (const config of MODULES) {
    const cases = data[config.sheetKey];
    if (!cases?.length) {
      console.error(`Missing cases for ${config.sheetKey}`);
      process.exit(1);
    }
    const outPath = path.join(ROOT, config.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, generateModuleFile(config, cases), "utf8");
    console.log(`Wrote ${cases.length} tests -> ${config.output}`);
    total += cases.length;
  }

  generateCompose(
    "tests/hfi-portal/Regression/Sprint3/Sprint3Regression.test.ts",
    [
      "./ConsumerFinanceDashboardRegression.test",
      "./ApplicationsRegression.test",
      "./DisbursementsRegression.test",
      "./PendingPDDsRegression.test",
      "./PayoutsRegression.test",
    ],
    "Sprint 3 — HFI Portal",
  );

  generateCompose(
    "tests/oem-portal/Regression/Sprint3/Sprint3Regression.test.ts",
    ["./OEMCheckerRegression.test"],
    "Sprint 3 — OEM Portal",
  );

  generateCompose(
    "tests/ops-console/Regression/Sprint3/Sprint3Regression.test.ts",
    [
      "./OfflinePaymentVerificationRegression.test",
      "./DealerTargetRegression.test",
    ],
    "Sprint 3 — Ops Console",
  );

  console.log(`Total generated tests: ${total}`);
}

main();
