import type { EventsMap, PromiseeMap } from '#events';
import type { types } from '@bemedev/types';
import type { FnMap } from '~types';

/**
 * Delay type definition.
 * The function takes in a context object and returns a delay in milliseconds.
 * @template : type {@linkcode EventsMap} [E], the events map.
 * @template : type {@linkcode PromiseeMap} [P], the promisees map.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc], the type of the context.
 * @returns : A number or a {@linkcode FnMap} function that returns a number.
 */
export type Delay<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = number | FnMap<E, P, Pc, Tc, number>;

/**
 * Delay configuration map.
 * Maps a string key to a {@linkcode Delay} function.
 * @template : type {@linkcode EventsMap} [E] - The events map.
 * @template : type {@linkcode PromiseeMap} [P] - The promisees map.
 * @template : [Pc] - The type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc] - The type of the context.
 * @returns : A partial record where each key is a string and each value is a {@linkcode Delay}.
 */
export type DelayMap<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Partial<Record<string, Delay<E, P, Pc, Tc>>>;
