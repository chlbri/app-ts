# Solution: CLI Helper for Machine Typings

## Problem

`createMachine` currently relies heavily on the TypeScript language server
to infer complex generic types (`Config`, `EventsMap`, `ActorsConfigMap`,
`PrimitiveObject`, etc.) at authoring time. The deep nesting of conditional
types (`TransformPrimitiveObject`, `TransformConfigDef`,
`NoExtraKeysConfig`, `FlatMapN`, etc.) causes the TS server to slow down
significantly on larger machines.

The goal: offload type computation to a **CLI tool** that watches
`*.fsm.ts` / `*.machine.ts` files and pre-generates type helpers into a
single `app.gen.ts` file, so the TS server only consumes simple,
pre-resolved types via a global `Register` interface (TanStack Start
pattern).

---

## Architecture Overview

```
User writes *.machine.ts / *.fsm.ts
       |
       v
CLI (chokidar watcher)
       |
       v
Parse all machine configs
       |
       v
Generate single app.gen.ts at rootDir (or project root)
  - Rewrites entire Config as strictly typed const (no __tsSchema)
  - Generates StatePaths type for machine.ts and interpreter.ts
  - declare module '@bemedev/app-ts' { interface Register { ... } }
       |
       v
MACHINES registry: getMachine('relative/path') -> fully typed
```

**Single output file**: `app.gen.ts` at the `rootDir` defined in
`tsconfig.json`, or at the project root if `rootDir` is not set. No
per-machine `*.gen.ts` files.

---

## Core Design: No `__tsSchema`, the Entire Config IS the Schema

**Current approach** (removed): The user imports a `__tsSchema` object from
a `.gen.ts` file and injects it into the config. The `ConfigDef` type
overlays target constraints on top of the config.

**New approach**: The CLI **rewrites the entire config as a strictly typed
`const`** in `app.gen.ts`. Each state node has its `targets` pre-resolved
as a string literal union **excluding its own path**. The config in
`app.gen.ts` IS the schema. No separate schema overlay, no `__tsSchema`
key.

**Before** (current, using `__tsSchema`):

```ts
import { SCHEMAS } from './machine1.machine.gen';

export const machine = createMachine({
  __tsSchema: SCHEMAS.machine.__tsSchema, // ← REMOVED
  initial: 'idle',
  states: {
    idle: { on: { NEXT: '/working' } },
    working: { on: { DONE: '/final' } },
    final: {},
  },
}, typings({ ... }));
```

**After** (CLI generates strict config type, user writes plain config):

```ts
// User writes this — no __tsSchema, no import from gen file
export default createMachine('my/machine', {
  initial: 'idle',
  states: {
    idle: { on: { NEXT: '/working' } },
    working: { on: { DONE: '/final' } },
    final: {},
  },
}, typings({ ... }));
```

The CLI watches, parses the config, and generates the strict const config
type in `app.gen.ts`:

```ts
// Inside app.gen.ts — the CLI rewrites the ENTIRE config as strictly typed const

type MyMachine_AllPaths = '/' | '/idle' | '/working' | '/final';

/**
 * Strictly typed config. Each state's available targets
 * are ALL paths EXCEPT its own path.
 * This replaces __tsSchema entirely.
 */
type MyMachine_Config = {
  readonly initial: 'idle' | 'working' | 'final';
  readonly states: {
    readonly idle: {
      /** idle can target any path except '/idle' */
      readonly __targets: Exclude<MyMachine_AllPaths, '/' | '/idle'>;
      readonly on?: Record<
        string,
        TransitionConfig<Exclude<MyMachine_AllPaths, '/' | '/idle'>>
      >;
      readonly after?: Record<
        string,
        TransitionConfig<Exclude<MyMachine_AllPaths, '/' | '/idle'>>
      >;
      readonly always?: AlwaysConfig<
        Exclude<MyMachine_AllPaths, '/' | '/idle'>
      >;
    };
    readonly working: {
      readonly __targets: Exclude<MyMachine_AllPaths, '/' | '/working'>;
      readonly on?: Record<
        string,
        TransitionConfig<Exclude<MyMachine_AllPaths, '/' | '/working'>>
      >;
      readonly after?: Record<
        string,
        TransitionConfig<Exclude<MyMachine_AllPaths, '/' | '/working'>>
      >;
      readonly always?: AlwaysConfig<
        Exclude<MyMachine_AllPaths, '/' | '/working'>
      >;
    };
    readonly final: {
      readonly __targets: Exclude<MyMachine_AllPaths, '/' | '/final'>;
      readonly on?: Record<
        string,
        TransitionConfig<Exclude<MyMachine_AllPaths, '/' | '/final'>>
      >;
      readonly after?: Record<
        string,
        TransitionConfig<Exclude<MyMachine_AllPaths, '/' | '/final'>>
      >;
      readonly always?: AlwaysConfig<
        Exclude<MyMachine_AllPaths, '/' | '/final'>
      >;
    };
  };
};
```

With compound states (nested), the same logic applies recursively:

