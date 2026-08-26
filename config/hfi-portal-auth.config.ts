import path from "path";
import { getCurrentEnv } from "./env";

export function getHfiAuthStoragePath(): string {
  const env = getCurrentEnv();
  return path.join(
    process.cwd(),
    "playwright",
    ".auth",
    `hfi-portal.${env}.json`,
  );
}

/** Legacy path — used until all projects migrate to env-scoped storage. */
export function getLegacyAuthStoragePath(): string {
  return path.join(process.cwd(), "playwright", ".auth", "dealer-session.json");
}

export const HFI_SESSION_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
