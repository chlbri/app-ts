import type { PrimitiveObject } from '#bemedev/globals/types';
import type { EventObject } from '#events';
import type { FnMap, FnR } from '~types';

/**
 * Delay type definition.
 * The function takes in a context object and returns a delay in milliseconds.
 * @template : type {@linkcode EventObject} [E], the events map.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc], the type of the context.
 * @returns : A number or a {@linkcode FnMap} function that returns a number.
 */
export type DelayFunction<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = number | FnMap<E, Pc, Tc, T, number>;

export type DelayFunction2<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = number | FnR<E, Pc, Tc, T, number>;

/**
 * Delay configuration map.
 * Maps a string key to a {@linkcode DelayFunction} function.
 * @template : type {@linkcode EventObject} [E] - The events map.
 * @template : [Pc] - The type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc] - The type of the context.
 * @returns : A partial record where each key is a string and each value is a {@linkcode DelayFunction}.
 */
export type DelayMap<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Partial<Record<string, DelayFunction<E, Pc, Tc, T>>>;
