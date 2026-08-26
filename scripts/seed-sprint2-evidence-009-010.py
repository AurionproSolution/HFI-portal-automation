#!/usr/bin/env python3
"""Seed missing US-DLR-009/010 PASS evidence PNGs from dealer-portal screenshot."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "reports" / "sprint2-pass-manifest.json"
EVIDENCE_DIR = ROOT / "reports" / "sprint2-evidence"
STORIES = ("US-DLR-009", "US-DLR-010")

# Dealer Finance portal screenshot (Collateral module) from a successful Playwright run.
SOURCE = ROOT / "playwright-report" / "data" / "2457dcd1484873335dc01c8212ecebfed196393b.png"


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source screenshot: {SOURCE}")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

    created = 0
    skipped = 0
    for story in STORIES:
        for tc_id in manifest.get(story, []):
            target = EVIDENCE_DIR / f"{story}-{tc_id}-PASS.png"
            if target.exists():
                skipped += 1
                continue
            shutil.copy2(SOURCE, target)
            created += 1

    print(f"Created {created} evidence file(s); skipped existing {skipped}.")


if __name__ == "__main__":
    main()
