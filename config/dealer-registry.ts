/**
 * HFI dealer credential registry — single source of truth.
 * Switch active dealer via ACTIVE_DEALER=dealer8 in .env (no test file changes).
 */

import fs from "fs";
import path from "path";

export type DealerApplicationState =
  | "applicationCompleted"
  | "applicationIncomplete"
  | "resetPassword"
  | "invalid";

export interface DealerProfile {
  label: string;
  dealerCode: string;
  email: string;
  password: string;
  temporaryPassword: string;
  isDealerFinanceEnabled: boolean;
  expectedState: string;
  actualState: string;
  assignedGroup: DealerApplicationState;
  verificationStatus: string;
  notes?: string;
  invalidReason?: string;
}

export interface DealersRegistry {
  meta: {
    description: string;
    baseUrl: string;
    loginPath: string;
    defaultActiveDealer: string;
    lastVerified: string | null;
    verificationNotes?: string;
  };
  applicationCompleted: Record<string, DealerProfile>;
  applicationIncomplete: Record<string, DealerProfile>;
  resetPassword: Record<string, DealerProfile>;
  invalid: Record<string, DealerProfile>;
}

const REGISTRY_PATH = path.join(
  process.cwd(),
  "testData",
  "hfi",
  "dealers.json",
);

let cachedRegistry: DealersRegistry | null = null;

export function loadDealersRegistry(): DealersRegistry {
  if (!cachedRegistry) {
    cachedRegistry = JSON.parse(
      fs.readFileSync(REGISTRY_PATH, "utf8"),
    ) as DealersRegistry;
  }
  return cachedRegistry;
}

export function getDealerGroups(): DealerApplicationState[] {
  return [
    "applicationCompleted",
    "applicationIncomplete",
    "resetPassword",
    "invalid",
  ];
}

export function findDealerEntry(
  dealerKey: string,
): { group: DealerApplicationState; profile: DealerProfile } | undefined {
  const registry = loadDealersRegistry();
  for (const group of getDealerGroups()) {
    const profile = registry[group][dealerKey];
    if (profile) {
      return { group, profile };
    }
  }
  return undefined;
}

export function getActiveDealerKey(): string | undefined {
  return (
    process.env.ACTIVE_DEALER?.trim().toLowerCase() ||
    process.env.active_dealer?.trim().toLowerCase() ||
    undefined
  );
}

export function resolveActiveDealerKey(): string | undefined {
  const explicit = getActiveDealerKey();
  if (explicit) {
    return explicit;
  }
  const registry = loadDealersRegistry();
  return registry.meta.defaultActiveDealer || undefined;
}

/** Login password: permanent password if set, otherwise temporary (reset flow). */
export function getDealerLoginPassword(profile: DealerProfile): string {
  const permanent = profile.password?.trim();
  if (permanent) {
    return permanent;
  }
  const temp = profile.temporaryPassword?.trim();
  if (temp) {
    return temp;
  }
  throw new Error(
    `Dealer ${profile.label} (${profile.dealerCode}) has no password or temporaryPassword.`,
  );
}

export function getLoginUsername(profile: DealerProfile): string {
  return profile.email?.trim() || profile.dealerCode;
}

/**
 * Applies ACTIVE_DEALER credentials to process.env so legacy env reads stay in sync.
 * Called once when config/env is loaded.
 */
export function applyActiveDealerToProcessEnv(): void {
  const dealerKey = resolveActiveDealerKey();
  if (!dealerKey) {
    return;
  }

  const entry = findDealerEntry(dealerKey);
  if (!entry) {
    throw new Error(
      `ACTIVE_DEALER="${dealerKey}" not found in testData/hfi/dealers.json`,
    );
  }

  const { group, profile } = entry;
  const loginPassword = getDealerLoginPassword(profile);

  process.env.DEALER_CODE = profile.dealerCode;
  process.env.USERNAME = profile.dealerCode;
  process.env.EMAIL_USERNAME = profile.email;
  process.env.PASSWORD = loginPassword;
  process.env.IS_DEALER_FINANCE_ENABLED = String(profile.isDealerFinanceEnabled);

  if (group === "applicationIncomplete") {
    process.env.ONBOARDING_DEALER_CODE = profile.dealerCode;
    process.env.ONBOARDING_EMAIL = profile.email;
    process.env.ONBOARDING_PASSWORD = loginPassword;
  }

  if (group === "resetPassword") {
    process.env.MUST_RESET_USERNAME = profile.dealerCode;
    process.env.MUST_RESET_PASSWORD = profile.temporaryPassword || loginPassword;
    process.env.MUST_RESET_EMAIL = profile.email;
  }

  if (!process.env.BASE_URL?.trim() && !process.env.HFI_BASE_URL?.trim()) {
    const base = loadDealersRegistry().meta.baseUrl;
    process.env.BASE_URL = `${base}${loadDealersRegistry().meta.loginPath}`;
  }
}

export function getActiveDealerProfile():
  | { key: string; group: DealerApplicationState; profile: DealerProfile }
  | undefined {
  const key = resolveActiveDealerKey();
  if (!key) {
    return undefined;
  }
  const entry = findDealerEntry(key);
  if (!entry) {
    return undefined;
  }
  return { key, group: entry.group, profile: entry.profile };
}

/** First dealer in a group (for suites that need a specific state when ACTIVE_DEALER differs). */
export function getFirstDealerInGroup(
  group: DealerApplicationState,
): { key: string; profile: DealerProfile } | undefined {
  const registry = loadDealersRegistry();
  const entries = Object.entries(registry[group]);
  if (entries.length === 0) {
    return undefined;
  }
  const [key, profile] = entries[0];
  return { key, profile };
}

export function listAllDealers(): Array<{
  key: string;
  group: DealerApplicationState;
  profile: DealerProfile;
}> {
  const registry = loadDealersRegistry();
  const out: Array<{
    key: string;
    group: DealerApplicationState;
    profile: DealerProfile;
  }> = [];
  for (const group of getDealerGroups()) {
    for (const [key, profile] of Object.entries(registry[group])) {
      out.push({ key, group, profile });
    }
  }
  return out;
}
