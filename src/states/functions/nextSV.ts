import { isDefined } from '@bemedev/basifun';
import { decompose, decomposeKeys, recompose } from '@bemedev/decompose';
import { t } from '@bemedev/types';
import { DEFAULT_DELIMITER } from '~constants';
import { isString } from '~types';
import {
  deleteFirst,
  isStringEmpty,
  recomposeSV,
  replaceAll,
} from '~utils';
import type { StateValue } from '../types';

export type NextStateValue_F = <T extends StateValue>(
  from: T,
  target?: string | undefined,
) => StateValue;

export const nextSV: NextStateValue_F = (from, target) => {
  const check0 = isStringEmpty(from);
  if (check0) return {};

  const checkT = isDefined(target);
  if (!checkT) return from;

  const check1 = isStringEmpty(target);
  if (check1) return from;

  const check2 = isString(from);

  if (check2) {
    const check31 = target.includes(`${from}/`);

    if (check31) {
      const out = recomposeSV(target);
      return out;
    }
    return target;
  }

  const keys = Object.keys(from);

  const check4 = keys.length === 0;
  if (check4) {
    return from;
  }

  const decomposed = t.any(decompose(from));

  const last = target.lastIndexOf(DEFAULT_DELIMITER);
  if (last === -1) return from;

  const entry = target.substring(0, last);

  const _target2 = replaceAll({
    entry,
    match: DEFAULT_DELIMITER,
    replacement: '.',
  });

  const target2 = deleteFirst(_target2, '.');
  const keysD = decomposeKeys(from);
  const check5 = keysD.includes(target2 as any);

  if (check5) {
    decomposed[target2] = target.substring(last + 1);
  } else return target;

  const out: any = recompose(decomposed);
  return out;
};