```ts
type Machine1_Config = {
  readonly initial: 'idle' | 'checking' | 'working';
  readonly states: {
    readonly idle: {
      readonly __targets:
        | '/checking'
        | '/working'
        | '/working/idle'
        | '/working/adding';
      // ...
    };
    readonly checking: {
      readonly __targets:
        | '/idle'
        | '/working'
        | '/working/idle'
        | '/working/adding';
      // ...
    };
    readonly working: {
      readonly initial: 'idle' | 'adding';
      readonly __targets: '/idle' | '/checking';
      readonly states: {
        readonly idle: {
          /** working/idle can target everything except '/', '/working', '/working/idle' */
          readonly __targets: '/idle' | '/checking' | '/working/adding';
          // ...
        };
        readonly adding: {
          readonly __targets: '/idle' | '/checking' | '/working/idle';
          // ...
        };
      };
    };
  };
};
```

The `__targets` field on each state node constrains all `target` values in
`on`, `after`, `always`, and `actors` transitions within that node. The
`Register` interface wires `MyMachine_Config` to the machine path, and
`createMachine` reads the config type from `Register` to constrain the
config parameter.

---

## `StatePaths` Type for `machine.ts` and `interpreter.ts`

A new `StatePaths` type is added to both `Machine` and `Interpreter`
classes to constrain any API that accepts a state path to only valid paths
for that machine.

**In `src/machine/machine.ts`** — add a `StatePaths` type parameter derived
from the config:

```ts
class Machine<
  const C extends Config = Config,
  const Pc = any,
  const Tc extends PrimitiveObject = PrimitiveObject,
  E extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  A extends ActorsConfigMap = GetActorKeysFromConfig<C>,
  Ta extends ExtractTagsFromConfig<C> = ExtractTagsFromConfig<C>,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
  // NEW: pre-resolved from Register, no longer computed from C
  Sp extends string = string,
  // ...
> {
  // ...

  /**
   * Type-safe state path accessor.
   * Only accepts valid absolute paths for this machine.
   * Pre-resolved from app.gen.ts via Register — no FlatMapN computation.
   */
  toNode(value: Sp): NodeConfig {
    /* ... */
  }

  /**
   * Check if a state path matches current value.
   */
  matches(path: Sp): boolean {
    /* ... */
  }
}
```

**In `src/interpreters/interpreter.ts`** — the `Interpreter` also gets
`StatePaths`:

```ts
class Interpreter<
  const C extends Config = Config,
  const Pc = any,
  const Tc extends PrimitiveObject = PrimitiveObject,
  E extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  A extends ActorsConfigMap = GetActorKeysFromConfig<C>,
  Ta extends ExtractTagsFromConfig<C> = ExtractTagsFromConfig<C>,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
  // NEW: state paths constraint
  Sp extends string = string,
> {
  // ...

  /**
   * Check if the interpreter's current state matches a path.
   * Only accepts valid state paths.
   */
  matches(path: Sp): boolean {
    /* ... */
  }

  /**
   * Subscribe to a specific state path.
   * Only accepts valid state paths.
   */
  onState(path: Sp, callback: (state: State) => void): void {
    /* ... */
  }
}
```

**How `StatePaths` flows from `app.gen.ts`**:

The `Register` interface carries `AllPaths` per machine, and
`createMachine` / `interpret` extract it:

```ts
// In app.gen.ts
declare module '@bemedev/app-ts' {
  interface Register {
    machines: {
      'my/machine': MachineTypeDef<
        MyMachine_Config, // strictly typed config (replaces __tsSchema)
        MyMachine_AllPaths // '/idle' | '/working' | '/final'
        // ...action keys, guard keys, etc.
      >;
    };
  }
}
```

```ts
// In registry.ts — getMachine returns Machine<..., Sp>
// where Sp = Register['machines'][P]['allPaths']
export function getMachine<P extends keyof Register['machines']>(
  relativePath: P,
): Machine<
  Register['machines'][P]['config'],
  Register['machines'][P]['pContext'],
  Register['machines'][P]['context'],
  // ...
  Register['machines'][P]['allPaths'] // StatePaths!
> {
  return MACHINES[relativePath] as any;
}
```

---

## Rule-by-Rule Implementation

### Rule 1: Machine File Convention

**Convention**: `*.fsm.ts` or `*.machine.ts`, one `export default` machine
per file.

**Current state**: Machines are currently named exports (e.g.,
`export const machine = createMachine(...)`). This must change to
`export default`.

**Changes needed**:

```ts
// Before (current)
export const machine = createMachine({ ... }, typings({ ... }));

// After — no __tsSchema import, no gen file import
export default createMachine('src/interpreters/__tests__/tags/tags', {
  initial: 'idle',
  states: {
    idle: { tags: ['idle'], on: { NEXT: '/working' } },
    working: { tags: ['working', 'busy'], on: { NEXT: '/final', PREV: '/idle' } },
    final: {},
  },
}, typings({
  eventsMap: { NEXT: 'primitive', PREV: 'primitive' },
}));
```

The CLI (using `cmd-ts` + `chokidar`) watches for these files:

```bash
# One-shot generation
app generate

# Watch mode — regenerates app.gen.ts on any *.machine.ts / *.fsm.ts change
app watch
```

---

