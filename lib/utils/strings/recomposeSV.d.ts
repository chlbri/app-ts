import type { StateValue } from '../../states/index.js';
import type { types } from '@bemedev/types';
export type RecomposeSV_F = types.Fn<[
    arg: string,
    delimiter?: string
], StateValue>;
/**
 * Recombines a string into a state value object.
 * The string is expected to be delimited by the default delimiter.
 * The first part of the string becomes the key, and the rest becomes the value.
 * If the string starts with the delimiter, it is removed before processing.
 * @param arg The string to recompose.
 * @param delimiter The delimiter used to split the string. Defaults to {@linkcode DEFAULT_DELIMITER}.
 * @returns An object with the first part as the key and the recomposed value as the value.
 *
 * @see {@linkcode RecomposeSV_F} for the type definition
 */
export declare const recomposeSV: RecomposeSV_F;
//# sourceMappingURL=recomposeSV.d.ts.map