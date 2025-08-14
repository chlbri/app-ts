import type { NodeConfig } from '../../states/index.js';
import type { RecordS } from '../../types/index.js';
/**
 * Returns a list of all possible events from a flat record of NodeConfig.
 * @param flat of type {@linkcode RecordS}<{@linkcode NodeConfig}>, a flat record of NodeConfig.
 * @returns An array of event names.
 *
 * @see {@linkcode castings} for the utility function to check if a value is defined.
 */
export declare const possibleEvents: (flat: RecordS<NodeConfig>) => string[];
//# sourceMappingURL=possibleEvents.d.ts.map