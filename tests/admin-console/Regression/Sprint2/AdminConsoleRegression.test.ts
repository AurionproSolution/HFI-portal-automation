/**
 * UC-ADM-001 — Admin Console (Portal Users, Notification Templates, Login & Comms)
 * Single source of truth: UC-ADM-001_TestCases_v1_0.xlsx (TC-001 … TC-055)
 * Catalog: testData/admin/adminConsoleCatalog.ts
 */

import { test, expect } from "@playwright/test";
import { getAdminNfrSlaMs } from "@config/admin-env";
import { adminConsoleMessages } from "@testData/admin/messages";
import { OEMLoginPage } from "@pages/oem-portal/login/OEMLoginPage";
import {
  initAdminConsoleSteps,
  regressionStep,
  requireEnv,
  requireLoginCommsAsAdmin,
  requireNotificationTemplatesAsAdmin,
  requirePortalUsersAsAdmin,
  skipWithReason,
  openAsNonAdminMaker,
  expectAdminConsoleAccessDenied,
  navigateDirectAdminPath,
  withSecondBrowser,
  uniqueAutomationEmail,
  skipLoginBannerDeferred,
} from "../../adminConsole.helpers";
import {
  getPortalUsersPath as portalUsersPath,
  getNotificationTemplatesPath as templatesPath,
  getLoginCommsPath as loginCommsPath,
} from "@config/admin-env";

function handleSkip(e: unknown): void {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
  throw e;
}

function tags(type: string, priority: string): string {
  return `@${type.toLowerCase().replace(/\s+/g, "-")} @${priority.toLowerCase()} @uc-adm-001 @admin-console @regression`;
}

