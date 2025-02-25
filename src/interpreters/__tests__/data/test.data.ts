import { t } from '@bemedev/types';
import { createMachine } from '~machine';
import { createConfig } from '~machines';
import { fakeDB } from './fakeDB';

export const DELAY = 60;

// #region machine1
export const machine1 = createMachine(
  {
    states: {
      idle: {
        activities: {
          DELAY: 'inc',
        },
        on: {
          NEXT: '/final',
        },
      },
      final: {},
    },
  },
  {
    eventsMap: {
      NEXT: {},
    },
    context: t.buildObject({ iterator: t.number }),
    pContext: t.object,
  },
  { '/': 'idle' },
);

machine1.addOptions(() => ({
  actions: {
    inc: (pContext, context) => {
      context.iterator++;
      return { context, pContext };
    },
  },
  delays: {
    DELAY,
  },
}));
// #endregion

// #region machine2
export const machine2 = createMachine(
  {
    machines: 'machine1',
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
);

machine2.addOptions(({ isNotValue, isValue, createChild }) => ({
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

export const config3 = createConfig({
  description: 'cdd',
  states: {
    state1: {
      states: {
        state11: {
          states: {
            state111: {},
          },
        },
        state12: {
          activities: {
            DELAY5: 'deal',
            DELAY17: 'deal17',
          },
        },
      },
    },
    state2: {
      after: {
        DELAY: { actions: ['dodo1', 'doré'] },
        DELAY2: '/state2',
        DELAY3: { actions: 'dodo2' },
      },
      on: {
        EVENT: { actions: ['dodo3', 'doré1'] },
        EVENT2: '/state4',
        EVENT3: { actions: 'dodo5' },
      },
      always: [
        { actions: 'dodo6', guards: 'guard2', target: '/state3' },
        {
          actions: ['dodo7', 'doré3', 'doré1'],
          guards: 'guard2',
          target: '/state3',
        },
        '/state1',
      ],
      promises: [
        {
          src: 'promise1',
          then: { actions: 'action1' },
          catch: [{ guards: 'ert', actions: 'action14' }, '/state1'],
          finally: [
            {
              actions: 'action13',
              guards: 'guar34',
            },
            {
              guards: 'guard4',
              actions: 'action13',
            },
            'action22',
          ],
        },
        {
          src: 'promise2',
          then: [
            { actions: 'action4', guards: 'guard2' },
            { actions: 'action3' },
          ],
          catch: [{ guards: 'ert', actions: 'action15' }, '/state1'],
          finally: [
            {
              guards: 'guard',
              actions: 'action12',
            },
            'action20',
          ],
        },
      ],
    },
  },
  machines: { description: 'A beautiful machine', name: 'machine1' },
});

export const machine3 = createMachine(
  config3,
  {
    pContext: { data: t.string },
    context: { age: t.number },
    eventsMap: {
      EVENT: { password: t.string, username: t.string },
      EVENT2: t.boolean,
      EVENT3: { login: t.string, pwd: t.string },
    },
  },
  { '/': 'state1', '/state1': 'state11', '/state1/state11': 'state111' },
);

export type Machine3 = typeof machine3;

export type Config3 = typeof config3;
