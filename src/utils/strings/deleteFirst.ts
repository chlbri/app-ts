import type { Fn } from '@bemedev/types';
import { DEFAULT_DELIMITER } from '~constants';

export type DeleteFirst_F = Fn<[arg: string, toDelete?: string], string>;

export const deleteFirst: DeleteFirst_F = (
  arg,
  toDelete = DEFAULT_DELIMITER,
) => {
  const check = arg.startsWith(toDelete);
  return check ? arg.substring(1) : arg;
};