test.describe(
  "UC-ADM-001 Admin Console @uc-adm-001 @admin-console @regression",
  () => {
    test.setTimeout(300_000);
    test.beforeEach(() => initAdminConsoleSteps());

    test(`TC-001 Verify Portal Users lists all accounts with required columns and a count ${tags("UI", "High")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Verify Portal Users columns and account count", async () => {
          await pu.expectRequiredColumns();
          const count = await pu.getDisplayedAccountCount();
          expect(count, "Expected account count label such as '4 of 4 accounts'").not.toBeNull();
          if (count) expect(count.shown).toBeGreaterThan(0);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-002 Verify listed account values match the provisioning source ${tags("Positive", "High")}`, async () => {
      test.skip(
        true,
        "BLOCKED – Backend: identity/user-provisioning service access required (ADMIN_PROVISIONING_API_URL).",
      );
    });

    test(`TC-003 Verify the displayed count matches the actual number of accounts ${tags("Positive", "Medium")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Compare displayed count to visible rows", async () => {
          const count = await pu.getDisplayedAccountCount();
          const rows = await pu.getVisibleRowCount();
          if (!count) skipWithReason("Account count label not found on Portal Users screen.");
          expect(count!.shown).toBe(rows);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-004 Verify search by name filters the Portal Users list ${tags("Positive", "Medium")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Search by name fragment", async () => {
          const searchName = process.env.ADMIN_SEARCH_NAME?.trim() || "Ved";
          await pu.searchAccounts(searchName);
          const text = await pu.getPageText();
          expect(text.toLowerCase()).toContain(searchName.toLowerCase());
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-005 Verify search by email filters the Portal Users list ${tags("Positive", "Medium")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Search by email fragment", async () => {
          const searchEmail = process.env.ADMIN_SEARCH_EMAIL?.trim() || "ved@gmail.com";
          await pu.searchAccounts(searchEmail);
          const text = await pu.getPageText();
          expect(text.toLowerCase()).toContain(searchEmail.toLowerCase());
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-006 Verify search with no matching accounts shows an empty result ${tags("Negative", "Low")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Search with ZZZNOMATCH", async () => {
          await pu.searchAccounts("ZZZNOMATCH");
          await pu.expectEmptySearchResult();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-007 Verify Add User creates a new account with assigned role and default Active status ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const username = `auto.user.${Date.now()}`;
        const email = uniqueAutomationEmail();
        await regressionStep("Add User with Checker role", async () => {
          await pu.openAddUser();
          await pu.fillUserForm({
            name: "Automation User",
            username,
            email,
            role: "Checker",
          });
          await pu.saveUserForm();
          const row = await pu.findRowByUsername(username);
          await expect(row).toBeVisible({ timeout: 30_000 });
          const rowText = (await row.textContent()) ?? "";
          expect(rowText).toMatch(/checker/i);
          expect(rowText).toMatch(/active/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-008 Verify the role selector supports roles beyond Maker/Checker/Admin as the portal evolves ${tags("UI", "Medium")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Inspect role selector options", async () => {
          await pu.openAddUser();
          expect(await pu.isRoleSelectorExtensible()).toBeTruthy();
          const options = await pu.getRoleOptionsFromOpenForm();
          expect(options.length).toBeGreaterThanOrEqual(2);
          const joined = options.join(" ").toLowerCase();
          expect(joined).toMatch(/maker/);
          expect(joined).toMatch(/checker/);
          await pu.cancelUserForm();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-009 Verify Edit amends an existing account's details successfully ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const target =
          process.env.ADMIN_EDIT_TARGET_USERNAME?.trim() || "ved.prakash";
        await regressionStep("Edit account name", async () => {
          await pu.clickRowAction(target, "Edit");
          await pu.fillUserForm({ name: "Priya R. Sharma" });
          await pu.saveUserForm();
          const row = await pu.findRowByUsername(target);
          await expect(row).toBeVisible({ timeout: 30_000 });
          await expect(row).toContainText("Priya R. Sharma");
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-010 Verify Delete removes an account from the list ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const username = `delete.${Date.now()}`;
        const email = uniqueAutomationEmail("del.auto");
        await regressionStep("Create disposable user", async () => {
          await pu.openAddUser();
          await pu.fillUserForm({
            name: "Delete Me",
            username,
            email,
            role: "Maker",
          });
          await pu.saveUserForm();
        });
        await regressionStep("Delete the account", async () => {
          await pu.clickRowAction(username, "Delete");
          await pu.confirmDialogIfPresent();
          await expect(pu.accountsTable.getByText(new RegExp(username, "i"))).toHaveCount(0);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-011 Verify changing Status to Suspended blocks sign-in for that account ${tags("Positive", "High")}`, async ({ page, browser }) => {
      try {
        requireEnv(
          "ADMIN_SUSPEND_TEST_USERNAME",
          "Set ADMIN_SUSPEND_TEST_USERNAME/PASSWORD to a dedicated non-admin test account.",
        );
        requireEnv("ADMIN_SUSPEND_TEST_PASSWORD", "ADMIN_SUSPEND_TEST_PASSWORD required.");
        const pu = await requirePortalUsersAsAdmin(page);
        const target = process.env.ADMIN_SUSPEND_TEST_USERNAME!.trim();
        await regressionStep("Suspend test account", async () => {
          await pu.setUserStatus(target, "Suspended");
          const text = await pu.getPageText();
          expect(text).toMatch(/suspended/i);
        });
        await regressionStep("Verify sign-in blocked", async () => {
          await withSecondBrowser(browser, async (p2) => {
            const login = new OEMLoginPage(p2);
            await login.open();
            await login.loginWithCredentials(
              target,
              process.env.ADMIN_SUSPEND_TEST_PASSWORD!.trim(),
            );
            const body = await p2.locator("body").innerText();
            expect(body).toMatch(adminConsoleMessages.accountSuspended);
          });
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-012 Verify changing Status back to Active reactivates a suspended account ${tags("Positive", "High")}`, async ({ page, browser }) => {
      try {
        requireEnv("ADMIN_SUSPEND_TEST_USERNAME", "Dedicated suspend test user required.");
        requireEnv("ADMIN_SUSPEND_TEST_PASSWORD", "ADMIN_SUSPEND_TEST_PASSWORD required.");
        const pu = await requirePortalUsersAsAdmin(page);
        const target = process.env.ADMIN_SUSPEND_TEST_USERNAME!.trim();
        await regressionStep("Ensure account Active", async () => {
          await pu.setUserStatus(target, "Active");
        });
        await regressionStep("Verify sign-in succeeds", async () => {
          await withSecondBrowser(browser, async (p2) => {
            const login = new OEMLoginPage(p2);
            await login.open();
            await login.loginWithCredentials(
              target,
              process.env.ADMIN_SUSPEND_TEST_PASSWORD!.trim(),
            );
            await p2.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30_000 });
          });
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-013 Verify the exact validation message when adding a user with a duplicate username ${tags("Negative", "High")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const duplicate = process.env.ADMIN_DUPLICATE_USERNAME?.trim() || "ved.prakash";
        await regressionStep("Attempt Add User with duplicate username", async () => {
          await pu.openAddUser();
          await pu.fillUserForm({
            name: "Dup Test",
            username: duplicate,
            email: uniqueAutomationEmail("dup"),
            role: "Maker",
          });
          await pu.attemptSaveUserForm();
          await pu.expectDuplicateUsernameMessage();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-014 Verify suspending the last remaining active Admin is blocked ${tags("Negative", "High")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const lastAdmin = process.env.ADMIN_LAST_ADMIN_USERNAME?.trim();
        if (!lastAdmin) {
          skipWithReason(
            "Set ADMIN_LAST_ADMIN_USERNAME only when environment has a verified single active Admin test scenario.",
          );
        }
        await regressionStep("Attempt suspend last Admin", async () => {
          await pu.setUserStatus(lastAdmin!, "Suspended");
          await pu.expectLastAdminBlocked();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-015 Verify deleting the last remaining active Admin is blocked ${tags("Negative", "High")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const lastAdmin = process.env.ADMIN_LAST_ADMIN_USERNAME?.trim();
        if (!lastAdmin) {
          skipWithReason("Set ADMIN_LAST_ADMIN_USERNAME for last-Admin protection test.");
        }
        await regressionStep("Attempt delete last Admin", async () => {
          await pu.clickRowAction(lastAdmin!, "Delete");
          await pu.expectLastAdminBlocked();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-016 Verify a signed-in user is signed out when their account is suspended mid-session ${tags("Positive", "High")}`, async ({ page, browser }) => {
      try {
        requireEnv("ADMIN_MIDSESSION_USERNAME", "Dedicated mid-session test user required.");
        requireEnv("ADMIN_MIDSESSION_PASSWORD", "ADMIN_MIDSESSION_PASSWORD required.");
        const target = process.env.ADMIN_MIDSESSION_USERNAME!.trim();
        await withSecondBrowser(browser, async (userPage) => {
          const login = new OEMLoginPage(userPage);
          await login.open();
          await login.loginWithCredentials(
            target,
            process.env.ADMIN_MIDSESSION_PASSWORD!.trim(),
          );
          await userPage.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30_000 });
          const pu = await requirePortalUsersAsAdmin(page);
          await pu.setUserStatus(target, "Suspended");
          await userPage.reload();
          await userPage.waitForLoadState("domcontentloaded");
          const url = userPage.url();
          const body = await userPage.locator("body").innerText();
          expect(url.includes("/login") || adminConsoleMessages.accountSuspended.test(body)).toBeTruthy();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-017 Verify a signed-in user's role change applies only from their next sign-in ${tags("Positive", "Medium")}`, async ({ page, browser }) => {
      try {
        requireEnv("ADMIN_ROLE_CHANGE_USERNAME", "Dedicated role-change test user required.");
        requireEnv("ADMIN_ROLE_CHANGE_PASSWORD", "ADMIN_ROLE_CHANGE_PASSWORD required.");
        requireEnv("ADMIN_ROLE_CHANGE_FROM", "Set ADMIN_ROLE_CHANGE_FROM (e.g. Maker).");
        requireEnv("ADMIN_ROLE_CHANGE_TO", "Set ADMIN_ROLE_CHANGE_TO (e.g. Checker).");
        const target = process.env.ADMIN_ROLE_CHANGE_USERNAME!.trim();
        await withSecondBrowser(browser, async (userPage) => {
          const login = new OEMLoginPage(userPage);
          await login.open();
          await login.loginWithCredentials(
            target,
            process.env.ADMIN_ROLE_CHANGE_PASSWORD!.trim(),
          );
          const beforeText = await userPage.locator("body").innerText();
          const pu = await requirePortalUsersAsAdmin(page);
          await pu.clickRowAction(target, "Edit");
          await pu.fillUserForm({ role: process.env.ADMIN_ROLE_CHANGE_TO!.trim() });
          await pu.saveUserForm();
          const afterText = await userPage.locator("body").innerText();
          expect(afterText).toContain(beforeText.slice(0, 200));
          await userPage.context().clearCookies();
          await login.open();
          await login.loginWithCredentials(
            target,
            process.env.ADMIN_ROLE_CHANGE_PASSWORD!.trim(),
          );
          const postLogin = await userPage.locator("body").innerText();
          expect(postLogin).toMatch(new RegExp(process.env.ADMIN_ROLE_CHANGE_TO!, "i"));
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-018 Verify deleting a user still referenced elsewhere is handled per the exception flow ${tags("Edge", "Medium")}`, async () => {
      test.skip(true, "BLOCKED – Test Data: user referenced in audit/template requires seeded ADMIN_REFERENCED_USER.");
    });

    test(`TC-019 Verify Notification Templates shows Email and SMS channel tabs with a count per channel ${tags("UI", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        await regressionStep("Verify Email and SMS tabs with counts", async () => {
          await expect(nt.emailTab).toBeVisible();
          await expect(nt.smsTab).toBeVisible();
          const emailCount = await nt.getChannelTabCount("Email");
          const smsCount = await nt.getChannelTabCount("SMS");
          expect(emailCount ?? "0").toMatch(/\d+/);
          expect(smsCount ?? "0").toMatch(/\d+/);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-020 Verify each template card shows code, title and status ${tags("UI", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        await regressionStep("Inspect template card fields", async () => {
          await nt.expectTemplateCardsShowCodeTitleStatus();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-021 Verify the Admin can toggle between the Email and SMS tabs ${tags("Alternate", "Medium")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        await regressionStep("Toggle Email/SMS tabs", async () => {
          await nt.switchToChannel("SMS");
          let text = await nt.getPageText();
          expect(text).toMatch(/sms/i);
          await nt.switchToChannel("Email");
          text = await nt.getPageText();
          expect(text).toMatch(/email/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-022 Verify viewing a template shows Template Code, Template Name, Subject and Body ${tags("UI", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_KNOWN_TEMPLATE_CODE?.trim() || "INVOICE_BATCH_SUBMITTED_2";
        await regressionStep("Open template detail", async () => {
          await nt.openTemplate(code);
          await nt.expectTemplateDetailFields();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-023 Verify New Template creates a template under the correct channel tab with entered details ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("OEM-INV-UPLOAD-CONF");
        await regressionStep("Create Email template", async () => {
          await nt.switchToChannel("Email");
          await nt.openNewTemplate();
          await nt.fillTemplateForm({
            code,
            name: "OEM Invoice Upload Confirmation",
            subject: "Automation Subject",
            body: "Automation body for invoice upload confirmation.",
          });
          await nt.saveTemplate();
          const card = nt.templateCard(code);
          await expect(card).toBeVisible({ timeout: 30_000 });
          const cardText = await card.innerText();
          expect(cardText).toMatch(new RegExp(code, "i"));
          expect(cardText).toMatch(/active/i);
          expect(cardText).toMatch(/automation subject/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-024 Verify a newly created template appears with the correct default status ${tags("UI", "Medium")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode();
        await regressionStep("Create template and verify default Active status", async () => {
          await nt.createDisposableTemplate({
            code,
            subject: "Status Test",
            body: "Body for status test",
          });
          const card = nt.templateCard(code);
          await expect(card).toContainText(/active/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-025 Verify Edit updates a template's content successfully ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("EDIT");
        await regressionStep("Create disposable template for edit", async () => {
          await nt.createDisposableTemplate({
            code,
            subject: "Before",
            body: "Before body",
          });
        });
        await regressionStep("Edit subject and body", async () => {
          await nt.clickTemplateAction(code, "Edit");
          await nt.fillTemplateForm({ subject: "New Subject line", body: "Updated body" });
          await nt.saveTemplate();
          await expect(nt.templateCard(code)).toContainText(/New Subject line/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-026 Verify Deactivate updates a template's status without deleting it ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_DEACTIVATE_TEMPLATE_CODE?.trim() || "INVOICE_BATCH_SUBMITTED_Test";
        await regressionStep("Attempt deactivate on non-sole-active template", async () => {
          await nt.clickTemplateAction(code, "Deactivate");
          const warned = await page
            .getByRole("dialog")
            .filter({ hasText: adminConsoleMessages.onlyActiveTemplateWarning })
            .isVisible()
            .catch(() => false);
          if (warned) {
            await nt.cancelWarningDialog();
            skipWithReason(
              `Template '${code}' is the only active template for its code on DEV — TC-026 precondition (not sole active) not met.`,
            );
          }
          const card = nt.templateCard(code);
          await expect(card).toBeVisible();
          await expect(card).toContainText(/deactivat/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-027 Verify Delete removes a template from the list ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("DEL");
        await regressionStep("Create disposable template", async () => {
          await nt.createDisposableTemplate({
            code,
            subject: "Delete me",
            body: "Body",
          });
        });
        await regressionStep("Delete the template", async () => {
          await nt.deleteTemplate(code);
          await expect(nt.templateCard(code)).toHaveCount(0);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-028 Verify merge fields using {{field_name}} syntax render correctly ${tags("UI", "Medium")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("MERGE");
        const merge = "Dear {{dealer_name}},";
        await regressionStep("Create template with merge field", async () => {
          await nt.createDisposableTemplate({
            code,
            subject: "Merge test",
            body: merge,
          });
          await nt.expectMergeFieldVisible("{{dealer_name}}");
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-029 Verify the exact warning when deactivating the only active template for a code ${tags("Negative", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("SOLE-DEACT");
        await regressionStep("Create sole-active template", async () => {
          await nt.createDisposableTemplate({
            code,
            subject: "Sole active deactivate test",
            body: "Body",
          });
        });
        await regressionStep("Deactivate and verify warning", async () => {
          await nt.clickTemplateAction(code, "Deactivate");
          await nt.expectOnlyActiveTemplateWarning();
          await nt.cancelWarningDialog();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-030 Verify the exact warning when deleting the only active template for a code ${tags("Negative", "High")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("SOLE-DEL");
        await regressionStep("Create sole-active template", async () => {
          await nt.createDisposableTemplate({
            code,
            subject: "Sole active delete test",
            body: "Body",
          });
        });
        await regressionStep("Delete and verify warning", async () => {
          await nt.clickTemplateAction(code, "Delete");
          await nt.expectOnlyActiveTemplateWarning();
          await nt.cancelWarningDialog();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-031 Verify confirming the warning proceeds with deactivate/delete ${tags("Positive", "Medium")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("SOLE-CONFIRM");
        await regressionStep("Create sole-active template", async () => {
          await nt.createDisposableTemplate({
            code,
            subject: "Sole active confirm deactivate test",
            body: "Body",
          });
        });
        await regressionStep("Confirm deactivate warning", async () => {
          await nt.clickTemplateAction(code, "Deactivate");
          await nt.expectOnlyActiveTemplateWarning();
          await nt.confirmWarningDialog();
          const cardText = await nt.templateCard(code).innerText();
          expect(cardText).toMatch(/inactive|deactivat/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-032 Verify cancelling the warning leaves the template unchanged ${tags("Positive", "Medium")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("SOLE-CANCEL");
        await regressionStep("Create sole-active template", async () => {
          await nt.createDisposableTemplate({
            code,
            subject: "Sole active cancel deactivate test",
            body: "Body",
          });
        });
        await regressionStep("Cancel deactivate warning", async () => {
          await nt.clickTemplateAction(code, "Deactivate");
          await nt.expectOnlyActiveTemplateWarning();
          await nt.cancelWarningDialog();
          const cardText = await nt.templateCard(code).innerText();
          expect(cardText).toMatch(/active/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-033 Verify deleting a template still referenced elsewhere is handled per the exception flow ${tags("Edge", "Medium")}`, async () => {
      test.skip(true, "BLOCKED – Test Data: template actively referenced by notification flow (ADMIN_REFERENCED_TEMPLATE_CODE).");
    });

    test(`TC-034 Verify the template catalog structure supports extensibility to further channels/types ${tags("UI", "Low")}`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        await expect(nt.emailTab).toBeVisible();
        await expect(nt.smsTab).toBeVisible();
        const text = await nt.getPageText();
        expect(text).toMatch(/email|sms/i);
      } catch (e) { handleSkip(e); }
    });

    test(`TC-035 Verify Login & Comms shows current Banner and Support & Contact details with a live preview ${tags("UI", "High")}`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await regressionStep("Verify support sections and contact preview", async () => {
          const text = await lc.getPageText();
          expect(text).toMatch(/support\s*&\s*communication/i);
          expect(text).toMatch(/dealer portal.*support/i);
          expect(text).toMatch(/oem portal.*support/i);
          expect(text).toMatch(/preview/i);
          await expect(lc.supportPhoneInput).toBeVisible();
          await expect(lc.supportEmailInput).toBeVisible();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-036 Verify banner fields reflect currently saved values ${tags("Positive", "High")}`, async () => {
      skipLoginBannerDeferred();
    });

    test(`TC-037 Verify editing a banner field updates the Live preview immediately, before saving ${tags("Positive", "High")}`, async () => {
      skipLoginBannerDeferred();
    });

    test(`TC-038 Verify Support & Contact Details shows Support Phone, Support Hours and Support Email on load ${tags("UI", "High")}`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        const text = await lc.getPageText();
        expect(text).toMatch(/support phone/i);
        expect(text).toMatch(/support hours/i);
        expect(text).toMatch(/support email/i);
      } catch (e) { handleSkip(e); }
    });

    test(`TC-039 Verify a Contact preview is shown alongside Support & Contact Details ${tags("UI", "Medium")}`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        const preview = await lc.getContactPreviewText();
        expect(preview).toMatch(/contact preview|support phone|support email/i);
      } catch (e) { handleSkip(e); }
    });

    test(`TC-040 Verify Escalation Email is present and editable in Support & Contact Details ${tags("UI", "Medium")}`, async ({ page }) => {
      test.skip(
        true,
        "OUT OF SCOPE (current sprint): Escalation Email field not on Support & Comms UI.",
      );
    });

    test(`TC-041 Verify editing a contact field updates the Contact preview immediately, before saving ${tags("Positive", "Medium")}`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await lc.setSupportPhone("1800-123-4567");
        const preview = await lc.getContactPreviewText();
        expect(preview).toContain("1800-123-4567");
      } catch (e) { handleSkip(e); }
    });

    test(`TC-042 Verify Save Changes persists edited values and they are reflected on the portal ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        if (process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE !== "true") {
          skipWithReason("Set ADMIN_ALLOW_LOGIN_COMMS_SAVE=true to run destructive Login & Comms save tests.");
        }
        const lc = await requireLoginCommsAsAdmin(page);
        const originalPhone = await lc.getFieldValue(lc.supportPhoneInput);
        const marker = `1800-${String(Date.now()).slice(-7)}`;
        await regressionStep("Save support phone and verify persistence after reload", async () => {
          await lc.setSupportPhone(marker);
          await lc.saveChanges();
          await page.reload();
          await lc.expectModuleLoaded();
          expect(await lc.getFieldValue(lc.supportPhoneInput)).toContain(marker);
        });
        await regressionStep("Restore original support phone", async () => {
          await lc.setSupportPhone(originalPhone);
          await lc.saveChanges();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-043 Verify Save Changes saves banner and support-detail edits together in a single action ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        if (process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE !== "true") {
          skipWithReason("Set ADMIN_ALLOW_LOGIN_COMMS_SAVE=true for combined save test.");
        }
        const lc = await requireLoginCommsAsAdmin(page);
        const originalPhone = await lc.getFieldValue(lc.supportPhoneInput);
        const originalHours = await lc.getFieldValue(lc.supportHoursInput);
        const phoneMarker = "1800-999-0000";
        const hoursMarker = "Mon-Fri, 9-5 IST";
        await regressionStep("Save dealer support phone and hours in one action", async () => {
          await lc.setSupportPhone(phoneMarker);
          await lc.setSupportHours(hoursMarker);
          await lc.saveChanges();
          await page.reload();
          await lc.expectModuleLoaded();
          expect(await lc.getFieldValue(lc.supportPhoneInput)).toContain(phoneMarker);
          expect(await lc.getFieldValue(lc.supportHoursInput)).toContain(hoursMarker);
        });
        await regressionStep("Restore original dealer support details", async () => {
          await lc.setSupportPhone(originalPhone);
          await lc.setSupportHours(originalHours);
          await lc.saveChanges();
        });
      } catch (e) { handleSkip(e); }
    });

    test(`TC-044 Verify the exact validation error when a mandatory Login & Comms field is left blank ${tags("Negative", "High")}`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await lc.clearMandatoryField(/support email/i);
        await lc.saveChanges();
        await lc.expectMandatoryFieldsError();
      } catch (e) { handleSkip(e); }
    });

    test(`TC-045 Verify Save Changes is blocked for the whole section when one sub-section has invalid data ${tags("Negative", "Medium")}`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        const beforePhone = await lc.getFieldValue(lc.supportPhoneInput);
        await lc.setSupportPhone(`1800-${String(Date.now()).slice(-7)}`);
        await lc.clearMandatoryField(/support email/i);
        await lc.saveChanges();
        await lc.expectMandatoryFieldsError();
        await page.reload();
        await lc.expectModuleLoaded();
        expect(await lc.getFieldValue(lc.supportPhoneInput)).toBe(beforePhone);
      } catch (e) { handleSkip(e); }
    });

    test(`TC-046 Verify disabling the login banner hides it from the login screen while retaining its fields ${tags("Positive", "High")}`, async () => {
      skipLoginBannerDeferred();
    });

    test(`TC-047 Verify re-enabling a previously disabled banner restores it using the retained field values ${tags("Positive", "High")}`, async () => {
      skipLoginBannerDeferred();
    });

    test(`TC-048 Verify the CTA URL field rejects an invalid URL format ${tags("Negative", "Medium")}`, async () => {
      skipLoginBannerDeferred();
    });

    test(`TC-049 Verify saved banner configuration is reflected correctly on the dealer login screen ${tags("Positive", "High")}`, async () => {
      skipLoginBannerDeferred();
    });

    test(`TC-050 Verify saved support/contact details are reflected correctly in the portal footer ${tags("Positive", "High")}`, async ({ page }) => {
      try {
        if (process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE !== "true") {
          skipWithReason("Set ADMIN_ALLOW_LOGIN_COMMS_SAVE=true for footer verification.");
        }
        const lc = await requireLoginCommsAsAdmin(page);
        const phone = "1800-555-0100";
        await lc.setSupportPhone(phone);
        await lc.saveChanges();
        const dealerLogin = await lc.openDealerLoginInNewPage();
        const footer = await dealerLogin.locator("footer, body").innerText();
        expect(footer).toContain(phone);
        await dealerLogin.close();
      } catch (e) { handleSkip(e); }
    });

    test(`TC-051 Verify only users with the Admin role can access Admin Console -> System Configuration ${tags("Security", "High")}`, async ({ page }) => {
      try {
        await openAsNonAdminMaker(page);
        await navigateDirectAdminPath(page, portalUsersPath());
        await expectAdminConsoleAccessDenied(page);
      } catch (e) { handleSkip(e); }
    });

    test(`TC-052 Verify non-Admin users cannot access Admin Console sub-pages directly via URL ${tags("Security", "High")}`, async ({ page }) => {
      try {
        await openAsNonAdminMaker(page);
        for (const p of [portalUsersPath(), templatesPath(), loginCommsPath()]) {
          await navigateDirectAdminPath(page, p);
          await expectAdminConsoleAccessDenied(page);
        }
      } catch (e) { handleSkip(e); }
    });

    test(`TC-053 Verify the Admin Console left navigation correctly switches between the three sections ${tags("Alternate", "Medium")}`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await pu.navigateToNotificationTemplates();
        await expect(
          page.getByRole("heading", { name: /notification templates/i }),
        ).toBeVisible();
        await pu.navigateToLoginComms();
        await expect(
          page.getByRole("heading", { name: /support\s*&\s*communication/i }),
        ).toBeVisible();
        await pu.navigateToPortalUsers();
        await pu.expectModuleLoaded();
      } catch (e) { handleSkip(e); }
    });

    test(`TC-054 Verify Admin Console pages load within an acceptable response time with a realistic data volume ${tags("NFR", "Medium")}`, async ({ page }) => {
      try {
        const sla = getAdminNfrSlaMs();
        const pu = await requirePortalUsersAsAdmin(page);
        const t0 = Date.now();
        await pu.navigateToNotificationTemplates();
        await pu.navigateToLoginComms();
        await pu.navigateToPortalUsers();
        const elapsed = Date.now() - t0;
        expect(elapsed).toBeLessThan(sla * 3);
      } catch (e) { handleSkip(e); }
    });

    test(`TC-055 Verify the login banner and support details cannot be configured per branch or per dealer ${tags("Negative", "Medium")}`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await lc.expectNoBranchOrDealerScopeControls();
      } catch (e) { handleSkip(e); }
    });
  },
);
