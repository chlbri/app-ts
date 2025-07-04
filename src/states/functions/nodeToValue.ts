import { t } from '@bemedev/types';
import type { NodeConfigWithInitials, StateValue } from '../types';
import { isAtomic, isCompound } from './checks';

export type NodeToValue_F = (body: NodeConfigWithInitials) => StateValue;

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
    const keys = Object.keys(body.states);
    const check6 = keys.length === 1;
    if (check6) {
      const key = keys[0];
      const value = body.states[key];
      const check7 = isAtomic(value);
      if (check7) return key;
    }
  }

  const entries2 = entries.map(([key, value]) =>
    t.tuple(key, nodeToValue(value)),
  );

  const out = entries2.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as any);

  return out;
};
