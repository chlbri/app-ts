import { isDefined } from '@bemedev/basifun';
import type { EventObject } from '~events';
import type { NodeConfigWithInitials } from '~states';
import type { RecordS } from '~types';

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

export const eventToType = (event: EventObject | string) => {
  const check = typeof event === 'string';
  if (check) return event;
  return event.type;
};
