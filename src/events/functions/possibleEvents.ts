import type { NodeConfig } from '#states';
import type { RecordS } from '#types';
import { castings } from '@bemedev/types';

/**
 * Returns a list of all possible events from a flat record of NodeConfig.
 * @param flat of type {@linkcode RecordS}<{@linkcode NodeConfig}>, a flat record of NodeConfig.
 * @returns An array of event names.
 *
 * @see {@linkcode castings} for the utility function to check if a value is defined.
 */
export const possibleEvents = (flat: RecordS<NodeConfig>) => {
  const events: string[] = [];

  const values = Object.values(flat);
  values.forEach(value => {
    const on = value.on;
    const check = castings.commons.isDefined(on);

    if (check) {
      events.push(...Object.keys(on));
    }
  });

  return events;
};
