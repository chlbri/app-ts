import { ESCAPE_REGEXP } from '#constants';

export type EscapeRexExp_F = (arg: string) => string;

/**
 * Escapes special characters in a string to be used in a regular expression.
 * @param arg The string to escape.
 * @returns The escaped string, where special characters are prefixed with a `'\\$&'`.
 *
 * @see {@linkcode EscapeRexExp_F} for the type definition
 * @see {@linkcode ESCAPE_REGEXP} for the regular expression used to identify special characters.
 */
export const escapeRegExp: EscapeRexExp_F = arg => {
  const replacer = '\\$&';
  return arg.replace(ESCAPE_REGEXP, replacer);
};
