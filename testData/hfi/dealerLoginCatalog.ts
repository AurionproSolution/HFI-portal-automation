/**
 * US-DLR-001 — Dealer Portal Login (Excel v1.0 single source of truth).
 * Source: US-DLR-001_TestCases_v1_0.xlsx
 */

export type DealerLoginCaseType =
  | "UI"
  | "Security"
  | "Positive"
  | "Negative"
  | "NFR"
  | "Edge"
  | "Alternate";

export type DealerLoginCasePriority = "High" | "Medium" | "Low";

export interface DealerLoginCase {
  id: string;
  title: string;
  type: DealerLoginCaseType;
  priority: DealerLoginCasePriority;
  acFlowRef: string;
  preconditions: string;
  steps: string;
  testData: string;
  expectedResult: string;
}

export const DEALER_LOGIN_CASES: DealerLoginCase[] = [
  {
    "id": "TC-001",
    "title": "Verify the Login screen displays all required elements",
    "type": "UI",
    "priority": "High",
    "acFlowRef": "AC-1",
    "preconditions": "Dealer navigates to the portal URL without an active session.",
    "steps": "1. Open the portal URL in a browser.\n2. Observe the Login screen.",
    "testData": "-",
    "expectedResult": "Username field, Password field, Sign in button, Forgot password link and an encrypted-session note are all displayed."
  },
  {
    "id": "TC-002",
    "title": "Verify the Password field has a show/hide toggle",
    "type": "UI",
    "priority": "Medium",
    "acFlowRef": "Frontend Req",
    "preconditions": "Login screen is displayed.",
    "steps": "1. Enter a value in the Password field.\n2. Click the show/hide toggle.",
    "testData": "Password: Test@1234",
    "expectedResult": "The toggle switches the field between masked (dots/asterisks) and plain-text display of the entered password."
  },
  {
    "id": "TC-003",
    "title": "Verify the Branding section displays the Honda Finance India logo and application name",
    "type": "UI",
    "priority": "Low",
    "acFlowRef": "Frontend Req",
    "preconditions": "Login screen is displayed.",
    "steps": "1. Load the Login screen.\n2. Inspect the branding section.",
    "testData": "-",
    "expectedResult": "The Honda Finance India logo and the application name/details are displayed correctly."
  },
  {
    "id": "TC-004",
    "title": "Verify the encrypted-session note and support contact block are visible",
    "type": "UI",
    "priority": "Medium",
    "acFlowRef": "AC-1",
    "preconditions": "Login screen is displayed.",
    "steps": "1. Load the Login screen.\n2. Locate the session note and support contact block.",
    "testData": "-",
    "expectedResult": "An encrypted-session note is shown along with a support contact block containing phone/email details."
  },
  {
    "id": "TC-005",
    "title": "Verify Username field accepts a dealer-ID for login",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-2",
    "preconditions": "A dealer account exists with a valid dealer-ID and password; must_reset_password = false.",
    "steps": "1. Enter the dealer-ID in Username.\n2. Enter the correct password.\n3. Click Sign in.",
    "testData": "Username: DLR100234 (dealer-ID)",
    "expectedResult": "The dealer is authenticated successfully using the dealer-ID and routed to the role-appropriate dashboard."
  },
  {
    "id": "TC-006",
    "title": "Verify Username field accepts a registered email for login",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-2",
    "preconditions": "A dealer account exists with a registered email and password; must_reset_password = false.",
    "steps": "1. Enter the registered email in Username.\n2. Enter the correct password.\n3. Click Sign in.",
    "testData": "Username: dealer@example.com",
    "expectedResult": "The dealer is authenticated successfully using the registered email and routed to the role-appropriate dashboard."
  },
  {
    "id": "TC-007",
    "title": "Verify valid credentials authenticate the dealer over TLS and load the dashboard",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-2",
    "preconditions": "must_reset_password = false for the dealer account.",
    "steps": "1. Enter valid Username and Password.\n2. Click Sign in.\n3. Inspect the connection used for the login request.",
    "testData": "-",
    "expectedResult": "The credentials are validated over a TLS-encrypted connection via the Login API, and the dealer is routed to the role-appropriate dashboard."
  },
  {
    "id": "TC-008",
    "title": "Verify successful login routes to the Consumer Finance dashboard by default",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "Navigation",
    "preconditions": "Dealer has both Consumer Finance and Dealer Finance access, with no other default configured.",
    "steps": "1. Log in with valid credentials.\n2. Observe the landing dashboard.",
    "testData": "-",
    "expectedResult": "The dealer lands on the Consumer Finance dashboard by default after a successful login."
  },
  {
    "id": "TC-009",
    "title": "Verify successful login routes a Dealer Finance-only role appropriately",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "Navigation / RBAC",
    "preconditions": "Dealer account is configured with Dealer Finance access only, per RBAC.",
    "steps": "1. Log in with valid credentials for this account.\n2. Observe the landing dashboard.",
    "testData": "-",
    "expectedResult": "The dealer lands on the Dealer Finance dashboard consistent with their configured role and permissions."
  },
  {
    "id": "TC-010",
    "title": "Verify first-time login (must_reset_password = true) routes to the mandatory Set Password screen",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-3",
    "preconditions": "Dealer account has must_reset_password = true.",
    "steps": "1. Log in with the valid (temporary) credentials.\n2. Observe the resulting screen.",
    "testData": "-",
    "expectedResult": "The dealer is routed to the mandatory Set Password screen; no dashboard or other route is accessible."
  },
  {
    "id": "TC-011",
    "title": "Verify direct URL navigation to a protected route is blocked while must_reset_password = true",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "AC-3, E5",
    "preconditions": "Dealer has logged in with must_reset_password = true and is on the Set Password screen.",
    "steps": "1. Manually type the URL of a protected route (e.g., the dashboard) into the browser address bar.\n2. Press Enter.",
    "testData": "-",
    "expectedResult": "The dealer is redirected back to the Set Password screen; the protected route is not accessible until the password is reset."
  },
  {
    "id": "TC-012",
    "title": "Verify a successful login ends any pre-existing active session for the same dealer ID",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-4",
    "preconditions": "The dealer has an existing active session (e.g., logged in on Device/Browser A).",
    "steps": "1. While Session A remains open, log in with the same dealer ID from Device/Browser B.\n2. Return to Session A and attempt an action.",
    "testData": "-",
    "expectedResult": "The new login on Device B succeeds; Session A is invalidated and the dealer on Device A is signed out or redirected to Login on their next action."
  },
  {
    "id": "TC-013",
    "title": "Verify only one active session per dealer ID is allowed across two concurrent logins",
    "type": "Edge",
    "priority": "Medium",
    "acFlowRef": "AC-4",
    "preconditions": "No active session currently exists for the dealer ID.",
    "steps": "1. Log in on Device A.\n2. Immediately log in on Device B with the same dealer ID.\n3. Check the session status on Device A.",
    "testData": "-",
    "expectedResult": "Device B's session becomes the sole active session; Device A's session is ended per the single-active-session rule."
  },
  {
    "id": "TC-014",
    "title": "Verify the exact inline error message and attempts-remaining count for incorrect credentials",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "AC-5",
    "preconditions": "Dealer account has zero prior failed attempts in the current lockout window.",
    "steps": "1. Enter a valid Username with an incorrect Password.\n2. Click Sign in.\n3. Observe the inline error.",
    "testData": "Username: valid, Password: incorrect",
    "expectedResult": "An inline error is shown: 'Login credentials are incorrect. X attempts remaining', where X correctly reflects the attempts left (4, on the first failure)."
  },
  {
    "id": "TC-015",
    "title": "Verify the attempts-remaining count decrements correctly on successive failed attempts",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "AC-5",
    "preconditions": "Dealer has already had 1 failed attempt (4 remaining).",
    "steps": "1. Attempt Sign in with incorrect credentials again.\n2. Observe the inline error.\n3. Repeat for a third failed attempt.",
    "testData": "-",
    "expectedResult": "The attempts-remaining count decreases by one with each failure (e.g., 3, then 2), matching the actual number of attempts left before lockout."
  },
  {
    "id": "TC-016",
    "title": "Verify no session is created when invalid credentials are submitted",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "AC-5",
    "preconditions": "Dealer account is active with no prior lockout.",
    "steps": "1. Submit Sign in with incorrect credentials.\n2. Attempt to access a protected route directly afterward.",
    "testData": "-",
    "expectedResult": "No authenticated session is created; the dealer remains on the Login screen and cannot access any protected route."
  },
  {
    "id": "TC-017",
    "title": "Verify the account is locked with the exact message on the 5th consecutive failed attempt",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "AC-6",
    "preconditions": "Dealer has already had 4 consecutive failed login attempts.",
    "steps": "1. Submit Sign in with incorrect credentials a 5th consecutive time.\n2. Observe the resulting message.",
    "testData": "5th consecutive failed attempt",
    "expectedResult": "The account is locked and the message 'Your account has been suspended. Please reach out to your IT admin to reactivate your account.' is displayed."
  },
  {
    "id": "TC-018",
    "title": "Verify a locked account blocks further login attempts even with correct credentials",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "AC-6",
    "preconditions": "Dealer's account is locked following 5 consecutive failed attempts.",
    "steps": "1. Enter the correct Username and Password.\n2. Click Sign in.",
    "testData": "Correct credentials on a locked account",
    "expectedResult": "Sign in is blocked; the lockout message is shown again, and no session is created even though the credentials are correct."
  },
  {
    "id": "TC-019",
    "title": "Verify the failed-attempt counter resets after a subsequent successful login",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "Business Rule",
    "preconditions": "Dealer has 2 failed attempts recorded (not yet locked) and then logs in successfully.",
    "steps": "1. Have 2 failed attempts recorded.\n2. Log in successfully with correct credentials.\n3. Log out, then deliberately fail once more.\n4. Observe the attempts-remaining count.",
    "testData": "-",
    "expectedResult": "After the successful login, the failed-attempt counter resets to zero; the next failed attempt shows 4 attempts remaining, not 2."
  },
  {
    "id": "TC-020",
    "title": "Verify a suspended/inactive account shows the exact suspension message and creates no session",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "AC-7",
    "preconditions": "Dealer account status is suspended or inactive in DFS.",
    "steps": "1. Enter otherwise-valid credentials for the suspended/inactive account.\n2. Click Sign in.",
    "testData": "Suspended dealer account",
    "expectedResult": "Access is denied with the message 'Your account has been suspended. Please reach out to your IT admin to reactivate your account.'; no session is created."
  },
  {
    "id": "TC-021",
    "title": "Verify selecting Forgot password directs the dealer to the Password Reset flow",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-8",
    "preconditions": "Login screen is displayed.",
    "steps": "1. Click Forgot password.\n2. Observe the resulting screen.",
    "testData": "-",
    "expectedResult": "The dealer is directed to the Password Reset flow."
  },
  {
    "id": "TC-022",
    "title": "Verify an idle session is terminated after 15 minutes of inactivity",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-9",
    "preconditions": "Dealer has an active authenticated session.",
    "steps": "1. Log in successfully.\n2. Leave the session idle (no activity) for 15 minutes.\n3. Attempt an action.",
    "testData": "Idle period: 15 minutes",
    "expectedResult": "The session is terminated and the dealer is returned to the Login screen."
  },
  {
    "id": "TC-023",
    "title": "Verify activity within the 15-minute window prevents the idle timeout",
    "type": "Negative",
    "priority": "Medium",
    "acFlowRef": "AC-9",
    "preconditions": "Dealer has an active authenticated session.",
    "steps": "1. Log in successfully.\n2. Perform an action (e.g., navigate a page) at the 10-minute mark.\n3. Wait a further 10 minutes (20 minutes total from login, 10 minutes from the last activity).",
    "testData": "Activity at 10 minutes, then idle",
    "expectedResult": "The session remains active at the 20-minute mark since the last activity reset the idle timer; the session terminates only after 15 minutes from that last activity."
  },
  {
    "id": "TC-024",
    "title": "Verify Logout terminates the session and clears the auth token",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-10",
    "preconditions": "Dealer has an active authenticated session.",
    "steps": "1. Click Logout.\n2. Inspect the client for the authentication token.",
    "testData": "-",
    "expectedResult": "The session is terminated and the auth token is cleared client-side."
  },
  {
    "id": "TC-025",
    "title": "Verify the dealer is returned to the Login screen after logout",
    "type": "Positive",
    "priority": "High",
    "acFlowRef": "AC-10",
    "preconditions": "Dealer has just clicked Logout.",
    "steps": "1. Complete the Logout action.\n2. Observe the resulting screen.",
    "testData": "-",
    "expectedResult": "The dealer is returned to the Login screen."
  },
  {
    "id": "TC-026",
    "title": "Verify browser back button after logout does not restore the authenticated session",
    "type": "Negative",
    "priority": "Medium",
    "acFlowRef": "Edge / Session Security",
    "preconditions": "Dealer has logged out and is on the Login screen.",
    "steps": "1. Click the browser's Back button.\n2. Observe the resulting page and attempt an action on it.",
    "testData": "-",
    "expectedResult": "Any previously cached authenticated page does not allow further action; the dealer is redirected to the Login screen when attempting to interact with a protected route."
  },
  {
    "id": "TC-027",
    "title": "Verify a successful login event is recorded in the audit log",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "AC-11",
    "preconditions": "Dealer logs in successfully.",
    "steps": "1. Log in with valid credentials.\n2. Inspect the audit log for this event.",
    "testData": "-",
    "expectedResult": "An entry is recorded in the audit log with dealer ID, timestamp and outcome 'success' for the login event."
  },
  {
    "id": "TC-028",
    "title": "Verify a failed login event is recorded in the audit log",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "AC-11",
    "preconditions": "Dealer submits an incorrect login attempt.",
    "steps": "1. Attempt login with incorrect credentials.\n2. Inspect the audit log for this event.",
    "testData": "-",
    "expectedResult": "An entry is recorded in the audit log with dealer ID, timestamp and outcome 'failed' for the login attempt."
  },
  {
    "id": "TC-029",
    "title": "Verify an account-lockout event is recorded in the audit log",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "AC-11",
    "preconditions": "Dealer's account reaches the 5-failed-attempt lockout threshold.",
    "steps": "1. Trigger account lockout via 5 consecutive failed attempts.\n2. Inspect the audit log for this event.",
    "testData": "-",
    "expectedResult": "An entry is recorded in the audit log with dealer ID, timestamp and outcome 'locked' for the lockout event."
  },
  {
    "id": "TC-030",
    "title": "Verify a logout event is recorded in the audit log",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "AC-11",
    "preconditions": "Dealer logs out of an active session.",
    "steps": "1. Click Logout.\n2. Inspect the audit log for this event.",
    "testData": "-",
    "expectedResult": "An entry is recorded in the audit log with dealer ID, timestamp and outcome 'logout' for the event."
  },
  {
    "id": "TC-031",
    "title": "Verify a non-blocking technical error is shown when the authentication service is unavailable",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "AC-12",
    "preconditions": "The Identity / Authentication service is unreachable or times out.",
    "steps": "1. Simulate the auth service being unavailable.\n2. Attempt to log in with valid credentials.\n3. Observe the resulting message.",
    "testData": "Auth service: forced timeout/500",
    "expectedResult": "A non-blocking technical error is shown; the dealer is not locked out and can retry once the service is available again."
  },
  {
    "id": "TC-032",
    "title": "Verify a retry succeeds once the authentication service recovers",
    "type": "Edge",
    "priority": "Medium",
    "acFlowRef": "AC-12",
    "preconditions": "The dealer has just seen the non-blocking technical error from TC-031; the auth service is now restored.",
    "steps": "1. Restore the auth service.\n2. Retry Sign in with valid credentials.\n3. Observe the outcome.",
    "testData": "-",
    "expectedResult": "The retried login succeeds and the dealer is routed to the role-appropriate dashboard."
  },
  {
    "id": "TC-033",
    "title": "Verify login credentials are transmitted only over TLS/HTTPS",
    "type": "Security",
    "priority": "High",
    "acFlowRef": "Business Rule",
    "preconditions": "Login screen is loaded.",
    "steps": "1. Submit the Login form with valid credentials.\n2. Inspect the network traffic for the request.",
    "testData": "-",
    "expectedResult": "The request is sent only over an HTTPS/TLS-encrypted connection; the login page itself is not servable over plain HTTP."
  },
  {
    "id": "TC-034",
    "title": "Verify the Password field masks input by default",
    "type": "Security",
    "priority": "Medium",
    "acFlowRef": "Frontend Req",
    "preconditions": "Login screen is displayed.",
    "steps": "1. Click into the Password field.\n2. Type a password.\n3. Observe the field without using the show/hide toggle.",
    "testData": "Password: Test@1234",
    "expectedResult": "The typed password is masked (dots/asterisks) by default; it is visible only when the show/hide toggle is explicitly activated."
  },
  {
    "id": "TC-035",
    "title": "Verify the session token is cleared and not reusable after logout",
    "type": "Security",
    "priority": "High",
    "acFlowRef": "AC-10, Security",
    "preconditions": "Dealer has logged out; the previous session token is known (e.g., captured before logout).",
    "steps": "1. Log out.\n2. Attempt to reuse the previously captured session token to call a protected API/route directly.",
    "testData": "-",
    "expectedResult": "The old session token is rejected; the protected route/API returns an unauthorised response and does not honour the stale token."
  },
  {
    "id": "TC-036",
    "title": "Verify Sign in is blocked with a validation prompt when Username or Password is blank",
    "type": "Negative",
    "priority": "Medium",
    "acFlowRef": "Frontend Req",
    "preconditions": "Login screen is displayed.",
    "steps": "1. Leave Username blank and click Sign in.\n2. Enter Username, leave Password blank, and click Sign in.",
    "testData": "Username/Password left blank in turn",
    "expectedResult": "Sign in is blocked and a validation prompt indicates the missing required field(s); no login request is sent to the server."
  },
  {
    "id": "TC-037",
    "title": "Verify an expired/invalid session on a protected route redirects to Login",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "Table2 – Session Validation",
    "preconditions": "Dealer's session has expired or is otherwise invalid (e.g., token tampered).",
    "steps": "1. Attempt to access a protected route with the expired/invalid session.\n2. Observe the Session Validation response.",
    "testData": "-",
    "expectedResult": "The Session Validation call returns 401 and the dealer is redirected to the Login screen."
  },
  {
    "id": "TC-038",
    "title": "Verify the Login API 401 response is handled with the inline error and attempts-remaining message",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "Table2 – Login API",
    "preconditions": "Dealer submits incorrect credentials.",
    "steps": "1. Submit incorrect credentials.\n2. Inspect the Login API response and the resulting UI message.",
    "testData": "-",
    "expectedResult": "The Login API returns 401; the UI shows the inline 'Login credentials are incorrect. X attempts remaining' message, consistent with AC-5."
  },
  {
    "id": "TC-039",
    "title": "Verify the Login API 423 response is handled with the lockout message",
    "type": "Negative",
    "priority": "High",
    "acFlowRef": "Table2 – Login API",
    "preconditions": "Dealer's account is already locked (5 consecutive failed attempts).",
    "steps": "1. Attempt to log in on the locked account.\n2. Inspect the Login API response and the resulting UI message.",
    "testData": "-",
    "expectedResult": "The Login API returns 423; the UI shows the lockout message directing the dealer to contact IT admin, consistent with AC-6."
  },
  {
    "id": "TC-040",
    "title": "Verify the session clears client-side even if the Logout API call fails",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "Table2 – Logout, non-blocking",
    "preconditions": "Dealer clicks Logout while the Logout API is unavailable or returns an error.",
    "steps": "1. Simulate a Logout API failure.\n2. Click Logout.\n3. Observe the client-side session state.",
    "testData": "Logout API: forced failure",
    "expectedResult": "The session is cleared client-side (token removed, dealer returned to Login) regardless of the Logout API's failure, consistent with its non-blocking failure handling."
  },
  {
    "id": "TC-041",
    "title": "Verify role and permissions are applied per User Master / RBAC configuration on login",
    "type": "Security",
    "priority": "High",
    "acFlowRef": "Business Rule",
    "preconditions": "Two dealer accounts exist with different RBAC-configured roles/permissions.",
    "steps": "1. Log in as Dealer A (Consumer Finance only).\n2. Log in as Dealer B (Consumer Finance + Dealer Finance).\n3. Compare the accessible sections for each.",
    "testData": "Dealer A: Consumer Finance only; Dealer B: both",
    "expectedResult": "Each dealer sees and can access only the sections/dashboards permitted by their configured role and permissions."
  },
  {
    "id": "TC-042",
    "title": "Verify Username field handling of case and leading/trailing whitespace",
    "type": "Edge",
    "priority": "Low",
    "acFlowRef": "Frontend Req",
    "preconditions": "A dealer account's registered email is known in a specific case (e.g., Dealer@Example.com).",
    "steps": "1. Enter the username in a different case, and with leading/trailing spaces.\n2. Submit Sign in with the correct password.",
    "testData": "Username: '  dealer@example.com  ' or 'DEALER@EXAMPLE.COM'",
    "expectedResult": "Login succeeds as expected for a case-insensitive, whitespace-trimmed match (or, if the system is case-sensitive by design, this is confirmed against the design intent)."
  },
  {
    "id": "TC-043",
    "title": "Verify a script/SQL injection attempt in Username or Password is safely rejected",
    "type": "Security",
    "priority": "High",
    "acFlowRef": "Security",
    "preconditions": "Login screen is displayed.",
    "steps": "1. Enter a script/SQL injection payload into Username and/or Password.\n2. Click Sign in.",
    "testData": "Username: \"' OR '1'='1\"",
    "expectedResult": "The login attempt is safely rejected as invalid credentials; no script executes and no unintended data access or system error occurs."
  },
  {
    "id": "TC-044",
    "title": "Verify each dealership resolves to a single portal login as per DFS provisioning",
    "type": "Positive",
    "priority": "Low",
    "acFlowRef": "Business Rule",
    "preconditions": "A dealership has been provisioned with exactly one portal login in DFS.",
    "steps": "1. Confirm in DFS that the dealership has a single provisioned login.\n2. Log in using that single set of credentials.",
    "testData": "-",
    "expectedResult": "The dealership's single provisioned login authenticates successfully; internal access management within the dealership is understood to be the dealership's own responsibility, not enforced by additional portal logins."
  },
  {
    "id": "TC-045",
    "title": "Verify an unprovisioned/unknown dealer-ID shows an appropriate invalid-credentials response",
    "type": "Negative",
    "priority": "Medium",
    "acFlowRef": "Edge",
    "preconditions": "A dealer-ID that has never been provisioned in DFS is used.",
    "steps": "1. Enter the unknown dealer-ID with any password.\n2. Click Sign in.",
    "testData": "Username: 'DLR999999' (unknown)",
    "expectedResult": "The system responds with the standard invalid-credentials message (consistent with AC-5), not a system error or a message revealing the account doesn't exist."
  },
  {
    "id": "TC-046",
    "title": "Verify the support contact block displays correct phone/email details",
    "type": "UI",
    "priority": "Low",
    "acFlowRef": "Frontend Req",
    "preconditions": "Login screen is displayed.",
    "steps": "1. Load the Login screen.\n2. Inspect the support contact block.",
    "testData": "-",
    "expectedResult": "The support contact block shows the correct, currently valid phone number and/or email address for dealer support."
  },
  {
    "id": "TC-047",
    "title": "Verify the configurable lockout threshold is honoured as configured",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "Business Rule",
    "preconditions": "The lockout threshold is configured to a non-default value (e.g., 3) in a test environment.",
    "steps": "1. Attempt login with incorrect credentials up to the configured threshold.\n2. Observe when lockout occurs.",
    "testData": "Configured threshold: 3 failed attempts",
    "expectedResult": "The account locks exactly at the configured threshold (3 failed attempts in this case), not the default 5, confirming the setting is configurable."
  },
  {
    "id": "TC-048",
    "title": "Verify the configurable idle-timeout duration is honoured as configured",
    "type": "Positive",
    "priority": "Medium",
    "acFlowRef": "Business Rule",
    "preconditions": "The idle-timeout duration is configured to a non-default value (e.g., 5 minutes) in a test environment.",
    "steps": "1. Log in successfully.\n2. Remain idle for the configured duration.\n3. Attempt an action.",
    "testData": "Configured idle timeout: 5 minutes",
    "expectedResult": "The session terminates at the configured 5-minute idle duration, not the default 15 minutes, confirming the setting is configurable."
  },
  {
    "id": "TC-049",
    "title": "Verify the Login screen and Login API respond within an acceptable response time",
    "type": "NFR",
    "priority": "Medium",
    "acFlowRef": "NFR",
    "preconditions": "Standard network conditions; authentication service is healthy.",
    "steps": "1. Load the Login screen and measure render time.\n2. Submit valid credentials and measure the Login API response time.",
    "testData": "-",
    "expectedResult": "Both the Login screen load and the Login API response complete within the agreed performance SLA (target to be confirmed with the performance/NFR team; flag if it exceeds a few seconds under normal load)."
  },
  {
    "id": "TC-050",
    "title": "Verify the dealer without an active session is presented with the Login screen on opening the portal URL",
    "type": "Alternate",
    "priority": "Medium",
    "acFlowRef": "Trigger / Main Flow",
    "preconditions": "Dealer has no active session (e.g., a fresh browser session, or after logout).",
    "steps": "1. Open the portal URL directly.\n2. Observe the resulting screen.",
    "testData": "-",
    "expectedResult": "The dealer is presented with the Login screen, not any dashboard or protected route."
  }
];

export function getDealerLoginCase(id: string): DealerLoginCase | undefined {
  return DEALER_LOGIN_CASES.find((c) => c.id === id);
}
