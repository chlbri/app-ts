# Solution: TS2589 — Type instantiation is excessively deep and possibly infinite

## 1. Diagnosis

### Where the error surfaces

The error appears only during **rolldown DTS generation**, not during `tsc --noEmit`.
During `--noEmit`, TypeScript can short-circuit many deep instantiations because it never
has to fully serialize a concrete type into a `.d.ts` file. The DTS emitter forces full
resolution of every exported type, which is what triggers the limit.

### The two files at fault

| File | Role |
|---|---|
| `src/states/types.ts` | Defines `FlatMapNodeConfig` + `FlatMapN` |
| `src/machine/types.ts` | Defines `_GetKeyXXXFromFlat`, `MachineOptions` |

---

## 2. Root Cause — Step by Step

### Step 1 — `FlatMapNodeConfig` produces a nested intersection-of-unions

```ts
type FlatMapNodeConfig<T, withChildren, Remaining> =
  'states' extends keyof T
    ? { readonly [key in keyof T['states'] as `${Remaining}${key}`]: ... }  // A: immediate children map
      & {
          [key in keyof T['states']]:
            states[key] has states
              ? FlatMapNodeConfig<states[key], ...>   // recursive
              : {};
        }[keyof T['states']]                          // B: union of recursive results
    : {};
```

The second part `{ ... }[keyof T['states']]` distributes over the state keys, producing a
**union**. The whole type is `A & (B1 | B2 | ...)`.

TypeScript distributes `A & (B1 | B2)` into `(A & B1) | (A & B2)`.  
At the next depth this becomes `((A & B1) | (A & B2)) & (C1 | C2)`, which distributes to 4
members. Each additional level **doubles** the union size because every leaf inherits all
ancestor node types. For a tree with d levels and b branches per level, the union has up to
`b^d` members.

### Step 2 — `UnionToIntersection` collapses the explosion into an intersection

```ts
export type FlatMapN<T, withChildren> =
  UnionToIntersection<FlatMapNodeConfig<T, withChildren>> & { '/': T };
```

`UnionToIntersection` uses the standard contravariant infer trick:

```ts
(U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
```

For an exponentially-sized union, TypeScript must simultaneously infer `I` across all
members. Each member carries the full ancestor type tree (repeated), so the instantiation
depth for the inference grows proportionally to `nodes × depth × member_type_size`.

With a complex machine (deep event/asset/contact types, 5+ states, 2+ nesting levels),
this is where TypeScript hits the TS2589 limit.

### Step 3 — Multiple consumers re-iterate over `keyof Flat`

After `FlatMapN<C, false>` is computed once as a default type parameter in `MachineOptions`,
it is passed to **four separate** `_GetKeyXXXFromFlat` types:

```ts
// Each of these is a separate full iteration over the intersection's keys:
_GetKeyActionsFromFlat<Flat>
_GetKeyGuardsFromFlat<Flat>
_GetDelayKeysFromFlat<Flat>
_GetPromiseeSrcKeysFromFlat<Flat>
_GetEmitterSrcKeyFromFlat<Flat>
_GetChildKeysFromFlat<Flat>
_ExtractTagsFromFlat<Flat>
```

Each type is `{ [key in keyof Flat]: extract_something<Flat[key]> }[keyof Flat]`.
TypeScript must fully evaluate `keyof Flat` — which is the union of all keys of the
intersection — and then apply a conditional extraction for every key, for every one of
these seven types. This compounds the cost of Step 2.

---

## 3. Proposed Solution — FlatNodes: single-pass union traversal

### Core idea

The extraction types (`_GetKeyActionsFromFlat`, etc.) only care about **visiting each node
once** and collecting a union of strings. They do not need the flat map as a key-indexed
object. A **union of typed node entries** gives us the same information with none of the
`UnionToIntersection` cost.

TypeScript processes `U extends Condition ? Extract : never` (distributive conditional
types) in O(n) — one instantiation per union member — which is how it was designed to
work over unions.

---

### 3.1 New type: `NodeEntry` and `FlatNodes`

Replace the current `FlatMapNodeConfig` with a type that collects every node as a
discriminated union member — **no intersection, no `UnionToIntersection`**.

