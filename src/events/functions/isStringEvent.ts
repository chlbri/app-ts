import {
  AFTER_EVENT,
  ALWAYS_EVENT,
  INIT_EVENT,
  MAX_EXCEEDED_EVENT_TYPE,
} from '../constants';
import type { EventStrings } from '../types';

const VALUES = [INIT_EVENT, MAX_EXCEEDED_EVENT_TYPE];
export const isStringEvent = (event: any): event is EventStrings => {
  const out =
    typeof event === 'string' &&
    (VALUES.includes(event) ||
      event.endsWith(ALWAYS_EVENT) ||
      event.endsWith(AFTER_EVENT));

  return out;
};
