import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/legacy-options.8.machine',
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                NEXT: {
                  actions: 'increment',
                },
              },
            },
          },
        },
        typings({
          eventsMap: {
            NEXT: 'primitive',
          },
          context: 'number',
        }),
      );
