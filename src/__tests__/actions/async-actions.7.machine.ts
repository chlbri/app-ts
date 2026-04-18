import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/actions/async-actions.7.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              DISPATCH: { actions: 'dispatchEvent', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { DISPATCH: 'primitive' },
        context: { dispatched: 'boolean' },
      }),
    );
