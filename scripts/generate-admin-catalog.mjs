import fs from "fs";

const data = JSON.parse(
  fs.readFileSync("reports/uc-adm-001-admin-console-cases.json", "utf8"),
);

function esc(s) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, "\\n");
}

const lines = [
  "/**",
  " * UC-ADM-001 — Admin Console catalog",
  " * Source: UC-ADM-001_TestCases_v1_0.xlsx",
  " */",
  "",
  "export interface AdminConsoleCase {",
  "  id: string;",
  "  title: string;",
  "  type: string;",
  "  priority: string;",
  "  ac: string;",
  "  preconditions: string;",
  "  steps: string;",
  "  testData: string;",
  "  expectedResult: string;",
  "}",
  "",
  "export const ADMIN_CONSOLE_CASES: AdminConsoleCase[] = [",
];

for (const c of data.cases) {
  lines.push(
    `  { id: '${esc(c["TC ID"])}', title: '${esc(c["Test Case Title"])}', type: '${esc(c.Type)}', priority: '${esc(c.Priority)}', ac: '${esc(c["AC / Flow Ref"])}', preconditions: '${esc(c.Preconditions)}', steps: '${esc(c["Test Steps"])}', testData: '${esc(c["Test Data"])}', expectedResult: '${esc(c["Expected Result"])}' },`,
  );
}

lines.push(
  "];",
  "",
  "export function getAdminConsoleCase(id: string): AdminConsoleCase | undefined {",
  "  return ADMIN_CONSOLE_CASES.find((c) => c.id === id);",
  "}",
);

fs.writeFileSync("testData/admin/adminConsoleCatalog.ts", lines.join("\n"));
console.log(`wrote ${data.cases.length} cases`);
