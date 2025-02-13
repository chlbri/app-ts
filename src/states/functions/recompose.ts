import { deepmerge } from 'deepmerge-ts';
import { DEFAULT_DELIMITER } from '~constants';
import type { NodeConfig, NodeConfigCompoundWithInitials } from '../types';

type Url_F = <T>(shape: string, value: T) => any;

export const recomposeObjectUrl: Url_F = (shape, value) => {
  const obj: any = {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { states, ...rest } = value as any;

  if (shape === DEFAULT_DELIMITER) {
    return rest;
  }

  const keys = shape.split(DEFAULT_DELIMITER).filter(str => str !== '');

  if (keys.length <= 1) {
    const key = keys.shift()!;
    obj.states = {};
    obj.states[key] = value;
  } else {
    const key = keys.shift()!;
    const _value = recomposeObjectUrl(keys.join(DEFAULT_DELIMITER), value);

    obj.states = {};

    obj.states[key] = _value;
  }
  return obj;
};

export type RecomposeNode_F = <
  T extends NodeConfig | NodeConfigCompoundWithInitials,
>(
  shape: T,
) => NodeConfigCompoundWithInitials;

export const recomposeNode: RecomposeNode_F = shape => {
  const entries = Object.entries(shape);
  const arr: any[] = [];
  entries.forEach(([key, value]) => {
    arr.push(recomposeObjectUrl(key, value));
  });

  const output = deepmerge(...arr);
  return output as any;
};
