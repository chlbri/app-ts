# Update Documentation

Update CHANGELOG.md and README.md after version upgrade.

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

4. **Commit**:

```
docs: update documentation for version X.Y.Z

Update CHANGELOG.md with version X.Y.Z changes

@chlbri:bri_lvi@icloud.com
```

## Format

- Date: DD/MM/YYYY (European)
- English commit messages
- French allowed in CHANGELOG details
- Actions: Add, Fix, Remove, Update, Enhance, Refactor
