import { t } from '@bemedev/types';
import type { RecordS } from '~types';
import { toArray } from '~utils';

export type ReduceEvents_F = (
  events: RecordS<string | string[]> | 'allEvents' | 'full',

  firstEvent: string,
  ...toChecks: string[]
) => boolean;

export const reduceEvents: ReduceEvents_F = (
  _events,
  firstEvent,
  ...toChecks
) => {
  const check1 = _events === 'allEvents' || _events === 'full';
  if (check1) return true;

  const events = Object.entries(_events).map(([key, value]) => {
    const values = toArray.typed(value);
    return t.tuple(key, values);
  });

  for (const [key, values] of events) {
    if (key === firstEvent) {
      for (const toCheck of toChecks) {
        if (!values.includes(toCheck)) return false;
      }
    }
  }

  return true;
};
