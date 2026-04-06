---
name: update-docs
description:
  Update `CHANGELOG.md` and `README.md` after a version upgrade by
  analyzing recent git commits and comparing versions.
---

# Update Docs

Four-step workflow to keep `CHANGELOG.md` and `README.md` in sync after a
version bump in `package.json`.

## Flags

| Flag       | Effect                                                               |
| ---------- | -------------------------------------------------------------------- |
| `--force`  | Continue to Step 3 even when no meaningful changes are detected      |
| `--readme` | In Step 3, deeply analyse all diffs and consider README improvements |

## Format Rules

| Field             | Format                                                  |
| ----------------- | ------------------------------------------------------- |
| Date              | `DD/MM/YYYY` (European format)                          |
| Time              | `HH:MM` (24-hour, use current time)                     |
| Commit messages   | English                                                 |
| CHANGELOG entries | French allowed                                          |
| Action verbs      | `Add`, `Fix`, `Remove`, `Update`, `Enhance`, `Refactor` |

## When to use

- After bumping the version in `package.json`
- Before publishing a new release
- When a reviewer requests updated documentation for a new version

## Workflow

Start at → [`steps/step1.md`](steps/step1.md)
