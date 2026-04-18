import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/children.5.machine',
      {
        actors: {
          child: {
            on: {
              NEXT: {
                actions: ['notify'],
              },
            },
          },
        },
        initial: 'idle',
        states: {
          idle: {
            on: {
              NEXT: {
                actions: ['sendChildNext'],
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
        },
        actorsMap: {
          children: {
            child: {
              NEXT: 'primitive',
            },
          },
        },
      }),
    );
