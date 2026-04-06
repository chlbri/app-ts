#!/usr/bin/env bash
# find-diff.sh
# Finds the commit that introduced the last CHANGELOG.md version and prints
# every change since then — committed AND uncommitted.
# Compatible with macOS (BSD grep, no PCRE).

LAST=$(grep -m1 -oE '\[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | tr -d '[]')
echo "Last documented version: $LAST"

# ── 1. COMMITTED CHANGES ────────────────────────────────────────────────────

HASH=$(git log --all --oneline --grep="$LAST" -1 | awk '{print $1}')

if [ -n "$HASH" ]; then
  echo "Found commit: $HASH"
  echo ""
  echo "=== Committed diff stat since $HASH ==="
  git --no-pager diff "$HASH"..HEAD --stat
  echo ""
  echo "=== Commits since $HASH ==="
  git log --oneline "$HASH"..HEAD --no-merges
else
  # Fallback: oldest of the last 20 commits (safe even on shallow repos)
  FALLBACK=$(git log --oneline -20 | tail -1 | awk '{print $1}')
  echo "No commit found for version $LAST — falling back to $FALLBACK."
  echo ""
  echo "=== Committed diff stat (since $FALLBACK) ==="
  git --no-pager diff "$FALLBACK"..HEAD --stat
  echo ""
  echo "=== Commits (since $FALLBACK) ==="
  git log --oneline "$FALLBACK"..HEAD --no-merges
fi

# ── 2. UNCOMMITTED CHANGES (staged + unstaged) ───────────────────────────────

echo ""
echo "=== Uncommitted diff stat (working tree) ==="
git --no-pager diff HEAD --stat

# ── 3. UNTRACKED FILES ───────────────────────────────────────────────────────

UNTRACKED=$(git status --short | grep '^??' | awk '{print $2}')
if [ -n "$UNTRACKED" ]; then
  echo ""
  echo "=== Untracked files ==="
  echo "$UNTRACKED"
fi
