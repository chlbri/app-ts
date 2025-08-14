import type { NodeConfig, StateValue } from '../types';
export type NodeToValue_F = (body: NodeConfig) => StateValue;
/**
 * Converts a state machine config into a StateValue.
 *
 * @param body - The state machine configuration to process.
 * @returns A value representation of the state machine, which can be a string,
 *         an object, or an empty object if the state is atomic.
 *
 * @see {@linkcode NodeToValue_F} for more details
 * @see {@linkcode isAtomic} for checking atomic states
 * @see {@linkcode isCompound} for checking compound states
 * @see {@linkcode t} for type utilities
 */
export declare const nodeToValue: NodeToValue_F;
//# sourceMappingURL=nodeToValue.d.ts.map