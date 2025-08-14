import type { ActionResultFn } from '../../actions/index.js';
import type { EventsMap, PromiseeMap } from '../../events/index.js';
import { type FnMap } from '#types';
import type { Decompose } from '@bemedev/decompose';
import type { types } from '@bemedev/types';
export type ExpandFnMap = <Pc, Tc = types.PrimitiveObject, D = Decompose<{
    pContext: Pc;
    context: Tc;
}, {
    sep: '.';
    object: 'both';
    start: false;
}>, K extends Extract<keyof D, string> = Extract<keyof D, string>, R = D[K], E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap>(events: E, promisees: P, key: K, fn: FnMap<E, P, types.Cast<Pc, types.PrimitiveObject>, types.Cast<Tc, types.PrimitiveObject>, R>) => ActionResultFn<E, P, types.Cast<Pc, types.PrimitiveObject>, types.Cast<Tc, types.PrimitiveObject>>;
/**
 *
 * @param events : type {@linkcode EventsMap} [E] - The events map.
 * @param promisees  : type {@linkcode PromiseeMap} [P] - The promisees map.
 * @param key  : type {@linkcode Decompose} [D] - The key to assign the result to in the context and the private context.
 * @param fn  : type {@linkcode FnMap} [E, P, Pc, Tc, R] - The function to reduce the events and promisees and performs the action.
 * @returns a {@linkcode ActionResultFn} function.
 *
 * @see {@linkcode assignByKey} for assigning the result to the context and private context.
 * @see {@linkcode reduceFnMap} for reducing the events and promisees.
 * @see {@linkcode Decompose} for decomposing the private context and context into paths.
 *
 */
export declare const expandFnMap: ExpandFnMap;
//# sourceMappingURL=expandFnMap.d.ts.map