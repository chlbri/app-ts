import { interpret } from '#interpreters';
import { notU, typings } from '#utils';
import { createConfig } from 'src/machine/functions/create2';
import { createMachine } from 'src/machine/machine2';
import { DELAY } from './constants';
import { fakeDB } from './fakeDB';
import { machine1 } from './machine1';
// #region machine2

export const config2 = createConfig({
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
        FINISH: '/final',
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
                FETCH: {
                  guards: 'isInputNotEmpty',
                  target: '/working/fetch/fetch',
                },
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

export const machine2 = createMachine(
  {
    actors: {
      id: 'machine1',
      src: 'machine11',
      contexts: {},
      on: {
        NEXT: '/working',
      },
    },
    ...config2,
  },
  typings({
    eventsMap: {
      NEXT: 'primitive',
      FETCH: 'primitive',
      WRITE: { value: 'string' },
      FINISH: 'primitive',
    },
    pContext: {
      iterator: 'number',
    },
    context: {
      iterator: 'number',
      input: 'string',
      data: ['string'],
    },
    actorsMap: {
      children: {
        machine11: {
          NEXT: 'boolean',
        },
      },
      promisees: {
        fetch: {
          then: ['string'],
          catch: 'primitive',
        },
      },
    },
  }),
).provideOptions(({ isNotValue, isValue, assign, voidAction }) => ({
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
  },
  predicates: {
    isInputEmpty: isValue('context.input', ''),
    isInputNotEmpty: isNotValue('context.input', ''),
  },
  actors: {
    promises: {
      fetch: async ({ context }) => {
        return fakeDB
          .filter(item => item.name.includes(context?.input))
          .map(item => item.name);
      },
    },
    children: {
      machine11: interpret(machine1, {}),
    },
  },
  delays: {
    DELAY,
    DELAY2: 2 * DELAY,
  },
}));

const _config2 = createConfig({ ...config2, entry: 'debounce' });

export const _machine2 = createMachine(
  _config2,
  typings({
    eventsMap: {
      NEXT: 'primitive',
      FETCH: 'primitive',
      WRITE: { value: 'string' },
      FINISH: 'primitive',
    },
    pContext: {
      iterator: 'number',
    },
    context: {
      iterator: 'number',
      input: 'string',
      data: ['string'],
    },
    actorsMap: {
      promisees: {
        fetch: {
          then: ['string'],
          catch: 'primitive',
        },
      },
    },
  }),
).provideOptions(
  ({ isNotValue, isValue, assign, voidAction, debounce: _debounce }) => ({
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
      debounce: _debounce(
        assign('context.iterator', () => {
          console.log('Debounced action executed');
          return 1000;
        }),
        { ms: 10_000, id: 'debounce-action' },
      ),
    },
    predicates: {
      isInputEmpty: isValue('context.input', ''),
      isInputNotEmpty: isNotValue('context.input', ''),
    },
    actors: {
      promises: {
        fetch: async ({ context }) => {
          return fakeDB
            .filter(item => item.name.includes(context?.input))
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
