import type { EventsMap, PromiseeMap, ToEventsR } from '../events/index.js';
import { type FnMap, type FnMapR, type FnR, type FnReduced } from '../types/index.js';
import type { types } from '@bemedev/types';
type ToEventMap_F = <E extends EventsMap, P extends PromiseeMap = PromiseeMap>(events: E, promisees: P) => ToEventsR<E, P>;
export declare const toEventsMap: ToEventMap_F;
export type ReduceFnMap_F = <E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc extends types.PrimitiveObject = types.PrimitiveObject, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any>(events: E, promisees: P, fn: FnMap<E, P, Pc, Tc, R>) => FnR<E, P, Pc, Tc, R>;
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
export declare const reduceFnMap: ReduceFnMap_F;
export type ReduceFnMap2_F = <E extends EventsMap, P extends PromiseeMap = PromiseeMap, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any>(events: E, promisees: P, fn: FnMapR<E, P, Tc, R>) => FnReduced<E, P, Tc, R>;
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
export declare const reduceFnMapReduced: ReduceFnMap2_F;
export {};
//# sourceMappingURL=reduceFnMap.d.ts.map