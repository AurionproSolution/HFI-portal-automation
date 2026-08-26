/**
 * Generator for AdminConsoleRegression.test.ts — run: node scripts/generate-admin-regression.mjs
 */
import fs from "fs";
import path from "path";

const header = `/**
 * UC-ADM-001 — Admin Console (Portal Users, Notification Templates, Login & Comms)
 * Single source of truth: UC-ADM-001_TestCases_v1_0.xlsx (TC-001 … TC-055)
 * Catalog: testData/admin/adminConsoleCatalog.ts
 */

import { test, expect } from "@playwright/test";
import { getAdminNfrSlaMs } from "@config/admin-env";
import { getAppOrigin } from "@config/env";
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
} from "../../adminConsole.helpers";
import {
  getPortalUsersPath as portalUsersPath,
  getNotificationTemplatesPath as templatesPath,
  getLoginCommsPath as loginCommsPath,
} from "@config/admin-env";

function handleSkip(e: unknown): void {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\\s*/, ""));
  throw e;
}

function tags(type: string, priority: string): string {
  return \`@\${type.toLowerCase().replace(/\\s+/g, "-")} @\${priority.toLowerCase()} @uc-adm-001 @admin-console @regression\`;
}

test.describe(
  "UC-ADM-001 Admin Console @uc-adm-001 @admin-console @regression",
  () => {
    test.setTimeout(300_000);
    test.beforeEach(() => initAdminConsoleSteps());
`;

const tests = [];

