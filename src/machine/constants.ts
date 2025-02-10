import { sleepU } from './interpreter.helpers';

export const THEN_EVENT_TYPE = 'machine$$then';

export type ThenEvent = {
  type: typeof THEN_EVENT_TYPE;
  payload?: any;
};

export const CATCH_EVENT_TYPE = 'machine$$catch';

export type CatchEvent = {
  type: typeof CATCH_EVENT_TYPE;
  payload?: any;
};

export const MAX_EXCEEDED_EVENT_TYPE = 'machine$$exceeded';

export type MaxExceededEvent = typeof MAX_EXCEEDED_EVENT_TYPE;

export const MAX_TIME_PROMISE = 100_000;

export const MIN_ACTIVITY_TIME = 50;

export const DEFAULT_MAX_PROMISE = () => sleepU(MAX_TIME_PROMISE);
