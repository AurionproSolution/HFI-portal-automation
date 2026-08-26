import json
from pathlib import Path

cases = json.loads(
    Path("reports/us-dlr-011-cases.json").read_text(encoding="utf-8")
)
lines = [
    "/**",
    " * US-DLR-011 — Exposure Settings (Limits, Sub-limits, Expiry, Requests & Visibility)",
    " * Source: US-DLR-011_TestCases_v1_0.xlsx",
    " */",
    "",
    "export interface ExposureSettingsCase {",
    "  id: string;",
    "  title: string;",
    "  type: string;",
    "  priority: string;",
    "  ac: string;",
    "}",
    "",
    "export const EXPOSURE_SETTINGS_CASES: ExposureSettingsCase[] = [",
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
    "export function getExposureSettingsCase(",
    "  id: string,",
    "): ExposureSettingsCase | undefined {",
    "  return EXPOSURE_SETTINGS_CASES.find((c) => c.id === id);",
    "}",
]
Path("testData/hfi/exposureSettingsCatalog.ts").write_text(
    "\n".join(lines), encoding="utf-8"
)
print(f"catalog written: {len(cases)} cases")
