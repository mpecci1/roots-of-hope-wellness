#!/bin/bash
# Swap every workers.dev reference to the real domain. Run this ONLY after
# https://www.rootsofhopeandwellness.com serves the new site with a valid cert.
#   bash tools/go-live.sh          # dry run, shows the count
#   bash tools/go-live.sh --apply  # makes the change
set -euo pipefail
cd "$(dirname "$0")/.."
OLD="roots-of-hope-wellness.maguirepecci.workers.dev"
NEW="www.rootsofhopeandwellness.com"
N=$(grep -rc "$OLD" *.html sitemap.xml robots.txt 2>/dev/null | awk -F: '{s+=$2} END {print s}')
echo "$N references to $OLD"
if [ "${1:-}" != "--apply" ]; then echo "(dry run, pass --apply to change)"; exit 0; fi
for f in *.html sitemap.xml robots.txt; do
  [ -f "$f" ] && sed -i '' "s|$OLD|$NEW|g" "$f"
done
python3 - <<'PY'
import re, json, pathlib
for f in sorted(pathlib.Path('.').glob('*.html')):
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', f.read_text(), re.S):
        json.loads(m.group(1))
print("JSON-LD still valid")
PY
echo "remaining: $(grep -rc "$OLD" *.html sitemap.xml robots.txt 2>/dev/null | awk -F: '{s+=$2} END {print s}')"
echo "Now: bump <lastmod> in sitemap.xml, commit, push, and resubmit the sitemap in Google Search Console."
