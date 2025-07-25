import { isString } from '~types';

/**
 * Checks if a given argument is a string and if it is empty (i.e., contains only whitespace).
 * @param arg The value to check.
 * @returns `true` if the argument is a string and is empty, otherwise `false`.
 *
 * @see {@linkcode isString} for checking if the argument is a string
 */
export const isStringEmpty = (arg: unknown) => {
  return isString(arg) && arg.trim() === '';
};