```ts
// A single typed record: one node at one path
type NodeEntry<
  Path extends string,
  N extends NodeConfig,
> = {
  readonly path: Path;
  readonly node: N;
};

// Recursively collect every node in the tree as a union of NodeEntry
type FlatNodes<
  T extends NodeConfig,
  withChildren extends boolean = true,
  Path extends string = '/',
> =
  | NodeEntry<Path, withChildren extends true ? T : Omit<T, 'states'>>
  | ('states' extends keyof T
    ? {
        [key in keyof T['states']]: FlatNodes<
          T['states'][key],
          withChildren,
          `${Path}${key & string}/`
        >
      }[keyof T['states']]
    : never);
```

**Why this is safe from TS2589:**
- The result is a pure **union** — `NodeEntry<...> | NodeEntry<...> | ...`
- There is no `&` between ancestors and descendants; each entry is independent
- Recursion depth equals the tree depth (linear, not exponential)
- TypeScript defers union evaluation lazily — it never has to materialize the full union
  for type checking unless something iterates over it

---

### 3.2 Shallow per-node extractors

These replace the repeated inline logic inside each `_GetKeyXXXFromFlat`. Each one
operates on a **single concrete `NodeConfig`** — no generics over `Flat`, no `keyof`.

```ts
// --- Actions ---
type _ActionKeysFromNode<N extends NodeConfig> =
  | ExtractActionKeysFromTransitions<Extract<N, TransitionsConfig>>
  | ExtractActionsFromActivity<Extract<N, { activities: ActivityConfig }>>
  | FromActionConfig<ReduceArray<Extract<N, { entry: any }>['entry']>>
  | FromActionConfig<ReduceArray<Extract<N, { exit: any }>['exit']>>;

// --- Guards ---
type _GuardKeysFromNode<N extends NodeConfig> =
  | ExtractGuardKeysFromTransitions<Extract<N, TransitionsConfig>>
  | ExtractGuardsFromActivity<Extract<N, { activities: ActivityConfig }>>;

// --- Delays ---
type _DelayKeysFromNode<N extends NodeConfig> =
  | ExtractDelayKeysFromTransitions<Extract<N, TransitionsConfig>>
  | ExtractDelaysFromActivity<N>;

// --- Events ---
type _EventKeysFromNode<N extends NodeConfig> =
  N extends { on: infer V } ? keyof V : never;

// --- Promise src keys ---
type _PromiseSrcKeyFromNode<N extends NodeConfig> =
  ExtractPromiseeSrcKeyFromTransitions<Extract<N, TransitionsConfig>>;

// --- Emitter src keys ---
type _EmitterSrcKeyFromNode<N extends NodeConfig> =
  ExtractEmitterSrcKeyFromTransitions<Extract<N, TransitionsConfig>>;

// --- Child keys (returns the { src, on, contexts } union) ---
type _ChildKeysFromNode<N extends NodeConfig> =
  ExtractChildKeysFromTransitions<Extract<N, TransitionsConfig>>;

// --- Tags ---
type _TagsFromNode<N extends NodeConfig> =
  N extends { tags: SingleOrArrayL<string> }
    ? ReduceArray<N['tags']>
    : never;
```

---

### 3.3 Distributed extractors — the key pattern

Each extractor uses a **single distributive conditional** over the `FlatNodes` union.
TypeScript processes this in O(n) — one instantiation per node.

```ts
type GetActionKeysFromNodes<Nodes> =
  Nodes extends NodeEntry<string, infer N extends NodeConfig>
    ? _ActionKeysFromNode<N>
    : never;

type GetGuardKeysFromNodes<Nodes> =
  Nodes extends NodeEntry<string, infer N extends NodeConfig>
    ? _GuardKeysFromNode<N>
    : never;

type GetDelayKeysFromNodes<Nodes> =
  Nodes extends NodeEntry<string, infer N extends NodeConfig>
    ? _DelayKeysFromNode<N>
    : never;

type GetEventKeysFromNodes<Nodes> =
  Nodes extends NodeEntry<string, infer N extends NodeConfig>
    ? _EventKeysFromNode<N>
    : never;

type GetPromiseSrcKeysFromNodes<Nodes> =
  Nodes extends NodeEntry<string, infer N extends NodeConfig>
    ? _PromiseSrcKeyFromNode<N>
    : never;

type GetEmitterSrcKeysFromNodes<Nodes> =
  Nodes extends NodeEntry<string, infer N extends NodeConfig>
    ? _EmitterSrcKeyFromNode<N>
    : never;

type GetChildKeysFromNodes<Nodes> =
  Nodes extends NodeEntry<string, infer N extends NodeConfig>
    ? _ChildKeysFromNode<N>
    : never;

type GetTagsFromNodes<Nodes> =
  Nodes extends NodeEntry<string, infer N extends NodeConfig>
    ? _TagsFromNode<N>
    : never;
```

