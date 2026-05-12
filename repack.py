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

# Pre-compile App.tsx with esbuild → plain JS so the browser doesn't run Babel
# Standalone at boot. In-browser Babel was the bottleneck for time-to-visible
# (~2.3 sec on a 100 KB TSX file); esbuild does it offline in ~5 ms.
import subprocess, shutil
COMPILED = UNPACKED / "App.compiled.js"
try:
    subprocess.run(
        ["npx", "--yes", "esbuild", str(NEW_APP),
         "--loader:.tsx=tsx", "--jsx=transform",
         "--jsx-factory=React.createElement", "--jsx-fragment=React.Fragment",
         "--target=es2020", f"--outfile={COMPILED}"],
        check=True, capture_output=True,
    )
    new_app_src = COMPILED.read_text(encoding="utf-8")
    print(f"App.tsx compiled with esbuild: {len(new_app_src)/1024:.1f} KB")
except (subprocess.CalledProcessError, FileNotFoundError) as e:
    # Fallback to in-browser Babel if esbuild isn't available — slower but works.
    print(f"esbuild unavailable ({e}); falling back to in-browser Babel")
    new_app_src = NEW_APP.read_text(encoding="utf-8")

# window.RIGHT_PANEL_IMGS is no longer referenced by App.tsx (we use full_page.jpg
# as a single background). Skip bundling to keep the HTML small.
regions = {}

# Bundle the full-page design export. The new App renders this single image
# as the page background and only overlays the 2 dynamic data cards on top.
# Design background images are served as separate files (not inlined as data: URLs)
# so the browser can decode them in parallel with HTML parsing instead of blocking
# load on ~3 MB of base64 image data. Re-encoded to WebP at quality 75/80 — saves
# roughly 70% over the original JPEG/PNG with no visible quality loss for these
# illustrated backgrounds.
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)
try:
    from PIL import Image as _Image
except ImportError:
    _Image = None
design_imgs = {}
for name, src_ext, opts in [
    ("full_page",        "jpg", {"quality": 75}),
    ("tomato_dashboard", "jpg", {"quality": 75}),
    ("taoyuan_detail",   "png", {"quality": 80}),  # has alpha — WebP keeps it
]:
    src = UNPACKED / f"{name}.{src_ext}"
    if not src.exists():
        continue
    dst = ASSETS / f"{name}.webp"
    if _Image is not None:
        _Image.open(src).save(dst, "WEBP", **opts)
    else:
        # Fallback: ship original format if Pillow unavailable.
        dst = ASSETS / f"{name}.{src_ext}"
        dst.write_bytes(src.read_bytes())
    design_imgs[name] = f"assets/{dst.name}"
print(f"Design assets (webp): {list(design_imgs.keys())}")

# Bundle per-county character SVGs (hover-to-show on the map).
# Files at unpacked/county_chars/<key>.svg are loaded by key.
# Strip Adobe Illustrator metadata (each raw SVG is ~770 KB, 99% of which is
# AI's <metadata> + i: namespace blob; after stripping each is ~5 KB).
import re as _re
def _strip_ai(svg_text: str) -> str:
    s = _re.sub(r"<metadata>.*?</metadata>", "", svg_text, flags=_re.DOTALL)
    s = _re.sub(r"\s+xmlns:i=\"[^\"]+\"", "", s)
    s = _re.sub(r"<!--.*?-->", "", s, flags=_re.DOTALL)
    return s

county_chars = {}
char_dir = UNPACKED / "county_chars"
if char_dir.exists():
    raw_total = 0
    clean_total = 0
    for p in sorted(char_dir.glob("*.svg")):
        key = p.stem
        raw = p.read_text(encoding="utf-8")
        cleaned = _strip_ai(raw).encode("utf-8")
        raw_total += len(raw.encode("utf-8"))
        clean_total += len(cleaned)
        data = base64.b64encode(cleaned).decode("ascii")
        county_chars[key] = f"data:image/svg+xml;base64,{data}"
    print(f"County characters bundled: {len(county_chars)} keys "
          f"({raw_total/1024:.0f} KB raw → {clean_total/1024:.0f} KB stripped)")

# Bundle dashboard datasets (parsed from agrstat.moa.gov.tw ODS exports).
datasets = {}
for name in ("tomato_export", "tomato_market", "disaster_yearly"):
    f = UNPACKED / f"{name}.json"
    if not f.exists():
        continue
    datasets[name] = json.loads(f.read_text())
print(f"Datasets bundled: {list(datasets.keys())}")

# Bundle Figma button SVGs (城市 pill / 加減號 / 上下箭頭, 各兩個 hover state).
button_svgs = {}
bf = UNPACKED / "figma_buttons.json"
if bf.exists():
    button_svgs = json.loads(bf.read_text())
print(f"Button SVGs bundled: {len(button_svgs)} keys")

