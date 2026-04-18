import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/actions/async-actions.1.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              LOAD: { actions: 'loadUser', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { LOAD: 'primitive' },
        context: { name: 'string' },
      }),
    );
