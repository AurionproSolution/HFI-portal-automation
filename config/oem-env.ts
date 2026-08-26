/**
 * OEM Portal — environment URLs and Maker credential accessors.
 * Dealer Portal config lives in hfi-env.ts; OEM tests must not use dealer login URLs.
 */

import { getCurrentEnv } from "./env";

export interface OemCredentials {
  username: string;
  password: string;
}

const OEM_LOGIN_URLS: Partial<Record<string, string>> = {
  dev: "http://devdealerportal.centralindia.cloudapp.azure.com/oem/login",
  uat: "http://uatdealerportal.centralindia.cloudapp.azure.com/oem/login",
};

export function getOemLoginUrl(): string {
  const explicit =
    process.env.OEM_LOGIN_URL?.trim() ||
    process.env.OEM_BASE_URL?.trim();
  if (explicit) {
    return explicit.includes("/login")
      ? explicit
      : `${explicit.replace(/\/$/, "")}/login`;
  }

  const envDefault = OEM_LOGIN_URLS[getCurrentEnv()];
  if (envDefault) {
    return envDefault;
  }

  return OEM_LOGIN_URLS.dev!;
}

export function getOemAppOrigin(): string {
  const url = new URL(getOemLoginUrl());
  return `${url.protocol}//${url.host}`;
}

export function getOemMakerCredentials(): OemCredentials | undefined {
  const username =
    process.env.OEM_MAKER_USERNAME?.trim() ||
    process.env.OEM_USERNAME?.trim();
  const password =
    process.env.OEM_MAKER_PASSWORD?.trim() ||
    process.env.OEM_PASSWORD?.trim();
  if (!username || !password) {
    return undefined;
  }
  return { username, password };
}

export function getOemCheckerCredentials(): OemCredentials | undefined {
  const username = process.env.OEM_CHECKER_USERNAME?.trim();
  const password = process.env.OEM_CHECKER_PASSWORD?.trim();
  if (!username || !password) {
    return undefined;
  }
  return { username, password };
}

export function getInvoiceFinancingPath(): string {
  return (
    process.env.INVOICE_FINANCING_PATH?.trim() || "/oem/invoices"
  );
}

export function getAuditTrackingPath(): string {
  return process.env.AUDIT_TRACKING_PATH?.trim() || "/oem/audit";
}

export function getDealerLimitsPath(): string {
  return (
    process.env.DEALER_LIMITS_PATH?.trim() ||
    process.env.OEM_DEALER_LIMITS_PATH?.trim() ||
    "/oem/dealer-limits"
  );
}

export function getOemCheckerQueuePath(): string {
  return (
    process.env.OEM_CHECKER_QUEUE_PATH?.trim() ||
    process.env.CHECKER_QUEUE_PATH?.trim() ||
    "/oem/checker-queue"
  );
}
