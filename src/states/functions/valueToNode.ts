import { decomposeSV, type StateValue } from '@bemedev/decompose';
import { isString } from 'src/types/primitives';
import { DEFAULT_DELIMITER } from '~constants';
import { replaceAll } from '~utils';

import { flatMap } from './flatMap';
import { getChildren } from './getChildren';
import { getParents } from './getParents';
import { recomposeNode } from './recompose';
import type { NodeConfig, NodeConfigWithInitials } from '../types';

export type ValueToNode_F = <T extends StateValue>(
  body: NodeConfigWithInitials,
  from: T,
  initial?: boolean,
) => NodeConfigWithInitials;

export const valueToNode: ValueToNode_F = (body, from) => {
  const flatBody = flatMap(body as NodeConfig, false);
  const keysB = Object.keys(flatBody);
  const check1 = isString(from);
  if (check1) {
    const check2 = keysB.includes(from);
    if (check2) {
      const parents = getParents(from);
      const children = getChildren(from, ...keysB);

      const out1: any = {
        '/': flatBody['/'],
      };

      parents.concat(children).forEach(key => {
        out1[key] = (flatBody as any)[key];
      });

      const out: any = recomposeNode(out1);
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

  const out2 = recomposeNode(out1);
  return out2;
};