# Bundle Taoyuan township crop characters (SVG data URLs).
taoyuan_crops = {}
tc = UNPACKED / "taoyuan_crops.json"
if tc.exists():
    taoyuan_crops = json.loads(tc.read_text())
print(f"Taoyuan crop characters bundled: {len(taoyuan_crops)} keys")

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

# Locate the original babel script — we use it both as the anchor for the
# regions_script injection (below) and as the swap point for our compiled JS.
# IMPORTANT: keep the babel attribute around while we inject `regions_script`,
# THEN flip it to plain JS. Switching first would lose the anchor.
babel_re = re.compile(
    r'(<script type="text/babel"[^>]*>)(.*?)(</script>)',
    re.DOTALL,
)
if not babel_re.search(inner_html):
    raise SystemExit("babel script not found inside template")
new_inner = inner_html

# Externalize the big data blobs to keep the initial HTML small.
# - DATASETS (~620 KB), COUNTY_CHARS (~120 KB), BUTTON_SVGS (~163 KB),
#   TAOYUAN_CROPS (~73 KB) go into assets/page-data.json (~960 KB), fetched
#   in parallel after HTML parse. Components subscribe to a 'page-data-ready'
#   custom event to re-render once data lands.
# - tomato_market.daily is trimmed to the last 365 days for the bundled
#   fallback — the live nongzhidao fetch (in useTomatoMarket) provides the
#   full 20-year history when online.
# - DESIGN_IMGS stays inline (just 3 short URLs).
# - Chart.js becomes an external file that the Dashboard component loads on
#   demand via dynamic <script> injection. Frontpage doesn't need it.
import copy
trimmed_datasets = copy.deepcopy(datasets)
if 'tomato_market' in trimmed_datasets:
    tm = trimmed_datasets['tomato_market']
    if isinstance(tm, dict) and isinstance(tm.get('daily'), list):
        tm['daily'] = tm['daily'][-365:]
page_data = {
    'datasets':       trimmed_datasets,
    'county_chars':   county_chars,
    'button_svgs':    button_svgs,
    'taoyuan_crops':  taoyuan_crops,
}
(ASSETS / "page-data.json").write_text(
    json.dumps(page_data, ensure_ascii=False, separators=(',', ':')),
    encoding="utf-8",
)
# Chart.js — copy to assets for on-demand loading by Dashboard
(ASSETS / "chart.umd.min.js").write_bytes((UNPACKED / "chart.umd.min.js").read_bytes())

regions_script = (
    '<script>window.DESIGN_IMGS='
    + json.dumps(design_imgs, ensure_ascii=False)
    + ';</script>'
    # Bootloader — empty globals so synchronous reads don't throw, then fetch
    # the heavy data in parallel and fire 'page-data-ready' when it lands.
    + "<script>"
      "window.DATASETS=window.DATASETS||{};"
      "window.COUNTY_CHARS=window.COUNTY_CHARS||{};"
      "window.BUTTON_SVGS=window.BUTTON_SVGS||{};"
      "window.TAOYUAN_CROPS=window.TAOYUAN_CROPS||{};"
      "fetch('assets/page-data.json').then(r=>r.json()).then(d=>{"
        "window.DATASETS=d.datasets||{};"
        "window.COUNTY_CHARS=d.county_chars||{};"
        "window.BUTTON_SVGS=d.button_svgs||{};"
        "window.TAOYUAN_CROPS=d.taoyuan_crops||{};"
        "window.dispatchEvent(new CustomEvent('page-data-ready'));"
      "}).catch(e=>console.warn('[page-data] fetch failed',e));"
    "</script>"
)
# Remove any previously-injected version so re-runs stay idempotent. Match
# every consecutive injected <script>…</script> regardless of how it was split.
new_inner = re.sub(
    r'(?:<script(?:\s[^>]*)?>window\.(?:RIGHT_PANEL_IMGS|DESIGN_IMGS|COUNTY_CHARS|DATASETS|BUTTON_SVGS|TAOYUAN_CROPS)=.*?</script>)+'
    r'(?:<script src="[^"]*chart[^"]*"></script>)?'
    r'(?:<script data-bundled="chart\.js">.*?</script>)?',
    '',
    new_inner,
    flags=re.DOTALL,
)

# Strip dead globals left over from earlier iterations of bundle-source.html —
# MAP_IMG_SRC / LEFT_PANEL_IMG / RIGHT_PANEL_IMG are old per-panel images that the
# current App.tsx no longer references. Together ~1.5 MB of base64 PNG.
new_inner = re.sub(
    r'<script>window\.(?:MAP_IMG_SRC|LEFT_PANEL_IMG|RIGHT_PANEL_IMG)=.*?</script>',
    '',
    new_inner,
    flags=re.DOTALL,
)
new_inner = babel_re.sub(
    lambda bm: regions_script + bm.group(0),
    new_inner,
    count=1,
)

