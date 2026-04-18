import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/legacy-options.10.machine',
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                FIRST: { actions: 'first' },
                SECOND: { actions: 'second' },
              },
            },
          },
        },
        typings({
          eventsMap: {
            FIRST: 'primitive',
            SECOND: 'primitive',
          },
          context: 'number',
        }),
      );
