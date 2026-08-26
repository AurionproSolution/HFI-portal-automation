import type { Page } from "@playwright/test";

export async function readAuthTokenFromPage(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      if (/token|auth|access|jwt/i.test(key)) {
        const value = localStorage.getItem(key);
        if (value && value.length > 10) {
          return value;
        }
      }
    }
    return null;
  });
}
