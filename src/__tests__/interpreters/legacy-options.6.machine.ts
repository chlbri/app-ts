import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/legacy-options.6.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              FIRST: { actions: 'first' },
              SECOND: { actions: 'second' },
              THIRD: { actions: 'third' },
            },
          },
        },
      },
      typings({
        eventsMap: {
          FIRST: 'primitive',
          SECOND: 'primitive',
          THIRD: 'primitive',
        },
        context: 'number',
      }),
    );
