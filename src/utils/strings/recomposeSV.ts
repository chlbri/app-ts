import { isDefined } from '@bemedev/basifun';
import type { Fn } from '@bemedev/types';
import { DEFAULT_DELIMITER } from '~constants';
import type { StateValue } from '~states';
import { isStringEmpty } from './isStringEmpty';

export type RecomposeSV_F = Fn<[arg?: string], StateValue>;

export const recomposeSV: RecomposeSV_F = arg => {
  const check1 = !isDefined(arg) || isStringEmpty(arg);
  if (check1) return {};

  const arg1 = arg.startsWith(DEFAULT_DELIMITER) ? arg.substring(1) : arg;

  const splits = arg1.split(DEFAULT_DELIMITER);

  const check2 = splits.length === 1;
  if (check2) return arg;

  const first = splits.shift()!;

  const rest = splits.join(DEFAULT_DELIMITER);
  return { [first]: recomposeSV(rest) };
};
