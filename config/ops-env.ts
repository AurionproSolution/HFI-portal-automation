/**
 * Ops Console — environment URLs and Operations user credential accessors.
 */

import { getCurrentEnv } from "./env";

export interface OpsCredentials {
  username: string;
  password: string;
}

const OPS_LOGIN_URLS: Partial<Record<string, string>> = {
  dev: "http://devdealerportal.centralindia.cloudapp.azure.com/ops/login",
  uat: "http://uatdealerportal.centralindia.cloudapp.azure.com/ops/login",
};

export function getOpsLoginUrl(): string {
  const explicit =
    process.env.OPS_LOGIN_URL?.trim() || process.env.OPS_BASE_URL?.trim();
  if (explicit) {
    return explicit.includes("/login")
      ? explicit
      : `${explicit.replace(/\/$/, "")}/login`;
  }
  return OPS_LOGIN_URLS[getCurrentEnv()] || OPS_LOGIN_URLS.dev!;
}

export function getOpsOfflinePaymentPath(): string {
  return (
    process.env.OPS_OFFLINE_PAYMENT_PATH?.trim() ||
    "/ops/offline-payment-verification"
  );
}

export function getOpsDealerTargetPath(): string {
  return (
    process.env.OPS_DEALER_TARGET_PATH?.trim() || "/ops/dealer-target"
  );
}

export function getOpsCredentials(): OpsCredentials | undefined {
  const username = process.env.OPS_USERNAME?.trim();
  const password = process.env.OPS_PASSWORD?.trim();
  if (!username || !password) {
    return undefined;
  }
  return { username, password };
}

export function getOpsRestrictedCredentials(): OpsCredentials | undefined {
  const username = process.env.OPS_RESTRICTED_USERNAME?.trim();
  const password = process.env.OPS_RESTRICTED_PASSWORD?.trim();
  if (!username || !password) {
    return undefined;
  }
  return { username, password };
}