### Rule 2: `createMachine` Gets 3 Arguments

**New signature**:

```ts
createMachine(name, config, typingsArg?)
```

- **Arg 1 (`name: string`)**: Relative path to the project root,
  auto-generated by the CLI on file creation, then watched.
- **Arg 2 (`config`)**: The machine config — **strictly typed via
  `Register`**, no `__tsSchema` needed. The CLI rewrites the entire config
  type as a const with per-state target constraints.
- **Arg 3 (`typingsArg?`)**: The typings (same as current arg 2, now
  optional per Rule 5).

**Implementation changes in `src/machine/machine.ts`**:

```ts
// Current: CreateMachine_F takes (config, types) + config has __tsSchema
// New: CreateMachine_F takes (name, config, types?)
//      config type comes from Register[name]['config'] — already strictly typed
//      No __tsSchema key needed
```

The `NoExtraKeysConfig` type no longer needs the `__tsSchema` exception:

```ts
// Before
export type NoExtraKeysConfig<T extends Config> = T & {
  [K in Exclude<keyof T, keyof Config | '__tsSchema'>]: never; // ← __tsSchema exception
};

// After — clean, no special keys
export type NoExtraKeysConfig<T extends Config> = T & {
  [K in Exclude<keyof T, keyof Config>]: never;
};
```

---

### Rule 3: Global `MACHINES` Registry via `declare module` (TanStack Start Pattern)

Instead of per-machine gen files or function overloads, the CLI generates a
**single `app.gen.ts`** at the project root (no `rootDir` in tsconfig) that
uses module declaration augmentation.

**Runtime registry** (`src/machine/registry.ts`):

```ts
const MACHINES: Record<string, AnyMachine> = {};

export function getMachine<P extends keyof Register['machines']>(
  relativePath: P,
): Register['machines'][P] {
  return MACHINES[relativePath] as any;
}

// The Register interface — augmented by app.gen.ts
export interface Register {
  machines: Record<string, AnyMachine>;
}

export { MACHINES };
```

**Generated `app.gen.ts`** (at project root, written by CLI):

