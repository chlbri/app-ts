---
---

# Test Organisation Instructions

## 1. Split tests as granularly as possible

Not only every `expect` call, but also every **distinct action** should
live in its own `test` — unless that action declares a variable that
subsequent tests depend on (in which case it must stay in the `describe`
body as shared setup, or in a dedicated `test` that precedes the ones that
use it).

> **Rule of thumb:** if a line can be moved into its own `test()` without
> breaking any other test, it should be.

### What counts as a splittable action?

- An `expect(…)` assertion
- A method call whose side-effects are the subject of a later assertion
  (e.g. `scheduler.start(counter.task)`)
- An `await` expression that is not inside a shared `beforeEach`

### What must stay in the `describe` body (shared setup)?

- Variable declarations that are read by more than one `test` (e.g.
  `const counter = makeCounter()`)
- Object/scheduler creation that is shared across tests (e.g.
  `const scheduler = createScheduler()`)

---

### ❌ Bad – multiple actions collapsed into one test

```ts
test('#02 => status becomes "available" after start with a callback', () => {
  const scheduler = createScheduler();
  const counter = makeCounter();
  scheduler.start(counter.task); // action
  expect(scheduler.status).toBe('available'); // assertion 1
  expect(counter.count).toBe(1); // assertion 2
  expect(scheduler.performeds).toBe(1); // assertion 3
  scheduler.start(counter.task); // action (second call)
  expect(scheduler.status).toBe('available'); // assertion 4
  expect(counter.count).toBe(1); // assertion 5
  expect(scheduler.performeds).toBe(1); // assertion 6
});
```

### ✅ Good – each action and each assertion in its own `test`

Variable declarations that are shared across tests live in the `describe`
body. The call `scheduler.start(counter.task)` is a distinct action → its
own `test`. Each `expect` is also its own `test`.

```ts
describe('#02 => with a sync callback', () => {
  const scheduler = createScheduler(); // shared — stays in describe body
  const counter = makeCounter(); // shared — stays in describe body

  test('#00 => initial counter.count is 0', () =>
    expect(counter.count).toBe(0));

  test('#01 => start with a callback', () => {
    scheduler.start(counter.task);
  });

  test('#02 => status is "available"', () =>
    expect(scheduler.status).toBe('available'));
  test('#03 => counter.count is 1', () => expect(counter.count).toBe(1));
  test('#04 => performeds is 1', () =>
    expect(scheduler.performeds).toBe(1));

  describe('#05 => second call is idempotent', () => {
    test('#01 => restart', () => {
      scheduler.start(counter.task);
    });

    test('#02 => status remains "available"', () =>
      expect(scheduler.status).toBe('available'));
    test('#03 => counter.count is still 1', () =>
      expect(counter.count).toBe(1));
    test('#04 => performeds is still 1', () =>
      expect(scheduler.performeds).toBe(1));
  });
});
```

---

### ❌ Bad – multiple `expect` calls in one test

```ts
test('#01 => returns an object', () => {
  expect(typeof scheduler).toBe('object');
  expect(scheduler).toBeDefined();
});
```

### ✅ Good – one `expect` per test

```ts
describe('#01 => returns an object', () => {
  test('#01 => is an object', () =>
    expect(typeof scheduler).toBe('object'));
  test('#02 => is defined', () => expect(scheduler).toBeDefined());
});
```

---

## 2. Group by action, not by outcome

Each `describe` block represents **one action** (a method call, a lifecycle
step, etc.).  
Each `test` inside it represents **one observable outcome** of that action.

```ts
describe('#02 => start', () => {
  test('#01 => status is "initialized" after start (no callback, empty queue)', () => {
    const scheduler = createScheduler();
    scheduler.start();
    expect(scheduler.status).toBe('initialized');
  });

  test('#02 => performeds is 0 after start (no callback)', () => {
    const scheduler = createScheduler();
    scheduler.start();
    expect(scheduler.performeds).toBe(0);
  });
});
```

---

## 3. Blank-line rules between tests

The project uses **`printWidth: 75`** (`.prettierrc.yml`).

A test is considered **single-line** only when the entire `test(…)` call —
including the inline arrow body — fits within **75 characters**.  
If the total length exceeds 75 chars, Prettier will break the arrow onto
the next line, making it a multi-line test.

Rules:

- **Two consecutive tests that are both single-line (≤ 75 chars) → no blank
  line between them.**
- **In all other cases → exactly one blank line between tests.**

### How to check

Count the characters of the whole `test(…)` call on one line.  
If it is ≤ 75 → single-line, no blank line needed between it and its
neighbour (when that neighbour is also single-line).  
If it is > 75 → multi-line; always put a blank line before and after it.

### ✅ Short tests (≤ 75 chars) — no blank line

```ts
// 56 chars — single-line ✓
test('#01 => is defined', () => expect(scheduler).toBeDefined());
// 58 chars — single-line ✓
test('#02 => performeds is 0', () => expect(scheduler.performeds).toBe(0));
```

### ✅ Tests that exceed 75 chars — Prettier wraps, treat as multi-line

