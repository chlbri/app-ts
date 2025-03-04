import { toArray } from '@bemedev/basifun';
import { EVENTS_FULL } from '../../types';
import type { RecordS } from '~types';

export type ReduceEvents_F = (
  events: (RecordS<string | string[]> | string)[] | typeof EVENTS_FULL,

  firstEvent: string,
  ...toChecks: string[]
) => boolean;

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
