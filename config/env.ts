import dotenv from "dotenv";
import path from "path";
import { applyActiveDealerToProcessEnv } from "./dealer-registry";

/** Shell/CLI values must win over .env */
const shellOverrides = {
  HEADLESS: process.env.HEADLESS,
  SLOW_MO: process.env.SLOW_MO,
  CI: process.env.CI,
  TEST_ENV: process.env.TEST_ENV,
  ACTIVE_DEALER: process.env.ACTIVE_DEALER,
};

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
});

for (const [key, value] of Object.entries(shellOverrides)) {
  if (value !== undefined) {
    process.env[key] = value;
  }
}

applyActiveDealerToProcessEnv();

export type TestEnvironment = "dev" | "qat" | "sit" | "uat" | "prod";

/** Resolved at call time — UDC pattern */
export function getCurrentEnv(): TestEnvironment {
  const env = (process.env.TEST_ENV || "qat").toLowerCase();
  if (
    env === "dev" ||
    env === "qat" ||
    env === "sit" ||
    env === "uat" ||
    env === "prod"
  ) {
    return env;
  }
  return "qat";
}

/** @deprecated Use getCurrentEnv */
export function getTestEnvironment(): TestEnvironment {
  return getCurrentEnv();
}

export function isCI(): boolean {
  return process.env.CI === "true" || process.env.CI === "1";
}

export * from "./hfi-env";
