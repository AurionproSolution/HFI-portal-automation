/**
 * HFI Dealer Portal — environment URLs and credential accessors.
 * Driven by .env (ACTIVE_DEALER + testData/hfi/dealers.json) or legacy DEALER_CODE/PASSWORD.
 */

import {
  applyActiveDealerToProcessEnv,
  getActiveDealerProfile,
  getDealerLoginPassword,
  getFirstDealerInGroup,
  getLoginUsername,
  loadDealersRegistry,
} from "./dealer-registry";

export type TestEnvironment = "dev" | "qat" | "sit" | "uat" | "prod";

export interface Credentials {
  username: string;
  password: string;
  dealerCode: string;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and set values.`,
    );
  }
  return value;
}

function resolveTestEnv(): TestEnvironment {
  const env = (process.env.TEST_ENV || "dev").toLowerCase();
  if (
    env === "dev" ||
    env === "qat" ||
    env === "sit" ||
    env === "uat" ||
    env === "prod"
  ) {
    return env;
  }
  return "dev";
}

const PORTAL_LOGIN_URLS: Partial<Record<TestEnvironment, string>> = {
  dev: "http://devdealerportal.centralindia.cloudapp.azure.com/login",
  uat: "http://uatdealerportal.centralindia.cloudapp.azure.com/login",
};

export function getBaseUrl(): string {
  const explicit =
    process.env.HFI_BASE_URL?.trim() || process.env.BASE_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const envDefault = PORTAL_LOGIN_URLS[resolveTestEnv()];
  if (envDefault) {
    return envDefault;
  }

  const registry = loadDealersRegistry();
  const fromRegistry = registry.meta.baseUrl?.trim();
  if (fromRegistry) {
    return `${fromRegistry}${registry.meta.loginPath || "/login"}`;
  }

  return requireEnv("BASE_URL");
}

export function getLoginUrl(): string {
  const loginPath = process.env.HFI_LOGIN_PATH?.trim() || "/login";
  const base = getBaseUrl();
  if (base.includes("/login")) {
    return base;
  }
  const origin = new URL(base.includes("://") ? base : `http://${base}`);
  return `${origin.protocol}//${origin.host}${loginPath.startsWith("/") ? loginPath : `/${loginPath}`}`;
}

export function getCredentials(): Credentials {
  applyActiveDealerToProcessEnv();
  const active = getActiveDealerProfile();
  if (active) {
    const { profile } = active;
    return {
      dealerCode: profile.dealerCode,
      username: getLoginUsername(profile),
      password: getDealerLoginPassword(profile),
    };
  }
  const dealerCode = requireEnv("DEALER_CODE");
  const username = process.env.USERNAME?.trim() || dealerCode;
  return {
    username,
    password: requireEnv("PASSWORD"),
    dealerCode,
  };
}

export function getEmailLoginUsername(): string | undefined {
  const active = getActiveDealerProfile();
  if (active?.profile.email) {
    return active.profile.email;
  }
  const email = process.env.EMAIL_USERNAME?.trim();
  return email || undefined;
}

export function requireEmailLoginUsername(): string {
  const email = getEmailLoginUsername();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(
      "HFS-T0005 requires EMAIL_USERNAME in .env (dealer registered email).",
    );
  }
  return email;
}

export interface MustResetCredentials {
  username: string;
  password: string;
  email?: string;
}

export function getMustResetCredentials(): MustResetCredentials | undefined {
  applyActiveDealerToProcessEnv();
  const active = getActiveDealerProfile();
  if (active?.group === "resetPassword") {
    const { profile } = active;
    const temp = profile.temporaryPassword?.trim() || getDealerLoginPassword(profile);
    return {
      username: profile.dealerCode,
      password: temp,
      email: profile.email,
    };
  }
  const username = process.env.MUST_RESET_USERNAME?.trim();
  const password = process.env.MUST_RESET_PASSWORD?.trim();
  const email = process.env.MUST_RESET_EMAIL?.trim();
  if (!username || !password) {
    return undefined;
  }
  return { username, password, email: email || undefined };
}

export function getMustResetLoginId(creds: MustResetCredentials): string {
  return creds.username;
}

export function isHttpsBaseUrl(): boolean {
  return getBaseUrl().toLowerCase().startsWith("https://");
}

