import json
from pathlib import Path

cases = json.loads(
    Path("reports/us-dlr-007-profile-cases.json").read_text(encoding="utf-8")
)
lines = [
    "/**",
    " * US-DLR-005 — Profile (Dealer Info, Branches & Key Connects)",
    " * Source: US-DLR-007_TestCases_v1.0.xlsx",
    " */",
    "",
    "export interface ProfileCase {",
    "  id: string;",
    "  title: string;",
    "  type: string;",
    "  priority: string;",
    "  ac: string;",
    "}",
    "",
    "export const PROFILE_CASES: ProfileCase[] = [",
]
for c in cases:
    title = c["Test Case Title"].replace("\\", "\\\\").replace('"', '\\"')
    ac = str(c["AC / Flow Ref"]).replace("\\", "\\\\").replace('"', '\\"')
    lines.append(
        f'  {{ id: "{c["TC ID"]}", title: "{title}", '
        f'type: "{c["Type"]}", priority: "{c["Priority"]}", ac: "{ac}" }},'
    )
lines += [
    "];",
    "",
    "export function getProfileCase(id: string): ProfileCase | undefined {",
    "  return PROFILE_CASES.find((c) => c.id === id);",
    "}",
]
Path("testData/hfi/profileCatalog.ts").write_text(
    "\n".join(lines), encoding="utf-8"
)
print(f"catalog: {len(cases)} cases")
