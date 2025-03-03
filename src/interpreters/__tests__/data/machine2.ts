import { t } from '@bemedev/types';
import { createMachine } from '~machine';
import { createConfig } from '~machines';
import { DELAY } from './constants';
import { fakeDB } from './fakeDB';
import { machine1 } from './machine1';

// #region machine2

export const config2 = createConfig({
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

export const machine2 = createMachine(
  {
    machines: 'machine1',
    ...config2,
  },
  {
    eventsMap: {
      NEXT: {},
      FETCH: {},
      WRITE: { value: t.string },
      FINISH: {},
    },
    context: t.unknown<{
      iterator: number;
      input: string;
      data: string[];
    }>(),
    pContext: t.unknown<{ iterator: number }>(),
  },
  { '/': 'idle', '/working/fetch': 'idle', '/working/ui': 'idle' },
).provideOptions(({ isNotValue, isValue, createChild }) => ({
  actions: {
    inc: (pContext, context) => {
      context.iterator++;
      return { context, pContext };
    },
    inc2: (pContext, context) => {
      context.iterator += 4;
      return { context, pContext };
    },
    sendPanelToUser: (pContext, context) => {
      console.log('sendPanelToUser');
      return { context, pContext };
    },
    write: {
      WRITE: (pContext, context, { value }) => {
        context.input = value;
        return { context, pContext };
      },
      else: (pContext, context) => ({ pContext, context }),
    },
    askUsertoInput: (pContext, context) => {
      console.log('Input, please !!');
      return {
        pContext,
        context,
      };
    },
    insertData: (pContext, context, eventsMap) => {
      const check =
        typeof eventsMap === 'object' &&
        eventsMap.type === 'machine$$then';

      if (check) {
        context.data.push(...eventsMap.payload);
      }
      return { context, pContext };
    },
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
        events: 'full',
        contexts: { iterator: 'iterator' },
      },
    ),
  },
}));
// #endregion
