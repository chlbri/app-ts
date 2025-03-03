import type {
  EventArg,
  EventsMap,
  PromiseeMap,
  ToEventsR,
} from '../types';

export type TransformEventArg = <
  E extends EventsMap,
  P extends PromiseeMap,
>(
  event: EventArg<E, P>,
) => ToEventsR<E, P>;

export const transformEventArg: TransformEventArg = event => {
  const check1 = typeof event === 'string';
  if (check1) return { type: event, payload: {} } as any;

  return event;
};
