import {
  AFTER_EVENT,
  ALWAYS_EVENT,
  INIT_EVENT,
  MAX_EXCEEDED_EVENT_TYPE,
} from '../constants';
import type { EventStrings } from '../types';

const VALUES = [INIT_EVENT, MAX_EXCEEDED_EVENT_TYPE];

/**
 * Checks if the provided event is a {@linkcode EventStrings}.
 * @param event any - The event to check
 * @returns  boolean - Returns true if the event is a {@linkcode EventStrings}
 */
export const isStringEvent = (event: any): event is EventStrings => {
  const out =
    typeof event === 'string' &&
    (VALUES.includes(event) ||
      event.endsWith(ALWAYS_EVENT) ||
      event.endsWith(AFTER_EVENT));

  return out;
};
