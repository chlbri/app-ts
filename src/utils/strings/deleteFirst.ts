import { DEFAULT_DELIMITER } from '#constants';
import type { types } from '@bemedev/types';

export type DeleteFirst_F = types.Fn<
  [arg: string, toDelete?: string],
  string
>;

/**
 * Deletes the first occurrence of a specified delimiter from the start of a string.
 * @param arg  The string from which to delete the first occurrence of the specified delimiter.
 * @param toDelete The delimiter to remove from the start of the string. Defaults to {@linkcode DEFAULT_DELIMITER}.
 * @returns The modified string with the first occurrence of the specified value removed, or the original string if the delimiter is not found at the start.
 *
 * @see {@linkcode DeleteFirst_F} for the type definition
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used if none is specified
 */
export const deleteFirst: DeleteFirst_F = (
  arg,
  toDelete = DEFAULT_DELIMITER,
) => {
  const check = arg.startsWith(toDelete);
  return check ? arg.substring(1) : arg;
};
