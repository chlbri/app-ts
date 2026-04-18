import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/actions/async-actions.6.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              FILTER: { actions: 'filterEven' },
            },
          },
        },
      },
      typings({
        eventsMap: { FILTER: 'primitive' },
        context: { items: typings.array('number') },
      }),
    );
