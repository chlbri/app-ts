import tupleOf from '#bemedev/features/arrays/castings/tuple';
import type { ConfigNode } from '#machines';
import type { StateValue } from '../types';
import { isAtomic, isCompound } from './checks';

export type NodeToValue_F = (body: ConfigNode) => StateValue;

/**
 * Converts a state machine config into a StateValue.
 *
 * @param body - The state machine configuration to process.
 * @returns A value representation of the state machine, which can be a string,
 *         an object, or an empty object if the state is atomic.
 *
 * @see {@linkcode NodeToValue_F} for more details
 * @see {@linkcode isAtomic} for checking atomic states
 * @see {@linkcode isCompound} for checking compound states
 */
export const nodeToValue: NodeToValue_F = body => {
  const entries = Object.entries(body.states);

  const check2 = isCompound(body);

  if (check2) {
    // const length = entries.length;
    const __id = body.initial;
    const initial = body.states[__id];

    const check4 = !!initial && isAtomic(initial);

    if (check4) return __id;
    const keys = Object.keys(body.states);
    const check6 = keys.length === 1;
    if (check6) {
      const key = keys[0];
      const value = body.states[key];
      const check7 = isAtomic(value);
      if (check7) return key;
    }
  }

  const entries2 = entries.map(([key, body]) => {
    const __id = body.initial;
    if (__id) {
      const initial = body.states[__id];
      if (initial) {
        const check3 = isAtomic(initial);
        if (check3) return tupleOf(key, __id);
        return tupleOf(key, { [__id]: nodeToValue(initial) });
      }
    }
    return tupleOf(key, nodeToValue(body as any));
  });

  const out = entries2.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as any);

  return out;
};
