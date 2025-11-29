# Update Documentation

Update CHANGELOG.md and README.md after version upgrade.

## Prerequisites

### Step 1: Get current version from package.json

```bash
cat package.json | grep '"version"'
```

### Step 2: Find last documented version in CHANGELOG.md

```bash
head -20 CHANGELOG.md | grep -E "^\#\# \*\*\[" | head -1
```

- NB: If versions match (package.json vs last version inside CHANGELOG.md):
  STOP !! - Documentation is already up to date.

### Step 3: Check if version changed

Compare the version from package.json with the last version in
CHANGELOG.md.

**If versions match: STOP** - Documentation is already up to date.

### Step 4: Find all commits since last documented version

```bash
# Get last documented version (e.g., "1.6.0")
LAST_VERSION=$(head -20 CHANGELOG.md | grep -E "^\#\# \*\*\[" | head -1 | sed -E 's/.*\[([0-9.]+)\].*/\1/')

# Find when this version was tagged or committed
git log --all --oneline --grep="$LAST_VERSION" -1

# Get all commits since that version
git log --oneline --since="<commit-hash-or-date>" --no-merges
```

### Step 5: Analyze changed files since last version

```bash
# Get diff of all changes since last documented version
git --no-pager diff <last-version-commit>..HEAD --stat

# Get detailed changes for specific files
git --no-pager diff <last-version-commit>..HEAD -- src/
```

If no significant changes: STOP.

## Steps

1. **Analyze recent changes** using git commands above

2. **Update CHANGELOG.md** (top of file):

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

Order: Breaking changes → Features → Fixes → Docs → Refactor → Dependencies

3. **Update README.md** only if:
   - New features need documentation
   - API changes
   - New examples needed

**STOP HERE - DO NOT COMMIT**

User will commit manually.

## Format

- Date: DD/MM/YYYY (European format)
- Time: HH:MM (24h format)
- English commit messages
- French allowed in CHANGELOG details
- Actions: Add, Fix, Remove, Update, Enhance, Refactor

## Commit Message Format (for reference only)

```
docs: update documentation for version X.Y.Z

Update CHANGELOG.md with version X.Y.Z changes

@chlbri:bri_lvi@icloud.com
```
