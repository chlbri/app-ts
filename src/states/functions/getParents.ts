import { DEFAULT_DELIMITER } from '~constants';
import { isStringEmpty } from '~utils';

export type GetParents_F = (value: string) => string[];

export const getParents:GetParents_F = value => {
  const last = value.lastIndexOf(DEFAULT_DELIMITER);
  if (last === -1) return [];
  const out = ['/', value];
  const str2 = value.substring(0, last);
  if (isStringEmpty(str2)) {
    return out;
  }

  out.push(...getParents(str2));
  return out;
};
