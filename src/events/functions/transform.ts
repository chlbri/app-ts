import type { EventArg, EventsMap, ToEvents2 } from '../types';

export type TransformEventArg = <T extends EventsMap>(
  event: EventArg<T>,
) => ToEvents2<T>;

export const transformEventArg: TransformEventArg = event => {
  const check1 = typeof event === 'string';
  if (check1) return { type: event, payload: {} } as any;

  return event;
};
