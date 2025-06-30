import type { EventObject } from '../types';

export type EventToType_F = (event: EventObject | string) => string;

/**
 * Converts an event to its type.
 * If the event is a string, it returns the string.
 * If the event is an object, it returns the type property of the object.
 * @param event {@linkcode EventObject} or string
 * @returns string representing the type of the event
 */
export const eventToType: EventToType_F = event => {
  const check = typeof event === 'string';
  if (check) return event;
  return event.type;
};
