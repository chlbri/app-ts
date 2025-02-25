import type { EventArg, EventsMap, ToEventsR } from '../types';

export type TransformEventArg = <T extends EventsMap>(
  event: EventArg<T>,
) => ToEventsR<T>;

export const transformEventArg: TransformEventArg = event => {
  const check1 = typeof event === 'string';
  if (check1) return { type: event, payload: {} } as any;

  return event;
};