```ts
/**
 * This file is auto-generated by the @bemedev/app-ts CLI.
 * Do not edit manually.
 *
 * @see https://www.npmjs.com/package/@bemedev/app-ts
 */

// ============================================================
// Machine: src/interpreters/__tests__/tags/tags
// Source:   src/interpreters/__tests__/tags/tags.machine.ts
// ============================================================

type Tags_AllPaths =
  | '/'
  | '/idle'
  | '/working'
  | '/final';

/**
 * Strictly typed config — replaces __tsSchema.
 * Each state's targets are all valid paths excluding
 * the root path and its own path.
 */
type Tags_Config = {
  readonly initial: 'idle' | 'working' | 'final';
  readonly states: {
    readonly idle: {
      readonly __targets: Exclude<Tags_AllPaths, '/' | '/idle'>;
    };
    readonly working: {
      readonly __targets: Exclude<Tags_AllPaths, '/' | '/working'>;
    };
    readonly final: {
      readonly __targets: Exclude<Tags_AllPaths, '/' | '/final'>;
    };
  };
};

type Tags_ActionKeys = never;
type Tags_GuardKeys = never;
type Tags_DelayKeys = never;
type Tags_EventKeys = 'NEXT' | 'PREV';
type Tags_TagKeys = 'idle' | 'working' | 'busy';
type Tags_EmitterKeys = never;
type Tags_ChildrenKeys = never;

type Tags_Context = {};
type Tags_PContext = undefined;
type Tags_Events = {
  NEXT: {};
  PREV: {};
};
type Tags_Actors = {};

// ============================================================
// Machine: src/interpreters/__tests__/complex/machine1
// Source:   src/interpreters/__tests__/complex/machine1.machine.ts
// ============================================================

type Machine1_AllPaths =
  | '/'
  | '/idle'
  | '/checking'
  | '/working'
  | '/working/idle'
  | '/working/adding';

/**
 * Strictly typed config with nested compound states.
 * No __tsSchema — the config IS the schema.
 */
type Machine1_Config = {
  readonly initial: 'idle' | 'checking' | 'working';
  readonly states: {
    readonly idle: {
      readonly __targets: '/checking' | '/working' | '/working/idle' | '/working/adding';
    };
    readonly checking: {
      readonly __targets: '/idle' | '/working' | '/working/idle' | '/working/adding';
    };
    readonly working: {
      readonly __targets: '/idle' | '/checking';
      readonly initial: 'idle' | 'adding';
      readonly states: {
        readonly idle: {
          readonly __targets: '/idle' | '/checking' | '/working/adding';
        };
        readonly adding: {
          readonly __targets: '/idle' | '/checking' | '/working/idle';
        };
      };
    };
  };
};

type Machine1_ActionKeys =
  | 'provideAsset'
  | 'reset'
  | 'addMandatoryIntermediary'
  | 'addBlockImmoIntermediary'
  | 'error.noAsset'
  | 'setOnlineStatus'
  | 'addIntermediary'
  | 'error.addIntermediary';

type Machine1_GuardKeys =
  | 'assetIsDefined'
  | 'mandatoryIsDefined'
  | 'intermediariesAreNotFull'
  | 'intermediaryIsNotAdded';

type Machine1_DelayKeys = 'CHECK_DELAY' | 'ADD_DELAY';
type Machine1_EventKeys = 'START' | 'ADD_INTERMEDIARY' | 'RESET';
type Machine1_TagKeys = 'un' | 'deux';
type Machine1_EmitterKeys = never;
type Machine1_ChildrenKeys = never;

type Machine1_Context = {
  asset?: {
    id: string;
    description: string;
    value: number;
    currency: { display: string; bank: string; description?: string };
    location?: {
      address?: string;
      city?: string;
      country?: string;
      coordinates?: { lat: number; lng: number };
      googleMapsLink?: string;
    };
    medias: {
      photos?: string[];
      videos?: string[];
      documents?: string[];
    };
  };
  intermediaries?: Array</* Intermediary resolved type */>;
  internetStatus?: boolean;
  errors?: {
    noAsset?: string;
    intermediary?: { offline?: string };
  };
};

type Machine1_PContext = undefined;

type Machine1_Events = {
  START: {
    asset?: Machine1_Context['asset'];
    mandatory?: Machine1_Context['intermediaries'] extends Array<infer I> ? I : never;
  };
  ADD_INTERMEDIARY: Machine1_Context['intermediaries'] extends Array<infer I> ? I : never;
  RESET: {};
};

type Machine1_Actors = {};

// ============================================================
// Example: Machine with children/emitters and pContext relation
// ============================================================
//
// type WithActors_ChildrenKeys = 'childService' | 'otherChild';
// type WithActors_EmitterKeys = 'priceStream' | 'statusStream';
//
// The children <-> pContext relation is preserved:
// Each child key maps to its events AND the pContext path it uses
//
// type WithActors_ChildrenConfig = {
//   childService: {
//     events: { CHILD_EVENT: {} };
//     parentPContext: { childData: { id: string; status: string } };
//   };
//   otherChild: {
//     events: { OTHER_EVENT: { value: number } };
//     parentPContext: { otherData: { count: number } };
//   };
// };

// ============================================================
// Global Register Interface
// ============================================================

/**
 * Type container for each machine.
 * Holds all pre-resolved types so the TS server never computes
 * FlatMapN, TransformPrimitiveObject, etc.
 */
interface MachineTypeDef<
  TConfig = unknown,
  AllPaths extends string = string,
  ActionKeys extends string = string,
  GuardKeys extends string = string,
  DelayKeys extends string = string,
  EventKeys extends string = string,
  TagKeys extends string = string,
  EmitterKeys extends string = string,
  ChildrenKeys extends string = string,
  Context = unknown,
  PContext = unknown,
  Events = unknown,
  Actors = unknown,
  ChildrenConfig = unknown,
> {
  /** Strictly typed config — replaces __tsSchema entirely */
  config: TConfig;
  /** All valid state paths for this machine (used by StatePaths) */
  allPaths: AllPaths;
  actionKeys: ActionKeys;
  guardKeys: GuardKeys;
  delayKeys: DelayKeys;
  eventKeys: EventKeys;
  tagKeys: TagKeys;
  emitterKeys: EmitterKeys;
  childrenKeys: ChildrenKeys;
  context: Context;
  pContext: PContext;
  events: Events;
  actors: Actors;
  /** Maps each child key to { events, parentPContext } */
  childrenConfig: ChildrenConfig;
}

declare module '@bemedev/app-ts' {
  interface Register {
    machines: {
      'src/interpreters/__tests__/tags/tags': MachineTypeDef<
        Tags_Config,
        Tags_AllPaths,
        Tags_ActionKeys,
        Tags_GuardKeys,
        Tags_DelayKeys,
        Tags_EventKeys,
        Tags_TagKeys,
        Tags_EmitterKeys,
        Tags_ChildrenKeys,
        Tags_Context,
        Tags_PContext,
        Tags_Events,
        Tags_Actors,
        {}
      >;

      'src/interpreters/__tests__/complex/machine1': MachineTypeDef<
        Machine1_Config,
        Machine1_AllPaths,
        Machine1_ActionKeys,
        Machine1_GuardKeys,
        Machine1_DelayKeys,
        Machine1_EventKeys,
        Machine1_TagKeys,
        Machine1_EmitterKeys,
        Machine1_ChildrenKeys,
        Machine1_Context,
        Machine1_PContext,
        Machine1_Events,
        Machine1_Actors,
        {}
      >;

      // ... one entry per discovered *.machine.ts / *.fsm.ts file
    };
  }
}

export {};
```

**How `getMachine` uses it**:

```ts
import { getMachine } from '@bemedev/app-ts';

// Fully typed — TS reads from Register, config is strictly const-typed
// StatePaths flows from Register['machines'][P]['allPaths']
const m = getMachine('src/interpreters/__tests__/complex/machine1');
// m.matches('/idle')       ✅ valid
// m.matches('/nonexistent') ❌ compile error
```

---

### Rule 4: CLI Rewrites the Entire Config as the User Types

