import type { _EventsR, EventArg, EventsMap } from '../types';

export type TransformEventArg = <E extends EventsMap>(
  event: EventArg<E>,
) => _EventsR<E>;

export const transformEventArg: TransformEventArg = event => {
  const check1 = typeof event === 'string';
  if (check1) return { type: event, payload: {} } as any;

  return event;
};
