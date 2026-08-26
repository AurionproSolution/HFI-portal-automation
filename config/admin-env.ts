/**
 * Admin Console — environment URLs and credential accessors.
 * Admin Console is a dedicated portal at /admin (not OEM /oem/login).
 */

import { getCurrentEnv } from "./env";
import {
  getOemCheckerCredentials,
  getOemMakerCredentials,
  type OemCredentials,
} from "./oem-env";

export interface AdminCredentials extends OemCredentials {}

const ADMIN_BASE_URLS: Partial<Record<string, string>> = {
  dev: "http://devdealerportal.centralindia.cloudapp.azure.com/admin",
  uat: "http://uatdealerportal.centralindia.cloudapp.azure.com/admin",
};

const ADMIN_PATH_DEFAULTS = {
  portalUsers: "/admin",
  notificationTemplates: "/admin/notification-templates",
  loginComms: "/admin/support-comms",
  dashboard: "/admin",
} as const;

export function getAdminBaseUrl(): string {
  const explicit =
    process.env.ADMIN_BASE_URL?.trim() ||
    process.env.ADMIN_LOGIN_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/login\/?$/, "").replace(/\/$/, "");
  }
  const envDefault = ADMIN_BASE_URLS[getCurrentEnv()];
  return envDefault ?? ADMIN_BASE_URLS.dev!;
}

export function getAdminLoginUrl(): string {
  const explicit = process.env.ADMIN_LOGIN_URL?.trim();
  if (explicit) return explicit;
  return `${getAdminBaseUrl()}/login`;
}

export function getAdminAppOrigin(): string {
  const url = new URL(getAdminBaseUrl());
  return `${url.protocol}//${url.host}`;
}

export function getAdminDashboardPath(): string {
  return process.env.ADMIN_DASHBOARD_PATH?.trim() || ADMIN_PATH_DEFAULTS.dashboard;
}

export function getPortalUsersPath(): string {
  return (
    process.env.ADMIN_PORTAL_USERS_PATH?.trim() ||
    process.env.PORTAL_USERS_PATH?.trim() ||
    ADMIN_PATH_DEFAULTS.portalUsers
  );
}

export function getNotificationTemplatesPath(): string {
  return (
    process.env.ADMIN_NOTIFICATION_TEMPLATES_PATH?.trim() ||
    process.env.NOTIFICATION_TEMPLATES_PATH?.trim() ||
    ADMIN_PATH_DEFAULTS.notificationTemplates
  );
}

export function getLoginCommsPath(): string {
  return (
    process.env.ADMIN_LOGIN_COMMS_PATH?.trim() ||
    process.env.LOGIN_COMMS_PATH?.trim() ||
    ADMIN_PATH_DEFAULTS.loginComms
  );
}

/** Admin Console credentials. */
export function getAdminCredentials(): AdminCredentials | undefined {
  const username =
    process.env.ADMIN_USERNAME?.trim() ||
    process.env.OEM_ADMIN_USERNAME?.trim();
  const password =
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.OEM_ADMIN_PASSWORD?.trim();
  if (!username || !password) {
    return undefined;
  }
  return { username, password };
}

export function getAdminNfrSlaMs(): number {
  const raw = process.env.ADMIN_NFR_SLA_MS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 5_000;
}

export function getCurrentAdminEnvLabel(): string {
  return getCurrentEnv();
}

export function isLoginCommsSaveAllowed(): boolean {
  return process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE?.trim() === "true";
}

export { getOemMakerCredentials, getOemCheckerCredentials };
