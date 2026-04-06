# Step 2 — Find Changes Since Last Documented Version

Locate the commit that introduced the last documented version and collect
every diff since then.

## Script

Run [`../scripts/find-diff.sh`](../scripts/find-diff.sh):

```bash
bash .claude/skills/update-docs/scripts/find-diff.sh
```

## Fallback — deep reasoning

If the script cannot produce a usable diff (shallow clone, missing ref,
detached HEAD, etc.), reason over:

- New or modified files in `src/`
- Changes in `package.json` (exports, dependencies, scripts)
- Any untracked files compared to what is already documented in the latest
  `CHANGELOG.md` entry

Use those inferred changes as the diff and continue to Step 3.

## Decision

| Result                                 | Action                                        |
| -------------------------------------- | --------------------------------------------- |
| No meaningful changes AND no `--force` | **STOP** — emit Step 4 summary with that note |
| No meaningful changes AND `--force`    | Continue → [`step3.md`](step3.md)             |
| Meaningful changes found               | Continue → [`step3.md`](step3.md)             |

> **Meaningful changes** = anything beyond lock-file updates, whitespace,
> or formatting-only commits.
