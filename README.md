# HondaDealerAutomation

End-to-end test automation for the **Honda Financial Services Dealer Portal**, built with **Playwright**, **TypeScript**, and the **Page Object Model**.

This framework is designed for scalable regression coverage: login is a reusable module, authenticated suites reuse `storageState`, and new Honda modules plug in as page objects under `pages/`.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- Network access to the target environment

---

## Installation

```bash
git clone <repository-url>
cd HondaDealerAutomation
npm install
npx playwright install chromium
```

Copy environment variables (never commit `.env`):

```bash
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
```

Edit `.env` with your `BASE_URL`, `USERNAME`, and `PASSWORD`.

---

## Folder structure

```
HondaDealerAutomation/
├── config/                  # env, hfi-env, settings, auth config
├── fixtures/                # hfiPortalTest.ts, portalFixtures.ts
├── pages/
│   ├── common/BasePage.ts
│   └── hfi-portal/          # HFILoginPage, HFIDashboardPage, onboarding, reset-password POMs
├── playwright/
│   ├── auth/hfi-portal.auth.setup.ts
│   └── reporters/
├── regression/              # Manual regression testcase documents (Sprint 1)
├── testData/hfi/            # Catalogs, loginData, selectors, upload fixtures (files/)
├── tests/
│   ├── hfi-portal/
│   │   ├── Regression/
│   │   │   ├── Sprint1/           # feature regression + Sprint1Regression.test.ts
│   │   │   ├── Sprint2/           # feature regression + Sprint2Regression.test.ts
│   │   │   └── FullRegression.test.ts
│   │   ├── reset-password/        # handlers
│   │   ├── in-principal/          # helpers
│   │   ├── purchase-orders-vins/  # handlers + helpers
│   │   └── probes/                # excluded from regression
│   ├── smoke/ sanity/ e2e/      # Authenticated suites
│   └── seed.spec.ts
├── utils/
├── playwright.config.ts
└── package.json
```

---

## How to run tests

| Command | Description |
|--------|-------------|
| `npm run test:setup` | Generate authenticated `storageState` |
| `npm run test:sprint1` | Sprint 1 regression (Login, Reset Password, Onboarding, In Principal) |
| `npm run test:sprint2` | Sprint 2 regression (Purchase Orders & VINs) |
| `npm run test:hfi-regression` | **Full regression** (all sprints) |
| `npm run test:login` | Login regression (HFS-T0001…T0042) |
| `npm run test:reset-password` | Reset Password regression (HFS-T0043…T0090) |
| `npm run test:onboarding` | Onboarding regression (TC-001…TC-044) |
| `npm run test:in-principal` | In Principal Sanction Letter regression |
| `npm run test:login:regression` | Login regression entry only |
| `npm run test:smoke` | Smoke suite (`@smoke`, authenticated) |
| `npm run test:sanity` | Sanity folder (authenticated) |
| `npm run test:regression` | Alias for `test:hfi-regression` |
| `npm run test:e2e` | E2E journeys (authenticated) |
| `npm run test:headed` | Run with visible browser |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open Playwright HTML report (`my-report/`) |
| `npm run report:ortoni` | Open Ortoni HTML report (`ortoni-report/`) |

Full suite:

```bash
npm test
```

Type-check:

```bash
npm run lint
```

---

## Authentication model

1. **`playwright/auth/hfi-portal.auth.setup.ts`** — logs in once and saves session to `playwright/.auth/`.
2. **Authenticated projects** (`portal-chromium`, `smoke`) depend on `auth-setup` and reuse `storageState`.
3. **Login / Reset Password / Onboarding regression** run **without** stored session so authentication behavior is tested honestly.

Do **not** duplicate login steps in feature tests. Assume the dealer is already logged in unless you are in login, reset-password, or onboarding specs.

---

## How to add a Page Object

1. Create `pages/hfi-portal/<module>/HFI<Module>Page.ts` extending `BasePage`.
2. Define locators in the constructor using Playwright priority: `getByRole` → `getByLabel` → `getByPlaceholder` → `locator`.
3. Expose small, reusable methods (`open`, `fillForm`, `submit`, `verifyLoaded`).
4. Export from `pages/index.ts`.
5. Optionally wire the page in `fixtures/hfiPortalTest.ts`.

---

## How to add test cases

1. Place executable specs under `tests/<module>/` with suffix `*.test.ts`.
2. Tag titles for filtering: `@smoke`, `@regression`, `@honda`, module tags.
3. For authenticated flows, use `portal-chromium` (or `smoke`) — **no manual login**.
4. Document manual regression steps under `regression/`; mirror UDC-style headers (module, story ID, steps, expected results).
5. Map stories from `stories/` and sprint cases from `sprint-testcases/` before expanding `tests/regression/`.

---

## Coding standards

- **Strict TypeScript** — `npm run lint` must pass.
- **No hardcoded credentials** — use `config/env.ts` and `.env`.
- **No hardcoded sleeps** — use `utils/waits.ts` and Playwright `expect`.
- **Single responsibility** — small page methods; shared logic in `utils/` or `fixtures/`.
- **Locator priority** — role/label/placeholder first; XPath only when necessary.
- **SOLID** — one page per screen; compose components under `pages/Components/`.

---

## Reporting

Configured in `playwright.config.ts`:

- **HTML report** → `my-report/`
- **Trace** → on first retry
- **Screenshot / video** → on failure
- **Console logs** → via `utils/logger.ts` in page flows

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `BASE_URL` | Login URL (e.g. `http://host:port/login`) |
| `DEALER_CODE` | Dealer code login id (e.g. `DL00009`) |
| `USERNAME` | Value entered in login field (defaults to `DEALER_CODE` if omitted) |
| `EMAIL_USERNAME` | Optional email for HFS-T0005 |
| `PASSWORD` | Dealer password |
| `TEST_ENV` | `dev` \| `qat` \| `uat` \| `prod` |
| `HEADLESS` | `true` / `false` |
| `CI` | Enables CI retries and stricter guards |

---

## Next steps (stories & regression)

Upload materials to `stories/` and `sprint-testcases/`. Regression documents go in `regression/`. Automation will:

- Compare story acceptance criteria vs sprint testcases
- Identify gaps
- Add matching specs under `tests/hfi-portal/Regression/` using the login regression style in `LoginRegression.test.ts`

---

## License

UNLICENSED — internal Honda dealer automation initiative.
