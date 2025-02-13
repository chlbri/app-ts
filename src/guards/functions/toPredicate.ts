import { isDefined } from '@bemedev/basifun';
import recursive, { type GuardDefUnion } from '@bemedev/boolean-recursive';
import { DEFAULT_NOTHING, GUARD_TYPE } from '~constants';
import type { EventsMap, ToEvents } from '~events';
import type { GuardConfig } from '~guards';
import { isDescriber, isString, type PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';
import type { PredicateMap, PredicateS2 } from '../types';

export const returnTrue = () => {
  console.log(`${DEFAULT_NOTHING} call true`);
  return true;
};

export const returnFalse = () => {
  console.log(`${DEFAULT_NOTHING} call false`);
  return false;
};

export type _ToPredicateF = <
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  guard?: GuardConfig,
  predicates?: PredicateMap<E, Pc, Tc>,
) => GuardDefUnion<[Pc, Tc, ToEvents<E>]> | undefined;

export type ToPredicate_F = <
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  guard?: GuardConfig,
  predicates?: PredicateMap<E, Pc, Tc>,
) => PredicateS2<E, Pc, Tc> | undefined;

const _toPredicate: _ToPredicateF = (events, guard, predicates) => {
  if (!guard) return undefined;

  if (isDescriber(guard)) {
    const fn = predicates?.[guard.name];
    const func = fn ? reduceFnMap(events, fn) : undefined;
    return func;
  }

  if (isString(guard)) {
    const fn = predicates?.[guard];
    const func = fn ? reduceFnMap(events, fn) : undefined;
    return func;
  }

  const makeArray = (guards: GuardConfig[]) => {
    return guards
      .map(guard => _toPredicate(events, guard, predicates))
      .filter(isDefined);
  };

  if (GUARD_TYPE.and in guard) {
    const and = makeArray(guard.and);
    return { and };
  }

  const or = makeArray(guard.or);
  return { or };
};

export const toPredicate: ToPredicate_F = (events, guard, predicates) => {
  const out1 = _toPredicate(events, guard, predicates);
  if (!out1) return;

  return recursive(out1);
};
