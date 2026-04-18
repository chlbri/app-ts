# Solution: Remove Promise Actor, Allow Async Actions & Helpers (v3.0.0)

Mirror of `~/.claude/plans/change-actors-an-delete-stateless-minsky.md`
kept inside the repo for durable reference.

## Scope

- **Delete** the `promisees` actor type: `PromiseeConfig`,
  `src/promises/*`, `PromiseFunction*`, `Promisee`, `PromisesMap`,
  `toPromise`, `performPromisee`, `performPromiseSrc`, `#addPromises`,
  `actors.promises`, `longRuns`, and associated tests.
- **Widen** `Action` / `Action2` / `ActionResult` to allow either
  `ActionResult<Pc, Tc>` or `Promise<ActionResult<Pc, Tc>>`.
- **Make** the interpreter's action pipeline (`#performAction` →
  `#executeAction` → `#performActions`) async and sequentially awaited.
- **Extend** every `addOptions` action helper that takes a user function
  with an optional third `errorFn` parameter (skipped on guards, which stay
  sync). `debounce` now also accepts `MaybeAsync` actions (the
  implementation already uses `await fn(state)`; the `Action2` widening
  makes this possible).

## Locked Design Decisions

1. **Error handling via 3rd arg.** Example (assign):

   ```ts
   assign<'user', User, FetchError>(
     'user',
     async ({ event }) => (await fetch(`/u/${event.id}`)).json(),
     (err, state) => ({
       context: { ...state.context, error: err.message },
     }),
   );
   ```

   The error type `Err` is a user generic, default `any`. On rejection:
   - `errorFn` present → its `ActionResult` is merged.
   - `errorFn` absent → error flows to the existing `_addError` channel; no
     merge.

2. **No transition-arm helper.** Users branch via try/catch + resend, or
   via `errorFn`.

3. **Debounce accepts MaybeAsync actions** — `fn` parameter is `Action2`,
   which now returns `MaybeAsyncActionResult`. The implementation uses
   `await fn(state)`, so async actions are supported without any extra
   overload. No `errorFn` 3rd arg is added to `debounce` (the scheduled
   data pattern means errors are propagated via the `_addError` channel as
   with any async action).

4. **Version bump = v3.0.0** (breaking).

## Helper Signature Summary

| Helper       | Sync (unchanged)   | New async overload                                             |
| ------------ | ------------------ | -------------------------------------------------------------- |
| `assign`     | `(key, fn)`        | `<Err=any>(key, asyncFn, errorFn?)`                            |
| `voidAction` | `(fn?)`            | `<Err=any>(asyncFn, errorFn?)`                                 |
| `batch`      | `(...actions)`     | accepts async sub-actions; no new arg (err per sub-action)     |
| `filter`     | `(key, predicate)` | `<Err=any>(key, asyncPredicate, errorFn?)`                     |
| `sendTo`     | `(machine?)(fn)`   | `(machine?)<Err=any>(asyncFn, errorFn?)`                       |
| `erase`      | `(key)` — no fn    | — (no fn, no change)                                           |
| `debounce`   | `(fn, { ms, id })` | ✅ accepts async `fn` via `Action2` widening; no `errorFn` arg |
| `resend`     | `(event)` — no fn  | —                                                              |
| `forceSend`  | `(event)` — no fn  | —                                                              |
| time helpers | `(id)` — no fn     | —                                                              |
| guards       | all sync           | — (out of scope)                                               |

## File Change Matrix

| Path                                                                 | Action                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/promises/`                                                      | delete (types, functions/src, functions/toPromise, tests)                   |
| `src/actor.types.ts`                                                 | drop `_PromiseeConfig`, `PromiseeConfig` from `ActorConfig`                 |
| `src/events/` (actors map types)                                     | drop `promisees` key                                                        |
| `src/actions/types.ts`                                               | widen `ActionResult`/`Action`/`Action2`                                     |
| `src/machine/machine.ts`                                             | remove `#addPromises`; widen helpers; async helper wrapper                  |
| `src/machine/machine.types.ts`                                       | overload `AssignAction_F`, `VoidAction_F`, `FilterAction_F`, `SendAction_F` |
| `src/interpreters/interpreter.ts`                                    | async pipeline; remove `#performPromisee`/`#performPromiseSrc`              |
| `src/interpreters/__tests__/selftransitions/promisee.test.ts`        | delete                                                                      |
| `src/promises/__tests__/longRuns.test.ts`                            | delete                                                                      |
| `src/actions/__tests__/actions.test.ts` + `action.batch.cov.test.ts` | add async coverage                                                          |
| `src/actions/__tests__/async-actions.test.ts`                        | **new** — all 6 helpers async + errorFn path                                |
| `src/machine/__tests__/addOptions-return.test.ts`                    | remove `promises` assertions                                                |
| `src/interpreters/__tests__/coverage/addOptions-return.test.ts`      | remove `promises` assertions                                                |
| `src/interpreters/__tests__/legacy-options.test.ts`                  | drop `_legacy.actors.promises`                                              |
| `src/fixtures/constants.ts`                                          | drop `promisees` from `defaultT.actors`                                     |
| `README.md`                                                          | rewrite async section                                                       |
| `CHANGELOG.md`                                                       | v3.0.0 entry                                                                |
| `package.json`                                                       | `version: 3.0.0`                                                            |

## Migration Table (CHANGELOG)

| Before (v2.x)                                                  | After (v3.0)                                                                                              |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `actors: { promises: { fetchUser: async () => … } }`           | `actions: { fetchUser: assign('user', async () => …, (err, s) => ({ context: { ...s.context, err } })) }` |
| state: `{ promises: [{ src: 'fetchUser', resolves, catch }] }` | state: `{ entry: 'fetchUser' }`; branch via `errorFn` or try/catch + resend                               |
| `PromiseeConfig`, `PromiseFunction`, `PromisesMap`             | removed                                                                                                   |
| `debounce(async fn, …)`                                        | ✅ now accepted — `Action2` widening makes async `fn` valid                                               |

## Verification Checklist

- [ ] `pnpm typecheck` clean
- [ ] `pnpm test` green
- [ ] `pnpm coverage` not regressed
- [ ] `pnpm build` succeeds
- [ ] `git grep -n promisee` → 0 hits outside CHANGELOG/README
- [ ] `git grep -n PromiseFunction` → 0 hits outside CHANGELOG/README
