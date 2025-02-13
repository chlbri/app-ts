import { isDefined } from '@bemedev/basifun';
import { t, type Fn } from '@bemedev/types';
import { stateType } from 'src/states/functions/stateType';
import type { ActionConfig } from '~actions';
import { toArray, toDescriber } from '~utils';
import type { NodeConfig, NodeConfigWithInitials, SimpleStateConfig } from './types';

export type ToSimple_F = Fn<
  [state: NodeConfig | NodeConfigWithInitials],
  SimpleStateConfig
>;

export const toSimple: ToSimple_F = config => {
  const type = stateType(config);
  const initial = (config as any).initial;

  const entry = toArray<ActionConfig>(config.entry).map(toDescriber);
  const exit = toArray<ActionConfig>(config.exit).map(toDescriber);
  const tags = toArray<string>(config.tags);

  const _states = config.states;

  const out = t.anify<any>({ type, entry, exit, tags });

  if (initial !== undefined) out.initial = initial;

  const states: any[] = [];

  const check1 = isDefined(_states);

  if (check1) {
    const entries = Object.entries(_states);
    states.push(
      ...entries.map(([__id, state]) => {
        const value = { ...toSimple(state), __id };
        return value;
      }),
    );
  }
  out.states = states;

  return out;
};
