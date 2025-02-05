import { t } from '@bemedev/types';
import { isAtomic, isCompound } from '~states';
import type { NodeToValue_F } from './nodeToValue.types';

export const nodeToValue: NodeToValue_F = body => {
  const check1 = isAtomic(body);
  if (check1) return {};

  const entries = Object.entries(body.states);

  const check2 = isCompound(body);

  if (check2) {
    const length = entries.length;
    const __id = body.initial;
    const initial = body.states[__id];

    const check3 = length === 1;
    const check4 = !!initial && isAtomic(initial);
    const check5 = check3 && check4;

    if (check5) return __id;
  }

  const entries2 = entries.map(([key, value]) => {
    const check1 = isAtomic(value);
    if (check1) {
      return t.tuple(key, {});
    }
    return t.tuple(key, nodeToValue(value));
  });

  const out = entries2.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as any);

  return out;
};
