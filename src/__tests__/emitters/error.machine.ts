import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/emitters/error.machine',
      {
        initial: 'idle',
        actors: {
          interval: {
            next: {
              actions: ['assigN'],
            },
            error: {
              actions: ['signals'],
            },
          },
        },
        states: {
          idle: {},
        },
      },
      typings({
        actorsMap: {
          emitters: {
            interval: { next: 'number', error: 'number' },
          },
        },
        context: 'number',
      }),
    );
