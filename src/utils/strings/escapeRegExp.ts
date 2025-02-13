import { ESCAPE_REGEXP } from '~constants';

export type EscapeRexExp_F = (arg: string) => string;

export const escapeRegExp: EscapeRexExp_F = arg => {
  const replacer = '\\$&';
  return arg.replace(ESCAPE_REGEXP, replacer);
};
