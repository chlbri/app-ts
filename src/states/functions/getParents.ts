import { DEFAULT_DELIMITER } from '~constants';
import { isStringEmpty } from '~utils';

type _GetParents_F = (value: string) => string[];
type GetParents_F = (value: `/${string}`) => string[];

const _getParents: _GetParents_F = value => {
  const last = value.lastIndexOf(DEFAULT_DELIMITER);
  const out = new Set('/');
  out.add(value);
  const str2 = value.substring(0, last);
  if (isStringEmpty(str2)) {
    return Array.from(out);
  }

  const inner = _getParents(str2);
  inner.forEach(v => out.add(v));

  return Array.from(out);
};

/**
 * Returns an array of parent paths for the given path.
 * @param value - The path to get parents for.
 * @returns An array of parent paths.
 *
 * @see {@linkcode GetParents_F} for type details.
 * @see {@linkcode _getParents} for the implementation.
 */
export const getParents: GetParents_F = _getParents;
