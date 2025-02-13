import { DEFAULT_NOTHING } from '~constants';
import { IS_TEST } from '~utils';

export const asyncNothing = async () => {
  if (IS_TEST) {
    console.log(`${DEFAULT_NOTHING} call ${DEFAULT_NOTHING}`);
    return DEFAULT_NOTHING;
  }
  return;
};
