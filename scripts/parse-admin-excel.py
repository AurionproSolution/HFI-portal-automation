#!/usr/bin/env python3
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

XLSX = Path(r"C:\Users\piyush.more\Downloads\UC-ADM-001_TestCases_v1_0.xlsx")
OUT = Path("reports/uc-adm-001-admin-console-cases.json")


def col_letter_to_index(col: str) -> int:
    n = 0
    for ch in col:
        n = n * 26 + ord(ch) - 64
    return n - 1


def parse_sheet(z: zipfile.ZipFile, sheet_path: str) -> list[list[str]]:
    sheet = ET.fromstring(z.read(sheet_path))
    ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

    def cell_value(c) -> str:
        t = c.get("t")
        if t == "inlineStr":
            is_el = c.find("m:is", ns)
            if is_el is not None:
                return "".join((n.text or "") for n in is_el.findall(".//m:t", ns))
            return ""
        v = c.find("m:v", ns)
        return v.text if v is not None and v.text is not None else ""

    grid: dict[tuple[int, int], str] = {}
    for row in sheet.findall("m:sheetData/m:row", ns):
        r = int(row.get("r"))
        for c in row.findall("m:c", ns):
            ref = c.get("r")
            col = re.match(r"([A-Z]+)", ref).group(1)
            ci = col_letter_to_index(col)
            grid[(r, ci)] = cell_value(c)
    if not grid:
        return []
    max_r = max(k[0] for k in grid)
    max_c = max(k[1] for k in grid)
    return [[grid.get((r, c), "") for c in range(max_c + 1)] for r in range(1, max_r + 1)]


def find_header(rows: list[list[str]]) -> tuple[int, list[str]] | None:
    for i, r in enumerate(rows):
        cells = [str(c).strip() for c in r]
        if "TC ID" in cells:
            idx = cells.index("TC ID")
            return i, cells[idx:]
        if cells and cells[0] == "TC ID":
            return i, cells
    return None


def main() -> None:
    all_cases: list[dict] = []
    with zipfile.ZipFile(XLSX) as z:
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_to = {
            r.get("Id"): r.get("Target")
            for r in rels.findall(
                "{http://schemas.openxmlformats.org/package/2006/relationships}Relationship"
            )
        }
        for sheet in wb.findall("m:sheets/m:sheet", ns):
            name = sheet.get("name") or ""
            rid = sheet.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            )
            target = rid_to[rid].lstrip("/")
            if target.startswith("xl/"):
                sheet_path = target
            elif target.startswith("worksheets/"):
                sheet_path = f"xl/{target}"
            else:
                continue
            rows = parse_sheet(z, sheet_path)
            found = find_header(rows)
            if not found:
                if name.lower() != "test cases":
                    print(f"Sheet '{name}': no header ({len(rows)} rows)")
                continue
            header_idx, header = found
            row_width = len(rows[header_idx])
            header = [str(c).strip() for c in rows[header_idx]]
            for r in rows[header_idx + 1 :]:
                padded = list(r) + [""] * (row_width - len(r))
                if not padded or not str(padded[0]).strip():
                    continue
                tc = str(padded[0]).strip()
                if not tc.startswith("TC-"):
                    continue
                obj = {
                    header[j]: str(padded[j]).strip() if j < len(padded) else ""
                    for j in range(len(header))
                }
                all_cases.append(obj)

    payload = {
        "total": len(all_cases),
        "types": {},
        "cases": all_cases,
    }
    for c in all_cases:
        t = c.get("Type", "Unknown")
        payload["types"][t] = payload["types"].get(t, 0) + 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Total cases: {len(all_cases)}")
    if all_cases:
        print("Columns:", list(all_cases[0].keys()))
        by_type: dict[str, int] = {}
        for c in all_cases:
            t = c.get("Type", "Unknown")
            by_type[t] = by_type.get(t, 0) + 1
        print("By type:", by_type)
        for c in all_cases:
            print(f"{c['TC ID']} | {c.get('Type','')} | {c.get('Test Case Title','')[:75]}")


if __name__ == "__main__":
    main()
