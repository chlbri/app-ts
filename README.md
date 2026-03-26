# @bemedev/app-ts

> [!CAUTION] **Ne pas utiliser la version 2.1.0.** Cette version contient
> des problèmes de configuration du build (`rolldown.config.ts`) et doit
> être évitée. Veuillez utiliser la version **2.2.0** ou supérieure.

A TypeScript library for building finite state machines with a rich,
type-safe API. Manages states, transitions, context, asynchronous
operations, and reactive streams through a unified **actors** model.

<br/>

## Philosophy

**The machine defines _what can happen_. The interpreter _makes it
happen_.**

A machine is purely declarative: it describes states, transitions, actions,
and guards by **name** (`'fetchUser'`, `'canSubmit'`). It never calls
external code directly. You wire real implementations in later via
`provideOptions` or `addOptions`.

The **interpreter** takes a machine and executes it at runtime — it
processes events, manages context, subscribes to actors, and drives
transitions.

### Actors — three kinds of external work

| Actor type | Shape                 | Trigger           | Direction                        |
| ---------- | --------------------- | ----------------- | -------------------------------- |
| `emitters` | `() => Observable<T>` | State entry       | **Source → Machine** (read-only) |
| `promises` | `() => Promise<T>`    | State entry       | **Source → Machine** (one-shot)  |
| `children` | `() => Interpreter`   | Machine lifecycle | **Bidirectional** (via `sendTo`) |

### Emitters importance is NOT touched during the flow

This is the single most important architectural choice to understand.

An **emitter** is a passive Observable source. It produces values on its
own schedule. The machine **only reacts** to those values — it never sends
events _to_ the emitter, never modifies it, never controls its output.

```
┌─────────────┐    emissions    ┌──────────────┐
│  Observable  │ ─────────────► │   Machine     │
│  (emitter)   │                │  next/error/  │
│              │  ◄── nothing   │  complete     │
└─────────────┘                 └──────────────┘
        ▲                              │
        │ subscribe on entry           │ unsubscribe on exit
        └──────────────────────────────┘
```

**Emitter lifecycle:**

1. The machine config declares an emitter name and its handlers (`next`,
   `error`, `complete`).
2. `provideOptions` wires the name to a factory: `() => Observable<T>`.
3. When the interpreter enters the state → the factory is called, the
   Observable is subscribed.
4. Each emission becomes an internal event routed to the matching handler
   (`next` → actions, `error` → actions, `complete` → actions or target).
5. The machine **never** sends events _to_ the Observable. It is strictly
   one-way.
6. When the interpreter exits the state (or stops) → the Observable is
   unsubscribed.
7. Re-entering the state creates a **new** subscription from scratch.

This differs fundamentally from:

- **Promises** — triggered once on state entry, machine waits for
  resolution.
- **Children** — bidirectional; the parent can `sendTo` the child
  interpreter.

<br/>

## Installation

```bash
npm install @bemedev/app-ts
# or
pnpm add @bemedev/app-ts
```

> **Requirements:** Node.js ≥ 22, TypeScript ≥ 5.x

<br/>

## Table of Contents

