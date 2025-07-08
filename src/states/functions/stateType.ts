import type { Fn } from '@bemedev/types/lib/types/types';

import type {
  NodeConfig,
  NodeConfigWithInitials,
  StateType,
} from '../types';

export type StateType_F = Fn<
  [state: NodeConfig | NodeConfigWithInitials],
  StateType
>;

/**
 * Determines the type of state based on its configuration.
 *
 * @param config - The state configuration object.
 * @returns The type of the state: 'atomic', 'compound', or the specified type.
 *
 * @see {@linkcode StateType_F} for more details.
 */
export const stateType: StateType_F = config => {
  const type = config.type;
  if (type) return type;
  const states = (config as any).states;
  if (states) {
    const len = Object.keys(states).length;
    if (len > 0) {
      return 'compound';
    }
  }

  return 'atomic';
};
