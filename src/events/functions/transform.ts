import type { EventObject } from '../types';

export type TransformEventArg = <T extends EventObject = EventObject>(
  event: string | EventObject,
) => T;

/**
 * Transforms an non-formated event into a standardized event object.
 * It can be a string or an object.
 *
 * If the event is a string, it returns an object with type set to the string and
 * an empty payload. If the event is an object, it returns the event as is.
 *
 * @see {@linkcode EventObject}
 */
export const transformEventArg: TransformEventArg = event => {
  const check1 = typeof event === 'string';
  if (check1) return { type: event, payload: {} } as any;

  return event;
};
