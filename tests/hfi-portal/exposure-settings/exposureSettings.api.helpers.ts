import type { Page, Response } from "@playwright/test";

const EXPOSURE_API_PATTERN =
  /exposure|limit[-_]?request|financials\/exposure|dealer[-_]?limit|los.*limit/i;

export interface CapturedExposureApi {
  url: string;
  status: number;
  body: unknown;
}

export function isExposureApiUrl(url: string): boolean {
  return (
    EXPOSURE_API_PATTERN.test(url) &&
    !/\.(js|css|png|jpg|svg|woff|ico|html)(\?|$)/i.test(url)
  );
}

export function watchExposureApi(page: Page): Promise<CapturedExposureApi> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      page.off("response", onResponse);
      reject(new Error("Exposure API response not captured within 60s"));
    }, 60_000);

    const onResponse = async (response: Response) => {
      const url = response.url();
      if (!isExposureApiUrl(url)) {
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

export async function applyExposureDataFailureRoute(page: Page): Promise<void> {
  await page.route("**/*", async (route) => {
    const req = route.request();
    const url = req.url();
    if (
      req.method() === "GET" &&
      isExposureApiUrl(url) &&
      (req.resourceType() === "xhr" || req.resourceType() === "fetch")
    ) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          message: "LOS unavailable",
        }),
      });
      return;
    }
    await route.continue();
  });
}

export async function applyExposureLosSubmitFailureRoute(
  page: Page,
): Promise<void> {
  let failCount = 0;
  await page.route("**/*", async (route) => {
    const req = route.request();
    const url = req.url();
    const isSubmit =
      (req.method() === "POST" || req.method() === "PUT") &&
      /limit[-_]?request|adhoc|renewal|exposure/i.test(url) &&
      (req.resourceType() === "xhr" || req.resourceType() === "fetch");

    if (isSubmit && failCount < 1) {
      failCount += 1;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "LOS submission failed" }),
      });
      return;
    }
    await route.continue();
  });
}

export function extractNumericFields(body: unknown): number[] {
  const values: number[] = [];
  const walk = (node: unknown): void => {
    if (node === null || node === undefined) {
      return;
    }
    if (typeof node === "number" && Number.isFinite(node)) {
      values.push(node);
      return;
    }
    if (typeof node === "string") {
      const digits = node.replace(/[^\d.]/g, "");
      if (digits && Number.isFinite(Number(digits))) {
        values.push(Number(digits));
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === "object") {
      Object.values(node as Record<string, unknown>).forEach(walk);
    }
  };
  walk(body);
  return values;
}
