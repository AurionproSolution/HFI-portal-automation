# HFI Portal — Sprint regression (UDC-aligned)

```
tests/hfi-portal/
├── Regression/
│   ├── Sprint1/
│   │   ├── LoginRegression.test.ts
│   │   ├── ResetPasswordRegression.test.ts
│   │   ├── OnboardingRegression.test.ts
│   │   ├── InPrincipalRegression.test.ts
│   │   └── Sprint1Regression.test.ts      # composes Sprint 1 features
│   ├── Sprint2/
│   │   ├── PurchaseOrdersVINsRegression.test.ts
│   │   ├── TransactionHistoryRegression.test.ts
│   │   └── Sprint2Regression.test.ts      # composes Sprint 2 features
│   └── FullRegression.test.ts             # composes all sprints
├── reset-password/                          # handlers
├── in-principal/                            # helpers
├── purchase-orders-vins/                    # handlers + helpers
└── probes/                                  # excluded from regression
```

## Run commands

| Goal | Command |
|------|---------|
| **Full regression (all sprints)** | `npm run test:hfi-regression` |
| **Sprint 1 only** | `npm run test:sprint1` |
| **Sprint 2 only** | `npm run test:sprint2` |
| Login only | `npm run test:login` |
| Reset Password only | `npm run test:reset-password` |
| Onboarding only | `npm run test:onboarding` |
| In Principal only | `npm run test:in-principal` |
| Purchase Orders & VINs only | `npm run test:purchase-orders-vins` |
| Transaction History only | `npm run test:transaction-history` |
| Probes (debug) | `npm run test:onboarding:probes` |

> Compose files (`Sprint1Regression`, `Sprint2Regression`, `FullRegression`) import feature modules only — no duplicate test bodies. Use the commands above to avoid running compose + feature files together.
