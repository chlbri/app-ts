---
name: update-docs
description:
  Update `CHANGELOG.md` and `README.md` after a version upgrade by
  analyzing recent git commits and comparing versions.
---

# Update Docs

Update `CHANGELOG.md` and `README.md` after a version upgrade by analyzing
recent git commits and comparing versions.

## Usage

Run the prerequisite checks first, then follow the steps below.

### Prerequisites

#### Step 1: Get current version from `package.json`

```bash
cat package.json | grep '"version"'
```

#### Step 2: Find last documented version in `CHANGELOG.md`

```bash
head -20 CHANGELOG.md | grep -E "^\#\# \*\*\[" | head -1
```

> **If versions match: STOP** — documentation is already up to date.

#### Step 3: Find all commits since last documented version

```bash
# Get last documented version (e.g., "1.6.0")
LAST_VERSION=$(head -20 CHANGELOG.md | grep -E "^\#\# \*\*\[" | head -1 | sed -E 's/.*\[([0-9.]+)\].*/\1/')

# Find when this version was tagged or committed
git log --all --oneline --grep="$LAST_VERSION" -1

# Get all commits since that version
git log --oneline --since="<commit-hash-or-date>" --no-merges
```

#### Step 4: Analyze changed files since last version

```bash
# Get diff stats since last documented version
git --no-pager diff <last-version-commit>..HEAD --stat

# Get detailed changes for specific files
git --no-pager diff <last-version-commit>..HEAD -- src/
```

> If no significant changes: **STOP**.

## Steps

1. **Analyze recent changes** using the git commands above.

2. **Update `CHANGELOG.md`** at the top of the file using this template:

```markdown
<details>
<summary>

## **[VERSION] - YYYY/MM/DD** => _HH:MM_

</summary>

- Change description 1
- Change description 2
- Update dependencies
- <u>Test coverage **_100%_**</u>

</details>

<br/>
```

Order entries as: Breaking changes → Features → Fixes → Docs → Refactor →
Dependencies

3. **Update `README.md`** only if:
   - New features need documentation
   - API changes occurred
   - New usage examples are needed

> **STOP HERE — DO NOT COMMIT.** The user will commit manually.

## Format Rules

| Field             | Format                                                  |
| ----------------- | ------------------------------------------------------- |
| Date              | `DD/MM/YYYY` (European format)                          |
| Time              | `HH:MM` (24-hour format)                                |
| Commit messages   | English                                                 |
| CHANGELOG details | French allowed                                          |
| Action verbs      | `Add`, `Fix`, `Remove`, `Update`, `Enhance`, `Refactor` |

## Commit Message Reference (do not commit — for format reference only)

```
docs: update documentation for version X.Y.Z

Update CHANGELOG.md with version X.Y.Z changes

@chlbri:bri_lvi@icloud.com
```

## When to use

- After bumping the version in `package.json`
- Before publishing a new release
- When a reviewer requests updated documentation for a new version