# NOW swap the (still text/babel) script body with the esbuild-compiled JS and
# drop the type attribute so the browser runs it directly without Babel.
new_inner = babel_re.sub(
    lambda bm: '<script>' + new_app_src + bm.group(3),
    new_inner,
    count=1,
)

# Re-encode as JSON. Important: escape "</" → "<\u002F" so inner </script>
# tags inside the JSON string don't terminate the outer <script> early.
# (That's how the original bundler encoded it; \u002F is a valid JSON escape for /.)
# ── Bypass the runtime bundler ─────────────────────────────────────────────
# The outer HTML (bundle-source.html) embeds 108 assets (105 WOFF2 font slices
# + 3 JS files ≈ 6.5 MB base64-gzip). At runtime it parses the manifest,
# decodes/decompresses every asset, THEN injects the inner HTML — the user
# stares at a loading thumbnail for ~500 ms even though loadComplete fires at
# 700 ms. Here we pre-decode the manifest at repack time, save each asset to
# assets/<uuid>.<ext>, and rewrite UUID refs to those paths. The new index.html
# is just the inner HTML — no bundler, no thumbnail wait.
import gzip as _gzip

manifest_re = re.compile(r'<script type="__bundler/manifest">(.*?)</script>', re.DOTALL)
mm = manifest_re.search(html)
if not mm:
    raise SystemExit("manifest script not found")
manifest = json.loads(mm.group(1))

_MIME_EXT = {
    "font/woff2": "woff2",
    "text/javascript": "js",
    "application/javascript": "js",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
}
# Production builds of React/ReactDOM (much smaller than the dev builds the
# original bundle ships — ReactDOM dev = 1 MB, prod = 129 KB).
REACT_PROD     = UNPACKED / "react.production.min.js"
REACT_DOM_PROD = UNPACKED / "react-dom.production.min.js"

asset_url_for = {}
saved = 0
react_replaced = []
for uuid, entry in manifest.items():
    raw = base64.b64decode(entry["data"])
    if entry.get("compressed"):
        raw = _gzip.decompress(raw)
    ext = _MIME_EXT.get(entry.get("mime", ""), "bin")
    # React dev → prod swap. Their license header carries the build name.
    if ext == "js":
        head = raw[:512].decode("utf-8", "ignore")
        if "react-dom.development.js" in head and REACT_DOM_PROD.exists():
            raw = REACT_DOM_PROD.read_bytes()
            react_replaced.append(("react-dom", uuid[:8]))
        elif "react.development.js" in head and REACT_PROD.exists():
            raw = REACT_PROD.read_bytes()
            react_replaced.append(("react", uuid[:8]))
    dst = ASSETS / f"{uuid}.{ext}"
    dst.write_bytes(raw)
    asset_url_for[uuid] = f"assets/{uuid}.{ext}"
    saved += len(raw)
print(f"Manifest assets extracted: {len(manifest)} files ({saved/1024/1024:.1f} MB total)")
if react_replaced:
    print(f"  React dev → prod: {', '.join(f'{name}({u})' for name, u in react_replaced)}")

# Rewrite UUID references in the inner HTML to point at the extracted files.
for uuid, url in asset_url_for.items():
    new_inner = new_inner.replace(uuid, url)

# Drop Babel Standalone — App.tsx is now pre-compiled by esbuild. The Babel
# bundle's first bytes are an IIFE that assigns `.Babel = {}` on globalThis;
# React/ReactDOM both start with a `@license React` block, so we discriminate
# by that fingerprint instead of substring (their license blob includes "babel"
# elsewhere, which mis-flagged ReactDOM before).
babel_uuid = None
for uuid, entry in manifest.items():
    if entry.get("mime") not in ("text/javascript", "application/javascript"):
        continue
    data = base64.b64decode(entry["data"])
    if entry.get("compressed"):
        data = _gzip.decompress(data)
    head = data[:512].decode("utf-8", "ignore")
    if "@license React" in head:
        continue  # this is React or ReactDOM, keep
    if "Babel={}" in head or "self).Babel" in head or "globalThis).Babel" in head:
        babel_uuid = uuid
        break
if babel_uuid:
    new_inner = re.sub(
        rf'<script[^>]*src="assets/{babel_uuid}\.js"[^>]*></script>',
        '', new_inner,
    )
    print(f"Babel Standalone dropped (uuid={babel_uuid[:8]}…)")
else:
    print("WARNING: Babel UUID not detected — bundle may include Babel Standalone")

# Strip integrity + crossorigin attrs (were for SRI on CDN; not relevant for
# same-origin local files and break script load if mismatched).
new_inner = re.sub(r'\s+integrity="[^"]*"', '', new_inner)
new_inner = re.sub(r'\s+crossorigin="[^"]*"', '', new_inner)

OUT.write_bytes(new_inner.encode("utf-8"))
print(f"Wrote {OUT}")
print(f"Size: {len(new_inner):,} bytes (original outer: {len(html):,} bytes)")
