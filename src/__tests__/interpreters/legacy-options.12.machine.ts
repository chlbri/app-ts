import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/legacy-options.12.machine',
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                INCREMENT: {
                  actions: 'increment',
                },
              },
            },
          },
        },
        typings({
          eventsMap: {
            INCREMENT: 'primitive',
          },
          context: 'number',
        }),
      );
