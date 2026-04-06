# Step 3 — Write Documentation

## 3a — Update `CHANGELOG.md`

Prepend a new entry immediately after the `## CHANGELOG` heading using this
template:

```markdown
<details>
<summary>

## **[VERSION] - DD/MM/YYYY** => _HH:MM_

</summary>

- Change description 1
- Change description 2
- <u>Test coverage **_100%_**</u>

</details>

<br/>
```

Order entries inside the block: **Breaking changes → Features → Fixes →
Docs → Refactor → Dependencies**

## 3b — Update `README.md`

### Without `--readme` flag

Update `README.md` **only when at least one of these is true:**

- A new public API or export was added or removed
- An existing API signature changed
- A new usage pattern deserves an example

### With `--readme` flag

Think deeply about every diff from Step 2. Consider whether any prose,
example, or table in `README.md` could be improved, even if the bar above
is not met. Still write nothing if there is genuinely nothing to improve.

---

Continue → [`step4.md`](step4.md)
