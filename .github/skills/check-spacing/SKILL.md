---
name: check-spacing
description:
  Detect and report blank-line spacing violations between consecutive
  test() calls in test files. Use when checking or enforcing spacing
  conventions in *.test.ts files.
---

# Check Spacing

Detect blank-line spacing violations between consecutive `test()` calls in
test files.

## Usage

```bash
node .github/skills/check_spacing/check_spacing.mjs <path/to/file.test.ts>
```

## Rules enforced

| Consecutive pair          | Expected gap               |
| ------------------------- | -------------------------- |
| single-line → single-line | 0 (no blank line)          |
| any other combination     | 1 (exactly one blank line) |

A test is **single-line** when the entire `test(…)` call ends with `);` on
the same line. Everything else is **multi-line**.

## Output

- **No violations:** `No spacing violations found.`
- **Violations found:** one entry per violation showing the line range, the
  actual vs expected gap, and the test types involved.

```
VIOLATION L12→L15: gap=2 expected=1 (multi → single)
  line 10: test('#01 => status is "available"', () => {
  line 15: test('#02 => counter.count is 1', () => expect(counter.count).toBe(1));

1 violation(s) total.
```

## When to use

Run this after editing or reorganising any `*.test.ts` file to ensure
blank-line spacing between tests conforms to the project conventions (see
`.github/instructions/organize-tests.instructions.md` § 3).

Fix every reported violation, then re-run until the output is
`No spacing violations found.`
