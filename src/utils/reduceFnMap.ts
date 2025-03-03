import { t } from '@bemedev/types';
import type { EventsMap, ToEvents } from '~events';
import {
  isFunction,
  type FnMap,
  type FnMapReduced,
  type PrimitiveObject,
} from '~types';
import { nothing } from './nothing';

export type ReduceFnMap_F = <
  const E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  events: E,
  fn: FnMap<E, Pc, Tc, R>,
) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => R;

export const reduceFnMap: ReduceFnMap_F = (events, fn) => {
  const check1 = isFunction(fn);
  if (check1) return fn;

  const keys = Object.keys(events);

  return (pContext, context, event) => {
    const check5 = typeof event === 'string';
    const _else = fn.else ?? nothing;
    if (check5) return t.any(_else(pContext, context, event));

    const { payload, type } = event;

    for (const key of keys) {
      const check2 = type === key;
      const func = fn[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4) return func(pContext, context, payload);
    }

    return t.any(_else(pContext, context, event));
  };
};

export type ReduceFnMap2_F = <
  const E extends EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  events: E,
  fn: FnMapReduced<E, Tc, R>,
) => (context: Tc, eventsMap: ToEvents<E>) => R;

export const reduceFnMap2: ReduceFnMap2_F = (events, fn) => {
  const check1 = isFunction(fn);
  if (check1) return t.any(fn);

  const keys = Object.keys(events);

  return (context, event) => {
    const check5 = typeof event === 'string';
    const _else = fn.else ?? nothing;
    if (check5) return t.any(_else(context, event));

    const { payload, type } = event;

    for (const key of keys) {
      const check2 = type === key;
      const func = fn[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4) return func(context, payload);
    }

    return t.any(_else(context, event));
  };
};
