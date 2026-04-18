import { createMachine } from '#machine';
import { typings } from '#utils';

const actions = { exit: 'inc', entry: 'inc' } as const;

export default createMachine(
  'src/__tests__/machine/real.1.machine',
  {
    initial: 'idle',
    ...actions,
    states: {
      idle: {
        ...actions,
        on: {
          NEXT: '/parallel',
        },
        description: 'First state',
      },
      compound: {
        ...actions,
        on: {
          NEXT: '/idle',
        },
        initial: 'idle',
        states: {
          idle: {
            ...actions,
            on: {
              NEXT: '/compound/next',
            },
          },
          next: {
            ...actions,
            on: {
              PREVIOUS: '/compound/idle',
              NEXT: '/parallel',
            },
          },
        },
      },
      parallel: {
        ...actions,
        on: {
          PREVIOUS: '/compound/next',
        },
        type: 'parallel',
        states: {
          atomic: {
            initial: 'idle',
            ...actions,
            on: {
              NEXT: '/idle',
            },

            states: {
              idle: {
                entry: 'inc',
                on: {
                  NEXT: '/parallel/atomic/next',
                },
              },
              next: {
                ...actions,
                on: {
                  PREVIOUS: '/parallel/atomic/idle',
                },
              },
            },
          },
          compound: {
            ...actions,
            on: {
              NEXT: '/compound/next',
            },
            initial: 'idle',
            states: {
              idle: {
                ...actions,
                on: {
                  NEXT: '/parallel/compound/next',
                },
              },
              next: {
                ...actions,
                on: {
                  NEXT: '/compound/idle',
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
