import { isDefined } from '@bemedev/basifun';
import recursive, { type GuardDefUnion } from '@bemedev/boolean-recursive';
import { GUARD_TYPE } from '~constants';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import type { GuardConfig } from '~guards';
import { isDescriber, isString, type PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';
import type { PredicateMap, PredicateS2 } from '../types';

export type _ToPredicateF = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: P,
  guard: GuardConfig,
  predicates?: PredicateMap<E, P, Pc, Tc>,
) => {
  func?: GuardDefUnion<[Pc, Tc, ToEvents<E, P>]>;
  errors: string[];
};

export type ToPredicate_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: P,
  guard: GuardConfig,
  predicates?: PredicateMap<E, P, Pc, Tc>,
) => {
  predicate?: PredicateS2<E, P, Pc, Tc> | undefined;
  errors: string[];
};

const _toPredicate: _ToPredicateF = (
  events,
  promisees,
  guard,
  predicates,
) => {
  const errors: string[] = [];

  if (isDescriber(guard)) {
    const fn = predicates?.[guard.name];
    const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
    if (!func) errors.push(`Predicate (${guard.name}) is not defined`);
    return { func, errors };
  }

  if (isString(guard)) {
    const fn = predicates?.[guard];
    const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
    if (!func) errors.push(`Predicate (${guard}) is not defined`);
    return { func, errors };
  }

  const makeArray = (guards: GuardConfig[]) => {
    return guards
      .map(guard => _toPredicate(events, promisees, guard, predicates))
      .filter(({ errors }) => {
        const check = errors.length > 0;
        if (check) {
          errors.push(...errors);
          return false;
        }
        return true;
      })
      .map(({ func }) => func)
      .filter(isDefined);
  };

  if (GUARD_TYPE.and in guard) {
    const and = makeArray(guard.and);
    return { func: { and }, errors };
  }

  const or = makeArray(guard.or);
  return { func: { or }, errors };
};

export const toPredicate: ToPredicate_F = (
  events,
  promisees,
  guard,
  predicates,
) => {
  const { func, errors } = _toPredicate(
    events,
    promisees,
    guard,
    predicates,
  );
  if (!func) return { errors };

  return { predicate: recursive(func), errors };
};
