import { MAX_EXCEEDED_EVENT_TYPE } from '~constants';
import { ALWAYS_EVENT, INIT_EVENT } from '../constants';
import type { EventArg, EventsMap, ToEvents } from '../types';

export type TransformEventArg = <T extends EventsMap>(
  event: EventArg<T>,
) => ToEvents<T>;

export const transformEventArg: TransformEventArg = event => {
  const check0 =
    event === INIT_EVENT ||
    event === MAX_EXCEEDED_EVENT_TYPE ||
    event === ALWAYS_EVENT;

  if (check0) {
    return event as any;
  }
  const check1 = typeof event === 'string';
  if (check1) return { type: event, payload: {} } as any;

  return event as any;
};
