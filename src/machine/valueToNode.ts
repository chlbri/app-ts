import { decomposeKeys } from '@bemedev/decompose';
import { isString } from 'src/types/primitives';
import { DEFAULT_DELIMITER } from '~constants';
import { replaceAll } from '~utils';
import { flatMap } from './flatMap';
import { getChildren } from './getChildren';
import { getParents } from './getParents';
import { recomposeNode } from './recompose';
import type { NodeConfig } from './types';
import type { ValueToConfig_F } from './valueToNode.type';

export const valueToConfig: ValueToConfig_F = (body, from) => {
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

  const flatFrom = decomposeKeys(from);

  const out1: any = {};

  flatFrom.forEach(key1 => {
    const key2 = replaceAll({
      entry: key1,
      match: '.',
      replacement: DEFAULT_DELIMITER,
    });

    const check4 = keysB.includes(`/${key2}`);

    if (check4) {
      const all = getParents(key2);
      all.forEach(_key => {
        out1[`/${_key}`] = (flatBody as any)[`/${_key}`];
      });
    }
  });

  const out2 = recomposeNode(out1);
  return out2;
};
