import { spawnSync } from "node:child_process";
import path from "node:path";

const slot = Number(process.argv[2] || "1");
const slots = {
  1: ["TC-001", "TC-002", "TC-003", "TC-004", "TC-005", "TC-006", "TC-007", "TC-008", "TC-009", "TC-010"],
  2: ["TC-011", "TC-012", "TC-013", "TC-014", "TC-015", "TC-016", "TC-017", "TC-018", "TC-019", "TC-020"],
  3: ["TC-021", "TC-022", "TC-023", "TC-024", "TC-025", "TC-026", "TC-027", "TC-028", "TC-029", "TC-030"],
  4: ["TC-031", "TC-032", "TC-033", "TC-034", "TC-035", "TC-036", "TC-037", "TC-038", "TC-039", "TC-040"],
  5: ["TC-041", "TC-042", "TC-043", "TC-044", "TC-045", "TC-046", "TC-047", "TC-048", "TC-049", "TC-050"],
};

const ids = slots[slot];
if (!ids) {
  console.error("Usage: node scripts/run-po-vins-slot.mjs <1-5>");
  process.exit(1);
}

const grep = ids.map((id) => id.replace("-", "\\-")).join("|");
const playwrightCli = path.join(process.cwd(), "node_modules", "@playwright", "test", "cli.js");
const args = [
  playwrightCli,
  "test",
  "tests/hfi-portal/Regression/Sprint2/PurchaseOrdersVINsRegression.test.ts",
  "--project=purchase-orders-vins-chromium",
  "--workers=1",
  "--grep",
  grep,
  "--reporter=list",
];

const env = {
  ...process.env,
  TEST_ENV: process.env.TEST_ENV || "dev",
  ACTIVE_DEALER: process.env.ACTIVE_DEALER || "dealer8",
};

console.log(`Running Purchase Orders & VINs Slot ${slot}: ${ids.join(", ")}`);
const result = spawnSync(process.execPath, args, { stdio: "inherit", env });
process.exit(result.status ?? 1);
