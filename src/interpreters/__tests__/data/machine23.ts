import { createMachine } from '#machine';
import { toFunction } from '#utils';
import { machine2 } from './machine2';

// #region machine23
export const machine23 = createMachine(
  {
    initial: 'idle',
    entry: 'debounce',
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
                machines: {
                  machine1: {
                    name: 'machine1',
                    description: 'A beautiful machine',
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
    eventsMap: machine2.eventsMap,
    context: machine2.context,
    pContext: machine2.pContext,
    promiseesMap: machine2.promiseesMap,
  },
)
  .provideOptions(toFunction<any>(machine2.options))
  .provideOptions(({ debounce: _debounce, assign }) => ({
    actions: {
      debounce: _debounce(
        assign('context.iterator', () => {
          console.log('Debounced action executed');
          return 1000;
        }),
        { ms: 10_000, id: 'debounce-action' },
      ),
    },
  }));
