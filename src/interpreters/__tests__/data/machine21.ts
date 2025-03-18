import { createMachine } from '~machine';
import { createConfig, EVENTS_FULL } from '~machines';
import { typings } from '~utils';
import { DELAY } from './constants';
import { fakeDB } from './fakeDB';
import { machine1 } from './machine1';

// #region machine2

export const config21 = createConfig({
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
          states: {
            idle: {
              activities: {
                DELAY: 'sendPanelToUser',
              },
              on: {
                FETCH: {
                  guards: 'isInputNotEmpty',
                  target: '/working/fetch/fetch',
                },
              },
            },
            fetch: {
              promises: {
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
    machines: 'machine1',
    ...config21,
  },
  {
    eventsMap: {
      NEXT: typings.object,
      FETCH: typings.object,
      WRITE: { value: typings.string() },
      SEND: typings.object,
    },
    context: {
      iterator: typings.number(),
      input: typings.string(),
      data: typings.array(typings.string()),
    },
    pContext: typings.recordAll(typings.number(), 'iterator'),
    promiseesMap: {
      fetch: typings.promiseDef(
        typings.array(typings.string()),
        typings.object,
      ),
    },
  },
  { '/': 'idle', '/working/fetch': 'idle', '/working/ui': 'idle' },
).provideOptions(
  ({ isNotValue, isValue, createChild, assign, voidAction, sender }) => ({
    actions: {
      inc: assign('context.iterator', (_, { iterator }) => iterator + 1),
      inc2: assign('context.iterator', (_, { iterator }) => iterator + 4),
      sendPanelToUser: voidAction(() => console.log('sendPanelToUser')),
      askUsertoInput: voidAction(() => console.log('Input, please !!')),
      write: assign('context.input', {
        WRITE: (_, __, { value }) => value,
      }),
      insertData: assign('context.data', {
        'fetch::then': (_, { data }, payload) => {
          data.push(...payload);
          return data;
        },
      }),
      send: sender(machine1)(() => ({ to: 'machine1', event: 'NEXT' })),
    },
    predicates: {
      isInputEmpty: isValue('context.input', ''),
      isInputNotEmpty: isNotValue('context.input', ''),
    },
    promises: {
      fetch: async (_, { input }) => {
        return fakeDB.filter(item => item.name.includes(input));
      },
    },
    delays: {
      DELAY,
      DELAY2: 2 * DELAY,
    },
    machines: {
      machine1: createChild(
        machine1,
        {
          pContext: {},
          context: { iterator: 0 },
        },
        {
          events: EVENTS_FULL,
          contexts: { iterator: 'iterator' },
        },
      ),
    },
  }),
);
// #endregion
