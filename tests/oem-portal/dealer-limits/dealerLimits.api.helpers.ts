import type { Page, Response } from "@playwright/test";

const DEALER_LIMITS_API_PATTERN =
  /dealer[-_]?limits?|retrieve.*dealer|limits\/dealers/i;

export interface CapturedDealerLimitsApi {
  url: string;
  status: number;
  body: unknown;
}

export function isDealerLimitsApiUrl(url: string): boolean {
  return (
    /dealer[-_]?limits?|retrieve.*dealer|limits\/dealers|\/oem\/.*limit/i.test(
      url,
    ) && !/\.(js|css|png|jpg|svg|woff|ico)(\?|$)/i.test(url)
  );
}

export function watchDealerLimitsApi(
  page: Page,
): Promise<CapturedDealerLimitsApi> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      page.off("response", onResponse);
      reject(new Error("Dealer limits API response not captured within 60s"));
    }, 60_000);

    const onResponse = async (response: Response) => {
      const url = response.url();
      if (!isDealerLimitsApiUrl(url)) {
        return;
      }
      if (response.request().method() !== "GET") {
        return;
      }
      const contentType = response.headers()["content-type"] ?? "";
      if (!contentType.includes("json")) {
        return;
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return;
      }
      clearTimeout(timeout);
      page.off("response", onResponse);
      resolve({ url, status: response.status(), body });
    };

    page.on("response", onResponse);
  });
}

export async function applyDealerLimitsLmsFailureRoute(page: Page): Promise<void> {
  await page.route("**/*", async (route) => {
    const req = route.request();
    const url = req.url();
    if (
      req.method() === "GET" &&
      isDealerLimitsApiUrl(url) &&
      (req.resourceType() === "xhr" || req.resourceType() === "fetch")
    ) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          message: "LMS Read-Only DB unavailable",
        }),
      });
      return;
    }
    await route.continue();
  });
}

export function extractDealerRecordsFromApiBody(
  body: unknown,
): Array<Record<string, unknown>> {
  if (!body || typeof body !== "object") {
    return [];
  }
  const root = body as Record<string, unknown>;
  const candidates = [
    root.data,
    root.dealers,
    root.items,
    root.records,
    root.results,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object",
      );
    }
  }
  if (Array.isArray(body)) {
    return body.filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    );
  }
  return [];
}

export function readDealerField(
  record: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return undefined;
}
