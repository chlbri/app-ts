import { DEFAULT_NOTHING } from '~constants';

export const returnTrue = () => {
  console.log(`${DEFAULT_NOTHING} call true`);
  return true;
};

export const returnFalse = () => {
  console.log(`${DEFAULT_NOTHING} call false`);
  return false;
};
