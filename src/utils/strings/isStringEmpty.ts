import { isString } from '~types';

export const isStringEmpty = (arg: unknown) => {
  return isString(arg) && arg.trim() === '';
};
