import type { EventsMap, PromiseeMap, ToEvents } from '../../events/index.js';
import type { GuardConfig } from '../index.js';
import type { StateExtended } from '../../interpreters/index.js';
import { type GuardDefUnion } from '@bemedev/boolean-recursive';
import { type types } from '@bemedev/types';
import type { PredicateMap, PredicateS2 } from '../types';
export type _ToPredicateF = <E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject>(events: E, promisees: P, guard: GuardConfig, predicates?: PredicateMap<E, P, Pc, Tc>) => {
    func?: GuardDefUnion<[StateExtended<Pc, Tc, ToEvents<E, P>>]> | undefined;
    errors: string[];
};
export type ToPredicate_F = <E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject>(events: E, promisees: P, guard: GuardConfig, predicates?: PredicateMap<E, P, Pc, Tc>) => {
    predicate?: PredicateS2<E, P, Pc, Tc> | undefined;
    errors: string[];
};
/**
 *
 * @param events of type {@linkcode EventsMap} [E], the events map to use for resolving the predicate.
 * @param promisees of type {@linkcode PromiseeMap} [P], the promisees map to use for resolving the predicate.
 * @param guard of type {@linkcode GuardConfig}, the guard configuration to convert to a predicate.
 * @param predicates of type {@linkcode PredicateMap}, the map of predicates containing functions to execute.
 * @returns an object containing the predicate function and any errors encountered during the conversion.
 *
 * @see {@linkcode ToEvents}
 * @see {@linkcode types.PrimitiveObject}
 * @see {@linkcode PredicateS2}
 * @see {@linkcode GuardDefUnion}
 * @see {@linkcode reduceFnMap}
 * @see {@linkcode isDescriber}
 * @see {@linkcode isString}
 * @see {@linkcode castings}
 * @see {@linkcode GUARD_TYPE}
 * @see {@linkcode recursive}
 */
export declare const toPredicate: ToPredicate_F;
//# sourceMappingURL=toPredicate.d.ts.map