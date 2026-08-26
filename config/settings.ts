import { isCI } from "./env";

export const settings = {
  defaultTimeout: 30_000,
  navigationTimeout: 60_000,
  actionTimeout: 15_000,
  expectTimeout: 10_000,
  retries: isCI() ? 2 : 0,
  workers: isCI() ? 2 : undefined,
  screenshotOnFailure: true,
  videoOnFailure: true,
  traceOnFirstRetry: true,
} as const;
