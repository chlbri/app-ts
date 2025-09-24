import { createMachine } from '#machine';
import { createConfig, EVENTS_FULL } from '#machines';
import { typings } from '#utils';
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
    machines: { machine1: 'machine1' },
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
    promiseesMap: {
      fetch: {
        then: ['string'],
        catch: 'primitive',
      },
    },
  }),
).provideOptions(
  ({ isNotValue, isValue, createChild, assign, voidAction }) => ({
    actions: {
      inc: assign(
        'context.iterator',
        ({ context: { iterator } }) => iterator + 1,
      ),
      inc2: assign(
        'context.iterator',
        ({ context: { iterator } }) => iterator + 4,
      ),
      sendPanelToUser: voidAction(() => console.log('sendPanelToUser')),
      askUsertoInput: voidAction(() => console.log('Input, please !!')),
      write: assign('context.input', {
        WRITE: ({ payload: { value } }) => value,
      }),
      insertData: assign('context.data', {
        'fetch::then': ({ payload, context: { data } }) => {
          data.push(...payload);
          return data;
        },
      }),
    },
    predicates: {
      isInputEmpty: isValue('context.input', ''),
      isInputNotEmpty: isNotValue('context.input', ''),
    },
    promises: {
      fetch: async ({ context: { input } }) => {
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
    promiseesMap: {
      fetch: {
        then: ['string'],
        catch: 'primitive',
      },
    },
  }),
).provideOptions(
  ({ isNotValue, isValue, assign, voidAction, debounce: _debounce }) => ({
    actions: {
      inc: assign(
        'context.iterator',
        ({ context: { iterator } }) => iterator + 1,
      ),

      inc2: assign(
        'context.iterator',
        ({ context: { iterator } }) => iterator + 4,
      ),
      sendPanelToUser: voidAction(() => console.log('sendPanelToUser')),
      askUsertoInput: voidAction(() => console.log('Input, please !!')),
      write: assign('context.input', {
        WRITE: ({ payload: { value } }) => value,
      }),
      insertData: assign('context.data', {
        'fetch::then': ({ payload, context: { data } }) => {
          data.push(...payload);
          return data;
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
    promises: {
      fetch: async ({ context: { input } }) => {
        return fakeDB.filter(item => item.name.includes(input));
      },
    },
    delays: {
      DELAY,
      DELAY2: 2 * DELAY,
    },
  }),
);
// #endregion
