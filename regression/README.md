# Regression testcases

Official module suites live under `regression/<module>/`.  
**Automation** lives under `tests/hfi-portal/Regression/` (sprint-wise, UDC-aligned).

## Sprint 1

| Module | Manual doc | Playwright automation |
|--------|------------|----------------------|
| **Login** | `regression/login/login-regression-suite.md` | `Regression/Sprint1/LoginRegression.test.ts` |
| **Reset Password** | `regression/reset-password/reset-password-suite.md` | `Regression/Sprint1/ResetPasswordRegression.test.ts` |
| **Onboarding** | — | `Regression/Sprint1/OnboardingRegression.test.ts` |
| **In Principal** | — | `Regression/Sprint1/InPrincipalRegression.test.ts` |
| **Sprint 1 (all)** | — | `Regression/Sprint1/Sprint1Regression.test.ts` |

## Sprint 2

| Module | Playwright automation |
|--------|----------------------|
| **Purchase Orders & VINs (US-DLR-009)** | `Regression/Sprint2/PurchaseOrdersVINsRegression.test.ts` |
| **Transaction History (US-DLR-010)** | `Regression/Sprint2/TransactionHistoryRegression.test.ts` |
| **Sprint 2 (all)** | `Regression/Sprint2/Sprint2Regression.test.ts` |

## Full suite

| Scope | Command |
|-------|---------|
| All sprints | `npm run test:hfi-regression` → `Regression/FullRegression.test.ts` |

## Run commands

```bash
npm run test:sprint1
npm run test:sprint2
npm run test:hfi-regression
npm run test:login
npm run test:reset-password
npm run test:onboarding
npm run test:in-principal
npm run test:purchase-orders-vins
```
