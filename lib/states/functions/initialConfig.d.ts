import { type types } from '@bemedev/types';
import type { NodeConfigWithInitials } from '../types';
export type InitialConfig_F = types.Fn<[
    body: NodeConfigWithInitials
], NodeConfigWithInitials>;
/**
 * Returns the initial configuration of a state machine.
 *
 * @param body - The state machine configuration to process.
 * @returns The initial configuration of the state machine.
 *
 * @see {@linkcode isAtomic} for checking atomic states
 * @see {@linkcode isParallel} for checking parallel states
 * @see {@linkcode InitialConfig_F} for more details
 * @see {@linkcode t} for type utilities
 */
export declare const initialConfig: InitialConfig_F;
//# sourceMappingURL=initialConfig.d.ts.map