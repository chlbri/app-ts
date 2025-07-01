export type ToFunction_F = <T = any>(value: T) => () => T;

/**
 * Converts a value into a function that returns that value.
 * @param value of type {@linkcode T}, to convert into a function.
 * @returns A function that, when called, returns the original value.
 *
 * @see {@linkcode ToFunction_F} for the type definition
 */
export const toFunction: ToFunction_F = value => () => value;
