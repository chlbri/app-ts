import type { PrimitiveObject } from '#bemedev/globals/types';
import type { ActorsConfigMap, AllEvent, EventsMap } from '#events';
import type { Config } from 'src/machine/types';
import type { FnMap } from 'src/types/primitives';

/**
 * Delay type definition.
 * The function takes in a context object and returns a delay in milliseconds.
 * @template : type {@linkcode EventsMap} [E], the events map.
 * @template : type {@linkcode ActorsConfigMap} [A], the actors config map.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc], the type of the context.
 * @returns : A number or a {@linkcode FnMap} function that returns a number.
 */
export type DelayFunction<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = number | FnMap<E, Pc, Tc, T, number>;

/**
 * Delay configuration map.
 * Maps a string key to a {@linkcode DelayFunction} function.
 * @template : type {@linkcode Config} [C] - The configuration type.
 * @template : type {@linkcode EventsMap} [E] - The events map.
 * @template : type {@linkcode ActorsConfigMap} [A] - The actors config map.
 * @template : [Pc] - The type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc] - The type of the context.
 * @returns : A partial record where each key is a string and each value is a {@linkcode DelayFunction}.
 */
export type DelayMap<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Partial<Record<string, DelayFunction<E, Pc, Tc, T>>>;