---

### 3.4 Single-pass all-at-once extraction

Compute all key categories at the same time. Since `Nodes` is a single type parameter,
TypeScript can cache it and re-use the union distribution result across all fields.

```ts
type AllExtractedKeys<Nodes> = {
  readonly actionKeys:  GetActionKeysFromNodes<Nodes>;
  readonly guardKeys:   GetGuardKeysFromNodes<Nodes>;
  readonly delayKeys:   GetDelayKeysFromNodes<Nodes>;
  readonly eventKeys:   GetEventKeysFromNodes<Nodes>;
  readonly promiseKeys: GetPromiseSrcKeysFromNodes<Nodes>;
  readonly emitterKeys: GetEmitterSrcKeysFromNodes<Nodes>;
  readonly childKeys:   GetChildKeysFromNodes<Nodes>;
  readonly tags:        GetTagsFromNodes<Nodes>;
};
```

---

### 3.5 Updated `MachineOptions`

The most impactful change: replace `FlatMapN<C, false>` (intersection, expensive) with
`FlatNodes<C, false>` (union, cheap) as the default type parameter.

```ts
// Before
export type MachineOptions<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
  Flat extends FlatMapN<C, false> = FlatMapN<C, false>,           // <-- expensive
> = Partial<{
  actions:    Partial<GetActionsFromFlat<Flat, Eo, Pc, Tc, T>>;  // re-iterates Flat
  predicates: Partial<GetGuardsFromFlat<Flat, Eo, Pc, Tc, T>>;   // re-iterates Flat
  delays:     Partial<GetDelaysFromFlat<Flat, Eo, Pc, Tc, T>>;   // re-iterates Flat
  actors:     Partial<GetActorsFromFlat<Flat, Eo, A, Pc, Tc, T>>;// re-iterates Flat
}>;

// After
export type MachineOptions<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
  Nodes extends FlatNodes<C, false> = FlatNodes<C, false>,        // <-- cheap union
  Keys extends AllExtractedKeys<Nodes> = AllExtractedKeys<Nodes>, // <-- single pass
> = Partial<{
  actions:    Partial<Record<Keys['actionKeys'] & string, Action2<Eo, Pc, Tc, T>>>;
  predicates: Partial<Record<Keys['guardKeys'] & string, PredicateS<Eo, Pc, Tc, T>>>;
  delays:     Partial<Record<Keys['delayKeys'] & string, DelayFunction2<Eo, Pc, Tc, T>>>;
  actors:     Partial<GetActorsFromNodes<Nodes, Eo, A, Pc, Tc, T>>;
}>;
```

---

### 3.6 Updated `ExtractTagsFromFlat` / `ExtractTagsFromConfig`

```ts
// Before (states/types.ts)
export type ExtractTagsFromFlat<Flat extends FlatMapN> =
  _ExtractTagsFromFlat<Flat> extends infer Tags
    ? Equals<Tags, never> extends true ? string : Tags
    : string;

// After
export type ExtractTagsFromNodes<Nodes> =
  GetTagsFromNodes<Nodes> extends infer Tags
    ? Equals<Tags, never> extends true ? string : Tags
    : string;

// In machine/types.ts
export type ExtractTagsFromConfig<T extends Config> =
  ExtractTagsFromNodes<FlatNodes<T>>;
```

---

## 4. Complexity comparison

| Aspect | Current (`FlatMapN`) | Proposed (`FlatNodes`) |
|---|---|---|
| Union size from `FlatMapNodeConfig` | O(b^d) — exponential | N/A — no union-to-intersection |
| `UnionToIntersection` cost | O(b^d × node_type_size) | Not needed |
| Key extraction per category | O(n) over `keyof intersection` | O(n) distributive conditional |
| Total cost for 7 extractors | O(7 × b^d × size) | O(7n) |
| Recursion depth | d levels of `FlatMapNodeConfig` + U→I | d levels of `FlatNodes` |
| DTS serialization | Full intersection must materialize | Union members are lazy |