The CLI (via chokidar watcher) performs **incremental type resolution** on
save and writes everything into the single `app.gen.ts`. **The entire
config is rewritten strictly as const** — this is the fundamental shift
from the old `__tsSchema` approach.

**What the CLI does on each save**:

1. **Scan all `*.machine.ts` / `*.fsm.ts` files** in the project.
2. **Parse each config**: Walk the state tree, collecting:
   - All absolute state paths (`AllPaths`)
   - Event names, action names, guard names, delay names, tag keys
   - Emitter keys, children keys
   - Activity keys
3. **Compute per-state targets**: For each state node at path `P`, its
   available targets are `AllPaths` excluding `'/'` and `P` (and for nested
   states, also excluding the parent compound path).
4. **Rewrite the entire config type as `const`**: Each state node gets a
   `__targets` field with its constrained path union. The `on`, `after`,
   `always`, `actors` transitions within that node are typed to only accept
   those paths. No `__tsSchema`, no `ConfigDef`, no `TransformConfigDef` —
   the config type is flat and pre-resolved.
5. **Extract children <-> pContext relation**: For each child actor,
   resolve which `pContext` path it maps to (currently computed by
   `Recomposer<G['contexts']>`). Preserve in generated `ChildrenConfig`.
6. **Generate all key literals**: `_ActionKeys`, `_GuardKeys`,
   `_DelayKeys`, `_EventKeys`, `_TagKeys`, `_EmitterKeys`, `_ChildrenKeys`.
7. **Resolve typings**: Pre-resolve `TransformPrimitiveObject` for context,
   pContext, events, actors.
8. **Write single `app.gen.ts`** at rootDir/project root with the
   `declare module` block.

**What this replaces**:

| Old (removed)                  | New (generated in app.gen.ts)                     |
| ------------------------------ | ------------------------------------------------- |
| `__tsSchema` key in config     | `__targets` per state in generated `_Config` type |
| `ConfigDef` type               | Direct const config type                          |
| `TransformConfigDef<C2>`       | Pre-resolved, no computation                      |
| `NoExtraKeysConfigDef<T>`      | Not needed — config is already strict             |
| `SCHEMAS` object in `*.gen.ts` | Gone — no per-machine gen files                   |
| `machine.real.gen.ts`          | Gone — merged into `app.gen.ts`                   |
| `machine1.machine.gen.ts`      | Gone — merged into `app.gen.ts`                   |

The children <-> pContext relation is critical. Currently
`GetActorsSrcKeysFromFlat2` computes:

```ts
// From src/machine/types.ts L523-532
type GetActorsSrcKeysFromFlat2<Flat, G> = {
  children: {
    [key in G['src']]: Record<Extract<G, { src: key }>['on'], any>;
  };
  emitters: GetEmittersSrcKeyFromFlat<Flat>;
  pContext: Recomposer<G['contexts'][keyof G['contexts']]>;
};
```

The CLI pre-resolves this into the gen file per-child:

```ts
// Generated in app.gen.ts for a machine with children
type MyMachine_ChildrenConfig = {
  childService: {
    /** Events this child can receive */
    events: Record<'CHILD_INIT' | 'CHILD_UPDATE', any>;
    /** pContext paths this child uses from the parent machine */
    parentPContext: { childData: { id: string; value: number } };
    /** context key where the child is spawned */
    context: 'context.activeChild';
  };
  anotherChild: {
    events: Record<'RESET', any>;
    parentPContext: { otherState: { count: number } };
    context: 'context.secondary';
  };
};
```

---

### Rule 5: Third Argument is Conditionally Optional

When a machine has **no events and no actors**, the third argument
(`types`) becomes optional. If provided, it only needs `context` and/or
`pContext` (as `Partial`).

**Type-level implementation**:

```ts
// Simplified conditional types for the 3rd arg

type HasEventsOrActors<C extends Config> =
  GetEventsFromConfig<C> extends Record<string, never>
    ? GetActorKeysFromConfig2<C> extends {
        children: never;
        emitters: never;
      }
      ? false
      : true
    : true;

// When no events/actors:
type OptionalTypingsArg = Partial<{
  context: PrimitiveObjectT;
  pContext: PrimitiveObjectT;
}>;

// Full form (when events or actors exist):
type FullTypingsArg = {
  eventsMap: PrimitiveObjectT;
  pContext: PrimitiveObjectT;
  context: PrimitiveObjectT;
  actorsMap: ActorsMap;
};
```

**In practice** - the CLI detects this and generates simpler types for
machines without events/actors:

```ts
// A machine with no events, no actors
export default createMachine('path/to/simple', {
  initial: 'idle',
  states: {
    idle: {},
    done: {},
  },
});
// Third arg omitted entirely

// A machine with only context
export default createMachine(
  'path/to/contextOnly',
  {
    initial: 'idle',
    states: { idle: {}, done: {} },
  },
  typings({
    context: { count: 'number' },
  }),
);
// Only context/pContext needed
```

---

### Rule 6: Actors Unify Children and Emitters

Currently, `ActorsConfigMap` separates children and emitters:

```ts
// src/events/types.ts L81-84
export type ActorsConfigMap = {
  children?: ChildConfigMap;
  emitters?: EmitterConfigMap;
};
```

