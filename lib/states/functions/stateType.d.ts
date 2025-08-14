import type { types } from '@bemedev/types';
import type { NodeConfig, StateType } from '../types';
export type StateType_F = types.Fn<[state: NodeConfig], StateType>;
/**
 * Determines the type of state based on its configuration.
 *
 * @param config - The state configuration object.
 * @returns The type of the state: 'atomic', 'compound', or the specified type.
 *
 * @see {@linkcode StateType_F} for more details.
 */
export declare const stateType: StateType_F;
//# sourceMappingURL=stateType.d.ts.map