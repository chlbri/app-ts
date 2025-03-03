import { DEFAULT_DELIMITER } from '~constants';
import { isStringEmpty } from '~utils';

type _GetParents_F = (value: string) => string[];
export type GetParents_F = (value: `/${string}`) => string[];

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

export const getParents: GetParents_F = _getParents;
