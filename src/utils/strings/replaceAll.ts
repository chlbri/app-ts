import { escapeRegExp } from './escapeRegExp';

export type ReplaceAll_F = (params: {
  entry: string;
  match: string;
  replacement: string;
}) => string;

/**
 * Replaces all occurrences of a specified substring in a string with a replacement string.
 * @param params Object containing the string to modify, the substring to match, and the replacement string.
 * @returns The modified string with all occurrences replaced.
 *
 * @see {@linkcode ReplaceAll_F} for the type definition
 */
export const replaceAll: ReplaceAll_F = ({
  entry,
  match,
  replacement,
}) => {
  const regex = escapeRegExp(match);

  return entry.replace(new RegExp(regex, 'g'), () => replacement);
};
