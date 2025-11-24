# Update Documentation

Update CHANGELOG.md and README.md after version upgrade, then commit automatically.

## Prerequisites

Check version changed:

```bash
git --no-pager diff HEAD~1 HEAD -- package.json | grep version
```

If no version change: STOP.

## Steps

1. **Use #codebase** to understand recent changes

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

4. **Commit automatically** (NO manual intervention):

```bash
git add CHANGELOG.md
# Add README.md only if modified
git commit -m "docs: update documentation for version X.Y.Z

Update CHANGELOG.md with version X.Y.Z changes

@chlbri:bri_lvi@icloud.com"
```

**IMPORTANT**: Execute the commit command automatically using `run_in_terminal` tool.
DO NOT ask for user confirmation. DO NOT stop before committing.

## Format

- Date: DD/MM/YYYY (European format, not YYYY/MM/DD)
- Time: HH:MM (24h format)
- English commit messages
- French allowed in CHANGELOG details
- Actions: Add, Fix, Remove, Update, Enhance, Refactor

## Automation

- Always use `run_in_terminal` to execute git commands
- Never ask user to run commands manually
- Complete the entire workflow in one execution
