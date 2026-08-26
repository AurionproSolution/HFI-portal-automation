import { spawnSync } from "node:child_process";
import path from "node:path";

const slot = Number(process.argv[2] || "1");
const slots = {
  1: Array.from({ length: 15 }, (_, i) => `TC-${String(i + 1).padStart(3, "0")}`),
  2: Array.from({ length: 15 }, (_, i) => `TC-${String(i + 16).padStart(3, "0")}`),
  3: Array.from({ length: 15 }, (_, i) => `TC-${String(i + 31).padStart(3, "0")}`),
  4: ["TC-046", "TC-047", "TC-048", "TC-049", "TC-050"],
};

const ids = slots[slot];
if (!ids) {
  console.error("Usage: node scripts/run-dealer-login-slot.mjs <1-4>");
  process.exit(1);
}

const grep = ids.map((id) => id.replace("-", "\\-")).join("|");
const playwrightCli = path.join(process.cwd(), "node_modules", "@playwright", "test", "cli.js");
const logFile = path.join(process.cwd(), "reports", `dealer-login-slot${slot}-run.log`);

const args = [
  playwrightCli,
  "test",
  "tests/hfi-portal/Regression/Sprint2/DealerLoginRegression.test.ts",
  "--project=dealer-login-chromium",
  "--workers=1",
  "--grep",
  grep,
  "--reporter=list",
];

const env = {
  ...process.env,
  ACTIVE_DEALER: process.env.ACTIVE_DEALER || "dealerdp2e",
};

console.log(`Running US-DLR-001 Slot ${slot}: ${ids.join(", ")}`);
console.log(`ACTIVE_DEALER=${env.ACTIVE_DEALER}`);
console.log(`Log: ${logFile}`);

const result = spawnSync(process.execPath, args, {
  env,
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});

const fs = await import("node:fs");
fs.mkdirSync(path.dirname(logFile), { recursive: true });
fs.writeFileSync(
  logFile,
  `Slot ${slot} — ${new Date().toISOString()}\nACTIVE_DEALER=${env.ACTIVE_DEALER}\n\n${result.stdout || ""}\n${result.stderr || ""}\nExit: ${result.status}\n`,
);
process.stdout.write(result.stdout || "");
process.stderr.write(result.stderr || "");
process.exit(result.status ?? 1);
