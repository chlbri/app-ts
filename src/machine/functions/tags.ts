import { flatMap, type NodeConfig } from '#states';
import { toArray } from '@bemedev/basifun';

export const getTags = (node: NodeConfig) => {
  const flat = flatMap(node);
  const out: string[] = [];
  const entries = Object.entries(flat);

  entries.forEach(([, state]) => {
    const tags = toArray.typed(state.tags);
    out.push(...tags);
  });

  const checkEmpty = out.length === 0;
  if (checkEmpty) return undefined;

  return out;
};
