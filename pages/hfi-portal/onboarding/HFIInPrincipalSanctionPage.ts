import { expect, type Locator, type Page } from "@playwright/test";
import { HFIOnboardingDashboardPage } from "./HFIOnboardingDashboardPage";

/** In Principal Sanction Letter panel (onboarding dashboard). */
export class HFIInPrincipalSanctionPage extends HFIOnboardingDashboardPage {
  readonly panelRoot: Locator;
  readonly approveAcceptButton: Locator;
  readonly negotiateButton: Locator;
  readonly declineButton: Locator;

  constructor(page: Page) {
    super(page);
    this.panelRoot = page
      .locator("main, [role='main'], section")
      .filter({ hasText: /in principal sanction letter|sanctioned limit/i })
      .first();
    this.approveAcceptButton = page.getByRole("button", {
      name: /approve\s*&\s*accept|accept limit/i,
    });
    this.negotiateButton = page.getByRole("button", { name: /^negotiate$/i });
    this.declineButton = page
      .getByRole("button", { name: /^decline$/i })
      .or(page.getByRole("button", { name: /^reject$/i }));
  }

  async hasInPrincipalTaskVisible(): Promise<boolean> {
    const tab = this.inPrincipalSanctionTab();
    return tab.isVisible().catch(() => false);
  }
  
  async openPanelIfPresent(): Promise<boolean> {
    if (!(await this.hasInPrincipalTaskVisible())) {
      return false;
    }
    await this.openInPrincipalSanctionLetter();
    return true;
  }

  termValue(label: RegExp): Locator {
    return this.page
      .locator("div, li, tr, p, span")
      .filter({ has: this.page.getByText(label) })
      .first();
  }

  async getPanelText(): Promise<string> {
    return this.page.locator("body").innerText();
  }

  confirmationDialog(): Locator {
    return this.page
      .getByRole("dialog")
      .or(this.page.locator("[role='alertdialog']"))
      .filter({ hasText: /confirm|are you sure/i });
  }

  confirmButton(): Locator {
    return this.page
      .getByRole("button", { name: /^confirm$/i })
      .or(this.page.getByRole("button", { name: /yes,?\s*confirm/i }));
  }

  cancelButton(): Locator {
    return this.page.getByRole("button", { name: /^cancel$/i });
  }

  async expectOfferTermLabels(): Promise<void> {
    const text = await this.getPanelText();
    const required = [
      /sanctioned limit/i,
      /requested/i,
      /tenure/i,
      /rate of interest|interest rate|roi/i,
      /processing fee/i,
      /validity/i,
      /collateral/i,
      /personal guarantee|guarantee/i,
      /renewal/i,
    ];
    for (const re of required) {
      expect(text, `Missing term matching ${re}`).toMatch(re);
    }
  }

  async clickDecision(
    which: "accept" | "negotiate" | "decline",
    confirm: boolean,
  ): Promise<void> {
    const btn =
      which === "accept"
        ? this.approveAcceptButton
        : which === "negotiate"
          ? this.negotiateButton
          : this.declineButton;
    await btn.click();
    const dialog = this.confirmationDialog();
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    if (confirm) {
      await this.confirmButton().click();
    } else {
      await this.cancelButton().click();
    }
    await this.waitForLoader();
  }

  navLinkMatching(name: RegExp): Locator {
    return this.page.locator("nav, aside").getByRole("link", { name });
  }
}
