import fs from "fs";
import path from "path";
import type { Page, TestInfo } from "@playwright/test";

/** Stable evidence folder (Playwright clears test-results/ on each run). */
export const SPRINT2_EVIDENCE_SUBDIR = path.join("reports", "sprint2-evidence");

export function isSprint2EvidenceCaptureEnabled(): boolean {
  return process.env.SPRINT2_EVIDENCE_CAPTURE === "1";
}

export function parseTcIdFromTitle(title: string): string | null {
  const match = title.match(/\b(TC[-_][A-Z0-9]+_\d{3}|TC-\d{3})\b/i);
  return match ? match[1].toUpperCase() : null;
}

export function buildPassEvidenceFileName(storyId: string, tcId: string): string {
  return `${storyId}-${tcId}-PASS.png`;
}

export function getPassEvidenceRelativePath(storyId: string, tcId: string): string {
  return path
    .join(SPRINT2_EVIDENCE_SUBDIR, buildPassEvidenceFileName(storyId, tcId))
    .replace(/\\/g, "/");
}

export function getPassEvidenceAbsolutePath(storyId: string, tcId: string): string {
  return path.join(process.cwd(), getPassEvidenceRelativePath(storyId, tcId));
}

export function shouldCapturePassEvidence(testInfo: TestInfo): boolean {
  if (!isSprint2EvidenceCaptureEnabled()) {
    return false;
  }
  if (testInfo.errors.length > 0) {
    return false;
  }
  if (
    testInfo.status === "failed" ||
    testInfo.status === "timedOut" ||
    testInfo.status === "skipped" ||
    testInfo.status === "interrupted"
  ) {
    return false;
  }
  return true;
}

export async function captureSprint2PassEvidence(
  page: Page,
  testInfo: TestInfo,
  storyId: string,
): Promise<string | undefined> {
  if (!shouldCapturePassEvidence(testInfo)) {
    return undefined;
  }

  const tcId = parseTcIdFromTitle(testInfo.title);
  if (!tcId) {
    return undefined;
  }

  const absolutePath = getPassEvidenceAbsolutePath(storyId, tcId);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

  try {
    await page.screenshot({ path: absolutePath, fullPage: true });
    await testInfo.attach(path.basename(absolutePath), {
      path: absolutePath,
      contentType: "image/png",
    });
    return getPassEvidenceRelativePath(storyId, tcId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[sprint2-evidence] ${storyId}-${tcId}: ${message}`);
    return undefined;
  }
}

type PlaywrightTest = typeof import("@playwright/test").test;

export function registerSprint2PassEvidence(test: PlaywrightTest, storyId: string): void {
  test.afterEach(async ({ page }, testInfo) => {
    await captureSprint2PassEvidence(page, testInfo, storyId);
  });
}
