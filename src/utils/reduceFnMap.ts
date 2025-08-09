import type { EventsMap, PromiseeMap, ToEventsR } from '#events';
import {
  isFunction,
  type FnMap,
  type FnMapR,
  type FnR,
  type FnReduced,
} from '#types';
import type { types } from '@bemedev/types';
import { castings } from '@bemedev/types';
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
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  R = any,
>(
  events: E,
  promisees: P,
  fn: FnMap<E, P, Pc, Tc, R>,
) => FnR<E, P, Pc, Tc, R>;

/**
 * Reduces a function map to a single function that processes events.
 * @param events the events map.
 * @param promisees the promisees map.
 * @param fn the function map to reduce.
 * @returns a function that takes a context and an event, returning the result of the function map.
 *
 * @see {@linkcode ReduceFnMap_F} for the type definition.
 * @see {@linkcode toEventsMap} for converting events and promisees to a map.
 * @see {@linkcode isFunction} for checking if a value is a function.
 * @see {@linkcode nothing} for the default else function.
 */
export const reduceFnMap: ReduceFnMap_F = (events, promisees, fn) => {
  const check1 = isFunction(fn);
  if (check1) return fn;

  const map = toEventsMap(events, promisees);
  const keys = Object.keys(map);

  return ({ event, context, pContext, status, value, tags }) => {
    const check5 = typeof event === 'string';
    const _else = fn.else ?? nothing;
    if (check5)
      return castings.commons.any(
        _else({ event, context, pContext, status, value, tags }),
      );

    const { payload, type } = event;

    for (const key of keys) {
      const check2 = type === key;
      const func = castings.commons.any(fn)[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4)
        return func({ payload, context, pContext, status, value, tags });
    }

    return castings.commons.any(
      _else({ event, context, pContext, status, value, tags }),
    );
  };
};

export type ReduceFnMap2_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  R = any,
>(
  events: E,
  promisees: P,
  fn: FnMapR<E, P, Tc, R>,
) => FnReduced<E, P, Tc, R>;

/**
 * Reduces a function map to a single function that processes events with a context.
 * @param events the events map.
 * @param promisees the promisees map.
 * @param fn the function map to reduce.
 * @returns a function that takes a context and an event, returning the result of the function map.
 *
 * @see {@linkcode ReduceFnMap2_F} for the type definition.
 * @see {@linkcode toEventsMap} for converting events and promisees to a map.
 * @see {@linkcode isFunction} for checking if a value is a function.
 * @see {@linkcode nothing} for the default else function.
 *
 * @remarks
 * This version is specifically designed to work with a context and an events map,
 *
 * Similar to {@linkcode reduceFnMap}, but it does not take a private context.
 */
export const reduceFnMapReduced: ReduceFnMap2_F = (
  events,
  promisees,
  fn,
) => {
  const check1 = isFunction(fn);
  if (check1) return castings.commons.any(fn);

  const map = toEventsMap(events, promisees);
  const keys = Object.keys(map);

  return ({ context, event, status, value, tags }) => {
    const check5 = typeof event === 'string';
    const _else = fn.else ?? nothing;
    if (check5)
      return castings.commons.any(
        _else({ context, event, status, value, tags }),
      );

    const { payload, type } = event;

    for (const key of keys) {
      const check2 = type === key;
      const func = castings.commons.any(fn)[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4) return func({ context, payload, status, value, tags });
    }

    return castings.commons.any(
      _else({ context, event, status, value, tags }),
    );
  };
};
