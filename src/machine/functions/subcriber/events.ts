import { t } from '@bemedev/types';
import type { RecordS } from '~types';
import { toArray } from '~utils';

export type ReduceEvents_F = (
  events: RecordS<string | string[]> | 'full' | string[],

  firstEvent: string,
  ...toChecks: string[]
) => boolean;

export const reduceEvents: ReduceEvents_F = (
  _events,
  firstEvent,
  ...toChecks
) => {
  const check1 = _events === 'full';
  if (check1) return true;

  const check2 = Array.isArray(_events);
  if (check2) {
    for (const toCheck of toChecks) {
      if (!_events.includes(toCheck)) return false;
    }
    return true;
  }

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
