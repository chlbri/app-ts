import { DEFAULT_NOTHING } from '~constants';
import { IS_TEST } from '~utils';

/**
 * A utility function used when no action is required or when a placeholder value is needed.
 *
 * @returns in text environment {@linkcode DEFAULT_NOTHING}.
 */
export const nothing = () => {
  if (IS_TEST) {
    console.log(`${DEFAULT_NOTHING} call ${DEFAULT_NOTHING}`);
    return DEFAULT_NOTHING;
    /* v8 ignore next 3 */
  }
  return;
};
