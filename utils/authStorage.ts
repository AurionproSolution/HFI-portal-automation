import type { Page } from "@playwright/test";

export interface AuthStorageSnapshot {
  localStorageKeys: string[];
  sessionStorageKeys: string[];
  cookieNames: string[];
}

const AUTH_KEY_PATTERN = /token|auth|session|jwt|bearer/i;

export async function snapshotAuthStorage(page: Page): Promise<AuthStorageSnapshot> {
  const storage = await page.evaluate((pattern) => {
    const re = new RegExp(pattern, "i");
    const localStorageKeys: string[] = [];
    const sessionStorageKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && re.test(key)) {
        localStorageKeys.push(key);
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && re.test(key)) {
        sessionStorageKeys.push(key);
      }
    }
    return { localStorageKeys, sessionStorageKeys };
  }, AUTH_KEY_PATTERN.source);

  const cookies = await page.context().cookies();
  const cookieNames = cookies
    .filter((c) => AUTH_KEY_PATTERN.test(c.name))
    .map((c) => c.name);

  return {
    localStorageKeys: storage.localStorageKeys,
    sessionStorageKeys: storage.sessionStorageKeys,
    cookieNames,
  };
}

export function hasAuthArtifacts(snapshot: AuthStorageSnapshot): boolean {
  return (
    snapshot.localStorageKeys.length > 0 ||
    snapshot.sessionStorageKeys.length > 0 ||
    snapshot.cookieNames.length > 0
  );
}