**New structure**: Merge children and emitters into a single `actors`
object, differentiated by their properties:

```ts
// New ActorDef
type ActorDef = {
  // A child actor: has events it can receive
  events?: PrimitiveObjectT;
  // An emitter actor: has an observable source
  src?: PrimitiveObjectT;
  // Shared: context key for spawning
  context?: string;
};

type ActorsMap = Record<string, ActorDef>;
```

**How differentiation works**:

| Actor Type | Has `events`? | Has `src`? |
| ---------- | :-----------: | :--------: |
| Child      |      Yes      |     No     |
| Emitter    |      No       |    Yes     |
| Both       |      Yes      |    Yes     |

**Usage in typings**:

```ts
typings({
  eventsMap: { START: 'primitive' },
  context: { count: 'number' },
  actorsMap: {
    // A child actor (has events)
    childService: {
      events: { CHILD_EVENT: 'primitive' },
    },
    // An emitter actor (has src)
    priceStream: {
      src: { price: 'number', timestamp: 'number' },
    },
  },
});
```

**Migration from current structure**:

```ts
// Before
typings({
  actorsMap: {
    children: { childService: { CHILD_EVENT: 'primitive' } },
    emitters: { priceStream: { price: 'number' } },
  },
});

// After
typings({
  actorsMap: {
    childService: { events: { CHILD_EVENT: 'primitive' } },
    priceStream: { src: { price: 'number' } },
  },
});
```

**Changes in `src/utils/typings.ts`**:

Update the `Args` type:

```ts
// Before
type ActorsMap = Partial<
  Record<'children' | 'promisees' | 'emitters', PrimitiveObjectT>
>;

// After
type ActorDef = {
  events?: PrimitiveObjectT;
  src?: PrimitiveObjectT;
  context?: string;
};

type ActorsMap = Record<string, ActorDef>;

export type Args<
  E extends PrimitiveObjectT = PrimitiveObjectT,
  P extends ActorsMap = ActorsMap,
> = {
  eventsMap: E;
  pContext: PrimitiveObjectT;
  context: PrimitiveObjectT;
  actorsMap: P;
};
```

Update `TransformArgs` to handle the new shape:

```ts
export type TransformArgs<T extends Partial<Args>> = {
  eventsMap: TransformPrimitiveObject<T['eventsMap']>;
  pContext: TransformPrimitiveObject<UndefinyT<T['pContext']>>;
  context: TransformPrimitiveObject<UndefinyT<T['context']>>;
  actorsMap: {
    [K in keyof NotUndefined<T['actorsMap']>]: {
      events: TransformPrimitiveObject<
        NotUndefined<T['actorsMap']>[K]['events']
      >;
      src: TransformPrimitiveObject<
        NotUndefined<T['actorsMap']>[K]['src']
      >;
    };
  };
} extends infer TT
  ? { [key in keyof TT]: TT[key] }
  : never;
```

---

### Rule 7: `typings()` Generates Types via `src/utils/typings.ts` Helpers

The existing `typings()` function and its helpers (`typings.custom`,
`typings.array`, `typings.optional`, `typings.intersection`,
`typings.discriminatedUnion`, `typings.litterals`, `typings.partial`,
`typings.record`, `typings.tuple`, `typings.union`, `typings.soa`,
`typings.sv`) already handle runtime-to-type transforms via
`TransformPrimitiveObject<T>`.

**What changes**: The CLI pre-resolves these transforms at generation time
into `app.gen.ts`, so the TS server receives already-resolved types instead
of computing `TransformPrimitiveObject<deeply nested structure>` on every
keystroke.

All resolved types live in the single `app.gen.ts` under their machine's
namespace prefix (e.g., `Machine1_Context`, `Tags_Events`), and are wired
into the `Register` interface via `MachineTypeDef`.

---

## The `app.gen.ts` Generation Location

The CLI determines where to write `app.gen.ts`:

1. Read `tsconfig.json` from project root.
2. If `compilerOptions.rootDir` is defined, write `app.gen.ts` there.
3. If `rootDir` is not defined (current project: no `rootDir`), write
   `app.gen.ts` at the project root.

For the current project (`tsconfig.json` has no `rootDir`), the file is
generated at:

```
/Users/chlbri/Documents/github/NODE JS/Librairies bemedev/app-ts/app.gen.ts
```

---

## CLI Tool: `@bemedev/app-ts` CLI (using `cmd-ts`)