Where n = number of nodes, b = average branching factor, d = tree depth.

---

## 5. Backward compatibility and migration plan

### What changes

| Symbol | Status | Action |
|---|---|---|
| `FlatMapN` | Kept for existing consumers | No change needed initially |
| `FlatMapNodeConfig` | Internal | Can be removed after migration |
| `_GetKeyXXXFromFlat` | Internal, private (`_` prefix) | Replace with `GetXxxKeysFromNodes` |
| `GetActionsFromFlat`, `GetGuardsFromFlat`, `GetDelaysFromFlat` | Public | Keep as aliases or update |
| `MachineOptions` | Public, exported | Update default type params |
| `ExtractTagsFromFlat` | Public | Provide `ExtractTagsFromNodes` alongside |

### Suggested phased migration

**Phase 1** — Add `NodeEntry`, `FlatNodes`, shallow extractors, distributive extractors,
`AllExtractedKeys`. No deletions. Ship and verify DTS build succeeds.

**Phase 2** — Update `MachineOptions` to use `Nodes` + `Keys` default params.
Update all `GetXxxFromConfig<C>` helpers to use `FlatNodes<C>` instead of `FlatMapN<C>`.

**Phase 3** — Deprecate `FlatMapN`-based extraction helpers (`GetActionsFromFlat`,
`GetGuardsFromFlat`, etc.) with a `@deprecated` JSDoc pointing to the new equivalents.

**Phase 4** — In a major version bump, remove the deprecated types if desired.

### Non-breaking guarantee

`FlatMapN` itself is not removed. Any user code that uses `FlatMapN` as a constraint
(e.g., `Flat extends FlatMapN`) continues to compile. The fix is entirely in how
`MachineOptions` and the internal extraction machinery compute their intermediates.

---

## 6. Alternative: surgical `infer`-based caching (lower risk)

If the `FlatNodes` refactor is too large for the current cycle, a smaller intervention
can reduce the number of re-evaluations of `FlatMapN` without eliminating the root cause:

```ts
// Add a single "all keys" type computed once from the flat map
type _AllKeysFromFlat<Flat extends FlatMapN> = {
  actionKeys:  _GetKeyActionsFromFlat<Flat>;
  guardKeys:   _GetKeyGuardsFromFlat<Flat>;
  delayKeys:   _GetDelayKeysFromFlat<Flat>;
  promiseKeys: _GetPromiseeSrcKeysFromFlat<Flat>;
  emitterKeys: _GetEmitterSrcKeyFromFlat<Flat>;
  childKeys:   _GetChildKeysFromFlat<Flat>;
  tags:        _ExtractTagsFromFlat<Flat>;
};

// Then in MachineOptions add a single Keys default param:
export type MachineOptions<
  ...
  Flat extends FlatMapN<C, false> = FlatMapN<C, false>,
  Keys extends _AllKeysFromFlat<Flat> = _AllKeysFromFlat<Flat>,
> = Partial<{
  actions:    Partial<Record<Keys['actionKeys'] & string, Action2<Eo, Pc, Tc, T>>>;
  predicates: Partial<Record<Keys['guardKeys'] & string, PredicateS<Eo, Pc, Tc, T>>>;
  delays:     Partial<Record<Keys['delayKeys'] & string, DelayFunction2<Eo, Pc, Tc, T>>>;
  ...
}>;
```

This consolidates 7 separate iterations into 1 default type parameter evaluation,
which TypeScript can cache. It **does not** fix the `UnionToIntersection` cost but
reduces the repetition that compounds it. Useful as a quick patch while the full
`FlatNodes` refactor is prepared.

---

## 7. Summary

The TS2589 error is caused by:
1. `FlatMapNodeConfig` producing an exponentially-growing union (O(b^d) members)
2. `UnionToIntersection` being forced to instantiate all members simultaneously
3. Seven extractors each re-iterating over the resulting `keyof intersection`

The structural fix is to **never convert the node union to an intersection for extraction
purposes**. A new `FlatNodes<T>` type that collects all nodes as a discriminated union
(no `UnionToIntersection`) enables all key extraction to be done via distributive
conditional types in O(n) total, eliminating the exponential growth entirely.
