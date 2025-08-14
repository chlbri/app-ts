import { DEFAULT_DELIMITER } from '#constants';
import { replaceAll } from '#utils';
import { decomposeSV, type StateValue } from '@bemedev/decompose';
import { isString } from '~types';

import type { NodeConfig } from '../types';
import { flatMap } from './flatMap';
import { getChildren } from './getChildren';
import { getParents } from './getParents';
import { recomposeConfig } from './recompose';

export type ValueToNode_F = <T extends StateValue>(
  body: NodeConfig,
  from: T,
  initial?: boolean,
) => NodeConfig;

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
  const keysFlatBody = Object.keys(flatBody);
  const fromIsString = isString(from);
  if (fromIsString) {
    const check2 = keysFlatBody.includes(from);
    if (check2) {
      const parents = getParents(from as any);
      const children = getChildren(from, ...keysFlatBody);

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

  flatFrom.forEach((key1, _, all) => {
    const check4 = keysFlatBody.some(key => key.startsWith(key1));

    if (check4) {
      out1[key1] = (flatBody as any)[key1];

      const initial = (flatBody as any)[key1].initial;
      if (initial) {
        const _initial = `${key1}${DEFAULT_DELIMITER}${initial}`;
        const cannotContinue = all.some(key =>
          key.startsWith(`${key1}${DEFAULT_DELIMITER}`),
        );
        if (cannotContinue) return;
        out1[_initial] = (flatBody as any)[_initial];
      }
    }
  });

  const out2 = recomposeConfig(out1);
  return out2;
};
