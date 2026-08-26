#!/usr/bin/env python3
import json
from pathlib import Path

cases = json.loads(
    Path("reports/us-dlr-008-contact-info-cases.json").read_text(encoding="utf-8")
)
lines = [
    "/**",
    " * US-DLR-006 — Contact Info Update",
    " * Source: US-DLR-008_TestCases_v1.0.xlsx",
    " */",
    "",
    "export interface ContactInfoCase {",
    "  id: string;",
    "  title: string;",
    "  type: string;",
    "  priority: string;",
    "  ac: string;",
    "}",
    "",
    "export const CONTACT_INFO_CASES: ContactInfoCase[] = [",
]
for c in cases:
    ac = c.get("AC / Flow Ref", "").replace("'", "\\'")
    title = c.get("Test Case Title", "").replace("'", "\\'")
    lines.append(
        f"  {{ id: '{c['TC ID']}', title: '{title}', type: '{c['Type']}', priority: '{c['Priority']}', ac: '{ac}' }},"
    )
lines += [
    "];",
    "",
    "export function getContactInfoCase(id: string): ContactInfoCase | undefined {",
    "  return CONTACT_INFO_CASES.find((c) => c.id === id);",
    "}",
    "",
]
Path("testData/hfi/contactInfoCatalog.ts").write_text("\n".join(lines), encoding="utf-8")
print(f"wrote catalog ({len(cases)} cases)")