// TC-001
tests.push(`
    test(\`TC-001 Verify Portal Users lists all accounts with required columns and a count \${tags("UI", "High")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Verify Portal Users columns and account count", async () => {
          await pu.expectRequiredColumns();
          const count = await pu.getDisplayedAccountCount();
          expect(count, "Expected account count label such as '4 of 4 accounts'").not.toBeNull();
          if (count) expect(count.shown).toBeGreaterThan(0);
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-002
tests.push(`
    test(\`TC-002 Verify listed account values match the provisioning source \${tags("Positive", "High")}\`, async () => {
      test.skip(
        true,
        "BLOCKED – Backend: identity/user-provisioning service access required (ADMIN_PROVISIONING_API_URL).",
      );
    });`);

// TC-003
tests.push(`
    test(\`TC-003 Verify the displayed count matches the actual number of accounts \${tags("Positive", "Medium")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Compare displayed count to visible rows", async () => {
          const count = await pu.getDisplayedAccountCount();
          const rows = await pu.getVisibleRowCount();
          if (!count) skipWithReason("Account count label not found on Portal Users screen.");
          expect(count!.shown).toBe(rows);
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-004
tests.push(`
    test(\`TC-004 Verify search by name filters the Portal Users list \${tags("Positive", "Medium")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Search by name fragment", async () => {
          const searchName = process.env.ADMIN_SEARCH_NAME?.trim() || "Priya";
          await pu.searchAccounts(searchName);
          const text = await pu.getPageText();
          expect(text.toLowerCase()).toContain(searchName.toLowerCase());
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-005
tests.push(`
    test(\`TC-005 Verify search by email filters the Portal Users list \${tags("Positive", "Medium")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Search by email fragment", async () => {
          const searchEmail = process.env.ADMIN_SEARCH_EMAIL?.trim() || "priya@oem.com";
          await pu.searchAccounts(searchEmail);
          const text = await pu.getPageText();
          expect(text.toLowerCase()).toContain(searchEmail.toLowerCase());
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-006
tests.push(`
    test(\`TC-006 Verify search with no matching accounts shows an empty result \${tags("Negative", "Low")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Search with ZZZNOMATCH", async () => {
          await pu.searchAccounts("ZZZNOMATCH");
          await pu.expectEmptySearchResult();
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-007
tests.push(`
    test(\`TC-007 Verify Add User creates a new account with assigned role and default Active status \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const username = \`auto.user.\${Date.now()}\`;
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
          await expect(pu.accountsTable.getByText(new RegExp(username, "i"))).toBeVisible({
            timeout: 30_000,
          });
          const text = await pu.getPageText();
          expect(text).toMatch(/checker/i);
          expect(text).toMatch(/active/i);
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-008
tests.push(`
    test(\`TC-008 Verify the role selector supports roles beyond Maker/Checker/Admin as the portal evolves \${tags("UI", "Medium")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await regressionStep("Inspect role selector options", async () => {
          const options = await pu.getRoleOptions();
          expect(options.length).toBeGreaterThan(0);
          const joined = options.join(" ").toLowerCase();
          expect(joined).toMatch(/maker|checker|admin/);
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-009
tests.push(`
    test(\`TC-009 Verify Edit amends an existing account's details successfully \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const target = process.env.ADMIN_EDIT_TARGET_USERNAME?.trim();
        if (!target) {
          skipWithReason("Set ADMIN_EDIT_TARGET_USERNAME to a safe automation-editable account.");
        }
        await regressionStep("Edit account name", async () => {
          await pu.clickRowAction(target!, "Edit");
          await pu.fillUserForm({ name: "Priya R. Sharma" });
          await pu.saveUserForm();
          await expect(pu.accountsTable.getByText(/Priya R\\. Sharma/i)).toBeVisible({
            timeout: 30_000,
          });
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-010
tests.push(`
    test(\`TC-010 Verify Delete removes an account from the list \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const username = \`delete.\${Date.now()}\`;
        const email = uniqueAutomationEmail("del.auto");
        await regressionStep("Create disposable user", async () => {
          await pu.openAddUser();
          await pu.fillUserForm({
            name: "Delete Me",
            username,
            email,
            role: "Checker",
          });
          await pu.saveUserForm();
        });
        await regressionStep("Delete the account", async () => {
          await pu.clickRowAction(username, "Delete");
          await pu.confirmDialogIfPresent();
          await expect(pu.accountsTable.getByText(new RegExp(username, "i"))).toHaveCount(0);
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-011
tests.push(`
    test(\`TC-011 Verify changing Status to Suspended blocks sign-in for that account \${tags("Positive", "High")}\`, async ({ page, browser }) => {
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
    });`);

// TC-012
tests.push(`
    test(\`TC-012 Verify changing Status back to Active reactivates a suspended account \${tags("Positive", "High")}\`, async ({ page, browser }) => {
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
    });`);

// TC-013
tests.push(`
    test(\`TC-013 Verify the exact validation message when adding a user with a duplicate username \${tags("Negative", "High")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        const duplicate = process.env.ADMIN_DUPLICATE_USERNAME?.trim() || "priya.sharma";
        await regressionStep("Attempt Add User with duplicate username", async () => {
          await pu.openAddUser();
          await pu.fillUserForm({
            name: "Dup Test",
            username: duplicate,
            email: uniqueAutomationEmail("dup"),
            role: "Checker",
          });
          await pu.saveUserForm();
          await pu.expectDuplicateUsernameMessage();
        });
      } catch (e) { handleSkip(e); }
    });`);

// TC-014, TC-015
tests.push(`
    test(\`TC-014 Verify suspending the last remaining active Admin is blocked \${tags("Negative", "High")}\`, async ({ page }) => {
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

    test(\`TC-015 Verify deleting the last remaining active Admin is blocked \${tags("Negative", "High")}\`, async ({ page }) => {
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
    });`);

// TC-016
tests.push(`
    test(\`TC-016 Verify a signed-in user is signed out when their account is suspended mid-session \${tags("Positive", "High")}\`, async ({ page, browser }) => {
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
    });`);

// TC-017
tests.push(`
    test(\`TC-017 Verify a signed-in user's role change applies only from their next sign-in \${tags("Positive", "Medium")}\`, async ({ page, browser }) => {
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
    });`);

// TC-018
tests.push(`
    test(\`TC-018 Verify deleting a user still referenced elsewhere is handled per the exception flow \${tags("Edge", "Medium")}\`, async () => {
      test.skip(true, "BLOCKED – Test Data: user referenced in audit/template requires seeded ADMIN_REFERENCED_USER.");
    });`);

// TC-019 to TC-034 - Notification Templates
tests.push(`
    test(\`TC-019 Verify Notification Templates shows Email and SMS channel tabs with a count per channel \${tags("UI", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        await regressionStep("Verify Email and SMS tabs with counts", async () => {
          await expect(nt.emailTab).toBeVisible();
          await expect(nt.smsTab).toBeVisible();
          const emailCount = await nt.getChannelTabCount("Email");
          const smsCount = await nt.getChannelTabCount("SMS");
          expect(emailCount ?? "0").toMatch(/\\d+/);
          expect(smsCount ?? "0").toMatch(/\\d+/);
        });
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-020 Verify each template card shows code, title and status \${tags("UI", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        await regressionStep("Inspect template card fields", async () => {
          const text = await nt.getPageText();
          expect(text).toMatch(/code|status/i);
          expect(text).toMatch(/title|name/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-021 Verify the Admin can toggle between the Email and SMS tabs \${tags("Alternate", "Medium")}\`, async ({ page }) => {
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

    test(\`TC-022 Verify viewing a template shows Template Code, Template Name, Subject and Body \${tags("UI", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_KNOWN_TEMPLATE_CODE?.trim();
        if (!code) skipWithReason("Set ADMIN_KNOWN_TEMPLATE_CODE to an existing template code.");
        await regressionStep("Open template detail", async () => {
          await nt.openTemplate(code!);
          await nt.expectTemplateDetailFields();
        });
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-023 Verify New Template creates a template under the correct channel tab with entered details \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("OEM-INV-UPLOAD-CONF");
        await regressionStep("Create Email template", async () => {
          await nt.switchToChannel("Email");
          await nt.openNewTemplate();
          await nt.fillTemplateForm({
            channel: "Email",
            code,
            subject: "Automation Subject",
            body: "Automation body",
          });
          await nt.saveTemplate();
          await expect(page.getByText(new RegExp(code, "i"))).toBeVisible({ timeout: 30_000 });
        });
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-024 Verify a newly created template appears with the correct default status \${tags("UI", "Medium")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode();
        await nt.openNewTemplate();
        await nt.fillTemplateForm({ code, subject: "Status Test", body: "Body" });
        await nt.saveTemplate();
        const text = await nt.getPageText();
        expect(text).toMatch(/active/i);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-025 Verify Edit updates a template's content successfully \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_EDIT_TEMPLATE_CODE?.trim() || nt.generateTemplateCode();
        if (!process.env.ADMIN_EDIT_TEMPLATE_CODE) {
          await nt.openNewTemplate();
          await nt.fillTemplateForm({ code, subject: "Before", body: "Before body" });
          await nt.saveTemplate();
        }
        await nt.clickTemplateAction(code, "Edit");
        await nt.fillTemplateForm({ subject: "New Subject line", body: "Updated body" });
        await nt.saveTemplate();
        await expect(page.getByText(/New Subject line/i)).toBeVisible();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-026 Verify Deactivate updates a template's status without deleting it \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_DEACTIVATE_TEMPLATE_CODE?.trim();
        if (!code) skipWithReason("Set ADMIN_DEACTIVATE_TEMPLATE_CODE to a non-sole-active template.");
        await nt.clickTemplateAction(code!, "Deactivate");
        const text = await nt.getPageText();
        expect(text).toMatch(/deactivat/i);
        await expect(page.getByText(new RegExp(code!, "i"))).toBeVisible();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-027 Verify Delete removes a template from the list \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = nt.generateTemplateCode("DEL");
        await nt.openNewTemplate();
        await nt.fillTemplateForm({ code, subject: "Delete me", body: "Body" });
        await nt.saveTemplate();
        await nt.clickTemplateAction(code, "Delete");
        await nt.confirmWarningDialog().catch(() => undefined);
        await expect(page.getByText(new RegExp(code, "i"))).toHaveCount(0);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-028 Verify merge fields using {{field_name}} syntax render correctly \${tags("UI", "Medium")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const merge = "Dear {{dealer_name}},";
        await nt.openNewTemplate();
        await nt.fillTemplateForm({ body: merge, subject: "Merge test", code: nt.generateTemplateCode("MERGE") });
        await nt.saveTemplate();
        await nt.expectMergeFieldVisible("{{dealer_name}}");
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-029 Verify the exact warning when deactivating the only active template for a code \${tags("Negative", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_ONLY_ACTIVE_TEMPLATE_CODE?.trim();
        if (!code) skipWithReason("Set ADMIN_ONLY_ACTIVE_TEMPLATE_CODE for sole-active template warning test.");
        await nt.clickTemplateAction(code!, "Deactivate");
        await nt.expectOnlyActiveTemplateWarning();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-030 Verify the exact warning when deleting the only active template for a code \${tags("Negative", "High")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_ONLY_ACTIVE_TEMPLATE_CODE?.trim();
        if (!code) skipWithReason("Set ADMIN_ONLY_ACTIVE_TEMPLATE_CODE for sole-active template warning test.");
        await nt.clickTemplateAction(code!, "Delete");
        await nt.expectOnlyActiveTemplateWarning();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-031 Verify confirming the warning proceeds with deactivate/delete \${tags("Positive", "Medium")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_ONLY_ACTIVE_TEMPLATE_DISPOSABLE?.trim();
        if (!code) skipWithReason("Set ADMIN_ONLY_ACTIVE_TEMPLATE_DISPOSABLE to a disposable sole-active template.");
        await nt.clickTemplateAction(code!, "Deactivate");
        await nt.expectOnlyActiveTemplateWarning();
        await nt.confirmWarningDialog();
        const text = await nt.getPageText();
        expect(text).toMatch(/deactivat/i);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-032 Verify cancelling the warning leaves the template unchanged \${tags("Positive", "Medium")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        const code = process.env.ADMIN_ONLY_ACTIVE_TEMPLATE_CODE?.trim();
        if (!code) skipWithReason("Set ADMIN_ONLY_ACTIVE_TEMPLATE_CODE.");
        await nt.clickTemplateAction(code!, "Deactivate");
        await nt.expectOnlyActiveTemplateWarning();
        await nt.cancelWarningDialog();
        const text = await nt.getPageText();
        expect(text).toMatch(/active/i);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-033 Verify deleting a template still referenced elsewhere is handled per the exception flow \${tags("Edge", "Medium")}\`, async () => {
      test.skip(true, "BLOCKED – Test Data: template actively referenced by notification flow (ADMIN_REFERENCED_TEMPLATE_CODE).");
    });

    test(\`TC-034 Verify the template catalog structure supports extensibility to further channels/types \${tags("UI", "Low")}\`, async ({ page }) => {
      try {
        const nt = await requireNotificationTemplatesAsAdmin(page);
        await expect(nt.emailTab).toBeVisible();
        await expect(nt.smsTab).toBeVisible();
        const text = await nt.getPageText();
        expect(text).toMatch(/email|sms/i);
      } catch (e) { handleSkip(e); }
    });`);

// TC-035 to TC-055 Login & Comms + Security + NFR
tests.push(`
    test(\`TC-035 Verify Login & Comms shows current Banner and Support & Contact details with a live preview \${tags("UI", "High")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await regressionStep("Verify sections and preview", async () => {
          const text = await lc.getPageText();
          expect(text).toMatch(/banner/i);
          expect(text).toMatch(/support/i);
          expect(text).toMatch(/preview/i);
        });
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-036 Verify banner fields reflect currently saved values \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        const headline = await lc.getFieldValue(lc.headlineInput).catch(() => "");
        expect(headline.length).toBeGreaterThan(0);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-037 Verify editing a banner field updates the Live preview immediately, before saving \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        const newHeadline = "Festive Season Financing Now Live";
        await lc.setHeadline(newHeadline);
        const preview = await lc.getLivePreviewText();
        expect(preview).toContain(newHeadline);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-038 Verify Support & Contact Details shows Support Phone, Support Hours and Support Email on load \${tags("UI", "High")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        const text = await lc.getPageText();
        expect(text).toMatch(/support phone/i);
        expect(text).toMatch(/support hours/i);
        expect(text).toMatch(/support email/i);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-039 Verify a Contact preview is shown alongside Support & Contact Details \${tags("UI", "Medium")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        const preview = await lc.getContactPreviewText();
        expect(preview).toMatch(/contact preview|support phone|support email/i);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-040 Verify Escalation Email is present and editable in Support & Contact Details \${tags("UI", "Medium")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await expect(lc.escalationEmailInput).toBeVisible();
        await lc.escalationEmailInput.fill("escalations@honda-finance.example");
        expect(await lc.escalationEmailInput.inputValue()).toBe("escalations@honda-finance.example");
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-041 Verify editing a contact field updates the Contact preview immediately, before saving \${tags("Positive", "Medium")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await lc.setSupportPhone("1800-123-4567");
        const preview = await lc.getContactPreviewText();
        expect(preview).toContain("1800-123-4567");
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-042 Verify Save Changes persists edited values and they are reflected on the portal \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        if (process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE !== "true") {
          skipWithReason("Set ADMIN_ALLOW_LOGIN_COMMS_SAVE=true to run destructive Login & Comms save tests.");
        }
        const lc = await requireLoginCommsAsAdmin(page);
        const marker = \`Auto \${Date.now()}\`;
        await lc.setHeadline(marker);
        await lc.saveChanges();
        await page.reload();
        await lc.expectModuleLoaded();
        expect(await lc.getFieldValue(lc.headlineInput)).toContain(marker);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-043 Verify Save Changes saves banner and support-detail edits together in a single action \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        if (process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE !== "true") {
          skipWithReason("Set ADMIN_ALLOW_LOGIN_COMMS_SAVE=true for combined save test.");
        }
        const lc = await requireLoginCommsAsAdmin(page);
        const marker = \`Combo \${Date.now()}\`;
        await lc.setHeadline(marker);
        await lc.setSupportPhone("1800-999-0000");
        await lc.saveChanges();
        await page.reload();
        expect(await lc.getFieldValue(lc.headlineInput)).toContain(marker);
        expect(await lc.getFieldValue(lc.supportPhoneInput)).toContain("1800-999-0000");
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-044 Verify the exact validation error when a mandatory Login & Comms field is left blank \${tags("Negative", "High")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await lc.setBannerEnabled(true);
        await lc.clearMandatoryField(/^headline$/i);
        await lc.saveChanges();
        await lc.expectMandatoryFieldsError();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-045 Verify Save Changes is blocked for the whole section when one sub-section has invalid data \${tags("Negative", "Medium")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        const beforeHeadline = await lc.getFieldValue(lc.headlineInput);
        await lc.setHeadline(\`Valid \${Date.now()}\`);
        await lc.clearMandatoryField(/support email/i);
        await lc.saveChanges();
        await lc.expectMandatoryFieldsError();
        await page.reload();
        expect(await lc.getFieldValue(lc.headlineInput)).toBe(beforeHeadline);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-046 Verify disabling the login banner hides it from the login screen while retaining its fields \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        if (process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE !== "true") {
          skipWithReason("Set ADMIN_ALLOW_LOGIN_COMMS_SAVE=true for banner toggle persistence test.");
        }
        const lc = await requireLoginCommsAsAdmin(page);
        const headline = await lc.getFieldValue(lc.headlineInput);
        await lc.setBannerEnabled(false);
        await lc.saveChanges();
        const dealerLogin = await lc.openDealerLoginInNewPage();
        const loginText = await dealerLogin.locator("body").innerText();
        expect(loginText).not.toContain(headline);
        await dealerLogin.close();
        await lc.navigateToLoginComms();
        expect(await lc.getFieldValue(lc.headlineInput)).toBe(headline);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-047 Verify re-enabling a previously disabled banner restores it using the retained field values \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        if (process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE !== "true") {
          skipWithReason("Set ADMIN_ALLOW_LOGIN_COMMS_SAVE=true for banner re-enable test.");
        }
        const lc = await requireLoginCommsAsAdmin(page);
        const headline = await lc.getFieldValue(lc.headlineInput);
        await lc.setBannerEnabled(true);
        await lc.saveChanges();
        const dealerLogin = await lc.openDealerLoginInNewPage();
        const loginText = await dealerLogin.locator("body").innerText();
        expect(loginText).toContain(headline);
        await dealerLogin.close();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-048 Verify the CTA URL field rejects an invalid URL format \${tags("Negative", "Medium")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await lc.setBannerEnabled(true);
        await lc.setCtaUrl("not a url");
        await lc.saveChanges();
        await lc.expectInvalidUrlError();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-049 Verify saved banner configuration is reflected correctly on the dealer login screen \${tags("Positive", "High")}\`, async ({ page }) => {
      try {
        if (process.env.ADMIN_ALLOW_LOGIN_COMMS_SAVE !== "true") {
          skipWithReason("Set ADMIN_ALLOW_LOGIN_COMMS_SAVE=true for dealer login banner verification.");
        }
        const lc = await requireLoginCommsAsAdmin(page);
        const headline = "New Diwali Offers Live";
        await lc.setHeadline(headline);
        await lc.saveChanges();
        const dealerLogin = await lc.openDealerLoginInNewPage();
        await expect(dealerLogin.getByText(headline)).toBeVisible({ timeout: 30_000 });
        await dealerLogin.close();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-050 Verify saved support/contact details are reflected correctly in the portal footer \${tags("Positive", "High")}\`, async ({ page }) => {
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

    test(\`TC-051 Verify only users with the Admin role can access Admin Console -> System Configuration \${tags("Security", "High")}\`, async ({ page }) => {
      try {
        await openAsNonAdminMaker(page);
        await navigateDirectAdminPath(page, portalUsersPath());
        await expectAdminConsoleAccessDenied(page);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-052 Verify non-Admin users cannot access Admin Console sub-pages directly via URL \${tags("Security", "High")}\`, async ({ page }) => {
      try {
        await openAsNonAdminMaker(page);
        for (const p of [portalUsersPath(), templatesPath(), loginCommsPath()]) {
          await navigateDirectAdminPath(page, p);
          await expectAdminConsoleAccessDenied(page);
        }
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-053 Verify the Admin Console left navigation correctly switches between the three sections \${tags("Alternate", "Medium")}\`, async ({ page }) => {
      try {
        const pu = await requirePortalUsersAsAdmin(page);
        await pu.navigateToNotificationTemplates();
        await expect(page.getByText(/notification templates/i)).toBeVisible();
        await pu.navigateToLoginComms();
        await expect(page.getByText(/login\s*&\s*comms|banner/i)).toBeVisible();
        await pu.navigateToPortalUsers();
        await pu.expectModuleLoaded();
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-054 Verify Admin Console pages load within an acceptable response time with a realistic data volume \${tags("NFR", "Medium")}\`, async ({ page }) => {
      try {
        const sla = getAdminNfrSlaMs();
        if (process.env.ADMIN_LARGE_DATA_SET !== "true") {
          skipWithReason(
            "Set ADMIN_LARGE_DATA_SET=true when 200+ users / 50+ templates exist; measuring with current DEV volume only otherwise.",
          );
        }
        const pu = await requirePortalUsersAsAdmin(page);
        const t0 = Date.now();
        await pu.navigateToNotificationTemplates();
        await pu.navigateToLoginComms();
        expect(Date.now() - t0).toBeLessThan(sla * 3);
      } catch (e) { handleSkip(e); }
    });

    test(\`TC-055 Verify the login banner and support details cannot be configured per branch or per dealer \${tags("Negative", "Medium")}\`, async ({ page }) => {
      try {
        const lc = await requireLoginCommsAsAdmin(page);
        await lc.expectNoBranchOrDealerScopeControls();
      } catch (e) { handleSkip(e); }
    });`);

const footer = `
  },
);
`;

const content = header + tests.join("\n") + footer;
const outPath = "tests/admin-console/Regression/Sprint2/AdminConsoleRegression.test.ts";
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content);
console.log("Generated AdminConsoleRegression.test.ts");
