import { DEFAULT_NOTHING } from '#constants';
import { IS_TEST } from '#utils';

export const returnTrue = () => {
  // v8 ignore next 2
  if (IS_TEST) console.log(`${DEFAULT_NOTHING} call true`);
  return true;
};

export const returnFalse = () => {
  // v8 ignore next 2
  if (IS_TEST) console.log(`${DEFAULT_NOTHING} call false`);
  return false;
};
