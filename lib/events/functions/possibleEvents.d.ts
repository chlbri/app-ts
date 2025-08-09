import type { NodeConfigWithInitials } from '../../states/index.js';
import type { RecordS } from '../../types/index.js';
/**
 * Returns a list of all possible events from a flat record of NodeConfigWithInitials.
 * @param flat of type {@linkcode RecordS}<{@linkcode NodeConfigWithInitials}>, a flat record of NodeConfigWithInitials.
 * @returns An array of event names.
 *
 * @see {@linkcode isDefined} for the utility function to check if a value is defined.
 */
export declare const possibleEvents: (flat: RecordS<NodeConfigWithInitials>) => string[];
//# sourceMappingURL=possibleEvents.d.ts.map