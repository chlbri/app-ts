import type { ActionConfig, FromActionConfig } from '#actions';
import type {
  NotUndefined,
  PrimitiveObject,
} from '#bemedev/globals/types';
import type { GUARD_TYPE } from '#constants';
import type { AllEvent, EventsMap } from '#events';
import type { KeysMatching } from '@bemedev/decompose';
import type { FnMap, FnR } from 'src/types/primitives';
import type { RecordS, ReduceArray } from '~types';

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
export type FromGuard<T extends GuardConfig> = T extends ActionConfig
  ? FromActionConfig<T>
  : T extends GuardAnd
    ? FromGuard<ReduceArray<T['and']>>
    : T extends GuardOr
      ? FromGuard<ReduceArray<T['or']>>
      : never;

export type PredicateS<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = boolean | FnMap<E, Pc, Tc, T, boolean>;

export type PredicateS2<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = boolean | FnR<E, Pc, Tc, T, boolean>;

export type PredicateUnion<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> =
  | PredicateS<E, Pc, Tc, T>
  | PredicateAnd<E, Pc, Tc, T>
  | PredicateOr<E, Pc, Tc, T>;

export type PredicateAnd<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  and: PredicateUnion<E, Pc, Tc, T>[];
};

export type PredicateOr<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  or: PredicateUnion<E, Pc, Tc, T>[];
};

/**
 * Union of all predicate functions.
 * @template : type {@linkcode EventsMap} [E], the events map to use for resolving the predicate.
 * @template : type {@linkcode PromiseeMap} [P], the promisees map to use for resolving the predicate.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc], the type of the context.
 *
 * @returns A union type that can be a single predicate function, a combination of predicates with AND logic, or a combination of predicates with OR logic.
 *
 * @see {@linkcode PredicateS2} for single predicate function.
 * @see {@linkcode PredicateAnd} for combining multiple predicates with AND logic.
 * @see {@linkcode PredicateOr} for combining multiple predicates with OR logic.
 */
export type Predicate<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> =
  | PredicateS2<E, Pc, Tc, T>
  | PredicateAnd<E, Pc, Tc, T>
  | PredicateOr<E, Pc, Tc, T>;

/**
 * Represents a map of predicates, where each key is a string and each value is a {@linkcode Predicate}.
 *
 * @template : type {@linkcode EventsMap} [E], the events map to use for resolving the predicate.
 * @template : type {@linkcode PromiseeMap} [P], the promisees map to use for resolving the predicate.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc], the type of the context.
 *
 * @returns A partial record where each key is a string and each value is a {@linkcode PredicateS}.
 *
 * @see {@linkcode RecordS} for single predicate function.
 */
export type PredicateMap<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Partial<RecordS<PredicateS<E, Pc, Tc, T>>>;

type _DefinedValue<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = KeysMatching<{
  pContext: NotUndefined<Pc>;
  context: NotUndefined<Tc>;
}>;

/**
 * Represents a type that can be a defined value or a string representing an event or its type
 *
 * @template : [Pc] The type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc] The type of the context.
 */
export type DefinedValue<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = _DefinedValue<Pc, Tc> | 'events' | 'events.type' | 'events.payload';
