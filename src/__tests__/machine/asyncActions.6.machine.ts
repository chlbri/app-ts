import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/machine/asyncActions.6.machine',
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      );
