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
 * @param event of type any, the event to check
 * @returns true if the event is a {@linkcode EventStrings}
 * @satisfies typechecker
 *
 * @see {@linkcode INIT_EVENT} for the initial event.
 * @see {@linkcode ALWAYS_EVENT} for the always event.
 * @see {@linkcode AFTER_EVENT} for the after event.
 * @see {@linkcode MAX_EXCEEDED_EVENT_TYPE} for the max exceeded event.
 */
export const isStringEvent = (event: any): event is EventStrings => {
  const out =
    typeof event === 'string' &&
    (VALUES.includes(event) ||
      event.endsWith(ALWAYS_EVENT) ||
      event.endsWith(AFTER_EVENT));

  return out;
};
