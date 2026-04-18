import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/actions/async-actions.8.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              INC: { actions: 'inc', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { INC: 'primitive' },
        context: 'number',
      }),
    );
