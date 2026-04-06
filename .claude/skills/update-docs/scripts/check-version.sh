#!/usr/bin/env bash
# check-version.sh
# Compares the version in package.json against the last version in CHANGELOG.md.
# Exit codes: 0 = proceed to Step 2, 1 = stop (match or rollback)
# Compatible with macOS (BSD grep, no node in PATH requirement).

PKG=$(python3 -c "import json; print(json.load(open('package.json'))['version'])")
LAST=$(grep -m1 -oE '\[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | tr -d '[]')

echo "package.json : $PKG"
echo "CHANGELOG.md : $LAST"

if [ "$PKG" = "$LAST" ]; then
  echo "RESULT: MATCH — documentation is already up to date. STOP."
  exit 1
fi

# Compare using sort -V (version-aware sort)
HIGHER=$(printf '%s\n%s\n' "$PKG" "$LAST" | sort -V | tail -1)

if [ "$HIGHER" = "$PKG" ]; then
  echo "RESULT: MISMATCH — package.json ($PKG) is ahead of CHANGELOG.md ($LAST). Proceed to Step 2."
  exit 0
else
  echo "RESULT: ROLLBACK — package.json ($PKG) is behind CHANGELOG.md ($LAST). STOP."
  exit 1
fi
