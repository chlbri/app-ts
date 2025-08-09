import type { EventsMap, PromiseeMap } from '../../events/index.js';
import type { SimpleMachineOptions } from '../../machine/index.js';
import type { PromiseeConfig } from '../index.js';
import type { types } from '@bemedev/types';
import type { Promisee } from '../types';
type ToPromise_F = <E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Pc extends types.PrimitiveObject = types.PrimitiveObject, TC extends types.PrimitiveObject = types.PrimitiveObject>(events: E, promisees: P, src: PromiseeConfig, promises?: types.NOmit<SimpleMachineOptions<E, P, Pc, TC>, 'initials'>) => Promisee<E, P, Pc, TC>;
/**
 * Converts a promise config to a promisee object with a source and transitions.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map.
 * @param promise of type {@linkcode PromiseeConfig}, the promise configuration to convert.
 * @param options of type {@linkcode SimpleMachineOptions}, the machine options.
 * @returns a promisee object with a source and transitions.
 *
 * @see {@linkcode toPromiseSrc} for converting the source.
 * @see {@linkcode toTransition} for converting transitions.
 * @see {@linkcode toArray.typed} for the type of the context.
 * @see {@linkcode ToPromise_F} formore details
 */
export declare const toPromise: ToPromise_F;
export {};
//# sourceMappingURL=toPromise.d.ts.map