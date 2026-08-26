/**
 * Rerun Sprint 2 PASS test cases (6 stories, excluding ADM) to capture
 * TC-named screenshots under reports/sprint2-evidence/.
 *
 * Prerequisites:
 *   npm run report:sprint2-pass-manifest
 *
 * Usage:
 *   node scripts/run-sprint2-pass-evidence.mjs
 *   node scripts/run-sprint2-pass-evidence.mjs US-DLR-011
 *   node scripts/run-sprint2-pass-evidence.mjs --missing-only
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "reports", "sprint2-pass-manifest.json");
const EVIDENCE_DIR = path.join(ROOT, "reports", "sprint2-evidence");
const playwrightCli = path.join(ROOT, "node_modules", "@playwright", "test", "cli.js");

const STORY_CONFIG = {
  "US-OEM-002": {
    testFile: "tests/oem-portal/Regression/Sprint2/DealerLimitsRegression.test.ts",
    project: "oem-dealer-limits-chromium",
    env: {},
    batchSize: 13,
  },
  "US-OEM-003": {
    testFile: "tests/oem-portal/Regression/Sprint2/InvoiceFinancingRegression.test.ts",
    project: "oem-invoice-financing-chromium",
    env: {},
    batchSize: 9,
  },
  "US-DLR-009": {
    testFile: "tests/hfi-portal/Regression/Sprint2/PurchaseOrdersVINsRegression.test.ts",
    project: "purchase-orders-vins-chromium",
    env: { ACTIVE_DEALER: "dealer8" },
    batchSize: 3,
  },
  "US-DLR-010": {
    testFile: "tests/hfi-portal/Regression/Sprint2/TransactionHistoryRegression.test.ts",
    project: "transaction-history-chromium",
    env: { ACTIVE_DEALER: "dealer8" },
    batchSize: 3,
  },
  "US-DLR-011": {
    testFile: "tests/hfi-portal/Regression/Sprint2/ExposureSettingsRegression.test.ts",
    project: "exposure-settings-chromium",
    env: { ACTIVE_DEALER: "dealerdp105" },
    batchSize: 5,
  },
  "US-DLR-001": {
    testFile: "tests/hfi-portal/Regression/Sprint2/DealerLoginRegression.test.ts",
    project: "dealer-login-chromium",
    env: { ACTIVE_DEALER: "dealerdp2e" },
    batchSize: 5,
  },
};

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function expectedEvidencePath(storyId, tcId) {
  return path.join(EVIDENCE_DIR, `${storyId}-${tcId}-PASS.png`);
}

function missingTcIds(storyId, tcIds) {
  return tcIds.filter((tcId) => !fs.existsSync(expectedEvidencePath(storyId, tcId)));
}

function runStoryBatch(storyId, tcIds, logFile) {
  const config = STORY_CONFIG[storyId];
  const grep = tcIds.map((id) => id.replace("-", "\\-")).join("|");
  const args = [
    playwrightCli,
    "test",
    config.testFile,
    `--project=${config.project}`,
    "--workers=1",
    "--grep",
    grep,
    "--reporter=list",
  ];

  const env = {
    ...process.env,
    ...config.env,
    SPRINT2_EVIDENCE_CAPTURE: "1",
    HEADLESS: process.env.HEADLESS ?? "true",
  };

  console.log(`\n[${storyId}] Evidence batch (${tcIds.length}): ${tcIds.join(", ")}`);
  const startedAt = new Date().toISOString();
  const result = spawnSync(process.execPath, args, {
    env,
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });

  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  const output = [
    `Story: ${storyId}`,
    `Started: ${startedAt}`,
    `TCs: ${tcIds.join(", ")}`,
    `Exit: ${result.status ?? "unknown"}`,
    "",
    result.stdout || "",
    result.stderr || "",
    "",
  ].join("\n");
  fs.appendFileSync(logFile, output, "utf8");

  return result.status ?? 1;
}

function summarize(manifest) {
  const summary = [];
  for (const [storyId, tcIds] of Object.entries(manifest)) {
    const captured = tcIds.filter((tcId) =>
      fs.existsSync(expectedEvidencePath(storyId, tcId)),
    );
    summary.push({
      storyId,
      passTcs: tcIds.length,
      captured: captured.length,
      missing: tcIds.length - captured.length,
      missingTcs: tcIds.filter(
        (tcId) => !fs.existsSync(expectedEvidencePath(storyId, tcId)),
      ),
    });
  }
  return summary;
}

function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.error(`Missing ${MANIFEST}. Run: npm run report:sprint2-pass-manifest`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const missingOnly = args.includes("--missing-only");
  const onlyStory = args.find((a) => a.startsWith("US-"));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const stories = onlyStory ? [onlyStory] : Object.keys(STORY_CONFIG);

  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  const logFile = path.join(ROOT, "reports", "sprint2-pass-evidence-run.log");
  if (!missingOnly) {
    fs.writeFileSync(
      logFile,
      `Sprint 2 PASS evidence capture — ${new Date().toISOString()}\n`,
      "utf8",
    );
  } else {
    fs.appendFileSync(
      logFile,
      `\n--- Resume missing only — ${new Date().toISOString()} ---\n`,
      "utf8",
    );
  }

  let exitCode = 0;
  for (const storyId of stories) {
    if (!STORY_CONFIG[storyId]) {
      console.error(`Unknown story: ${storyId}`);
      exitCode = 1;
      continue;
    }
    let tcIds = manifest[storyId] || [];
    if (missingOnly) {
      tcIds = missingTcIds(storyId, tcIds);
    }
    if (!tcIds.length) {
      console.log(`[${storyId}] No TCs to capture — skipping`);
      continue;
    }

    const batches = chunk(tcIds, STORY_CONFIG[storyId].batchSize);
    for (const batch of batches) {
      const code = runStoryBatch(storyId, batch, logFile);
      if (code !== 0) {
        exitCode = code;
      }
    }
  }

  const summary = summarize(manifest);
  const summaryPath = path.join(ROOT, "reports", "sprint2-pass-evidence-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

  console.log("\n=== Sprint 2 PASS Evidence Summary ===");
  for (const row of summary) {
    console.log(
      `${row.storyId}: PASS=${row.passTcs} captured=${row.captured} missing=${row.missing}`,
    );
    if (row.missingTcs.length) {
      console.log(`  missing: ${row.missingTcs.join(", ")}`);
    }
  }
  console.log(`\nLog: ${logFile}`);
  console.log(`Summary: ${summaryPath}`);
  console.log(`Evidence dir: ${EVIDENCE_DIR}`);

  process.exit(exitCode);
}

main();
