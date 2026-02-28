import isDefined from '#bemedev/features/common/castings/is/defined';
import type { PrimitiveObject } from '#bemedev/globals/types';
import { GUARD_TYPE } from '#constants';
import type { ActorsConfigMap, EventsMap, ToEvents2 } from '#events';
import type { GuardConfig } from '#guards';
import { reduceFnMap } from '#utils';
import recursive, { type GuardDefUnion } from '@bemedev/boolean-recursive';
import { isDescriber, isString } from '~types';
import type { PredicateMap, PredicateS2 } from '../types2';
import type { StateExtended } from '#states';
import type { Config } from 'src/machine/types2';

export type _ToPredicateF = <
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  actorsMap: A,
  guard: GuardConfig,
  predicates?: PredicateMap<C, E, A, Pc, Tc>,
) => {
  func?:
    | GuardDefUnion<[StateExtended<C, Pc, Tc, ToEvents2<E, A>, A>]>
    | undefined;
  errors: string[];
};

export type ToPredicate_F = <
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  actorsMap: A,
  guard: GuardConfig,
  predicates?: PredicateMap<C, E, A, Pc, Tc>,
) => {
  predicate?: PredicateS2<C, E, A, Pc, Tc> | undefined;
  errors: string[];
};

const _toPredicate: _ToPredicateF = (
  events,
  actorsMap,
  guard,
  predicates,
) => {
  const errors: string[] = [];

  if (isDescriber(guard)) {
    const fn = predicates?.[guard.name];
    const func = fn ? reduceFnMap(events, actorsMap, fn) : undefined;
    if (!func) errors.push(`Predicate (${guard.name}) is not defined`);
    return { func, errors };
  }

  if (isString(guard)) {
    const fn = predicates?.[guard];
    const func = fn ? reduceFnMap(events, actorsMap, fn) : undefined;
    if (!func) errors.push(`Predicate (${guard}) is not defined`);
    return { func, errors };
  }

  const makeArray = (guards: GuardConfig[]) => {
    return guards
      .map(guard => _toPredicate(events, actorsMap, guard, predicates))
      .filter(({ errors: errors1 }) => {
        const check = errors1.length > 0;
        if (check) {
          errors.push(...errors1);

          // Because if it has error, the function is not defined
          return false;
        }
        return true;
      })
      .map(({ func }) => func)
      .filter(isDefined);
  };

  if (GUARD_TYPE.and in guard) {
    const and = makeArray(guard.and);
    const check = and.length < 1;
    if (check) return { errors };

    return { func: { and }, errors };
  }

  const or = makeArray(guard.or);
  const check = or.length < 1;
  if (check) return { errors };

  return { func: { or }, errors };
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
 * @see {@linkcode PrimitiveObject}
 * @see {@linkcode PredicateS2}
 * @see {@linkcode GuardDefUnion}
 * @see {@linkcode reduceFnMap}
 * @see {@linkcode isDescriber}
 * @see {@linkcode isString}
 * @see {@linkcode castings}
 * @see {@linkcode GUARD_TYPE}
 * @see {@linkcode recursive}
 */
export const toPredicate: ToPredicate_F = (
  events,
  actorsMap,
  guard,
  predicates,
) => {
  const { func, errors } = _toPredicate(
    events,
    actorsMap,
    guard,
    predicates,
  );

  if (!func) return { errors };

  return { predicate: recursive(func), errors };
};
