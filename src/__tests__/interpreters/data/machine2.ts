import { interpret } from '#interpreters';
import { notU } from '#utils';
import { createConfig, type EventsFrom } from '#machines';
import { createMachine } from '#machine';
import { DELAY } from './constants';
import { fakeDB } from './fakeDB';
import { machine1 } from './machine1';
import * as helpers from '@bemedev/typings/helpers';
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
              entry: 'insertData',
              always: '/working/fetch/idle',
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

const typings = helpers.any({
  eventsMap: {
    FETCH: 'never',
    WRITE: {
      value: 'string',
    },
    NEXT: 'never',
    FINISH: 'never',
  },
  pContext: {
    iterator: 'number',
  },
  context: {
    iterator: 'number',
    input: 'string',
    data: helpers.array('string'),
  },
});

export const machine2 = createMachine(
  'src/__tests__/interpreters/data/machine2',
  {
    actors: {
      machine1: {
        contexts: {
          iterator: 'iterator',
        },
        on: {},
      },
    },
    ...config2,
  },
  typings,
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
    insertData: assign('context.data', ({ context }) =>
      fakeDB
        .filter(item => item.name.includes(context?.input ?? ''))
        .map(item => item.name),
    ),
  },
  guards: {
    isInputEmpty: isValue('context.input', ''),
    isInputNotEmpty: isNotValue('context.input', ''),
  },
  actors: {
    children: {
      machine1: () => interpret(machine1, { context: { iterator: 0 } }),
    },
  },
  delays: {
    DELAY,
    DELAY2: 2 * DELAY,
  },
}));

const _config2 = createConfig({
  ...config2,
  actors: {
    machine1: {
      contexts: {
        iterator: 'iterator',
      },
      on: {},
    },
  },
  states: {
    ...config2.states,
    idle: {
      entry: 'debounce',
      ...config2.states.idle,
    },
  },
});

export const _machine2 = createMachine(
  'src/__tests__/interpreters/data/machine2._2',
  _config2,
  typings,
).provideOptions(
  ({
    isNotValue,
    isValue,
    assign,
    voidAction,
    debounce: _debounce,
    batch,
  }) => ({
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
      insertData: assign('context.data', ({ context }) =>
        fakeDB
          .filter(item => item.name.includes(context?.input ?? ''))
          .map(item => item.name),
      ),
      debounce: batch(
        voidAction(() => console.log('Debounced action executed')),
        _debounce(
          assign('context.iterator', () => 1000),
          { ms: 10_000, id: 'debounce-action' },
        ),
      ),
    },
    guards: {
      isInputEmpty: isValue('context.input', ''),
      isInputNotEmpty: isNotValue('context.input', ''),
    },
    actors: {
      children: {
        machine1: () => interpret(machine1, { context: { iterator: 0 } }),
      },
    },
    delays: {
      DELAY,
      DELAY2: 2 * DELAY,
    },
  }),
);

type TT = Extract<EventsFrom<typeof machine2>, { type: 'WRITE' }>;

// #endregion
