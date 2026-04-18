import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/legacy-options.11.machine',
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                ADD: {
                  actions: 'add',
                },
                MULTIPLY: {
                  actions: 'multiply',
                },
              },
            },
          },
        },
        typings({
          eventsMap: {
            ADD: 'primitive',
            MULTIPLY: 'primitive',
          },
          context: 'number',
        }),
      );
