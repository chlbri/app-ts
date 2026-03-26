---
name: analyze-tests
description:
  Measure the inline length of `test()` candidates to decide whether each
  should be formatted as a **single-line** or **multi-line** test. Use when
  determining the correct format for new or refactored `test()` calls in
  `*.test.ts` files.
---

# Analyze Tests

Measure the inline length of `test()` candidates to decide whether each
should be formatted as a **single-line** or **multi-line** test.

## Usage

1. Open `.github/skills/analyze_tests/analyze_tests.py`.
2. Replace the `tests` list with the candidate inline forms (one string per
   test, written as it would appear on a single line).
3. Adjust `indent` to match the nesting level (4 spaces per `describe`
   level).
4. Run:

```bash
python3 .github/skills/analyze_tests/analyze_tests.py
```

## Output

Each line shows the total character count, a `SINGLE`/`MULTI` mark, and a
preview of the test string:

```
 69 [SINGLE]: test('#02 => is defined', () => expect(scheduler).toBeDefined(
 89 [MULTI ]: test('#02 => initial status is "idle"', () => expect(scheduler.
```

## Decision rule

| Mark     | Format to use                                                                           |
| -------- | --------------------------------------------------------------------------------------- |
| `SINGLE` | `test('...', () => expect(...));` on one line — no blank line with an adjacent `SINGLE` |
| `MULTI`  | `() => {` block form — exactly one blank line before **and** after                      |

A test is `SINGLE` when `len(indent + inline_form) <= 75`.

## When to use

Run this before editing a test file whenever you need to determine the
correct format for new or refactored `test()` calls (see
`.github/instructions/organize-tests.instructions.md` § 3).
