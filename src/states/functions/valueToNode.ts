import { decomposeSV, type StateValue } from '@bemedev/decompose';
import { DEFAULT_DELIMITER } from '~constants';
import { isString } from '~types';
import { replaceAll } from '~utils';

import type { NodeConfig, NodeConfigWithInitials } from '../types';
import { flatMap } from './flatMap';
import { getChildren } from './getChildren';
import { getParents } from './getParents';
import { recomposeConfig } from './recompose';

export type ValueToNode_F = <T extends StateValue>(
  body: NodeConfigWithInitials,
  from: T,
  initial?: boolean,
) => NodeConfigWithInitials;

/**
 * Converts a state value to a node configuration based on the provided body and from value.
 *
 * @param body - The node configuration body to convert from.
 * @param from - The state value to convert to a node configuration.
 * @param initial - Optional flag to indicate if the initial state should be included.
 * @returns A node configuration object that represents the state value.
 *
 * @see {@linkcode ValueToNode_F} for more details
 * @see {@linkcode flatMap} for flattening the node configuration
 * @see {@linkcode getChildren} for retrieving child states
 * @see {@linkcode getParents} for retrieving parent states
 * @see {@linkcode recomposeConfig} for recomposing the node configuration
 * @see {@linkcode decomposeSV} for decomposing state values
 * @see {@linkcode replaceAll} for replacing substrings in the state value
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used in state paths
 */
export const valueToNode: ValueToNode_F = (body, from) => {
  const flatBody = flatMap(body as NodeConfig, false);
  const keysB = Object.keys(flatBody);
  const check1 = isString(from);
  if (check1) {
    const check2 = keysB.includes(from);
    if (check2) {
      const parents = getParents(from as any);
      const children = getChildren(from, ...keysB);

      const out1: any = {};

      parents.concat(children).forEach(key => {
        out1[key] = (flatBody as any)[key];
      });

      const out: any = recomposeConfig(out1);
      return out;
    }
    return {};
  }

  const flatFrom = decomposeSV(from)
    .map(key =>
      replaceAll({
        entry: key,
        match: '.',
        replacement: DEFAULT_DELIMITER,
      }),
    )
    .map(key => `/${key}`);

  const out1: any = {};

  flatFrom.forEach(key1 => {
    const check4 = keysB.includes(key1);

    if (check4) {
      const children = getChildren(key1, ...keysB).filter(key =>
        flatFrom.includes(key),
      );

      out1[key1] = (flatBody as any)[key1];
      children.forEach(key2 => {
        out1[key2] = (flatBody as any)[key2];
      });
    }
  });

  const out2 = recomposeConfig(out1);
  return out2;
};
