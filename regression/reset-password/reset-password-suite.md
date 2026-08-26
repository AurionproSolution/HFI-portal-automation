# Honda Reset Password Regression Suite (Official)

**Module:** Reset Password / Forgot Password  
**Test cases:** 48 (HFS-T0043 … HFS-T0090)  
**Legacy IDs:** TC-001 … TC-048  

## Source of truth

| Artifact | Path |
|----------|------|
| **Canonical catalog** | `testData/hfi/resetPasswordCatalog.ts` |

## Acceptance criteria mapping (module)

| AC | Test cases (legacy) |
|----|---------------------|
| AC-1 | TC-001, TC-009, TC-034 |
| AC-2 | TC-002, TC-010, TC-047 |
| AC-3 | TC-010, TC-028 |
| AC-4 | TC-003, TC-011 |
| AC-5 | TC-025, TC-026, TC-027 |
| AC-6 | TC-005, TC-006, TC-016, TC-017, TC-018, TC-019, TC-020, TC-021, TC-024, TC-044, TC-045, TC-046 |
| AC-7 | TC-022, TC-024 |
| AC-8 | TC-023 |
| AC-9 | TC-007, TC-008, TC-043, TC-048 |
| AC-10 | TC-012, TC-013, TC-038, TC-042, TC-048 |
| AC-11 | TC-014, TC-015, TC-026, TC-028 |
| AC-12 | TC-037, TC-038, TC-039 |

## Index

| HFS ID | TC ID | Title | Type | Priority |
|--------|-------|-------|------|----------|
| HFS-T0043 | TC-001 | Verify Set a New Password screen loads correctly on First-Time path | UI | High |
| HFS-T0044 | TC-002 | Verify Forgot password link is present on Login screen and is clickable | UI | High |
| HFS-T0045 | TC-003 | Verify Reset Password screen loads correctly on Forgot Password path | UI | High |
| HFS-T0046 | TC-004 | Verify password fields are masked by default and show/hide toggle works | UI | Medium |
| HFS-T0047 | TC-005 | Live rules checklist updates in real time as the dealer types | UI | High |
| HFS-T0048 | TC-006 | Save / Save and continue button is disabled until all policy rules are met | UI | High |
| HFS-T0049 | TC-007 | Successful first-time password set with a policy-compliant password | Positive | High |
| HFS-T0050 | TC-008 | must_reset_password flag is cleared only on a successful first-time reset | Positive | High |
| HFS-T0051 | TC-009 | No other route is accessible while on the mandatory Set Password screen | Security | High |
| HFS-T0052 | TC-010 | Forgot Password with valid registered email issues a temporary password | Positive | High |
| HFS-T0053 | TC-011 | Temporary password is time-bound and works within the validity window | Positive | High |
| HFS-T0054 | TC-012 | Successful password reset via Forgot Password path routes user to Login | Positive | High |
| HFS-T0055 | TC-013 | Dealer can sign in with the newly set password after Forgot Password flow | Positive | High |
| HFS-T0056 | TC-014 | Request a fresh temporary password when the previous one expires or is not received | Alternate | High |
| HFS-T0057 | TC-015 | Resend request is subject to the configured resend limit | Negative | Medium |
| HFS-T0058 | TC-016 | New Password shorter than 8 characters is rejected | Negative | High |
| HFS-T0059 | TC-017 | New Password without an uppercase letter is rejected | Negative | High |
| HFS-T0060 | TC-018 | New Password without a lowercase letter is rejected | Negative | High |
| HFS-T0061 | TC-019 | New Password without a number is rejected | Negative | High |
| HFS-T0062 | TC-020 | New Password without a special character is rejected | Negative | High |
| HFS-T0063 | TC-021 | New Password meeting exactly the minimum policy is accepted (boundary) | Edge | Medium |
| HFS-T0064 | TC-022 | New Password and Confirm Password mismatch keeps Save disabled | Negative | High |
| HFS-T0065 | TC-023 | New Password identical to the old / current password is rejected | Negative | High |
| HFS-T0066 | TC-024 | Empty New Password or Confirm Password keeps Save disabled | Negative | Medium |
| HFS-T0067 | TC-025 | Incorrect temporary password is rejected with the correct message | Negative | High |
| HFS-T0068 | TC-026 | Expired temporary password is rejected | Negative | High |
| HFS-T0069 | TC-027 | Retry limit exceeded for temporary password entry blocks further attempts | Negative | High |
| HFS-T0070 | TC-028 | Temporary password is single-use only | Security | High |
| HFS-T0071 | TC-029 | Unregistered email submitted – generic message shown (no account enumeration) | Security | High |
| HFS-T0072 | TC-030 | Invalid email format is blocked at field level | Negative | Medium |
| HFS-T0073 | TC-031 | Blank email is not accepted | Negative | Medium |
| HFS-T0074 | TC-032 | Deactivated / suspended dealer email – no temp password issued; generic message | Security | High |
| HFS-T0075 | TC-033 | Cancel Forgot Password before completing temporary password entry | Alternate | Medium |
| HFS-T0076 | TC-034 | Direct URL access to protected route from Set Password screen is blocked | Security | High |
| HFS-T0077 | TC-035 | Notification service unavailable during Forgot Password – generic non-blocking error | Negative | High |
| HFS-T0078 | TC-036 | Auth service unavailable during Set Password – no partial update, dealer sees error | Negative | High |
| HFS-T0079 | TC-037 | Successful first-time password reset is written to the audit log | NFR | High |
| HFS-T0080 | TC-038 | Successful forgot-password reset is written to the audit log | NFR | High |
| HFS-T0081 | TC-039 | Failed password-reset attempts are audit-logged | NFR | High |
| HFS-T0082 | TC-040 | Password is never transmitted in plain text during Set / Reset | Security | High |
| HFS-T0083 | TC-041 | XSS payload in New Password field is safely handled | Security | High |
| HFS-T0084 | TC-042 | Existing sessions are invalidated after a successful Forgot Password reset | Security | High |
| HFS-T0085 | TC-043 | First-Time session is not established if Set Password fails | Security | High |
| HFS-T0086 | TC-044 | Password containing multiple allowed special characters is accepted | Edge | Medium |
| HFS-T0087 | TC-045 | Password with leading / trailing whitespace behavior is per spec | Edge | Medium |
| HFS-T0088 | TC-046 | Maximum length boundary for New Password is enforced correctly | Edge | Low |
| HFS-T0089 | TC-047 | Email is treated case-insensitively on Forgot Password | Edge | Medium |
| HFS-T0090 | TC-048 | Multiple rapid clicks on Save do not create duplicate password updates | Edge | Medium |

Full preconditions, steps, test data, and expected results are in `testData/hfi/resetPasswordCatalog.ts`.
