import { DEFAULT_DELIMITER } from '~constants';
import type { FlatMapN, NodeConfig } from '../types';

export type FlatMap_F<T extends NodeConfig = NodeConfig> = <
  const SN extends T,
  Wc extends boolean = true,
>(
  config: SN,
  withChildren?: Wc,
  delimiter?: string,
  path?: string,
) => FlatMapN<SN, Wc>;

export const flatMap: FlatMap_F = (
  node,
  withChildren,
  delimiter = DEFAULT_DELIMITER,
  path = '',
) => {
  const { states, ...rest } = node;

  const check = withChildren === undefined || withChildren === true;

  let out: any = {};
  out[path === '' ? DEFAULT_DELIMITER : path] = check ? node : rest;

  if (states) {
    for (const key in states) {
      if (Object.prototype.hasOwnProperty.call(states, key)) {
        const element = states[key];
        const inner = flatMap(
          element,
          withChildren,
          delimiter,
          `${path}${DEFAULT_DELIMITER}${key}`,
        );
        out = { ...out, ...inner };
      }
    }
  }

  return out;
};
