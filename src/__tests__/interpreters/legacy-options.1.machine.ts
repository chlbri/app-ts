import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/legacy-options.1.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              NEXT: {
                actions: 'increment',
              },
              DOUBLE: {
                actions: 'doubleIncrement',
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
          DOUBLE: 'primitive',
        },
        context: 'number',
      }),
    );
