import { isDefined } from '@bemedev/basifun';
import type { NodeConfigWithInitials } from '~states';
import type { RecordS } from '~types';

/**
 * Returns a list of all possible events from a flat record of NodeConfigWithInitials.
 * @param flat of type {@linkcode RecordS}<{@linkcode NodeConfigWithInitials}>, a flat record of NodeConfigWithInitials.
 * @returns An array of event names.
 *
 * @see {@linkcode isDefined} for the utility function to check if a value is defined.
 */
export const possibleEvents = (flat: RecordS<NodeConfigWithInitials>) => {
  const events: string[] = [];

  const values = Object.values(flat);
  values.forEach(value => {
    const on = value.on;
    const check = isDefined(on);

    if (check) {
      events.push(...Object.keys(on));
    }
  });

  return events;
};
