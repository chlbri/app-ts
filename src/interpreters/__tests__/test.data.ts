import { t } from '@bemedev/types';
import { createMachine } from '~machine';
import { createChildS } from '~machines';

export const fakeDB = [
  { _id: '01', name: 'Alice' },
  { _id: '02', name: 'Bob' },
  { _id: '03', name: 'Charlie' },
  { _id: '04', name: 'David' },
  { _id: '05', name: 'Eve' },
  { _id: '06', name: 'Frank' },
  { _id: '07', name: 'Grace' },
  { _id: '08', name: 'Hank' },
  { _id: '09', name: 'Ivy' },
  { _id: '10', name: 'Jack' },
  { _id: '11', name: 'Kathy' },
  { _id: '12', name: 'Leo' },
  { _id: '13', name: 'Mona' },
  { _id: '14', name: 'Nina' },
  { _id: '15', name: 'Oscar' },
  { _id: '16', name: 'Paul' },
  { _id: '17', name: 'Quincy' },
  { _id: '18', name: 'Rachel' },
  { _id: '19', name: 'Steve' },
  { _id: '20', name: 'Tracy' },
  { _id: '21', name: 'Uma' },
  { _id: '22', name: 'Victor' },
  { _id: '23', name: 'Wendy' },
  { _id: '24', name: 'Xander' },
  { _id: '25', name: 'Yara' },
  { _id: '26', name: 'Zane' },
];

export const DELAY = 60;

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
  {
    actions: {
      inc: (pContext, context) => {
        context.iterator++;
        return { context, pContext };
      },
    },
    delays: {
      DELAY,
    },
  },
);

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
                    actions: 'insertData',
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
    context: t.anify<{
      iterator: number;
      input: string;
      data: string[];
    }>(),
    pContext: t.anify<{ iterator: number }>(),
  },
  { '/': 'idle', '/working/fetch': 'idle', '/working/ui': 'idle' },
  {
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
      isInputNotEmpty: (_, context) => {
        return context.input !== '';
      },
      isInputEmpty: (_, context) => {
        return context.input === '';
      },
    },
    delays: {
      DELAY,
      DELAY2: 2 * DELAY,
    },
    promises: {
      fetch: async (_, { input }) => {
        return fakeDB.filter(item => item.name.includes(input));
      },
    },
    machines: {
      machine1: createChildS(
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
  },
);

// type TT = ContextFrom<typeof machine1> extends Ru ? true : false;