1. [Basic machine](#1-basic-machine)
2. [Typings utilities](#2-typings-utilities)
3. [Machine interpretation](#3-machine-interpretation)
4. [Subscribe to state changes](#4-subscribe-to-state-changes)
5. [Actions](#5-actions)
   - [assign](#51-assign)
   - [voidAction](#52-voidaction)
   - [batch](#53-batch)
   - [filter & erase](#54-filter--erase)
   - [resend & forceSend](#55-resend--forcesend)
6. [Guards (predicates)](#6-guards-predicates)
7. [Transitions: on, after, always](#7-transitions-on-after-always)
8. [Activities (recurring actions)](#8-activities-recurring-actions)
9. [Actors: emitters](#9-actors-emitters)
10. [Actors: promises](#10-actors-promises)
11. [Actors: children](#11-actors-children)
12. [Tags](#12-tags)
13. [Legacy options (\_legacy)](#13-legacy-options-_legacy)
14. [API reference](#14-api-reference)

<br/>

---

## 1. Basic Machine

```typescript
import { createMachine } from '@bemedev/app-ts';

const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'running',
      },
    },
    running: {
      on: {
        STOP: 'idle',
      },
    },
  },
});
```

The config is pure data — no callbacks, no side-effects. You can serialise
it, inspect it, or test it independently from runtime.

<br/>

## 2. Typings Utilities

The library provides powerful typing utilities inspired by Valibot for
defining complex types:

```typescript
import { typings, inferT } from '@bemedev/app-ts';

// Literals
const status = typings.litterals('idle', 'pending', 'success', 'error');
type Status = inferT<typeof status>;
// 'idle' | 'pending' | 'success' | 'error'

// Union types
const value = typings.union('string', 'number', 'boolean');
type Value = inferT<typeof value>;
// string | number | boolean

// Arrays
const tags = typings.array('string');
type Tags = inferT<typeof tags>;
// string[]

// Tuples
const coordinates = typings.tuple('number', 'number');
type Coordinates = inferT<typeof coordinates>;
// [number, number]

// Objects
const user = typings.any({
  name: 'string',
  age: 'number',
  email: typings.maybe('string'), // optional field
});
type User = inferT<typeof user>;
// { name: string; age: number; email?: string }

// Records
const config = typings.record('string');
// Record<string, string>
const namedConfig = typings.record('number', 'width', 'height');
// { width: number; height: number }

// Intersection types
const person = typings.intersection(
  { name: 'string', age: 'number' },
  { email: 'string', phone: 'string' },
);
type Person = inferT<typeof person>;
// { name: string; age: number; email: string; phone: string }

// Discriminated unions
const shape = typings.discriminatedUnion(
  'type',
  { type: typings.litterals('circle'), radius: 'number' },
  {
    type: typings.litterals('rectangle'),
    width: 'number',
    height: 'number',
  },
);

// Partial objects
const optionalUser = typings.partial({
  name: 'string',
  age: 'number',
});
type OptionalUser = inferT<typeof optionalUser>;
// { name?: string; age?: number }

// Custom types
const customType = typings.custom<MyCustomType>();

// Single or Array (SoA)
const singleOrMany = typings.soa('string');
type SingleOrMany = inferT<typeof singleOrMany>;
// string | string[]

// StateValue type helper
const stateValue = typings.sv;
type MyStateValue = inferT<typeof stateValue>;
// StateValue
```

### Using Typings with Machines

```typescript
import { createMachine, typings } from '@bemedev/app-ts';

const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        on: { FETCH: 'loading' },
      },
      loading: {
        on: { SUCCESS: 'success', ERROR: 'error' },
      },
      success: {},
      error: {},
    },
  },
  typings({
    eventsMap: {
      FETCH: 'primitive',
      SUCCESS: { data: typings.array('string') },
      ERROR: { message: 'string' },
    },
    context: {
      items: typings.array('string'),
      error: typings.maybe('string'),
    },
  }),
);
```

<br/>

## 3. Machine Interpretation

The interpreter brings a machine to life. It holds context, processes
events, and manages actor subscriptions.

```typescript
import { interpret } from '@bemedev/app-ts';

// Create an interpreter service
const service = interpret(machine, {
  context: { items: [], error: undefined },
  pContext: {}, // private context (invisible to subscribers)
});

// Start the service
service.start();

// Send events
service.send('FETCH');
service.send({
  type: 'SUCCESS',
  payload: { data: ['item1', 'item2'] },
});

// Read current state
console.log(service.value); // 'success'
console.log(service.context);
// { items: ['item1', 'item2'], error: undefined }

// Stop the service
await service[Symbol.asyncDispose]();
```

<br/>

## 4. Subscribe to State Changes

```typescript
import { interpret } from '@bemedev/app-ts';

const service = interpret(machine, {
  context: { items: [], error: undefined },
});

// Subscribe to all state changes
const subscription = service.subscribe((prevState, currentState) => {
  console.log('State changed:', {
    from: prevState.value,
    to: currentState.value,
  });
});

// Subscribe to specific events
const eventSubscription = service.subscribe({
  SUCCESS: ({ payload }) => console.log('Success:', payload.data),
  ERROR: ({ payload }) => console.log('Error:', payload.message),
  else: () => console.log('Other event'),
});

service.start();

// Later: unsubscribe
subscription.unsubscribe();
eventSubscription.close();
```

<br/>

---

## 5. Actions

Actions are side-effects that run during transitions. They are provided by
name in the config and implemented via `provideOptions`.

### 5.1 assign

Updates context values using decomposed paths.

```typescript
.provideOptions(({ assign }) => ({
  actions: {
    // Update a nested field
    updateCount: assign(
      'context.count',
      ({ context }) => context.count + 1,
    ),

    // Replace the entire context
    reset: assign('context', () => ({
      count: 0,
      name: 'New',
    })),

    // Actor-scoped assign (for emitter/promise payloads)
    insertData: assign('context.data', {
      'fetch::then': ({ payload, context }) => {
        context?.data?.push(...payload);
        return context?.data;
      },
    }),
  },
}))
```

### 5.2 voidAction

Side-effect only — does not modify context.

```typescript
.provideOptions(({ voidAction }) => ({
  actions: {
    logState: voidAction(
      () => console.log('State changed'),
    ),

    // Actor-scoped void action (e.g. for emitter errors)
    signals: voidAction({
      'interval::error': ({ payload }) => {
        console.warn('Error received:', payload);
      },
    }),
  },
}))
```

### 5.3 batch

Groups multiple actions into one.

```typescript
.provideOptions(({ batch, assign, erase }) => ({
  actions: {
    resetForm: batch(
      erase('context.name'),
      erase('context.email'),
      erase('context.age'),
    ),
  },
}))
```

### 5.4 filter & erase

**filter** — filters arrays, object arrays, or records in context:

```typescript
.provideOptions(({ filter }) => ({
  actions: {
    // Filter array elements
    filterEven: filter(
      'context.numbers',
      (num: number) => num % 2 === 0,
    ),

    // Filter array of objects
    filterActive: filter(
      'context.people',
      ({ active }) => active,
    ),

    // Filter record by value
    filterHighScores: filter(
      'context.scores',
      (score) => score >= 80,
    ),
  },
}))
```

**erase** — sets a property to `undefined`:

```typescript
.provideOptions(({ erase, batch }) => ({
  actions: {
    clearEmail: erase('context.user.email'),

    // Erase multiple with batch
    clearAll: batch(
      erase('context.name'),
      erase('context.email'),
      erase('context.age'),
    ),
  },
}))
```

### 5.5 resend & forceSend

Re-dispatch events from within actions.

- **`resend(event)`** — sends the event only if the machine is not in a
  blocked state.
- **`forceSend(event)`** — sends the event regardless of blocked state.

```typescript
.provideOptions(({ resend, forceSend }) => ({
  actions: {
    retryFetch: resend('FETCH'),
    forceIncrement: forceSend('INCREMENT'),
  },
}))
```

<br/>

## 6. Guards (Predicates)

Guards are pure predicates that decide whether a transition should fire.

```typescript
.provideOptions(({ isValue, isNotValue }) => ({
  predicates: {
    // Built-in value check helpers
    isEmpty: isValue('context.items', []),
    hasToken: isNotValue('context.token', undefined),

    // Custom predicate
    isAuthenticated: ({ context }) =>
      context.token !== undefined,
  },
}))
```

Usage in config:

```typescript
states: {
  idle: {
    on: {
      FETCH: {
        guards: 'canFetch',   // single guard
        target: 'loading',
      },
    },
    always: [
      { guards: 'isEmpty', target: '/empty' },
      '/default',             // fallback — no guard
    ],
  },
}
```

<br/>

## 7. Transitions: on, after, always

### `on` — event-driven transitions

```typescript
states: {
  idle: {
    on: {
      // Simple target
      START: '/running',

      // With guard and actions
      FETCH: {
        guards: 'canFetch',
        target: '/loading',
        actions: 'setLoading',
      },

      // Multiple candidates — first matching guard wins
      SUBMIT: [
        { guards: 'isValid', target: '/success' },
        { guards: 'hasErrors', target: '/error' },
        '/fallback',
      ],
    },
  },
}
```

### `after` — delayed transitions

Automatically transition after a named delay. If multiple delays are
defined, the **shortest** one that passes its guard wins.

```typescript
// Simple delay
const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: { after: { DELAY: '/active' } },
      active: {},
    },
  },
  defaultT,
);

machine.addOptions(() => ({
  delays: { DELAY: 1000 },
}));
// After 1 s in 'idle' → automatically transition to 'active'
```

```typescript
// Multiple delays — shortest wins
const machine2 = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        after: {
          DELAY1: '/result1',
          DELAY2: '/result2',
        },
      },
      result1: {},
      result2: {},
    },
  },
  defaultT,
);

machine2.addOptions(() => ({
  delays: { DELAY1: 3000, DELAY2: 2000 },
}));
// DELAY2 (2 s) fires first → goes to result2
```

```typescript
// Delayed with guard
states: {
  idle: {
    after: {
      DELAY: {
        guards: 'returnFalse',
        target: '/result1',
      },
      DELAY2: '/result2',
    },
  },
}
// DELAY fires first but guard prevents transition
// → DELAY2 wins
```

### `always` — immediate (eventless) transitions

Evaluated every time the state is entered. First matching guard wins.

```typescript
const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        always: [
          { guards: 'returnFalse', target: '/result1' },
          { guards: 'returnFalse', target: '/result3' },
          '/result2', // fallback — no guard
        ],
      },
      result1: {},
      result2: {},
      result3: {},
    },
  },
  defaultT,
);
// First two guards fail → goes to result2
```

<br/>

## 8. Activities (Recurring Actions)

An activity is an action executed repeatedly on a named delay while the
state is active. Activities support **pause**, **resume**, and **stop**
controls.

```typescript
const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        activities: { DELAY: 'inc' },
        on: {
          PAUSE: { actions: 'pause' },
          RESUME: { actions: 'resume' },
          STOP: { actions: 'stop' },
        },
      },
    },
  },
  typings({
    eventsMap: {
      PAUSE: 'primitive',
      RESUME: 'primitive',
      STOP: 'primitive',
    },
    context: { iterator: 'number' },
  }),
).provideOptions(({ assign, pauseActivity, resumeActivity, stopActivity }) => ({
  actions: {
    inc: assign('context.iterator', ({ context }) => context?.iterator + 1),
    pause: pauseActivity('/idle::DELAY'),
    resume: resumeActivity('/idle::DELAY'),
    stop: stopActivity('/idle::DELAY'),
  },
  delays: { DELAY: 100 },
}));
```

The activity `inc` runs every 100 ms while in `idle`. Sending `PAUSE`
freezes it, `RESUME` restarts it, and `STOP` terminates it permanently for
that state visit.

<br/>

---

## 9. Actors: Emitters

> **Key concept — emitters are NEVER touched during the flow.**

Emitters are passive Observable sources. The machine subscribes to them on
state entry and **only reacts** to their emissions. It never sends events
_to_ the Observable, never modifies it, never controls its output.

### 9.1 How emitters work

1. **Config** — declare the emitter name and its handlers:

   ```typescript
   actors: {
     interval: {
       next: { actions: ['assigN'] },
       error: { actions: ['handleError'] },
       complete: { actions: ['onComplete'] },
     },
   }
   ```

2. **Implementation** — provide the Observable factory:

   ```typescript
   .provideOptions(() => ({
     actors: {
       emitters: {
         interval: () =>
           interval(200).pipe(
             take(5),
             map(v => v + 1),
             map(v => v * 5),
           ),
       },
     },
   }))
   ```

3. **Runtime** — the interpreter manages the full lifecycle:
   - **Enter state** → factory called → `subscribe()`
   - Each `next` emission → routed to `next` handler (actions/target)
   - An `error` emission → routed to `error` handler
   - A `complete` emission → routed to `complete` handler
   - **Exit state** (or interpreter stops) → `unsubscribe()`
   - **Re-enter state** → a **new** subscription from scratch

### 9.2 Simple emitter — accumulating values

_Derived from `src/emitters/__tests__/data.ts` and `simple.test.ts`_

```typescript
import { createMachine, typings, interpret } from '@bemedev/app-ts';
import { interval, map, take } from 'rxjs';

const machine = createMachine(
  {
    initial: 'inactive',
    actors: {
      interval: {
        next: { actions: ['assigN'] },
        complete: { actions: ['mockCompleteAction'] },
      },
    },
    states: {
      inactive: { on: { NEXT: '/active' } },
      active: { on: { NEXT: '/inactive' } },
    },
  },
  typings({
    context: 'number',
    eventsMap: { NEXT: 'primitive' },
    actorsMap: {
      emitters: {
        interval: { next: 'number', error: 'primitive' },
      },
    },
  }),
).provideOptions(({ assign }) => ({
  actions: {
    assigN: assign('context', {
      'interval::next': ({ payload, context }) => notU(context) + payload,
    }),
  },
  actors: {
    emitters: {
      interval: () =>
        interval(200).pipe(
          take(5),
          map((v) => v + 1),
          map((v) => v * 5),
        ),
    },
  },
}));

const service = interpret(machine, { context: 0 });
service.start();
// The RxJS interval emits autonomously every 200 ms:
//   emission 0 → (0+1)*5 = 5  → context: 0 + 5  = 5
//   emission 1 → (1+1)*5 = 10 → context: 5 + 10 = 15
//   emission 2 → (2+1)*5 = 15 → context: 15 + 15 = 30
//   emission 3 → (3+1)*5 = 20 → context: 30 + 20 = 50
//   emission 4 → (4+1)*5 = 25 → context: 50 + 25 = 75
//
// The machine NEVER told the interval what to emit.
// It only reacted to each value.
```

### 9.3 Emitter error handling

_Derived from `src/emitters/__tests__/error.test.ts`_

When the Observable errors, the `error` handler fires. The machine itself
is not "broken" — it simply routes the error value to the declared actions.

```typescript
import { Subject } from 'rxjs';

const sub = new Subject<number>();

const machine = createMachine(
  {
    initial: 'idle',
    actors: {
      interval: {
        next: { actions: ['assigN'] },
        error: { actions: ['signals'] },
      },
    },
    states: { idle: {} },
  },
  typings({
    actorsMap: {
      emitters: {
        interval: { next: 'number', error: 'number' },
      },
    },
    context: 'number',
  }),
).provideOptions(({ assign, voidAction }) => ({
  actors: {
    emitters: { interval: () => sub },
  },
  actions: {
    assigN: assign('context', {
      'interval::next': ({ payload, context }) => context + payload,
    }),
    signals: voidAction({
      'interval::error': ({ payload }) => {
        console.warn('Error received:', payload);
      },
    }),
  },
}));

const service = interpret(machine, { context: 0 });
service.start();

// External code pushes values into the Subject:
sub.next(5); // → context becomes 5
sub.next(3); // → context becomes 8
sub.error(20); // → error handler fires, logs warning
//
// The machine didn't control the Subject.
// It only listened.
```

### 9.4 State-scoped emitters

_Derived from `src/emitters/__tests__/children.test.ts`_

When an emitter is defined **inside a specific state** (not at root), it
only runs while that state is active. Exiting the state unsubscribes;
re-entering creates a fresh subscription.

```typescript
const machine = createMachine(
  {
    initial: 'inactive',
    states: {
      inactive: { on: { NEXT: '/active' } },
      active: {
        on: { NEXT: '/inactive' },
        actors: {
          interval1: {
            next: { actions: ['assigN'] },
            complete: { actions: ['mockCompleteAction'] },
          },
        },
      },
    },
  } /* typings... */,
);
```

```
Timeline:
  [inactive] ──NEXT──► [active]
                          │ subscribe to interval1
                          │ ... emissions arrive ...
                          │
              ◄──NEXT─── [active]
  [inactive]              │ unsubscribe from interval1
                          │
              ──NEXT──► [active]
                          │ NEW subscription to interval1
```

### 9.5 Emitters vs Promises vs Children

| Aspect          | Emitters                    | Promises                  | Children                       |
| --------------- | --------------------------- | ------------------------- | ------------------------------ |
| Direction       | Source → Machine only       | Source → Machine only     | Bidirectional                  |
| Cardinality     | 0..∞ emissions              | Exactly 1 resolution      | Ongoing event exchange         |
| Machine control | **None** — read-only        | Triggered on state entry  | `sendTo` sends events to child |
| Subscription    | `subscribe` / `unsubscribe` | One-shot `then` / `catch` | `interpret` / `stop`           |
| Pause / Resume  | Via `@bemedev/rx-pausable`  | N/A                       | Via child interpreter          |

<br/>

---

## 10. Actors: Promises

A promise actor is a one-shot async task triggered on state entry. The
machine waits for resolution and routes the result to `then`, `catch`, or
`finally` handlers.

```typescript
const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: { on: { FETCH: '/fetch' } },
      fetch: {
        actors: {
          fetch: {
            then: {
              actions: 'insertData',
              target: '/idle',
            },
            catch: '/idle',
          },
        },
      },
    },
  },
  typings({
    eventsMap: { FETCH: 'primitive' },
    context: {
      input: 'string',
      data: typings.maybe(typings.array('string')),
    },
    actorsMap: {
      promises: {
        fetch: {
          then: typings.array('string'),
          catch: 'primitive',
        },
      },
    },
  }),
).provideOptions(({ assign }) => ({
  actors: {
    promises: {
      fetch: async ({ context }) => {
        return fakeDB
          .filter((item) => item.name.includes(context.input))
          .map((item) => item.name);
      },
    },
  },
  actions: {
    insertData: assign('context.data', {
      'fetch::then': ({ payload, context }) => {
        context?.data?.push(...payload);
        return context?.data;
      },
    }),
  },
}));
```

**Lifecycle:**

1. Interpreter enters the state containing the promise actor.
2. The factory `async ({ context, event }) => ...` is called once.
3. On success → `then` handler fires (actions + optional target).
4. On rejection → `catch` handler fires.
5. The promise is **not** retried automatically — you handle retry via
   transitions.

<br/>

---

## 11. Actors: Children

A child actor is a nested interpreter. The parent can **send events to it**
via `sendTo`, and the child's events can bubble up to the parent via `on`
handlers. Context can be mapped between parent and child.

### 11.1 Sending events to a child — `sendTo`

_Derived from `src/interpreters/__tests__/children.test.ts`_

```typescript
const parent = createMachine(
  {
    actors: {
      child: {
        on: {
          NEXT: { actions: ['notify'] },
        },
      },
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          NEXT: { actions: ['sendChildNext'] },
        },
      },
    },
  },
  typings({
    eventsMap: { NEXT: 'primitive' },
    actorsMap: {
      children: { child: { NEXT: 'primitive' } },
    },
  }),
).provideOptions(({ sendTo, voidAction }) => ({
  actions: {
    notify: voidAction(() => {
      notify();
    }),
    sendChildNext: sendTo(child)(() => ({
      to: 'child',
      event: 'NEXT',
    })),
  },
  actors: {
    children: {
      child: () => interpret(child),
    },
  },
}));
```

When the parent receives `NEXT`, it forwards it to the child via `sendTo`.
When the child processes `NEXT`, the parent's `on.NEXT` handler fires
`notify`.

### 11.2 Context mapping between parent and child

```typescript
const parent = createMachine(
  {
    actors: {
      child: {
        // Map child's entire context → parent.pContext.iterator
        contexts: { '.': 'iterator' },
      },
    },
    // ...
  },
  /* typings */
).provideOptions(() => ({
  actors: {
    children: {
      child: () => interpret(childMachine, { context: 0 }),
    },
  },
}));
```

When the child's context changes, it is automatically synced to the
parent's private context (`pContext`) at the mapped key. This is one-way:
the parent reads the child's context but does not write to it.

<br/>

---

## 12. Tags

Tags are metadata labels on states. They allow UI code to query **what
category** the current state belongs to without checking state names
directly.

_Derived from `src/interpreters/__tests__/tags/tags.machine.ts`_

```typescript
const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        tags: ['idle'],
        on: { NEXT: '/working' },
      },
      working: {
        tags: ['working', 'busy'],
        on: { NEXT: '/final', PREV: '/idle' },
      },
      final: {},
    },
  },
  typings({
    eventsMap: { NEXT: 'primitive', PREV: 'primitive' },
  }),
);

const service = interpret(machine);
service.start();

service.tags; // ['idle']
service.send('NEXT');
service.tags; // ['working', 'busy']
```

<br/>

---

## 13. Legacy Options (\_legacy)

Both `provideOptions` and `addOptions` support accessing previously defined
options through the `_legacy` parameter. This enables composition of
existing actions, predicates, delays, promises, and actors without manual
tracking.

### On a Machine

```typescript
const machine = createMachine(config, types)
  .provideOptions(({ assign }) => ({
    actions: {
      increment: assign('context', ({ context }) => context + 1),
    },
  }))
  .provideOptions(({ batch }, { _legacy }) => ({
    actions: {
      doubleIncrement: batch(
        _legacy.actions.increment!,
        _legacy.actions.increment!,
      ),
    },
  }));
```

### On an Interpreter

```typescript
const service = interpret(machine, { context: 0 });

service.addOptions(({ assign }) => ({
  actions: {
    add: assign('context', ({ context }) => context + 5),
  },
}));

// Reuse previous action via _legacy
service.addOptions(({ batch }, { _legacy }) => ({
  actions: {
    addTwice: batch(_legacy.actions.add!, _legacy.actions.add!),
  },
}));
```

### `provideOptions` on Interpreter (immutable)

```typescript
const service1 = interpret(machine, { context: 0 });

const service2 = service1.provideOptions(({ assign }) => ({
  actions: {
    multiply: assign('context', ({ context }) => context * 2),
  },
}));

const service3 = service2.provideOptions(({ assign }, { _legacy }) => ({
  actions: {
    multiplyAndAdd: assign('context', ({ context }) => context * 2 + 10),
  },
}));
// service1, service2, service3 are independent instances
```

**Properties available in `_legacy`:**

| Property             | Content                         |
| -------------------- | ------------------------------- |
| `_legacy.actions`    | Previously defined actions      |
| `_legacy.predicates` | Previously defined guards       |
| `_legacy.delays`     | Previously defined delays       |
| `_legacy.promises`   | Previously defined promises     |
| `_legacy.machines`   | Previously defined child actors |
| `_legacy.emitters`   | Previously defined emitters     |

**Key features:**

- **Immutable** — the `_legacy` object is frozen; it cannot be mutated.
- **Cumulative** — each call sees options from all previous calls.
- **Type-safe** — fully typed for IntelliSense support.
- Works with both `addOptions` (mutates) and `provideOptions` (returns new
  instance).

<br/>

---

## 14. API Reference

### Machine Creation

#### `createMachine(config, types?)`

Creates a new state machine.

**Parameters:**

- `config` — Machine configuration object
  - `initial` — Initial state name
  - `states` — State definitions
  - `actors?` — Root-level actor declarations (emitters, promises,
    children)
- `types` — Type definitions (via `typings(...)`)
  - `context` — Public context type
  - `pContext?` — Private context type
  - `eventsMap` — Event definitions
  - `actorsMap?` — Actor type maps (emitters, promises, children)

**Returns:** `Machine` instance

#### `createConfig(config)`

Utility to create a typed configuration object without creating a full
machine.

### Machine Methods

#### `machine.provideOptions(callback)`

Provides implementations for actions, guards, delays, actors.

**Parameters:**

- `callback(helpers, options)` — Function receiving:
  - **helpers** — `assign`, `voidAction`, `batch`, `filter`, `erase`,
    `sendTo`, `resend`, `forceSend`, `isValue`, `isNotValue`,
    `pauseActivity`, `resumeActivity`, `stopActivity`
  - **options** — `{ _legacy }` containing all previously defined options

**Returns:** New `Machine` instance (immutable)

#### `machine.addOptions(callback)`

Adds or overwrites options dynamically. Mutates the machine.

**Returns:** The added options object

### Interpreter

#### `interpret(machine, options?)`

Creates an interpreter service for a machine.

**Parameters:**

- `machine` — Machine instance
- `options`:
  - `context` — Initial public context
  - `pContext?` — Initial private context
  - `mode?` — `'strict'` | `'normal'` (default: `'strict'`)
  - `exact?` — Use exact timing intervals (default: `true`)

**Returns:** `Interpreter` service

### Interpreter Properties

| Property          | Description                                         |
| ----------------- | --------------------------------------------------- |
| `service.value`   | Current state value (string or nested object)       |
| `service.context` | Current public context                              |
| `service.status`  | Service status (`'idle'`, `'working'`, `'stopped'`) |
| `service.state`   | Complete state snapshot                             |
| `service.config`  | Current state configuration                         |
| `service.mode`    | Current mode (`'strict'` \| `'normal'`)             |
| `service.tags`    | Active tags for the current state                   |

### Interpreter Methods

| Method                                 | Description                                       |
| -------------------------------------- | ------------------------------------------------- |
| `service.start()`                      | Starts the service and begins processing          |
| `service.send(event)`                  | Sends an event (string or `{ type, payload }`)    |
| `service.subscribe(subscriber)`        | Subscribes to state changes                       |
| `service.pause()`                      | Pauses activities and timers                      |
| `service.resume()`                     | Resumes after pausing                             |
| `service.stop()`                       | Stops the service completely                      |
| `service.addOptions(callback)`         | Mutates the service with new options              |
| `service.provideOptions(callback)`     | Returns a **new** service with additional options |
| `service.dispose()`                    | Synchronously disposes of the service             |
| `await service[Symbol.asyncDispose]()` | Cleanly disposes (async)                          |

### State Configuration

```typescript
states: {
  stateName: {
    type?: 'atomic' | 'compound' | 'parallel' | 'final',
    initial?: string,
    tags?: string[],
    entry?: ActionConfig,
    exit?: ActionConfig,
    on?: { [event: string]: TransitionConfig },
    after?: { [delay: string]: TransitionConfig },
    always?: TransitionConfig | TransitionConfig[],
    activities?: { [delay: string]: ActionConfig },
    actors?: { [name: string]: ActorConfig },
    states?: { [state: string]: StateDefinition },
  }
}
```

### Transition Configuration

```typescript
type TransitionConfig =
  | string // Target state
  | {
      target?: string;
      guards?: GuardConfig;
      actions?: ActionConfig;
    }
  | TransitionConfig[]; // Multiple candidates (first match wins)
```

### Typings Utilities Reference

| Utility                                | Produces                         |
| -------------------------------------- | -------------------------------- |
| `typings.litterals(...values)`         | Literal union types              |
| `typings.union(...types)`              | Union types                      |
| `typings.array(type)`                  | Array types                      |
| `typings.tuple(...types)`              | Tuple types                      |
| `typings.any(schema)`                  | Object schemas                   |
| `typings.record(type, ...keys?)`       | Record types                     |
| `typings.intersection(...types)`       | Intersection types               |
| `typings.discriminatedUnion(key, ...)` | Discriminated unions             |
| `typings.maybe(type)`                  | Optional / undefined types       |
| `typings.partial(schema)`              | All properties optional          |
| `typings.custom<T>()`                  | Custom TypeScript types          |
| `typings.soa(type)`                    | Single or Array type             |
| `typings.sv`                           | StateValue type helper           |
| `inferT<T>`                            | Infer TS type from typing schema |

<br/>

---

## Changelog

[View CHANGELOG.md](https://github.com/chlbri/app-ts/blob/main/CHANGELOG.md)

<br/>

## NB

**_Don't use version 0.9.17, it doesn't export anything._**

<br/>

## Contributing

Contributions are welcome! Please read our contribution guide for details.

<br/>

## License

MIT

<br/>

## Author

chlbri (bri_lvi@icloud.com)

[My GitHub](https://github.com/chlbri?tab=repositories)

<br/>

## Links

- [Documentation](https://github.com/chlbri/app-ts)
- [Changelog](https://github.com/chlbri/app-ts/blob/main/CHANGELOG.md)
