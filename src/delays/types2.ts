import type { PrimitiveObject } from '#bemedev/globals/types';
import type { ActorsConfigMap, EventsMap } from '#events';
import type { FnMap } from 'src/types/primitives2';

/**
 * Delay type definition.
 * The function takes in a context object and returns a delay in milliseconds.
 * @template : type {@linkcode EventsMap} [E], the events map.
 * @template : type {@linkcode ActorsConfigMap} [A], the actors config map.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc], the type of the context.
 * @returns : A number or a {@linkcode FnMap} function that returns a number.
 */
export type Delay<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = number | FnMap<E, A, Pc, Tc, number>;

/**
 * Delay configuration map.
 * Maps a string key to a {@linkcode Delay} function.
 * @template : type {@linkcode EventsMap} [E] - The events map.
 * @template : type {@linkcode ActorsConfigMap} [A] - The actors config map.
 * @template : [Pc] - The type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc] - The type of the context.
 * @returns : A partial record where each key is a string and each value is a {@linkcode Delay}.
 */
export type DelayMap<
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<Record<string, Delay<E, A, Pc, Tc>>>;
