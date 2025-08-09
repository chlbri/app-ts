import type { RecordS } from '#types';
import { toArray } from '@bemedev/basifun';
import { EVENTS_FULL } from '../../constants';

export type ReduceEvents_F = (
  events: (RecordS<string | string[]> | string)[] | typeof EVENTS_FULL,

  firstEvent: string,
  ...toChecks: string[]
) => boolean;

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
export const reduceEvents: ReduceEvents_F = (
  _events,
  firstEvent,
  ...toChecks
) => {
  const check1 = _events === EVENTS_FULL;
  if (check1) return true;

  const check2 = toChecks.every(check => {
    const check3 = _events.includes(check);
    if (check3) return true;

    for (const _event of _events) {
      const check4 = typeof _event === 'string';
      if (check4) continue;

      const entries = Object.entries(_event);
      for (const [key, value] of entries) {
        const values = toArray.typed(value);

        if (key === firstEvent) {
          const check5 = values.includes(check);
          if (check5) return true;
        }
      }
    }
    return false;
  });

  return check2;
};
