# Honda Login Regression Suite (Official)

**Module:** Authentication / Login  
**Test cases:** 10 (HFS-T0001 … HFS-T0010)  
**Legacy IDs:** TC-001 … TC-010  

## Source of truth

| Artifact | Path |
|----------|------|
| **Canonical catalog** | `testData/hfi/loginRegressionCatalog.ts` |
| **Playwright automation** | `tests/hfi-portal/Regression/Sprint1/LoginRegression.test.ts` |

## Index

| HFS ID | TC ID | Title | Type | Priority |
|--------|-------|-------|------|----------|
| HFS-T0001 | TC-001 | Verify Login screen loads with all mandatory elements | UI | High |
| HFS-T0002 | TC-002 | Verify Password field masks input by default and show/hide toggle works | UI | Medium |
| HFS-T0003 | TC-003 | Verify TLS/HTTPS is enforced on the Login page | Security | High |
| HFS-T0004 | TC-004 | Successful login with valid Dealer ID and password – returning user | Positive | High |
| HFS-T0005 | TC-005 | Successful login with registered email as username | Positive | High |
| HFS-T0006 | TC-006 | Verify role-appropriate dashboard is loaded post-login (Consumer Finance default) | Positive | High |
| HFS-T0007 | TC-007 | First-time login – dealer is routed to mandatory Set Password screen | Positive | High |
| HFS-T0008 | TC-008 | Admin-reset account – reset-required flow behaves same as first-time login | Positive | High |
| HFS-T0009 | TC-009 | Direct URL access to any protected route is blocked when must_reset_password = true | Security | High |
| HFS-T0010 | TC-010 | Single-active-session rule – new login ends any pre-existing session | Positive | High |

Full preconditions, steps, test data, and expected results are in `testData/hfi/loginRegressionCatalog.ts`.

## Run (one case at a time)

```powershell
cd D:\HondaDealerAutomation
npx playwright test tests/hfi-portal/Regression/Sprint1/LoginRegression.test.ts -g "HFS-T0001" --project=login-chromium --workers=1
```
