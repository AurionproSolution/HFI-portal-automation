/**
 * Honda Financial Services — Reset Password / Forgot Password (TC-001 … TC-048 → HFS-T0043 … HFS-T0090)
 */

import { test } from "@playwright/test";
import { RESET_PASSWORD_CASES } from "@testData/hfi/resetPasswordCatalog";
import { resetPasswordHandlers } from "../../reset-password/resetPassword.handlers";

const CASE = Object.fromEntries(
  RESET_PASSWORD_CASES.map((c) => [c.id, c]),
) as Record<string, (typeof RESET_PASSWORD_CASES)[number]>;

function priorityTag(p: string): string {
  return `@${p.toLowerCase()}`;
}

function typeTag(t: string): string {
  return `@${t.toLowerCase()}`;
}

test.describe("Honda Dealer Portal - Reset Password Suite @honda @reset-password @regression", () => {
  test.setTimeout(120_000);

  for (const catalogCase of RESET_PASSWORD_CASES) {
    const handler = resetPasswordHandlers[catalogCase.legacyId];
    test(`${catalogCase.id} - ${catalogCase.title} ${typeTag(catalogCase.type)} ${priorityTag(catalogCase.priority)} @honda`, async ({
      page,
    }) => {
      if (!handler) {
        test.skip(true, `No automation handler for ${catalogCase.legacyId}`);
      }
      try {
        await handler(page);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("SKIP:")) {
          test.skip(true, msg.replace(/^SKIP:\s*/, ""));
        }
        throw e;
      }
    });
  }
});

export { CASE };
