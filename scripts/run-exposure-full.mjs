import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dealer = process.env.ACTIVE_DEALER || "dealerdp105";
const logDir = path.join(process.cwd(), "reports");
const logFile = path.join(logDir, `exposure-dp105-full-run.log`);

fs.mkdirSync(logDir, { recursive: true });
const logStream = fs.createWriteStream(logFile, { flags: "w" });
const write = (msg) => {
  process.stdout.write(msg);
  logStream.write(msg);
};

write(`Exposure Settings full run — ACTIVE_DEALER=${dealer}\n`);
write(`Started: ${new Date().toISOString()}\n\n`);

const playwrightCli = path.join(process.cwd(), "node_modules", "@playwright", "test", "cli.js");
const args = [
  playwrightCli,
  "test",
  "tests/hfi-portal/Regression/Sprint2/ExposureSettingsRegression.test.ts",
  "--project=exposure-settings-chromium",
  "--workers=1",
  "--reporter=list",
];

const env = {
  ...process.env,
  ACTIVE_DEALER: dealer,
};

write(`Command: node ${args.join(" ")}\n\n`);
const result = spawnSync(process.execPath, args, { env, encoding: "utf8" });
if (result.stdout) write(result.stdout);
if (result.stderr) write(result.stderr);
write(`\nFinished: ${new Date().toISOString()}\nExit code: ${result.status}\n`);
logStream.end();
process.exit(result.status ?? 1);
