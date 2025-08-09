import type { StateValue } from '../types';
export type NextStateValue_F = <T extends StateValue>(from: T, target?: string | undefined) => StateValue;
/**
 * Returns the next state value based on the current state value and a target string.
 *
 * @param from - The current state value, which can be a string or an object.
 * @param target - The target string to transition to. If not provided, the function returns the current state value.
 * @returns The next state value based on the provided conditions.
 *
 * @see {@linkcode NextStateValue_F} for more type details of this function.
 * @see {@linkcode isStringEmpty} for checking if a string is empty
 * @see {@linkcode isDefined} for checking if a value is defined
 * @see {@linkcode isString} for checking if a value is a string
 * @see {@linkcode decompose} for decomposing objects into key-value pairs
 * @see {@linkcode recompose} for recomposing key-value pairs into an object
 * @see {@linkcode recomposeSV} for recomposing state values
 * @see {@linkcode replaceAll} for replacing all occurrences of a substring in a string
 * @see {@linkcode deleteFirst} for deleting the first occurrence of a substring in a string
 * @see {@linkcode decomposeKeys} for getting the keys of an object after decomposition
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used in state paths
 */
export declare const nextSV: NextStateValue_F;
//# sourceMappingURL=nextSV.d.ts.map