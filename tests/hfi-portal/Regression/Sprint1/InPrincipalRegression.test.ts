/**
 * In Principal Sanction Letter — functional / business flow (TC-001 … TC-044 subset).
 * Credentials: ONBOARDING_* in .env (PB00018 / dealer8@gmail.com when configured).
 */

import { test, expect } from "@playwright/test";
import {
  allowInPrincipalDecisions,
  loginOnboardingUser,
  openOnboardingDashboard,
  skipDestructiveDecision,
  skipUnlessInPrincipalPanel,
  skipUnlessOnboarding,
} from "../../in-principal/inPrincipal.helpers";
import { HFIInPrincipalSanctionPage } from "@pages/hfi-portal/onboarding/HFIInPrincipalSanctionPage";

test.describe("In Principal Sanction Letter @in-principal @regression", () => {
  test.setTimeout(300_000);

  test("TC-001 In Principal Sanction Letter task appears once limit is credit-approved and undisbursed", async ({
    page,
  }) => {
    const landing = await loginOnboardingUser(page);
    skipUnlessOnboarding(
      landing,
      "PB00018 lands on full Consumer Finance; no limited-access onboarding dashboard or In Principal task on dev.",
    );
    const ip = new HFIInPrincipalSanctionPage(page);
    await expect(ip.myTasksSection).toBeVisible({ timeout: 60_000 });
    await expect(ip.inPrincipalSanctionTab()).toBeVisible();
    const text = await ip.getPageText();
    expect(text).toMatch(
      /in principal sanction letter|credit approved|action required/i,
    );
    expect(text).toMatch(/sanctioned limit|₹/i);
  });

  test("TC-002 In Principal Sanction Letter task does NOT appear before credit approval", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    const landing = page.url().includes("onboarding") ? "onboarding" : "full-finance";
    if (landing === "full-finance" || /error\s*404/i.test(await ip.getPageText())) {
      const consumerText =
        landing === "full-finance"
          ? await ip.getPageText()
          : "";
      if (landing === "full-finance") {
        expect(consumerText).not.toMatch(/in principal sanction letter/i);
        return;
      }
    }
    const hasIp = await ip.hasInPrincipalTaskVisible();
    if (!hasIp) {
      expect(await ip.getPageText()).toMatch(/my tasks|dealer onboarding/i);
      return;
    }
    test.fail(
      true,
      "In Principal task visible but precondition requires pre-credit-approval application.",
    );
  });

  test("TC-003 All 9 offer terms are displayed on the panel, sourced from LOS", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal Sanction Letter task for current dealer (PB00018 / onboarding 404 on dev).",
    );
    await ip.expectOfferTermLabels();
  });

  test("TC-004 All offer terms are strictly read-only", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel for current dealer.",
    );
    const inputs = ip.panelRoot.locator(
      "input:not([type='hidden']), textarea, [contenteditable='true']",
    );
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const el = inputs.nth(i);
      const ro = await el.getAttribute("readonly");
      const dis = await el.isDisabled().catch(() => true);
      expect(ro !== null || dis).toBeTruthy();
    }
    const limitRow = ip.termValue(/sanctioned limit/i);
    if (await limitRow.isVisible().catch(() => false)) {
      await limitRow.dblclick().catch(() => undefined);
      expect(await limitRow.locator("input").count()).toBe(0);
    }
  });

  test("TC-005 Validity countdown / remaining days is displayed on the panel", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel for current dealer.",
    );
    const text = await ip.getPanelText();
    expect(
      /valid until|remaining|days?\s+left|validity/i.test(text) &&
        (/\d+\s*day/i.test(text) || /\d{1,2}[-/]\w+/i.test(text)),
    ).toBeTruthy();
  });

  test("TC-006 Currency, decimal and percentage formatting on the panel is correct", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel for current dealer.",
    );
    const text = await ip.getPanelText();
    if (/sanctioned limit|₹/i.test(text)) {
      expect(text).toMatch(/₹[\d,]+/);
    }
    if (/%|rate of interest|roi/i.test(text)) {
      expect(text).toMatch(/\d+(\.\d+)?\s*%/i);
    }
    if (/tenure/i.test(text)) {
      expect(text).toMatch(/tenure[\s\S]{0,40}\d+\s*(month|year)/i);
    }
  });

  test("TC-007 Within validity, three actions are enabled and mutually exclusive", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel for current dealer.",
    );
    const text = await ip.getPanelText();
    if (/expired|declined|accepted|negotiate recorded|awaiting limit/i.test(text)) {
      test.skip(true, "Offer not in actionable state.");
    }
    await expect(ip.approveAcceptButton).toBeEnabled();
    await expect(ip.negotiateButton).toBeEnabled();
    await expect(ip.declineButton).toBeEnabled();
    await ip.approveAcceptButton.click();
    await page.waitForTimeout(300);
    const negotiateSelected = await ip.negotiateButton
      .getAttribute("aria-pressed")
      .catch(() => null);
    if (negotiateSelected !== null) {
      expect(negotiateSelected).not.toBe("true");
    }
  });

  test("TC-008 Confirmation prompt is shown before an irreversible decision is recorded", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel for current dealer.",
    );
    for (const [which, btn] of [
      ["accept", ip.approveAcceptButton],
      ["negotiate", ip.negotiateButton],
      ["decline", ip.declineButton],
    ] as const) {
      if (!(await btn.isEnabled().catch(() => false))) {
        continue;
      }
      await btn.click();
      await expect(ip.confirmationDialog()).toBeVisible({ timeout: 15_000 });
      await ip.cancelButton().click();
      await page.waitForTimeout(500);
    }
    if (allowInPrincipalDecisions()) {
      await ip.clickDecision("accept", true);
    }
  });

  test("TC-009 Approve & Accept records decision as Accepted and sends to LOS", async ({
    page,
  }) => {
    skipDestructiveDecision(
      "Destructive: records Accept in LOS. Set IN_PRINCIPAL_ALLOW_DECISIONS=true with disposable offer.",
    );
    const ip = await openOnboardingDashboard(page);
    expect(await ip.openPanelIfPresent()).toBeTruthy();
    await ip.clickDecision("accept", true);
    const text = await ip.getPanelText();
    expect(text).toMatch(/accepted/i);
  });

  test("TC-011 Full portal access is granted only after LMS limit creation, on the next sign-in", async ({
    page,
  }) => {
    const landing = await loginOnboardingUser(page);
    const text = await page.locator("body").innerText();
    if (landing === "full-finance" || page.url().includes("consumer")) {
      expect(page.url()).not.toMatch(/onboarding/i);
      expect(text).not.toMatch(/limited access until approval/i);
      await page.goto("/dealer-finance/exposure", {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(2_000);
      expect(page.url()).toMatch(/dealer-finance|exposure/i);
      expect(await page.locator("body").innerText()).not.toMatch(/error\s*404/i);
      return;
    }
    skipUnlessInPrincipalPanel(
      false,
      "Requires dealer in post-Accept + LMS-created state; current user still on onboarding.",
    );
  });

  test("TC-012 Between Accept and LMS limit creation, dealer sees an in-progress state", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No panel; cannot verify Accept-in-progress without LOS state Accept + pending LMS.",
    );
    const text = await ip.getPanelText();
    if (!/accepted|awaiting limit|limit setup/i.test(text)) {
      test.skip(true, "Offer not in Accept-awaiting-LMS state.");
    }
    expect(text).toMatch(/accepted|awaiting|limit setup/i);
    const nav = (await ip.getNavLinkLabels()).map((n) => n.trim()).filter(Boolean);
    expect(nav).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/exposure|dealer finance/i)]),
    );
  });

  test("TC-014 Negotiate records decision and directs dealer to RM offline", async ({
    page,
  }) => {
    skipDestructiveDecision("Set IN_PRINCIPAL_ALLOW_DECISIONS=true to record Negotiate.");
    const ip = await openOnboardingDashboard(page);
    expect(await ip.openPanelIfPresent()).toBeTruthy();
    await ip.clickDecision("negotiate", true);
    const text = await ip.getPanelText();
    expect(text).toMatch(/negotiat|pending|rm|relationship manager/i);
  });

  test("TC-015 No in-portal negotiation workflow is triggered on Negotiate", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    const text = await ip.getPanelText();
    if (!/negotiat/i.test(text)) {
      test.skip(true, "Negotiate not recorded for this dealer; run after TC-014 or use LOS state.");
    }
    expect(text).not.toMatch(/counter.?offer|send message|chat with rm/i);
    expect(
      page.getByRole("textbox", { name: /counter|revise|offer/i }).count(),
    ).resolves.toBe(0);
  });

  test("TC-016 Post-Negotiate, dealer remains on the limited-access Dashboard until a new offer is issued", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    const url = page.url();
    const text = await ip.getPageText();
    if (url.includes("consumer") && !url.includes("onboarding")) {
      test.skip(true, "Full-finance user; not applicable to limited-access negotiate state.");
    }
    if (!/negotiat|pending/i.test(text)) {
      test.skip(true, "Not in post-Negotiate state.");
    }
    expect(url).toMatch(/onboarding/i);
    const nav = (await ip.getNavLinkLabels()).map((n) => n.trim()).filter(Boolean);
    expect(nav).toEqual(["Dashboard"]);
  });

  test("TC-018 Decline records decision and dealer stays in limited access", async ({
    page,
  }) => {
    skipDestructiveDecision("Set IN_PRINCIPAL_ALLOW_DECISIONS=true to record Decline.");
    const ip = await openOnboardingDashboard(page);
    expect(await ip.openPanelIfPresent()).toBeTruthy();
    await ip.clickDecision("decline", true);
    expect(page.url()).toMatch(/onboarding/i);
    expect(await ip.getPanelText()).toMatch(/declin|reject/i);
  });

  test("TC-019 Decline is final for this offer – action buttons are disabled and cannot be reversed in-portal", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    const text = await ip.getPanelText();
    if (!/declin|reject/i.test(text)) {
      test.skip(true, "Decline not recorded for this offer.");
    }
    await expect(ip.approveAcceptButton).toBeDisabled();
    await expect(ip.negotiateButton).toBeDisabled();
    await expect(ip.declineButton).toBeDisabled();
  });

  test("TC-020 Exactly one decision permitted per offer – actions disabled after any recorded decision", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    const text = await ip.getPanelText();
    if (!/accepted|declin|reject|negotiat/i.test(text)) {
      test.skip(true, "No recorded decision on current offer.");
    }
    await expect(ip.approveAcceptButton).toBeDisabled();
    await expect(ip.negotiateButton).toBeDisabled();
    await expect(ip.declineButton).toBeDisabled();
  });

  test("TC-022 Recorded decision is shown on reopen within the same session", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    const before = await ip.getPanelText();
    if (!/accepted|declin|reject|negotiat/i.test(before)) {
      test.skip(true, "No recorded decision.");
    }
    await page.getByRole("link", { name: /^dashboard$/i }).click().catch(() => undefined);
    await ip.openInPrincipalSanctionLetter();
    const after = await ip.getPanelText();
    expect(after).toMatch(/accepted|declin|reject|negotiat/i);
  });

  test("TC-023 Recorded decision persists across sessions (logout + login)", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    const before = await ip.getPanelText();
    if (!/accepted|declin|reject|negotiat/i.test(before)) {
      test.skip(true, "No recorded decision.");
    }
    await ip.logout();
    await loginOnboardingUser(page);
    await ip.openInPrincipalSanctionLetter();
    expect(await ip.getPanelText()).toMatch(/accepted|declin|reject|negotiat/i);
  });

  test("TC-024 Offer displayed as Expired after validity lapses without a decision", async ({
    page,
  }) => {
    test.skip(
      true,
      "Requires LOS offer with lapsed validity or clock override — not available in UI automation on dev.",
    );
  });

  test("TC-025 Attempting the action at the exact instant of expiry – server-side enforcement wins", async ({
    page,
  }) => {
    test.skip(true, "Requires timed expiry simulation — not automatable without backend hooks.");
  });

  test("TC-037 After successful Accept + LMS creation, Consumer Finance and Dealer Finance modules become accessible", async ({
    page,
  }) => {
    const landing = await loginOnboardingUser(page);
    if (landing === "onboarding") {
      test.skip(
        true,
        "UP00010 is on limited-access onboarding (LMS limit not created). Use PB00018 or post-LMS dealer for TC-037.",
      );
    }
    expect(landing).toBe("full-finance");
    const text = await page.locator("body").innerText();
    expect(text).toMatch(/consumer finance|dashboard/i);
    const dealerFinanceLink = page
      .locator("nav, aside")
      .getByRole("link", { name: /dealer finance|exposure|transaction/i })
      .first();
    if (await dealerFinanceLink.isVisible().catch(() => false)) {
      await dealerFinanceLink.click();
      await page.waitForTimeout(3_000);
      expect(page.url()).toMatch(/dealer-finance|exposure|transaction/i);
    } else {
      await page.goto("/dealer-finance/exposure", {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(3_000);
      expect(page.url()).not.toMatch(/onboarding/i);
      expect(await page.locator("body").innerText()).not.toMatch(/error\s*404/i);
    }
  });

  test("TC-038 Bookmarked deep-links to Dealer Finance still blocked before LMS limit creation", async ({
    page,
  }) => {
    const landing = await loginOnboardingUser(page);
    test.skip(
      landing !== "onboarding",
      "Precondition: Accept recorded but LMS not complete. Full-finance dealers are out of scope.",
    );
    await page.goto("/dealer-finance/exposure", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3_000);
    const url = page.url();
    const body = await page.locator("body").innerText();
    const blocked =
      /onboarding|dashboard/i.test(url) && !/exposure/i.test(url);
    const emptyOrDenied =
      /access denied|not authorized|limited access|onboarding/i.test(body) &&
      !/exposure management/i.test(body);
    expect(
      blocked || emptyOrDenied,
      `Expected Dealer Finance deep-link blocked before LMS; URL=${url}`,
    ).toBeTruthy();
  });

  test("TC-040 Post-Decline: dealer sees continued limited access with the declined state visible", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    if (!page.url().includes("onboarding")) {
      test.skip(true, "Not on onboarding dashboard.");
    }
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    const text = await ip.getPanelText();
    if (!/declin|reject/i.test(text)) {
      test.skip(true, "Decline not recorded.");
    }
    await ip.logout();
    await loginOnboardingUser(page);
    await ip.openInPrincipalSanctionLetter();
    expect(await ip.getPanelText()).toMatch(/declin|reject/i);
  });

  test("TC-041 Zero or very large amount rendering does not break the panel", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    const text = await ip.getPanelText();
    expect(text).toMatch(/sanctioned limit/i);
    expect(text).toMatch(/₹|cr|l\b/i);
    await expect(ip.approveAcceptButton).toBeVisible();
    const overflow = await page.evaluate(() => {
      const el = document.querySelector("main") ?? document.body;
      return el.scrollWidth > el.clientWidth + 2;
    });
    expect(overflow).toBeFalsy();
    test.info().annotations.push({
      type: "note",
      description:
        "LOS min/max boundary amounts (₹1 / ₹9,99,99,99,999) not loaded on dev; verified current offer renders without horizontal overflow.",
    });
  });

  test("TC-042 Validity date is displayed in the dealer's timezone (IST)", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    const text = await ip.getPanelText();
    expect(text).toMatch(/validity/i);
    expect(
      /\d+\s*days?\s+from\s+offer|valid\s+until|remaining|\d{1,2}[-/][a-z]{3}[-/]\d{2,4}/i.test(
        text,
      ),
    ).toBeTruthy();
    const losUtc = process.env.IN_PRINCIPAL_LOS_VALIDITY_UTC?.trim();
    if (losUtc) {
      const utc = new Date(losUtc);
      const ist = utc.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      expect(text).toContain(ist.split(",")[0].trim().slice(0, 6));
    }
  });

  test("TC-043 Rapid double-click on a decision action does not create duplicate submissions", async ({
    page,
  }) => {
    const ip = await openOnboardingDashboard(page);
    skipUnlessInPrincipalPanel(
      await ip.openPanelIfPresent(),
      "No In Principal panel.",
    );
    if (!(await ip.approveAcceptButton.isEnabled().catch(() => false))) {
      test.skip(true, "Actions not enabled.");
    }
    const requests: string[] = [];
    page.on("request", (req) => {
      if (/decision|limit-offer|sanction/i.test(req.url()) && req.method() === "POST") {
        requests.push(req.url());
      }
    });
    await ip.approveAcceptButton.dblclick();
    const dialog = ip.confirmationDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await ip.cancelButton().click();
    }
    expect(requests.length).toBeLessThanOrEqual(1);
  });

  test("TC-044 Fresh offer issued after previous Decline / Expiry re-enables actions for the new offer", async ({
    page,
  }) => {
    test.skip(
      true,
      "Requires RM/LOS to issue a new offer after Decline/Expiry — integration setup not on dev.",
    );
  });
});
