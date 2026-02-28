import type { EventObject } from '../types';

export type TypeToEvent_F = (event: EventObject | string) => EventObject;

/**
 * Converts an event to its type.
 * If the event is a string, it returns an object with the type property set to the string.
 * If the event is an object, it returns the object itself.
 * @param event of type {@linkcode EventObject} or string
 * @returns {@linkcode EventObject} representing the event
 */
export const typeToEvent: TypeToEvent_F = event => {
  const check = typeof event === 'string';
  if (check) return { type: event, payload: {} };
  return event;
};
