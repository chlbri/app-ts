---
name: organize-tests
description:
  Apply and enforce all test-organization conventions defined in
  `.github/instructions/organize-tests.instructions.md` to every
  `*.test.ts` file in the codebase. Use when adding new tests, refactoring
  existing tests, or ensuring test files conform to project conventions
  before committing or during code review.
---

# Organize Tests

Apply and enforce all test-organization conventions defined in
`.github/instructions/organize-tests.instructions.md` to every `*.test.ts`
file in the codebase.

## Usage

Invoke this skill on any test file (or the whole project) to automatically
review and reformat test files according to the project's test conventions.

1. Identify all `*.test.ts` files in scope.
2. Read and apply every rule from
   `.github/instructions/organize-tests.instructions.md`.
3. Use the companion skills to assist with formatting decisions:
   - **`analyze_tests`** — determine whether each `test()` call should be
     formatted as single-line or multi-line before editing.
   - **`check_spacing`** — verify blank-line spacing between `test()` calls
     after editing.

## Rules enforced

All rules are defined in
`.github/instructions/organize-tests.instructions.md`. This skill acts as
the entry point that applies them in full to the target files.

## When to use

- After adding new tests
- After refactoring existing tests
- Before committing changes to any `*.test.ts` file
- When a code review flags test formatting issues
