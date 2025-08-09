import type { EventsMap, PromiseeMap } from '../../../events/index.js';
import type { DefinedValue } from '../../index.js';
import type { FnR } from '../../../types/index.js';
import type { types } from '@bemedev/types';
export type IsDefinedS_F = <E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc extends types.PrimitiveObject = types.PrimitiveObject, Tc extends types.PrimitiveObject = types.PrimitiveObject>(path: DefinedValue<Pc, Tc>) => FnR<E, P, Pc, Tc, boolean>;
/**
 * Checks if the given path is defined (not undefined or null).
 * @param path : A {@linkcode DefinedValue}, the path to retrieve.
 * @returns A {@linkcode FnR} function that returns true if the path is defined, false otherwise.
 *
 * @see {@linkcode isNotValue} for more details.
 * @see {@linkcode EventsMap}
 * @see {@linkcode PromiseeMap}
 * @see {@linkcode types.PrimitiveObject}
 *
 */
export declare const isDefinedS: IsDefinedS_F;
/**
 * Checks if the given path is undefined or null.
 * @param path : A {@linkcode DefinedValue} , the path to retrieve.
 * @returns A {@linkcode FnR} function that returns true if the path is undefined or null, false otherwise.
 *
 * @see {@linkcode isValue} for more details.
 * @see {@linkcode EventsMap}
 * @see {@linkcode PromiseeMap}
 * @see {@linkcode types.PrimitiveObject}
 */
export declare const isNotDefinedS: IsDefinedS_F;
//# sourceMappingURL=isDefined.d.ts.map