import { createMachine } from '#machine';
import { typings } from '#utils';

const io = { exit: 'inc', entry: 'inc' } as const;

export default createMachine(
  'src/__tests__/machine/real.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        ...io,
        on: {
          NEXT: '/parallel',
        },
      },
      parallel: {
        ...io,
        type: 'parallel',
        states: {
          atomic: {
            ...io,
            initial: 'idle',

            states: {
              idle: {
                ...io,
                on: {
                  NEXT: {
                    target: '/parallel/atomic/next',
                  },
                },
              },
              next: {
                ...io,
                on: {
                  PREVIOUS: '/parallel/atomic/idle',
                  NEXT: '/parallel/atomic/idle',
                },
              },
            },
          },
          compound: {
            ...io,
            initial: 'idle',

            states: {
              idle: {
                ...io,
                on: {
                  NEXT: {
                    target: '/parallel/compound/compound',
                  },
                },
              },
              compound: {
                ...io,
                initial: 'idle',
                states: {
                  idle: {
                    ...io,
                    on: {
                      NEXT: '/parallel/compound/compound/next',
                    },
                  },
                  next: {
                    ...io,
                    on: {
                      PREVIOUS: '/parallel/compound/compound/idle',
                      NEXT: '/idle',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  typings({
    eventsMap: {
      NEXT: 'primitive',
      PREVIOUS: 'primitive',
    },
    context: 'number',
  }),
);
