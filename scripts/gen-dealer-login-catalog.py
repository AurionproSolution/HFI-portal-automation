import json
import openpyxl

p = r"C:\Users\piyush.more\Downloads\US-DLR-001_TestCases_v1_0.xlsx"
ws = openpyxl.load_workbook(p, data_only=True)["Test Cases"]
rows = []
for r in ws.iter_rows(min_row=2, values_only=True):
    if not r[0]:
        continue
    steps = str(r[6] or "").replace("\r\n", "\n")
    rows.append(
        {
            "id": r[0],
            "title": r[1],
            "type": r[2],
            "priority": r[3],
            "acFlowRef": r[4] or "",
            "preconditions": r[5] or "",
            "steps": steps,
            "testData": r[7] or "-",
            "expectedResult": r[8] or "",
        }
    )

out = "d:/HondaDealerAutomation/testData/hfi/dealerLoginCatalog.ts"
content = """/**
 * US-DLR-001 — Dealer Portal Login (Excel v1.0 single source of truth).
 * Source: US-DLR-001_TestCases_v1_0.xlsx
 */

export type DealerLoginCaseType =
  | "UI"
  | "Security"
  | "Positive"
  | "Negative"
  | "NFR"
  | "Edge"
  | "Alternate";

export type DealerLoginCasePriority = "High" | "Medium" | "Low";

export interface DealerLoginCase {
  id: string;
  title: string;
  type: DealerLoginCaseType;
  priority: DealerLoginCasePriority;
  acFlowRef: string;
  preconditions: string;
  steps: string;
  testData: string;
  expectedResult: string;
}

export const DEALER_LOGIN_CASES: DealerLoginCase[] = %s;

export function getDealerLoginCase(id: string): DealerLoginCase | undefined {
  return DEALER_LOGIN_CASES.find((c) => c.id === id);
}
""" % json.dumps(rows, indent=2, ensure_ascii=False)

with open(out, "w", encoding="utf-8") as f:
    f.write(content)

print(f"written {len(rows)} cases to {out}")