export function getAppOrigin(): string {
  const url = new URL(getLoginUrl());
  return `${url.protocol}//${url.host}`;
}

export function getSessionIdleTimeoutMs(): number | undefined {
  const raw = process.env.SESSION_IDLE_TIMEOUT_MS?.trim();
  if (!raw) {
    return undefined;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export interface SuspendedAccountCredentials {
  username: string;
  password: string;
}

export function getSuspendedAccountCredentials():
  | SuspendedAccountCredentials
  | undefined {
  const username = process.env.SUSPENDED_USERNAME?.trim();
  const password = process.env.SUSPENDED_PASSWORD?.trim();
  if (!username || !password) {
    return undefined;
  }
  return { username, password };
}

export function getLockoutTestCredentials(): Credentials | undefined {
  const username = process.env.LOCKOUT_TEST_USERNAME?.trim();
  const password = process.env.LOCKOUT_TEST_PASSWORD?.trim();
  if (!username || !password) {
    return undefined;
  }
  return { username, password, dealerCode: username };
}

export function getForgotPasswordEmail(): string | undefined {
  return (
    process.env.FORGOT_PASSWORD_EMAIL?.trim() ||
    process.env.EMAIL_USERNAME?.trim() ||
    undefined
  );
}

export function allowDestructivePasswordReset(): boolean {
  return process.env.RESET_TEST_ALLOW_PASSWORD_CHANGE === "true";
}

export function getNewPasswordForResetTest(): string | undefined {
  return process.env.RESET_TEST_NEW_PASSWORD?.trim();
}

export interface OnboardingCredentials {
  dealerCode: string;
  email: string;
  password: string;
  applicationId?: string;
}

export function getSingleSessionTestCredentials(): {
  username: string;
  password: string;
  postLoginPath: string;
} {
  const onboardingEmail = process.env.ONBOARDING_EMAIL?.trim();
  const onboardingPassword = process.env.ONBOARDING_PASSWORD?.trim();
  const dealerFinanceEnabled =
    process.env.IS_DEALER_FINANCE_ENABLED?.trim().toLowerCase() !== "false";
  if (onboardingEmail && onboardingPassword) {
    return {
      username: onboardingEmail,
      password: onboardingPassword,
      postLoginPath: dealerFinanceEnabled ? "/consumer-finance" : "/onboarding",
    };
  }
  const creds = getCredentials();
  return {
    username: creds.username,
    password: creds.password,
    postLoginPath: "/consumer-finance",
  };
}

export function getOnboardingCredentials(): OnboardingCredentials {
  applyActiveDealerToProcessEnv();
  const active = getActiveDealerProfile();
  if (active?.group === "applicationIncomplete") {
    const { profile } = active;
    return {
      dealerCode: profile.dealerCode,
      email: profile.email,
      password: getDealerLoginPassword(profile),
      applicationId: process.env.ONBOARDING_APPLICATION_ID?.trim(),
    };
  }

  const dealerCode = process.env.ONBOARDING_DEALER_CODE?.trim();
  const email = process.env.ONBOARDING_EMAIL?.trim();
  const password = process.env.ONBOARDING_PASSWORD?.trim();
  if (dealerCode && email && password) {
    return {
      dealerCode,
      email,
      password,
      applicationId: process.env.ONBOARDING_APPLICATION_ID?.trim(),
    };
  }

  const fallback = getFirstDealerInGroup("applicationIncomplete");
  if (fallback) {
    const { profile } = fallback;
    return {
      dealerCode: profile.dealerCode,
      email: profile.email,
      password: getDealerLoginPassword(profile),
      applicationId: process.env.ONBOARDING_APPLICATION_ID?.trim(),
    };
  }

  throw new Error(
    "Onboarding credentials required: set ACTIVE_DEALER to an applicationIncomplete dealer (e.g. dealer4) or ONBOARDING_* in .env",
  );
}

export function isDealerFinanceEnabledForOnboarding(): boolean {
  const active = getActiveDealerProfile();
  if (active) {
    return active.profile.isDealerFinanceEnabled;
  }
  return process.env.IS_DEALER_FINANCE_ENABLED?.trim().toLowerCase() !== "false";
}

export function isHeadless(): boolean {
  return (process.env.HEADLESS ?? "true").toLowerCase() !== "false";
}
