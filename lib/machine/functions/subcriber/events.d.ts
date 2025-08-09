import type { RecordS } from '../../../types/index.js';
import { EVENTS_FULL } from '../../constants';
export type ReduceEvents_F = (events: (RecordS<string | string[]> | string)[] | typeof EVENTS_FULL, firstEvent: string, ...toChecks: string[]) => boolean;
/**
 * Reduces the events to check if any of the specified events are present.
 * @param _events - The events to check, can be an array of strings or objects.
 * @param firstEvent - The first event to check against.
 * @param toChecks - The events to check for presence.
 * @returns true if any of the specified events are found, false otherwise.
 *
 * @see {@linkcode EVENTS_FULL} for the full events constant.
 * @see {@linkcode toArray} for converting values to an array.
 * @see {@linkcode RecordS} for the record type used in events.
 */
export declare const reduceEvents: ReduceEvents_F;
//# sourceMappingURL=events.d.ts.map