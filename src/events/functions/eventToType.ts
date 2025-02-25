import type { EventObject } from '../types';

export type EventToType_F = (event: EventObject | string) => string;

export const eventToType: EventToType_F = event => {
  const check = typeof event === 'string';
  if (check) return event;
  return event.type;
};
