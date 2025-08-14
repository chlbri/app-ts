import { type StateValue } from '@bemedev/decompose';
import type { NodeConfig } from '../types';
export type ValueToNode_F = <T extends StateValue>(body: NodeConfig, from: T, initial?: boolean) => NodeConfig;
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
export declare const valueToNode: ValueToNode_F;
//# sourceMappingURL=valueToNode.d.ts.map