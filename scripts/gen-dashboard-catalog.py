import json
from pathlib import Path

cases = json.loads(
    Path("reports/us-dlr-006-cases.json").read_text(encoding="utf-8")
)
lines = [
    "/**",
    " * US-DLR-007 — Dealer Finance Dashboard (Limit, Exposure & Action Items)",
    " * Source: US-DLR-006_TestCases_v1.0.xlsx",
    " */",
    "",
    "export interface DealerFinanceDashboardCase {",
    "  id: string;",
    "  title: string;",
    "  type: string;",
    "  priority: string;",
    "  ac: string;",
    "}",
    "",
    "export const DEALER_FINANCE_DASHBOARD_CASES: DealerFinanceDashboardCase[] = [",
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
    "export function getDealerFinanceDashboardCase(",
    "  id: string,",
    "): DealerFinanceDashboardCase | undefined {",
    "  return DEALER_FINANCE_DASHBOARD_CASES.find((c) => c.id === id);",
    "}",
]
Path("testData/hfi/dealerFinanceDashboardCatalog.ts").write_text(
    "\n".join(lines), encoding="utf-8"
)
print(f"catalog: {len(cases)} cases")
