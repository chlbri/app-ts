import type { ActionConfig, FromActionConfig } from '../actions/index.js';
import type { GUARD_TYPE } from '../constants/index.js';
import type { EventsMap, PromiseeMap } from '../events/index.js';
import type { KeysMatching } from '@bemedev/decompose';
import type { types } from '@bemedev/types';
import type { FnMap, FnR, RecordS, ReduceArray } from '../types/index.js';
type gType = typeof GUARD_TYPE;
type and = gType['and'];
type or = gType['or'];
export type GuardUnion = ActionConfig | GuardAnd | GuardOr;
export type GuardAnd = {
    [k in and]: GuardUnion[];
};
export type GuardOr = {
    [k in or]: GuardUnion[];
};
/**
 * JSON configuration for a guard.
 *
 * @see {@linkcode ActionConfig} for more details.
 * @see {@linkcode GuardAnd} for more details.
 * @see {@linkcode GuardOr} for more details.
 */
export type GuardConfig = GuardUnion;
/**
 * Retrieves the name of the action if it is a describer, otherwise returns the action itself.
 * @template : type {@linkcode GuardConfig} [T], GuardConfig to reduce
 * @return The name of the action if it is a describer, otherwise the action itself.
 *
 * @see {@linkcode FromActionConfig} for more details.
 * @see {@linkcode ReduceArray} for more details.
 * @see {@linkcode GuardAnd} for more details.
 * @see {@linkcode GuardOr} for more details.
 */
export type FromGuard<T extends GuardConfig> = T extends ActionConfig ? FromActionConfig<T> : T extends GuardAnd ? FromGuard<ReduceArray<T['and']>> : T extends GuardOr ? FromGuard<ReduceArray<T['or']>> : never;
export type PredicateS<E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = FnMap<E, P, Pc, Tc, boolean>;
export type PredicateS2<E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = FnR<E, P, Pc, Tc, boolean>;
export type PredicateUnion<E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = PredicateS<E, P, Pc, Tc> | PredicateAnd<E, P, Pc, Tc> | PredicateOr<E, P, Pc, Tc>;
export type PredicateAnd<E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = {
    and: PredicateUnion<E, P, Pc, Tc>[];
};
export type PredicateOr<E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = {
    or: PredicateUnion<E, P, Pc, Tc>[];
};
/**
 * Union of all predicate functions.
 * @template : type {@linkcode EventsMap} [E], the events map to use for resolving the predicate.
 * @template : type {@linkcode PromiseeMap} [P], the promisees map to use for resolving the predicate.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc], the type of the context.
 *
 * @returns A union type that can be a single predicate function, a combination of predicates with AND logic, or a combination of predicates with OR logic.
 *
 * @see {@linkcode PredicateS2} for single predicate function.
 * @see {@linkcode PredicateAnd} for combining multiple predicates with AND logic.
 * @see {@linkcode PredicateOr} for combining multiple predicates with OR logic.
 */
export type Predicate<E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = PredicateS2<E, P, Pc, Tc> | PredicateAnd<E, P, Pc, Tc> | PredicateOr<E, P, Pc, Tc>;
/**
 * Represents a map of predicates, where each key is a string and each value is a {@linkcode Predicate}.
 *
 * @template : type {@linkcode EventsMap} [E], the events map to use for resolving the predicate.
 * @template : type {@linkcode PromiseeMap} [P], the promisees map to use for resolving the predicate.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc], the type of the context.
 *
 * @returns A partial record where each key is a string and each value is a {@linkcode PredicateS}.
 *
 * @see {@linkcode RecordS} for single predicate function.
 */
export type PredicateMap<E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = Partial<RecordS<PredicateS<E, P, Pc, Tc>>>;
type _DefinedValue<Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = KeysMatching<{
    pContext: Pc;
    context: Tc;
}>;
/**
 * Represents a type that can be a defined value or a string representing an event or its type
 *
 * @template : [Pc] The type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc] The type of the context.
 */
export type DefinedValue<Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject> = _DefinedValue<Pc, Tc> | 'events' | 'events.type' | 'events.payload';
export {};
//# sourceMappingURL=types.d.ts.map