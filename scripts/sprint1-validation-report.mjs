import fs from "fs";

const read = (p) => fs.readFileSync(p, "utf8");

const loginTests = read("tests/hfi-portal/Regression/Sprint1/LoginRegression.test.ts");
const rpHandlers = read("tests/hfi-portal/reset-password/resetPassword.handlers.ts");
const obMain = read("tests/hfi-portal/Regression/Sprint1/OnboardingRegression.test.ts");
const ip = read("tests/hfi-portal/Regression/Sprint1/InPrincipalRegression.test.ts");

const loginTestIds = [
  ...new Set([...loginTests.matchAll(/CASE\["HFS-T(\d{4})"\]/g)].map((m) => m[1])),
];
const rpHandlerKeys = [
  ...new Set([...rpHandlers.matchAll(/"TC-(\d{3})":/g)].map((m) => m[1])),
];
const obMainTC = [...obMain.matchAll(/test\("TC-(\d{2,3})/g)].map((m) => m[1].padStart(2, "0"));
const ipTC = [...ip.matchAll(/test\("TC-(\d{2,3})/g)].map((m) => m[1].padStart(2, "0"));

const loginAll = Array.from({ length: 42 }, (_, i) => String(i + 1).padStart(4, "0"));
const rpAll = Array.from({ length: 48 }, (_, i) => String(i + 1).padStart(3, "0"));
const obAll = Array.from({ length: 44 }, (_, i) => String(i + 1).padStart(2, "0"));
const ipDocAll = obAll; // in-principal uses TC-001..044 naming in same module context

function missing(all, have) {
  return all.filter((x) => !have.includes(x));
}

const rpSkipOnly = [];
for (const tc of rpAll) {
  const block = rpHandlers.split(`"TC-${tc}":`)[1]?.split(/"TC-\d{3}":/)[0] ?? "";
  if (/async \(\) => \{[\s\S]*?SKIP:|Cannot Verify|test\.skip/i.test(block) && block.length < 120) {
    rpSkipOnly.push(`TC-${tc}`);
  }
}

console.log(
  JSON.stringify(
    {
      login: {
        expected: 42,
        automated: loginTestIds.length,
        missing: missing(loginAll, loginTestIds),
      },
      resetPassword: {
        expected: 48,
        handlers: rpHandlerKeys.length,
        missing: missing(rpAll, rpHandlerKeys),
      },
      onboardingDashboard: {
        expected: 44,
        inMainSuite: [...new Set(obMainTC)].length,
        missingFromMain: missing(obAll, [...new Set(obMainTC)]),
      },
      inPrincipal: {
        automated: [...new Set(ipTC)].length,
        ids: [...new Set(ipTC)].sort(),
        missingFrom1to44: missing(ipDocAll, [...new Set(ipTC)]),
      },
    },
    null,
    2,
  ),
);
