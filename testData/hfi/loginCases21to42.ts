import type {
  LoginCasePriority,
  LoginCaseType,
  LoginRegressionCase,
} from "./loginRegressionCatalog";

function tc(
  index: number,
  title: string,
  type: LoginCaseType,
  priority: LoginCasePriority,
  acFlowRef: string,
  preconditions: string,
  steps: string[],
  testData: string,
  expectedResult: string,
): LoginRegressionCase {
  const n = String(index).padStart(4, "0");
  return {
    id: `HFS-T${n}`,
    legacyId: `TC-${String(index).padStart(3, "0")}`,
    title,
    type,
    priority,
    acFlowRef,
    preconditions,
    steps,
    testData,
    expectedResult,
  };
}

export const LOGIN_CASES_21_42: LoginRegressionCase[] = [
  tc(21, "Empty Username submission is blocked with a validation message", "Negative", "Medium", "AC-5", "Login screen is loaded.", ["Leave Username blank.", "Enter a password.", "Click Sign in."], "Username: (blank)\nPassword: Any@1", "Sign in is not processed. A field-level validation message prompts the user to enter Username. Failed Login Counter is NOT incremented."),
  tc(22, "Empty Password submission is blocked with a validation message", "Negative", "Medium", "AC-5", "Login screen is loaded.", ["Enter Username.", "Leave Password blank.", "Click Sign in."], "Username: DLR12345\nPassword: (blank)", "Sign in is not processed. A field-level validation message prompts the user to enter Password. Failed Login Counter is NOT incremented."),
  tc(23, "Both fields blank – form validation blocks submission", "Negative", "Low", "AC-5", "Login screen is loaded.", ["Leave both fields blank.", "Click Sign in."], "-", "Sign in is not processed. Field-level validation shown on both fields."),
  tc(24, "Trailing / leading whitespace in Username is handled correctly", "Edge", "Medium", "AC-2", "Dealer account active.", ["Enter valid Username with leading/trailing spaces.", "Enter correct password.", "Click Sign in."], 'Username: "  DLR12345  "\nPassword: Valid@Pwd1', "Whitespace is trimmed server-side; login succeeds."),
  tc(25, "Case-sensitivity behavior of Dealer ID / email is as specified", "Edge", "Medium", "AC-2", "Dealer account active. Registered email: dealer@example.com.", ["Attempt login with email in mixed case.", "Attempt login with Dealer ID in a different case."], "Username: Dealer@Example.COM / dlr12345", "Email is treated case-insensitively (standard). Confirm whether Dealer ID is case-sensitive per DFS."),
  tc(26, "Forgot password link navigates to Password Reset flow", "Alternate", "High", "AC-8", "Login screen is loaded.", ["Click Forgot password link."], "-", "User is directed to the Password Reset flow (covered by a separate user story)."),
  tc(27, "Authentication service unavailable – non-blocking error and retry", "Negative", "High", "AC-12, E4", "Auth microservice is intentionally taken down / returns 5xx.", ["Enter valid credentials.", "Click Sign in.", "Observe the error.", "Once service is restored, click Sign in again."], "Username: DLR12345\nPassword: Valid@Pwd1", 'Non-blocking technical error is shown (e.g. "Unable to reach the service. Please try again."). Failed Login Counter is NOT incremented. Retry after restoration succeeds.'),
  tc(28, "Network loss during login – graceful error message and retry works", "Negative", "Medium", "E4", "Dealer is on the Login screen.", ["Disconnect network.", "Enter credentials and click Sign in.", "Observe error.", "Restore network and retry."], "-", "Client-side network error surfaced without crashing the page. Retry after reconnection succeeds. No lockout occurs."),
  tc(29, "Session expired / invalid on protected route returns 401 and redirects to Login", "Security", "High", "Backend – Session Validation", "Dealer is logged in; session token is expired or tampered with.", ["Manually expire or clear the token.", "Navigate to a protected route."], "-", "GET /api/auth/session returns 401. User is redirected to Login screen."),
  tc(30, "Successful login event is written to the audit log", "NFR", "High", "AC-11, BR-Audit", "Audit logging service is running.", ["Perform a successful login.", "Query the audit log."], "-", "Log entry is present with: dealer ID, timestamp (UTC + IST), event = LOGIN_SUCCESS, source IP, device / browser."),
  tc(31, "Failed login attempt is written to the audit log", "NFR", "High", "AC-11", "Audit logging service is running.", ["Perform a failed login.", "Query the audit log."], "-", "Log entry present with: dealer ID (as entered), timestamp, event = LOGIN_FAILURE, reason (invalid credentials)."),
  tc(32, "Account lockout event is written to the audit log", "NFR", "High", "AC-11", "Audit logging service is running.", ["Trigger 5 consecutive failed logins.", "Query audit log."], "-", "Log entry present with: dealer ID, timestamp, event = ACCOUNT_LOCKED."),
  tc(33, "Logout event is written to the audit log", "NFR", "Medium", "AC-11", "Audit logging service is running.", ["Login, then Logout.", "Query the audit log."], "-", "Log entry present with: dealer ID, timestamp, event = LOGOUT."),
  tc(34, "SQL injection attempt in Username is safely handled", "Security", "High", "BR-Security", "Login screen is loaded.", ["Enter a SQL-injection payload as Username.", "Enter any password.", "Click Sign in."], "Username: ' OR '1'='1\nPassword: anything", "Login is not granted. Standard invalid-credentials error is shown. No SQL error is exposed to the client."),
  tc(35, "XSS payload in Username field is sanitized", "Security", "High", "BR-Security", "Login screen is loaded.", ["Enter an XSS payload as Username.", "Click Sign in.", "Observe the response and any subsequent screen."], "Username: <script>alert(1)</script>", "Payload is escaped/sanitized. No script executes. Error message does not reflect the raw payload."),
  tc(36, "Password is never transmitted in plain text", "Security", "High", "BR-TLS", "Browser dev-tools / proxy tool is available.", ["Open network inspector.", "Perform a login.", "Inspect the /api/auth/login request payload and headers."], "-", "Request is over HTTPS. Password field is not present as plain text in any URL, referer, or unencrypted channel. TLS ≥ 1.2 is used."),
  tc(37, "Auth token is invalidated server-side on logout", "Security", "High", "AC-10", "Dealer is logged in.", ["Capture the auth token before logout.", "Perform Logout.", "Replay a protected API call using the captured token."], "-", "Replayed call returns 401. Token cannot be reused post-logout."),
  tc(38, "Browser Back navigation after logout does not restore authenticated view", "Security", "Medium", "AC-10", "Dealer just logged out.", ["Click browser Back button repeatedly.", "Observe the pages."], "-", "Cached protected pages are not restored. User is redirected to Login on any protected route."),
  tc(39, "Login with valid password containing special characters", "Edge", "Medium", "AC-2", "Dealer account exists with a special-character password.", ["Enter Username.", "Enter password with special characters.", "Click Sign in."], "Password: P@ss!w0rd#Ω", "Login succeeds; special characters are handled by the API without truncation or encoding issues."),
  tc(40, "Maximum-length inputs in Username and Password are handled", "Edge", "Low", "AC-2", "Dealer account exists with long username.", ["Enter Username at max allowed length.", "Enter password at max allowed length.", "Click Sign in."], "Boundary values per DFS spec.", "Login succeeds; no truncation or 500 error. Inputs beyond max length are prevented at the field level."),
  tc(41, "Two tabs from the same browser share the same authenticated session", "Edge", "Medium", "AC-4", "Dealer is logged in on Tab 1.", ["Open a new tab (Tab 2) on the same browser.", "Navigate to a protected route."], "-", "Tab 2 uses the same session and shows authenticated content. Logout from either tab ends the session for both."),
  tc(42, "Sign-in button double-click / rapid multi-click does not cause duplicate logins", "Edge", "Medium", "AC-2, AC-4", "Login screen is loaded.", ["Enter valid credentials.", "Rapidly click Sign in multiple times."], "Username: DLR12345\nPassword: Valid@Pwd1", "Only one login request is processed; button is disabled while processing. Only one session is created."),
];
