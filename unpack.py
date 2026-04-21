#!/usr/bin/env python3
"""Unpack a Claude Design bundled HTML into its original source files."""
import base64, gzip, json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "bundle-source.html"
OUT = ROOT / "unpacked"
OUT.mkdir(parents=True, exist_ok=True)

html = SRC.read_text(encoding="utf-8")

def extract(tag_type):
    pat = re.compile(
        r'<script type="' + re.escape(tag_type) + r'">(.*?)</script>',
        re.DOTALL,
    )
    m = pat.search(html)
    if not m:
        raise SystemExit(f"Could not find {tag_type}")
    return m.group(1).strip()

manifest = json.loads(extract("__bundler/manifest"))
template = json.loads(extract("__bundler/template"))

print(f"Manifest entries: {len(manifest)}")
print(f"Template keys: {list(template.keys()) if isinstance(template, dict) else type(template)}")

# Save template (it's the entry/structure)
(OUT / "_template.json").write_text(json.dumps(template, indent=2, ensure_ascii=False))

# Save each manifest entry
index_lines = []
for uuid, entry in manifest.items():
    data_b64 = entry.get("data", "")
    compressed = entry.get("compressed", False)
    name = entry.get("name") or entry.get("path") or uuid
    mime = entry.get("mime", "")

    raw = base64.b64decode(data_b64)
    if compressed:
        try:
            raw = gzip.decompress(raw)
        except Exception as e:
            print(f"  ! gzip fail {name}: {e}")

    # Sanitize filename — preserve subdirectories if path-like
    safe = name.lstrip("/").replace("..", "_")
    if not safe:
        safe = uuid
    dest = OUT / safe
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(raw)
    index_lines.append(f"{uuid}\t{mime}\t{len(raw)}\t{safe}")

(OUT / "_index.tsv").write_text("\n".join(index_lines))
print(f"Unpacked {len(manifest)} files into {OUT}")
