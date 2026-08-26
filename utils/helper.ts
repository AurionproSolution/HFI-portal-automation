import { logger } from "./logger";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  action: () => Promise<T>,
  options: { retries?: number; delayMs?: number; label?: string } = {},
): Promise<T> {
  const retries = options.retries ?? 2;
  const delayMs = options.delayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        logger.warn(
          `${options.label ?? "retry"} failed (attempt ${attempt + 1}/${retries + 1}), retrying...`,
        );
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

export function randomString(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
