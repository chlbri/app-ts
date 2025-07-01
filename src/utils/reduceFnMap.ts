import { t } from '@bemedev/types';
import type { EventsMap, PromiseeMap, ToEvents, ToEventsR } from '~events';
import {
  isFunction,
  type FnMap,
  type FnMapReduced,
  type FnR,
  type PrimitiveObject,
} from '~types';
import { nothing } from './nothing';

type ToEventMap_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
>(
  events: E,
  promisees: P,
) => ToEventsR<E, P>;

export const toEventsMap: ToEventMap_F = (events, _promisees) => {
  const promisees = Object.entries(_promisees).reduce(
    (acc, [key, value]) => {
      acc[`${key}::then`] = value.then;
      acc[`${key}::catch`] = value.catch;
      return acc;
    },
    {} as any,
  );

  return { ...events, ...promisees };
};

export type ReduceFnMap_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc = any,
  R = any,
>(
  events: E,
  promisees: P,
  fn: FnMap<E, P, Pc, Tc, R>,
) => FnR<E, P, Pc, Tc, R>;

export const reduceFnMap: ReduceFnMap_F = (events, promisees, fn) => {
  const check1 = isFunction(fn);
  if (check1) return fn;

  const map = toEventsMap(events, promisees);
  const keys = Object.keys(map);

  return (pContext, context, event) => {
    const check5 = typeof event === 'string';
    const _else = fn.else ?? nothing;
    if (check5) return t.any(_else(pContext, context, event));

    const { payload, type } = event;

    for (const key of keys) {
      const check2 = type === key;
      const func = t.any(fn)[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4) return func(pContext, context, payload);
    }

    return t.any(_else(pContext, context, event));
  };
};

export type ReduceFnMap2_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  events: E,
  promisees: P,
  fn: FnMapReduced<E, P, Tc, R>,
) => (context: Tc, eventsMap: ToEvents<E, P>) => R;

export const reduceFnMap2: ReduceFnMap2_F = (events, promisees, fn) => {
  const check1 = isFunction(fn);
  if (check1) return t.any(fn);

  const map = toEventsMap(events, promisees);
  const keys = Object.keys(map);

  return (context, event) => {
    const check5 = typeof event === 'string';
    const _else = fn.else ?? nothing;
    if (check5) return t.any(_else(context, event));

    const { payload, type } = event;

    for (const key of keys) {
      const check2 = type === key;
      const func = t.any(fn)[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4) return func(context, payload);
    }

    return t.any(_else(context, event));
  };
};
