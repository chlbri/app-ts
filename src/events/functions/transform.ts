import type {
  // AllEvent,
  EventArg,
  // EventObject,
  EventsMap,
  PromiseeMap,
  ToEventsR,
} from '../types';
// import { isStringEvent } from './isStringEvent';

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

// export const transformAllEvent = (value: AllEvent): EventObject => {
//   return isStringEvent(value)
//     ? { type: value, payload: {} }
//     : transformEventArg(value);
// };
