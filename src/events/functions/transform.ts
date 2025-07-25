import type { EventArg, EventsMap } from '../types';
import { _EventsR } from './../types';

export type TransformEventArg = <E extends EventsMap>(
  event: EventArg<E>,
) => _EventsR<E>;

/**
 * Transforms an non-formated event into a standardized event object.
 * @param event of type {@linkcode EventArg}, the event to transform.
 * It can be a string or an object.
 *
 * @returns a {@linkcode _EventsR} object, transformed event object with type and payload properties.
 * If the event is a string, it returns an object with type set to the string and
 * an empty payload. If the event is an object, it returns the event as is.
 *
 * @see {@linkcode EventsMap}
 */
export const transformEventArg: TransformEventArg = event => {
  const check1 = typeof event === 'string';
  if (check1) return { type: event, payload: {} } as any;

  return event;
};
