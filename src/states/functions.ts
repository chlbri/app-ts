import { isDefined } from '@bemedev/basifun';
import { decompose, decomposeKeys, recompose } from '@bemedev/decompose';
import { isString } from 'src/types/primitives';

import { DEFAULT_DELIMITER } from '~constants';

import {
  deleteFirst,
  isStringEmpty,
  recomposeSV,
  replaceAll,
} from '~utils';
import type {
  GetStateType_F,
  NextStateValue_F,
  StateNodeConfigAtomic,
  StateNodeConfigCompound,
  StateNodeConfigParallel,
} from './types';

export const getStateType: GetStateType_F = config => {
  const type = config.type;
  if (type) return type;
  const states = (config as any).states;
  if (states) {
    const len = Object.keys(states).length;
    if (len > 0) {
      return 'compound';
    }
  }

  return 'atomic';
};

export function isParallel(arg: unknown): arg is StateNodeConfigParallel {
  return (arg as any).type === 'parallel';
}

export function isCompound(arg: any): arg is StateNodeConfigCompound {
  const out = getStateType(arg) === 'compound';
  return out;
}

export function isAtomic(arg: any): arg is StateNodeConfigAtomic {
  const out = getStateType(arg) === 'atomic';
  return out;
}

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

  const decomposed = decompose(from);

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
