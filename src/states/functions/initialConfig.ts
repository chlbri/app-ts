import { t, type Fn } from '@bemedev/types';
import type { NodeConfigWithInitials } from '../types';
import { isAtomic, isParallel } from './checks';

export type InitialConfig_F = Fn<
  [body: NodeConfigWithInitials],
  NodeConfigWithInitials
>;

export const initialConfig: InitialConfig_F = body => {
  const check1 = isAtomic(body);
  if (check1) return body;

  const check2 = isParallel(body);

  if (check2) {
    const { states: _states, ...config } = body;
    const entries1 = Object.entries(_states).map(([key, state]) => {
      const reduced = initialConfig(state);
      return t.tuple(key, reduced);
    });

    const states = entries1.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as any);

    const out = { ...config, states };
    return out;
  }

  const __id = body.initial!;

  const initial = body.states[__id];
  if (!initial) {
    const { states: _states, ...config } = body;
    const entries1 = Object.entries(_states).map(([key, state]) => {
      const reduced = initialConfig(state);
      return t.tuple(key, reduced);
    });

    const states = entries1.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as any);

    const out = { ...config, states };
    return out;
  }

  const check4 = isAtomic(initial);
  if (check4) {
    const out = { ...body, states: { [__id]: initial } };
    return out;
  }

  const out = {
    ...body,
    states: { [__id]: initialConfig(initial) },
  };
  return out;
};
