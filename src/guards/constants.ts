import { DEFAULT_NOTHING } from '#constants';
import { IS_TEST } from '#utils';

export const returnTrue = () => {
  if (IS_TEST) console.log(`${DEFAULT_NOTHING} call true`);
  return true;
};

export const returnFalse = () => {
  if (IS_TEST) console.log(`${DEFAULT_NOTHING} call false`);
  return false;
};
