import { DEFAULT_DELIMITER } from '~constants';
import type { NodeConfig } from '../types';

export type FlatMap_F<T extends NodeConfig = NodeConfig> = <
  const SN extends T,
  const Wc extends boolean = true,
>(
  config: SN,
  withChildren?: Wc,
  delimiter?: string,
  path?: string,
) => any;

/**
 * Flattens a state node configuration into a map structure.
 *
 * @param node - The state node configuration to flatten.
 * @param withChildren - Whether to include child states in the output.
 * @param delimiter - The delimiter to use for paths in the output map. Defaults to {@linkcode DEFAULT_DELIMITER}.
 * @param path - The current path in the output map (used for recursion).
 * @returns A flat map of the state node configuration.
 *
 * @see {@linkcode FlatMap_F} for more details.
 */
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
        const inner = (flatMap as any)(
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