```ts
// 79 chars on one line → Prettier wraps → blank line required
test('#01 => status is "available"', () => {
  // And no need direct return, make it multi-line for readability
  expect(scheduler.status).toBe('available');
});

test('#02 => counter.count is 1', () => expect(counter.count).toBe(1));
```

### ✅ Longer tests (multi-line body) — one blank line

```ts
test('#01 => status is "initialized" after start', () => {
  const scheduler = createScheduler();
  scheduler.start();
  expect(scheduler.status).toBe('initialized');
});

test('#02 => performeds is 0 after start', () => {
  const scheduler = createScheduler();
  scheduler.start();
  expect(scheduler.performeds).toBe(0);
});
```

### ✅ Mixed — apply the rule per consecutive pair

```ts
// Both ≤ 75 chars → no blank line between them
test('#01 => is an object', () => expect(typeof scheduler).toBe('object'));
test('#02 => is defined', () => expect(scheduler).toBeDefined());

// Next test is multi-line → blank line before it
test('#03 => status is "initialized" after start', () => {
  const scheduler = createScheduler();
  scheduler.start();
  expect(scheduler.status).toBe('initialized');
});

// Also multi-line → blank line before it
test('#04 => performeds is 0 after start', () => {
  const scheduler = createScheduler();
  scheduler.start();
  expect(scheduler.performeds).toBe(0);
});
```

---

## 4. Numbering convention

Use the pattern `#NN =>` for both `describe` and `test` labels, zero-padded
to match the total count in the block.

```ts
// 3 tests  → #01, #02, #03
// 12 tests → #01 … #12
```

The special label `#00` is reserved for a **precondition test** — an
assertion that verifies the initial state before any action is performed
(e.g. `test('#00 => initial counter.count is 0', …)`).

---

## 5. Full example — before / after

### Before

```ts
describe('#01 => createScheduler', () => {
  const { acceptation } = createTests(createScheduler);
  describe('#00 => Acceptation', acceptation);
  const scheduler = createScheduler();

  test('#01 => returns an object', () => {
    expect(typeof scheduler).toBe('object');
    expect(scheduler).toBeDefined();
  });

  test('#02 => initial status is "idle"', () => {
    expect(scheduler.status).toBe('idle');
  });

  test('#03 => initial performeds is 0', () => {
    expect(scheduler.performeds).toBe(0);
  });
});
```

### After

```ts
describe('#01 => createScheduler', () => {
  const { acceptation } = createTests(createScheduler);
  describe('#00 => Acceptation', acceptation);
  const scheduler = createScheduler();

  describe('#01 => returns an object', () => {
    test('#01 => is an object', () =>
      expect(typeof scheduler).toBe('object'));
    test('#02 => is defined', () => expect(scheduler).toBeDefined());
  });

  test('#02 => initial status is "idle"', () =>
    expect(scheduler.status).toBe('idle'));
  test('#03 => initial performeds is 0', () =>
    expect(scheduler.performeds).toBe(0));
});
```

> The two single-line tests `#02` and `#03` have no blank line between them
> because each fits on one line.  
> A blank line separates the `describe` block from the pair below it
> because the `describe` spans multiple lines.

---

## 6. Summary decision tree

```
Is it a variable declaration used by other tests?
  YES → keep it in the describe body (shared setup)
  NO  →
    Is it an expect call?
      YES → its own test
      NO  →
        Is it a side-effectful action (method call, await, assignment)?
          YES → its own test
          NO  → keep inline
```

N.B : NO COMMENTS IN TESTS. If you need to explain something, use a
`describe` block with a descriptive.

---

## 7. Method reference shorthand (strictly no params)

When a test calls a method that has **strictly no parameters** (the method
signature declares zero params — no required, no optional, no rest), pass
the bound method reference directly instead of wrapping it in an arrow
function.

> **Check the method declaration:** if the parameter list is completely
> empty `()`, use the shorthand. If any parameter exists — even an optional
> one (`?`) or one with a default value — wrap it in an arrow function
> instead.

### ❌ Bad – unnecessary arrow wrapper

```ts
test('#02 => first stop', () => scheduler.stop());
test('#03 => second stop', () => scheduler.stop());
```

### ✅ Good – direct method reference

```ts
test('#02 => first stop', scheduler.stop);
test('#03 => second stop', scheduler.stop);
```

This applies only to strictly zero-param methods: `scheduler.stop`,
`counter.reset`, etc. Methods like `scheduler.start(callback?)` have an
optional param and must be wrapped: `() => scheduler.start()`.

---

## 8. Verification scripts

Use these scripts to audit a test file before and after editing.

### 8.1 Measure inline length of every test candidate

Populate the `tests` list in
`.github/skills/analyze_tests/analyze_tests.py` with the candidate inline
forms, then run:

```bash
python3 .github/skills/analyze_tests/analyze_tests.py
```

| Mark     | Format to use                                                          |
| -------- | ---------------------------------------------------------------------- |
| `SINGLE` | `test('...', () => expect(...));` — no blank line with adjacent SINGLE |
| `MULTI`  | keep `() => {` block form — blank line before **and** after            |

### 8.2 Detect spacing violations automatically

```bash
node .github/skills/check_spacing/check_spacing.mjs <path/to/file.test.ts>
```

Fix every reported violation, then re-run until the output is
`No spacing violations found.`
