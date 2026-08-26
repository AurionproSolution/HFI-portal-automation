import json
from pathlib import Path

cases = json.loads(
    Path("reports/us-dlr-005-cases.json").read_text(encoding="utf-8")
)
lines = [
    "/**",
    " * US-DLR-008 — Collateral (Read-only View)",
    " * Source: US-DLR-005_TestCases_v1.0.xlsx (official Excel — Collateral module)",
    " */",
    "",
    "export interface CollateralCase {",
    "  id: string;",
    "  title: string;",
    "  type: string;",
    "  priority: string;",
    "  ac: string;",
    "}",
    "",
    "export const COLLATERAL_CASES: CollateralCase[] = [",
]
for c in cases:
    title = c["title"].replace("\\", "\\\\").replace('"', '\\"')
    ac = c["ac"].replace("\\", "\\\\").replace('"', '\\"')
    lines.append(
        f'  {{ id: "{c["id"]}", title: "{title}", type: "{c["type"]}", '
        f'priority: "{c["priority"]}", ac: "{ac}" }},'
    )
lines += [
    "];",
    "",
    "export function getCollateralCase(id: string): CollateralCase | undefined {",
    "  return COLLATERAL_CASES.find((c) => c.id === id);",
    "}",
]
Path("testData/hfi/collateralCatalog.ts").write_text(
    "\n".join(lines), encoding="utf-8"
)
print(f"catalog written: {len(cases)} cases")