The CLI is built with [`cmd-ts`](https://cmd-ts.vercel.app/) — the same
type-driven CLI parser used by
[`@bemedev/codebase`](https://github.com/chlbri/codebase). It follows the
same patterns: `command()` + `subcommands()` + `run()`.

### File Structure

```
cli/
  index.ts          # Entry point: run(cli, process.argv.slice(2))
  cli.ts            # subcommands({ cmds: { generate, watch } })
  commands/
    generate.ts     # command() — one-shot: scan all machines, write app.gen.ts
    watch.ts        # command() — chokidar watcher: regenerate on file change
  constants.ts      # BIN name, default patterns, etc.
  core/
    parser.ts       # Parse *.machine.ts / *.fsm.ts files (uses ts-morph AST)
    generator.ts    # Generate the single app.gen.ts (config rewrite + Register)
    resolver.ts     # Resolve TransformPrimitiveObject at build time
    paths.ts        # Compute AllPaths and per-state target exclusions
    utils.ts        # Path resolution helpers
```

### CLI Implementation

**Entry point** (`cli/index.ts`):

```ts
#!/usr/bin/env node
import { cli } from './cli';
import { run } from 'cmd-ts';

run(cli, process.argv.slice(2));
```

**Subcommands** (`cli/cli.ts`):

```ts
import { subcommands } from 'cmd-ts';
import { generate } from './commands/generate';
import { watch } from './commands/watch';
import { BIN } from './constants';

export const cli = subcommands({
  name: BIN,
  description: 'CLI for @bemedev/app-ts machine typings generation',
  version: '1.0.0',
  cmds: {
    generate,
    watch,
  },
});
```

**Generate command** (`cli/commands/generate.ts`):

```ts
import { command, option, string, multioption, array, flag } from 'cmd-ts';
import { generateAppGen } from '../core/generator';

export const generate = command({
  name: 'generate',
  description:
    'Scan all *.machine.ts / *.fsm.ts files and generate app.gen.ts',
  args: {
    output: option({
      long: 'output',
      short: 'o',
      type: string,
      description: 'Output file path for the generated file',
      defaultValue: () => 'app.gen.ts',
    }),
    excludes: multioption({
      long: 'excludes',
      short: 'x',
      type: array(string),
      description: 'Glob patterns to exclude',
      defaultValue: () => ['node_modules', 'lib', 'dist'],
    }),
  },
  handler: async ({ output, excludes }) => {
    await generateAppGen({ output, excludes });
    console.log(`Generated ${output}`);
  },
});
```

**Watch command** (`cli/commands/watch.ts`):

```ts
import { command, option, string, multioption, array } from 'cmd-ts';
import chokidar from 'chokidar';
import { generateAppGen } from '../core/generator';

export const watch = command({
  name: 'watch',
  description:
    'Watch *.machine.ts / *.fsm.ts files and regenerate app.gen.ts on change',
  args: {
    output: option({
      long: 'output',
      short: 'o',
      type: string,
      description: 'Output file path for the generated file',
      defaultValue: () => 'app.gen.ts',
    }),
    excludes: multioption({
      long: 'excludes',
      short: 'x',
      type: array(string),
      description: 'Glob patterns to exclude',
      defaultValue: () => ['node_modules', 'lib', 'dist'],
    }),
  },
  handler: async ({ output, excludes }) => {
    // Initial generation
    await generateAppGen({ output, excludes });
    console.log(`Generated ${output}`);

    // Watch for changes
    const watcher = chokidar.watch(['**/*.machine.ts', '**/*.fsm.ts'], {
      ignored: [output, '**/*.test.ts', ...excludes],
    });

    watcher.on('change', async filePath => {
      console.log(`Changed: ${filePath}`);
      await generateAppGen({ output, excludes });
      console.log(`Regenerated ${output}`);
    });

    watcher.on('add', async filePath => {
      console.log(`Added: ${filePath}`);
      await generateAppGen({ output, excludes });
      console.log(`Regenerated ${output}`);
    });

    watcher.on('unlink', async filePath => {
      console.log(`Removed: ${filePath}`);
      await generateAppGen({ output, excludes });
      console.log(`Regenerated ${output}`);
    });

    console.log('Watching for machine file changes...');
  },
});
```

**Constants** (`cli/constants.ts`):

```ts
export const BIN = 'app-ts';
```

### `package.json` Setup

```json
{
  "bin": {
    "app-ts": "cli/index.ts"
  },
  "dependencies": {
    "cmd-ts": "^0.15.0",
    "chokidar": "^4.0.0",
    "ts-morph": "^27.0.2"
  }
}
```

### Usage

```bash
# One-shot generation
app generate
app generate --output src/app.gen.ts
app generate --excludes node_modules lib dist

# Watch mode
app watch
app watch --output src/app.gen.ts

# During development (via tsx)
pnpm tsx cli/index.ts generate
pnpm tsx cli/index.ts watch
```

### npm scripts

```json
{
  "scripts": {
    "machines:generate": "tsx cli/index.ts generate",
    "machines:watch": "tsx cli/index.ts watch"
  }
}
```

### Relation to `@bemedev/codebase`

This CLI follows the same architecture as `@bemedev/codebase`:

| `@bemedev/codebase`               | `@bemedev/app-ts` CLI                                  |
| --------------------------------- | ------------------------------------------------------ |
| `cmd-ts` for CLI parsing          | Same                                                   |
| `ts-morph` for AST analysis       | Same — parse machine configs from TS source            |
| `generate()` core function        | `generateAppGen()` — scan machines, write `app.gen.ts` |
| Single output `codebase.json`     | Single output `app.gen.ts`                             |
| `--output` / `--excludes` options | Same option pattern                                    |
| `run(cli, process.argv.slice(2))` | Same entry point pattern                               |

---

## Migration Path

1. **Phase 1**: Add `name` as first arg to `createMachine`, keep old 2-arg
   overload as deprecated.
2. **Phase 2**: Add `StatePaths` type parameter to `Machine` and
   `Interpreter` classes.
3. **Phase 3**: Build CLI with `cmd-ts` (following `@bemedev/codebase`
   patterns) — `generate` and `watch` subcommands. Uses `ts-morph` for AST
   parsing, `chokidar` for file watching.
4. **Phase 4**: Implement single `app.gen.ts` generation with
   `declare module` pattern. Config is rewritten strictly as const —
   `__tsSchema` removed.
5. **Phase 5**: Add `MACHINES` registry + `getMachine()` consuming
   `Register` (config + allPaths + all keys).
6. **Phase 6**: Unify actors (children + emitters) with `_EmitterKeys` /
   `_ChildrenKeys` + `ChildrenConfig`.
7. **Phase 7**: Make third arg optional for event-less/actor-less machines.
8. **Phase 8**: Remove deprecated 2-arg overload, `__tsSchema` key,
   `ConfigDef` type, all per-machine `*.gen.ts` files.

---

## Key Files to Modify

| File                                             | Changes                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/machine/machine.ts` (L1283-1329)            | Update `CreateMachine_F` to 3 args, add `StatePaths` type param, remove `__tsSchema`                                                       |
| `src/machine/types.ts` (L115-155)                | Remove `ConfigDef`, `NoExtraKeysConfigDef`, `TransformConfigDef`. Remove `__tsSchema` from `NoExtraKeysConfig`. Update actor-related types |
| `src/interpreters/interpreter.ts` (L155+)        | Add `StatePaths` type param to `Interpreter`, constrain `matches`/`onState`/path APIs                                                      |
| `src/utils/typings.ts` (L94-258)                 | Update `ActorsMap`, `Args`, `TransformArgs`, `DEFAULT_ARGS`                                                                                |
| `src/events/types.ts` (L81-84)                   | Update `ActorsConfigMap` to new unified shape                                                                                              |
| New: `src/machine/registry.ts`                   | `MACHINES` object + `getMachine()` + `Register` interface                                                                                  |
| New: `cli/index.ts`                              | Entry point: `run(cli, process.argv.slice(2))`                                                                                             |
| New: `cli/cli.ts`                                | `subcommands({ cmds: { generate, watch } })` via `cmd-ts`                                                                                  |
| New: `cli/commands/generate.ts`                  | `command()` — one-shot scan + write `app.gen.ts`                                                                                           |
| New: `cli/commands/watch.ts`                     | `command()` — chokidar watcher + regenerate on change                                                                                      |
| New: `cli/constants.ts`                          | `BIN = 'app-ts'`, default patterns                                                                                                         |
| New: `cli/core/generator.ts`                     | Single `app.gen.ts` generation (config rewrite + Register)                                                                                 |
| New: `cli/core/parser.ts`                        | Parse machine files via `ts-morph` AST (like `@bemedev/codebase`)                                                                          |
| New: `cli/core/paths.ts`                         | AllPaths computation + per-state target exclusions                                                                                         |
| New: `cli/core/resolver.ts`                      | `TransformPrimitiveObject` resolution at build time                                                                                        |
| Generated: `app.gen.ts` (project root)           | `declare module '@bemedev/app-ts'` with `Register`                                                                                         |
| Remove: all `*.machine.gen.ts` / `*.real.gen.ts` | Replaced by single `app.gen.ts`                                                                                                            |

---

## Performance Impact

The key insight: instead of the TS server computing these recursive types
on every keystroke:

- `FlatMapN<C>` (recursive state tree flattening)
- `ConfigDef` / `TransformConfigDef<C2>` (config schema overlay — gone
  entirely)
- `NoExtraKeysConfigDef<T>` (schema validation — gone entirely)
- `__tsSchema` injection and resolution — gone entirely
- `_GetKeyActionsFromFlat<Flat>` (action key extraction from flat map)
- `_GetChildKeysFromFlat<Flat>` (children key extraction)
- `_GetEmitterSrcKeyFromFlat<Flat>` (emitter key extraction)
- `GetActorsSrcKeysFromFlat2<Flat>` (children + emitters + pContext
  relation)
- `TransformPrimitiveObject<T>` (deep typings resolution)
- `NoExtraKeysConfig<C>` (config validation)
- `Recomposer<P>` (pContext reconstruction from child paths)

...the CLI pre-computes them all once on save into `app.gen.ts`, and the TS
server only sees:

- **A strictly typed const config** with per-state `__targets` (replaces
  `__tsSchema` + `ConfigDef`)
- **`StatePaths`** — simple string literal union constraining all
  path-accepting APIs
- Simple string literal unions (`_ActionKeys`, `_GuardKeys`,
  `_EmitterKeys`, `_ChildrenKeys`, etc.)
- Pre-resolved object types (`_Context`, `_PContext`, `_Events`)
- Pre-resolved children-to-pContext mappings (`_ChildrenConfig`)
- The `Register` interface for `getMachine()` return types

This should dramatically reduce TS server memory usage and response time.
