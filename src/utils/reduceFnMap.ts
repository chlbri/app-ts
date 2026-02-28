import _any from '#bemedev/features/common/castings/any';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventsMap,
  PromiseeMap,
  ToEventsR2,
} from '#events';
import {
  isFunction,
  type FnMap,
  type FnMapR,
  type FnR,
  type FnReduced,
} from 'src/types/primitives';
import { nothing } from './nothing';
import type { Config } from 'src/machine/types';

type ToEventMap_F = <
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
>(
  events: E,
  actors: A,
) => ToEventsR2<E, A>;

export const toEventsMap: ToEventMap_F = (events, _actors) => {
  const promisees = Object.entries(_actors.promisees || {}).reduce(
    (acc, [key, value]) => {
      acc[`${key}::then`] = value.then;
      acc[`${key}::catch`] = value.catch;
      return acc;
    },
    {} as any,
  );

  const emitters = Object.entries(_actors.emitters || {}).reduce(
    (acc, [key, value]) => {
      acc[`${key}::next`] = value.next;
      acc[`${key}::error`] = value.error;
      return acc;
    },
    {} as any,
  );

  const children = Object.entries(_actors.children || {}).reduce(
    (acc, [key, value]) => {
      Object.entries(value).forEach(([childKey, childValue]) => {
        acc[`${key}::on::${childKey}`] = childValue;
      });
      return acc;
    },
    {} as any,
  );

  return { ...events, ...promisees, ...emitters, ...children };
};

export type ReduceFnMap_F = <
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  events: E,
  actorsMap: A,
  fn: FnMap<C, E, A, Pc, Tc, R>,
) => FnR<C, E, A, Pc, Tc, R>;

/**
 * Reduces a function map to a single function that processes events.
 * @param events the events map.
 * @param actorsMap the promisees map.
 * @param fn the function map to reduce.
 * @returns a function that takes a context and an event, returning the result of the function map.
 *
 * @see {@linkcode ReduceFnMap_F} for the type definition.
 * @see {@linkcode toEventsMap} for converting events and promisees to a map.
 * @see {@linkcode isFunction} for checking if a value is a function.
 * @see {@linkcode nothing} for the default else function.
 */
export const reduceFnMap: ReduceFnMap_F = (events, actors, fn) => {
  const check1 = isFunction(fn);
  if (check1) return fn;

  const map = toEventsMap(events, actors);
  const keys = Object.keys(map);

  return ({ event, ...rest }) => {
    const check5 = typeof event === 'string';
    const _else = fn.else ?? nothing;
    if (check5) return _any(_else({ ...rest, event }));

    const { payload, type } = event;

    for (const key of keys) {
      const check2 = type === key;
      const func = _any(fn)[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4) return func({ ...rest, payload });
    }

    return _any(_else({ ...rest, event }));
  };
};

export type ReduceFnMap2_F = <
  C extends Config,
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  events: E,
  promisees: P,
  fn: FnMapR<C, E, P, Tc, R>,
) => FnReduced<C, E, P, Tc, R>;

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
  if (check1) return _any(fn);

  const map = toEventsMap(events, promisees);
  const keys = Object.keys(map);

  return ({ event, ...rest }) => {
    const check5 = typeof event === 'string';
    const _else = fn.else ?? nothing;
    if (check5) {
      return _any(_else({ ...rest, event }));
    }

    const { payload, type } = event;

    for (const key of keys) {
      const check2 = type === key;
      const func = _any(fn)[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4) return func({ ...rest, payload });
    }

    return _any(_else({ ...rest, event }));
  };
};
