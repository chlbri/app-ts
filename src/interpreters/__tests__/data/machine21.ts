import { createMachine } from '#machine';
import { createConfig } from '#machines';
import { notU, typings } from '#utils';
import { DELAY } from './constants';
import { fakeDB } from './fakeDB';
import { machine1 } from './machine1';

// #region machine21

export const config21 = createConfig({
  initial: 'idle',
  states: {
    idle: {
      activities: {
        DELAY: 'inc',
      },
      on: {
        NEXT: '/working',
      },
    },
    working: {
      type: 'parallel',
      activities: {
        DELAY2: 'inc2',
      },
      on: {
        SEND: {
          actions: 'send',
        },
      },
      states: {
        fetch: {
          initial: 'idle',
          states: {
            idle: {
              activities: {
                DELAY: 'sendPanelToUser',
              },
              on: {
                FETCH: '/working/fetch/fetch',
              },
            },
            fetch: {
              actors: {
                src: 'fetch',
                then: {
                  actions: {
                    name: 'insertData',
                    description: 'Database insert',
                  },
                  target: '/working/fetch/idle',
                },
                catch: '/working/fetch/idle',
              },
            },
          },
        },
        ui: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                WRITE: {
                  actions: 'write',
                  target: '/working/ui/input',
                },
              },
            },
            input: {
              activities: {
                DELAY: {
                  guards: 'isInputEmpty',
                  actions: 'askUsertoInput',
                },
              },
              on: {
                WRITE: [
                  {
                    guards: 'isInputNotEmpty',
                    actions: 'write',
                    target: '/working/ui/idle',
                  },
                  '/working/ui/idle',
                ],
              },
            },
            final: {},
          },
        },
      },
    },
    final: {},
  },
});

export const machine21 = createMachine(
  {
    actors: {
      src: 'machine1',
      id: 'machine1',
      on: {},
    },
    ...config21,
  },
  typings({
    eventsMap: {
      NEXT: 'primitive',
      FETCH: 'primitive',
      WRITE: { value: 'string' },
      SEND: 'primitive',
    },
    context: {
      iterator: 'number',
      input: 'string',
      data: ['string'],
    },
    pContext: {
      iterator: 'number',
    },
    actorsMap: {
      children: {
        machine1: {},
      },
      promisees: {
        fetch: {
          then: ['string'],
          catch: 'primitive',
        },
      },
    },
  }),
).provideOptions(
  ({ isNotValue, isValue, assign, voidAction, sendTo }) => ({
    actions: {
      inc: assign(
        'context.iterator',
        ({ context }) => notU(context?.iterator) + 1,
      ),
      inc2: assign(
        'context.iterator',
        ({ context }) => notU(context?.iterator) + 4,
      ),
      sendPanelToUser: voidAction(() => console.log('sendPanelToUser')),
      askUsertoInput: voidAction(() => console.log('Input, please !!')),
      write: assign('context.input', {
        WRITE: ({ payload: { value } }) => value,
      }),
      insertData: assign('context.data', {
        'fetch::then': ({ payload, context }) => {
          context?.data?.push(...payload);
          return context?.data;
        },
      }),
      send: sendTo(machine1)(() => ({ to: 'machine1', event: 'NEXT' })),
    },
    predicates: {
      isInputEmpty: isValue('context.input', ''),
      isInputNotEmpty: isNotValue('context.input', ''),
    },
    actors: {
      promises: {
        fetch: async ({ context }) => {
          const input = notU(context?.input);
          return fakeDB
            .filter(item => item.name.includes(input))
            .map(item => item.name);
        },
      },
    },
    delays: {
      DELAY,
      DELAY2: 2 * DELAY,
    },
  }),
);
// #endregion
