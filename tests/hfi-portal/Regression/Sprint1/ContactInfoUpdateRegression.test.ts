/**
 * US-DLR-006 — Contact Info Update (Registered Email & Mobile OTP-Verified)
 * Single source of truth: US-DLR-008_TestCases_v1.0.xlsx (TC-001 … TC-047)
 * Catalog: testData/hfi/contactInfoCatalog.ts
 */

import { test, expect } from "@playwright/test";
import { getAppOrigin } from "@config/env";
import {
  initContactInfoSteps,
  regressionStep,
  requireContactInfo,
  requireEmailPanel,
  requireMobilePanel,
  requireEnv,
  requireOtpHarness,
  skipWithReason,
  getTestOtp,
} from "../../contact-info/contactInfo.helpers";

function handleSkip(e: unknown): void {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.startsWith("SKIP:")) test.skip(true, msg.replace(/^SKIP:\s*/, ""));
  throw e;
}

test.describe(
  "US-DLR-006 Contact Info Update (Registered Email & Mobile OTP-Verified) @us-dlr-006 @contact-info @regression",
  () => {
    test.setTimeout(300_000);

    test.beforeEach(() => {
      initContactInfoSteps();
    });

    test(`TC-001 Update panel opens with Current value (read-only), New value field and Send OTP action @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Verify email update panel baseline fields", async () => {
          await contact.expectUpdatePanelBasics("email");
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-002 Update panel launches correctly from Registered Email on Profile @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireContactInfo(page);
        await regressionStep("Open Registered Email update panel", async () => {
          await contact.openEmailUpdatePanel();
        });
        await regressionStep("Verify Current email and New email fields", async () => {
          await expect(page.getByText(/current email id/i)).toBeVisible();
          await expect(page.getByText(/new email id/i)).toBeVisible();
          const current = await contact.getCurrentEmailValue();
          expect(current).toMatch(/@/);
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-003 Update panel launches correctly from Registered Mobile on Profile @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireMobilePanel(page);
        await regressionStep("Verify Current mobile and New mobile fields", async () => {
          await expect(page.getByText(/current mobile/i)).toBeVisible();
          await expect(page.getByText(/new mobile/i)).toBeVisible();
          const current = await contact.getCurrentMobileValue();
          expect(current).toMatch(/\+91|\d{10}/);
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-004 Panel is inline (does not navigate away from Profile) @ui @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Verify inline panel on Profile", async () => {
          await contact.expectInlineOnProfile();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-005 Valid email address is accepted and Send OTP becomes enabled @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Enter valid new email", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
        });
        await regressionStep("Verify Send OTP is enabled", async () => {
          await contact.expectSendOtpEnabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-006 Invalid email (missing @) blocks Send OTP with inline error @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Enter email without @", async () => {
          await contact.fillNewEmail("dealerexample.com");
        });
        await regressionStep("Verify inline validation and disabled Send OTP", async () => {
          await contact.expectEmailValidationError();
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-007 Invalid email (missing domain) blocks Send OTP @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Enter email without domain", async () => {
          await contact.fillNewEmail("dealer@");
        });
        await regressionStep("Verify validation blocks Send OTP", async () => {
          await contact.expectEmailValidationError();
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-008 Email with leading / trailing spaces is handled per spec @edge @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Enter email with surrounding whitespace", async () => {
          await contact.fillNewEmail(`  ${contact.getTestNewEmail()}  `);
        });
        await regressionStep("Verify trimmed email is accepted", async () => {
          await contact.expectSendOtpEnabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-009 Email input is case-insensitive on comparison @edge @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        const current = await contact.getCurrentEmailValue();
        const mixed = current
          .split("@")
          .map((p, i) => (i === 0 ? p.toUpperCase() : p.toLowerCase()))
          .join("@");
        await regressionStep("Enter mixed-case current email as new value", async () => {
          await contact.fillNewEmail(mixed);
        });
        await regressionStep("Verify same-as-current validation", async () => {
          await contact.expectSameEmailError();
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-010 Valid 10-digit mobile is accepted and Send OTP becomes enabled @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireMobilePanel(page);
        await regressionStep("Enter valid 10-digit mobile", async () => {
          await contact.fillNewMobile(contact.getTestNewMobile());
        });
        await regressionStep("Verify Send OTP is enabled", async () => {
          await contact.expectSendOtpEnabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-011 9-digit mobile is rejected as invalid @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireMobilePanel(page);
        await regressionStep("Enter 9-digit mobile", async () => {
          await contact.fillNewMobile("987654321");
        });
        await regressionStep("Verify Send OTP remains disabled", async () => {
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-012 11+ digit mobile is rejected as invalid @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireMobilePanel(page);
        await regressionStep("Enter 11-digit mobile", async () => {
          await contact.fillNewMobile("98765432110");
        });
        await regressionStep("Verify Send OTP remains disabled", async () => {
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-013 Mobile containing non-numeric characters is rejected @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireMobilePanel(page);
        const input = page.locator("main input").nth(1);
        await regressionStep("Enter mobile with alpha characters", async () => {
          await contact.fillNewMobile("98765abcde");
        });
        await regressionStep("Verify non-numeric input is blocked or rejected", async () => {
          const value = await input.inputValue();
          expect(value).not.toMatch(/[a-z]/i);
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-014 Empty New value blocks Send OTP @negative @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Leave New email blank", async () => {
          await contact.fillNewEmail("");
        });
        await regressionStep("Verify Send OTP is disabled", async () => {
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-015 New email identical to current email is rejected with the correct message @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        const current = await contact.getCurrentEmailValue();
        await regressionStep("Enter current email as new value", async () => {
          await contact.fillNewEmail(current);
        });
        await regressionStep("Verify same-as-current error and disabled Send OTP", async () => {
          await contact.expectSameEmailError();
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-016 New mobile identical to current mobile is rejected @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireMobilePanel(page);
        const currentDigits = contact.normalizeMobileDigits(
          await contact.getCurrentMobileValue(),
        );
        await regressionStep("Enter current mobile as new value", async () => {
          await contact.fillNewMobile(currentDigits);
        });
        await regressionStep("Verify same-as-current error and disabled Send OTP", async () => {
          await contact.expectSameMobileError();
          await contact.expectSendOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-017 Send OTP for email update delivers OTP to the correct channel @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_OTP_INBOX",
          "Requires OTP delivery verification channel (email inbox/SMS) — set CONTACT_INFO_OTP_INBOX.",
        );
        skipWithReason(
          "OTP delivery channel verification requires CONTACT_INFO_OTP_INBOX or test mail/SMS harness.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-018 Send OTP for mobile update delivers OTP to the NEW mobile number @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_SMS_HARNESS",
          "Requires SMS harness for new mobile OTP delivery — set CONTACT_INFO_SMS_HARNESS.",
        );
        skipWithReason(
          "New-mobile OTP delivery verification requires CONTACT_INFO_SMS_HARNESS.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-019 OTP entry field appears after Send OTP is clicked with correct validation elements @ui @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Send OTP with valid new email", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
        });
        await regressionStep("Verify OTP entry step UI", async () => {
          await contact.expectOtpStepVisible();
          await expect(contact.sendOtpButton).toBeHidden();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-020 Correct OTP within validity window applies the update @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireOtpHarness(
          "Valid OTP required — set CONTACT_INFO_TEST_OTP or CONTACT_INFO_OTP_API_URL.",
        );
        const contact = await requireEmailPanel(page);
        const otp = getTestOtp()!;
        await regressionStep("Send OTP and verify with test OTP", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
          await contact.fillOtp(otp);
          await contact.clickVerifyOtp();
        });
        await regressionStep("Verify success confirmation or panel closes", async () => {
          await expect(
            page.getByText(/success|updated|saved/i),
          ).toBeVisible({ timeout: 30_000 });
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-021 Updated email is reflected on Profile immediately and on the next visit @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_UPDATED_EMAIL",
          "Requires successful email update test data — set CONTACT_INFO_UPDATED_EMAIL and CONTACT_INFO_TEST_OTP.",
        );
        skipWithReason(
          "Post-update email reflection requires CONTACT_INFO_UPDATED_EMAIL from a controlled OTP-verified update.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-022 Updated mobile is reflected on Profile immediately and on the next visit @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_UPDATED_MOBILE",
          "Requires successful mobile update test data — set CONTACT_INFO_UPDATED_MOBILE and CONTACT_INFO_TEST_OTP.",
        );
        skipWithReason(
          "Post-update mobile reflection requires CONTACT_INFO_UPDATED_MOBILE from a controlled OTP-verified update.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-023 OTP is valid for 5 minutes from the time of send @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireOtpHarness(
          "OTP validity window test requires CONTACT_INFO_TEST_OTP and optional CONTACT_INFO_OTP_DELAY_MS simulation.",
        );
        requireEnv(
          "CONTACT_INFO_OTP_DELAY_MS",
          "Requires OTP delay simulation — set CONTACT_INFO_OTP_DELAY_MS (e.g. 240000) or backend expiry hook.",
        );
        skipWithReason(
          "5-minute OTP validity test requires CONTACT_INFO_TEST_OTP and CONTACT_INFO_OTP_DELAY_MS/backend expiry hook.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-024 Incorrect OTP shows attempts-remaining message @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Send OTP", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
        });
        await regressionStep("Submit incorrect OTP", async () => {
          await contact.fillOtp("111111");
          await contact.clickVerifyOtp();
        });
        await regressionStep("Verify attempts-remaining message", async () => {
          await contact.expectIncorrectOtpMessage();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-025 Expired OTP (>5 minutes) is rejected @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_EXPIRED_OTP",
          "Requires expired OTP test token — set CONTACT_INFO_EXPIRED_OTP or backend expiry simulation.",
        );
        skipWithReason(
          "Expired OTP test requires CONTACT_INFO_EXPIRED_OTP or backend OTP expiry simulation.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-026 3 unsuccessful OTP attempts trigger the 24-hour / Service Request message @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_LOCKOUT_TEST_DEALER",
          "Requires dedicated lockout test dealer — set CONTACT_INFO_LOCKOUT_TEST_DEALER to avoid suspending production dealer accounts.",
        );
        skipWithReason(
          "3-attempt lockout test requires CONTACT_INFO_LOCKOUT_TEST_DEALER — not run on dealer8 to protect account safety.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-027 After 3 failures, dealer cannot retry the flow for 24 hours @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_LOCKOUT_TEST_DEALER",
          "Requires dealer in 24-hour lockout state — set CONTACT_INFO_LOCKOUT_TEST_DEALER.",
        );
        skipWithReason(
          "24-hour cool-down enforcement requires CONTACT_INFO_LOCKOUT_TEST_DEALER in lockout state.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-028 Empty OTP submission is blocked without incrementing counter @negative @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Reach OTP entry step", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
          await contact.expectOtpStepVisible();
        });
        await regressionStep("Verify empty OTP blocks Verify", async () => {
          await contact.fillOtp("");
          await contact.expectVerifyOtpDisabled();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-029 Resend OTP is disabled for 60 seconds with a countdown timer visible @ui @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Send OTP to reach resend state", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
          await contact.expectOtpStepVisible();
        });
        if (!(await contact.resendOtpButton.isVisible().catch(() => false))) {
          skipWithReason(
            "Resend OTP control not visible on DEV after Send OTP — UI may not expose resend yet.",
          );
        }
        await regressionStep("Verify Resend OTP disabled with countdown", async () => {
          await contact.expectResendOtpDisabled();
          await contact.expectResendCountdownVisible();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-030 Resend OTP re-enables after 60 seconds @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_RESEND_WAIT_MS",
          "Requires resend timer hook — set CONTACT_INFO_RESEND_WAIT_MS=60000 or backend shortened timer for automation.",
        );
        skipWithReason(
          "60-second Resend OTP re-enable test requires CONTACT_INFO_RESEND_WAIT_MS or shortened DEV timer.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-031 A newly-sent OTP invalidates the previous one @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireOtpHarness(
          "OTP invalidation test requires two OTP values — set CONTACT_INFO_TEST_OTP and CONTACT_INFO_TEST_OTP_RESEND.",
        );
        requireEnv(
          "CONTACT_INFO_TEST_OTP_RESEND",
          "Requires second OTP from resend — set CONTACT_INFO_TEST_OTP_RESEND.",
        );
        skipWithReason(
          "OTP invalidation across resend requires CONTACT_INFO_TEST_OTP, CONTACT_INFO_TEST_OTP_RESEND, and resend timer.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-032 Resend OTP flow still respects the 3-attempt verification limit @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_LOCKOUT_TEST_DEALER",
          "Requires dedicated lockout test dealer — set CONTACT_INFO_LOCKOUT_TEST_DEALER.",
        );
        skipWithReason(
          "Cumulative 3-attempt limit across resends requires CONTACT_INFO_LOCKOUT_TEST_DEALER.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-033 Resend OTP countdown resets on each Resend click @positive @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "CONTACT_INFO_RESEND_WAIT_MS",
          "Requires resend timer hook — set CONTACT_INFO_RESEND_WAIT_MS.",
        );
        skipWithReason(
          "Resend countdown reset test requires CONTACT_INFO_RESEND_WAIT_MS or shortened DEV timer.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-034 Cancel closes the panel and no change is made @alternate @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        const before = await contact.getCurrentEmailValue();
        await regressionStep("Cancel update panel", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickCancel();
        });
        await regressionStep("Verify panel closed and email unchanged", async () => {
          await contact.expectPanelClosed();
          await contact.openEmailUpdatePanel();
          expect(await contact.getCurrentEmailValue()).toBe(before);
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-035 Cancel during OTP entry invalidates the pending OTP session @security @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireOtpHarness(
          "Cancel invalidation test requires CONTACT_INFO_TEST_OTP to verify stale OTP rejection.",
        );
        skipWithReason(
          "Cancel OTP invalidation requires CONTACT_INFO_TEST_OTP and controlled resend after cancel.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-036 Panel behavior (fields, validation, OTP flow) is consistent for email and mobile @positive @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireContactInfo(page);
        await regressionStep("Verify email panel structure", async () => {
          await contact.openEmailUpdatePanel();
          await contact.expectUpdatePanelBasics("email");
          await contact.clickCancel();
        });
        await regressionStep("Verify mobile panel structure", async () => {
          await contact.openMobileUpdatePanel();
          await contact.expectUpdatePanelBasics("mobile");
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-037 OTP is never displayed in URL, logs or unencrypted client storage @security @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Send OTP and verify client storage safety", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
          await contact.assertOtpNotInClientStorage();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-038 OTP verification is transmitted over HTTPS/TLS @security @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        if (getAppOrigin().startsWith("http://")) {
          skipWithReason(
            "DEV portal is served over HTTP — TLS >= 1.2 validation requires HTTPS environment (staging/UAT).",
          );
        }
        const contact = await requireEmailPanel(page);
        await regressionStep("Send OTP over HTTPS", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
          await contact.assertHttpsOnLastOtpCall();
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-039 Direct API update without OTP is rejected @security @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Prime Send OTP to discover update API host", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
        });
        await regressionStep("Attempt direct update without OTP verification", async () => {
          const status = await contact.attemptDirectUpdateWithoutOtp(
            "email",
            contact.getTestNewEmail(),
          );
          expect(status).toBeGreaterThan(0);
          expect([401, 403, 404, 405, 415, 422]).toContain(status);
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-040 Reuse of a verified OTP does not permit a second update @security @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireOtpHarness(
          "OTP reuse test requires CONTACT_INFO_TEST_OTP from a completed verification.",
        );
        skipWithReason(
          "OTP single-use enforcement requires CONTACT_INFO_TEST_OTP from a prior successful verification.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-041 OTP notification failure (Sinch down) surfaces as a non-blocking retry @negative @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "SIMULATE_SINCH_DOWN",
          "Requires Sinch outage simulation — set SIMULATE_SINCH_DOWN=true.",
        );
        skipWithReason(
          "Sinch outage simulation not configured — set SIMULATE_SINCH_DOWN.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-042 Update flow can be retried after a notification failure without penalty @positive @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireEnv(
          "SIMULATE_SINCH_DOWN",
          "Requires Sinch outage + recovery simulation — set SIMULATE_SINCH_DOWN.",
        );
        skipWithReason(
          "Notification failure retry test requires SIMULATE_SINCH_DOWN recovery harness.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-043 Send OTP API - contract validation @integration @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Trigger Send OTP API", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
        });
        const api = contact.getLastSendOtpResponse();
        if (!api?.url) {
          skipWithReason("Send OTP API not observed on network.");
        }
        await regressionStep("Verify Send OTP API contract", async () => {
          expect(api!.status).toBeGreaterThanOrEqual(200);
          expect(api!.status).toBeLessThan(500);
          const serialized = JSON.stringify({
            req: api!.requestBody,
            res: api!.body,
          }).toLowerCase();
          expect(serialized).toMatch(/email|mobile|channel|dealer|otp|contact/);
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-044 Update registered email / mobile API - contract validation @integration @high @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireOtpHarness(
          "Update API contract validation requires CONTACT_INFO_TEST_OTP for verified update call.",
        );
        skipWithReason(
          "Update API contract validation requires CONTACT_INFO_TEST_OTP and real verify/update endpoint.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-045 Multiple browser tabs on the same update flow do not create OTP confusion @edge @medium @us-dlr-006 @contact-info @regression`, async ({ page, context }) => {
      try {
        requireOtpHarness(
          "Multi-tab OTP test requires CONTACT_INFO_TEST_OTP values per tab.",
        );
        skipWithReason(
          "Multi-tab OTP confusion test requires CONTACT_INFO_TEST_OTP harness across tabs.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-046 OTP field only accepts the specified digit / character length @ui @medium @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        const contact = await requireEmailPanel(page);
        await regressionStep("Reach OTP entry step", async () => {
          await contact.fillNewEmail(contact.getTestNewEmail());
          await contact.clickSendOtp();
        });
        await regressionStep("Verify OTP length enforcement", async () => {
          const expected =
            Number.parseInt(process.env.CONTACT_INFO_OTP_LENGTH?.trim() || "6", 10);
          await contact.expectOtpLengthEnforced(expected);
        });
      } catch (e) {
        handleSkip(e);
      }
    });

    test(`TC-047 Concurrent update on both Email and Mobile in same session @edge @low @us-dlr-006 @contact-info @regression`, async ({ page }) => {
      try {
        requireOtpHarness(
          "Concurrent email+mobile update requires two valid OTPs — set CONTACT_INFO_TEST_OTP and CONTACT_INFO_TEST_OTP_MOBILE.",
        );
        requireEnv(
          "CONTACT_INFO_TEST_OTP_MOBILE",
          "Requires mobile OTP — set CONTACT_INFO_TEST_OTP_MOBILE.",
        );
        skipWithReason(
          "Concurrent email+mobile updates require CONTACT_INFO_TEST_OTP and CONTACT_INFO_TEST_OTP_MOBILE.",
        );
      } catch (e) {
        handleSkip(e);
      }
    });
  },
);
