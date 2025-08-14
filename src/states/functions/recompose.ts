import { DEFAULT_DELIMITER } from '#constants';
import { merge } from '#utils';
import type { NodeConfig } from '../types';

type Url_F = <T>(shape: string, value: T) => any;

/**
 * Recompose an object URL based on the provided shape and value.
 *
 * @param shape - The shape of the URL to recompose.
 * @param value - The value to recompose into the URL.
 * @returns A recomposed object URL.
 *
 * @see {@linkcode Url_F} for type details.
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used in the URL.
 */
const recomposeObjectUrl: Url_F = (shape, value) => {
  const obj: any = {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { states, ...rest } = value as any;

  if (shape === DEFAULT_DELIMITER) {
    return rest;
  }

  const keys = shape.split(DEFAULT_DELIMITER).filter(str => str !== '');

  obj.states = {};
  if (keys.length === 1) {
    const key = keys.shift()!;
    obj.states[key] = value;
  } else {
    const key = keys.shift()!;
    const _value = recomposeObjectUrl(keys.join(DEFAULT_DELIMITER), value);

    obj.states[key] = _value;
  }
  return obj;
};

export type RecomposeConfig_F = <T extends NodeConfig>(
  shape: T,
) => NodeConfig;

/**
 * Recompose a configuration object into a nested structure based on the provided shape.
 *
 * @param shape - The shape of the configuration to recompose.
 * @returns A recomposed configuration object.
 *
 * @see {@linkcode RecomposeConfig_F} for type details.
 * @see {@linkcode recomposeObjectUrl} for the implementation of the recomposition logic.
 * @see {@linkcode merge} for merging objects.
 */
export const recomposeConfig: RecomposeConfig_F = shape => {
  const entries = Object.entries(shape);
  const arr: any[] = [];
  entries.forEach(([key, value]) => {
    arr.push(recomposeObjectUrl(key, value));
  });

  const output = merge(...(arr as [any, ...any[]]));
  return output as any;
};
