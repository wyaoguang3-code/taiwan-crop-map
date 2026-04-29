#!/usr/bin/env python3
"""Repack modified App.tsx back into the original bundled HTML.

The bundler structure:
- Outer HTML has <script type="__bundler/template">{JSON-encoded inner HTML string}</script>
- That inner HTML string contains <script type="text/babel">...</script> with the React source

We:
1. Swap the inner babel script body with our modified App.tsx.
2. Inject an extra <script> that registers region-specific right-panel images
   (any PNG at unpacked/right_panel_<region>.png is picked up automatically).
"""
import base64, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "bundle-source.html"
UNPACKED = ROOT / "unpacked"
NEW_APP = UNPACKED / "App.tsx"
OUT = ROOT / "index.html"

html = SRC.read_text(encoding="utf-8")
new_app_src = NEW_APP.read_text(encoding="utf-8")

# Collect per-region right-panel images (optional — any region without one falls back).
regions = {}
for p in sorted(UNPACKED.glob("right_panel_*.png")):
    region_id = p.stem.replace("right_panel_", "")
    data = base64.b64encode(p.read_bytes()).decode("ascii")
    regions[region_id] = f"data:image/png;base64,{data}"
print(f"Region-specific right panels: {list(regions.keys())}")

# Bundle the full-page design export. The new App renders this single image
# as the page background and only overlays the 2 dynamic data cards on top.
design_imgs = {}
for name in ("full_page", "tomato_dashboard"):
    f = UNPACKED / f"{name}.jpg"
    if not f.exists():
        continue
    data = base64.b64encode(f.read_bytes()).decode("ascii")
    design_imgs[name] = f"data:image/jpeg;base64,{data}"
print(f"Design assets bundled: {list(design_imgs.keys())}")

# Locate the template <script>...</script> block.
tpl_re = re.compile(
    r'(<script type="__bundler/template">)(.*?)(</script>)',
    re.DOTALL,
)
m = tpl_re.search(html)
if not m:
    raise SystemExit("template script not found")

tpl_json_str = m.group(2)
inner_html = json.loads(tpl_json_str)  # decoded inner HTML (string)

# Swap the babel script body inside the inner HTML.
babel_re = re.compile(
    r'(<script type="text/babel"[^>]*>)(.*?)(</script>)',
    re.DOTALL,
)
if not babel_re.search(inner_html):
    raise SystemExit("babel script not found inside template")

new_inner = babel_re.sub(
    lambda bm: bm.group(1) + new_app_src + bm.group(3),
    inner_html,
    count=1,
)

# Inject (or replace) the per-region images script right before the babel script.
regions_script = (
    '<script>window.RIGHT_PANEL_IMGS='
    + json.dumps(regions, ensure_ascii=False)
    + ';window.DESIGN_IMGS='
    + json.dumps(design_imgs, ensure_ascii=False)
    + ';</script>'
)
# Remove any previously-injected version so re-runs stay idempotent.
new_inner = re.sub(
    r'<script>window\.RIGHT_PANEL_IMGS=.*?</script>',
    '',
    new_inner,
    flags=re.DOTALL,
)
new_inner = babel_re.sub(
    lambda bm: regions_script + bm.group(0),
    new_inner,
    count=1,
)

# Re-encode as JSON. Important: escape "</" → "<\u002F" so inner </script>
# tags inside the JSON string don't terminate the outer <script> early.
# (That's how the original bundler encoded it; \u002F is a valid JSON escape for /.)
new_tpl_json = json.dumps(new_inner, ensure_ascii=False).replace("</", "<\\u002F")

# Splice back into the outer HTML.
new_html = html[:m.start(2)] + new_tpl_json + html[m.end(2):]
OUT.write_bytes(new_html.encode("utf-8"))
print(f"Wrote {OUT}")
print(f"Size: {len(new_html):,} bytes (original: {len(html):,} bytes)")
