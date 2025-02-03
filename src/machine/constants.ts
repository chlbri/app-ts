import sleep from '@bemedev/sleep';

export const THEN_EVENT_TYPE = 'machine$$then';

export type ThenEvent<T = any> = {
  type: typeof THEN_EVENT_TYPE;
  payload?: T;
};

export const CATCH_EVENT_TYPE = 'machine$$catch';

export type CatchEvent<T = any> = {
  type: typeof CATCH_EVENT_TYPE;
  payload?: T;
};

export const MAX_TIME_PROMISE = 100_000;

export const DEFAULT_MAX_PROMISE = () => sleep(MAX_TIME_PROMISE);
