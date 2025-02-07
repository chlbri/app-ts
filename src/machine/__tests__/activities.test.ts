import { t } from '@bemedev/types';
import { createMachine } from '~machine';
import { interpret } from '../interpreter';
import { fakeDB } from './activities.test.data';

const fakeWaiter = (ms = 0, times = 1) => {
  const waiterTime = ms * times;
  return vi.advanceTimersByTimeAsync(waiterTime);
};

const DELAY = 170;

vi.useFakeTimers();

describe('#1 => First state has activity', () => {
  const machine1 = createMachine(
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

  const service1 = interpret(machine1, {
    pContext: {},
    context: { iterator: 0 },
  });

  test('#0 => start the service', () => {
    service1.start();
    expect(service1.context.iterator).toBe(0);
  });

  test('#1 => Await one delay -> iterator = 1', async () => {
    await fakeWaiter(DELAY);
    expect(service1.context.iterator).toBe(1);
  });

  test('#2 => Await one delay -> iterator = 2', async () => {
    await fakeWaiter(DELAY);
    expect(service1.context.iterator).toBe(2);
  });

  test('#3 => Await twice delay -> iterator = 4', async () => {
    await fakeWaiter(DELAY, 2);
    expect(service1.context.iterator).toBe(4);
  });

  test('#4 => Await six times delay -> iterator = 10', async () => {
    await fakeWaiter(DELAY, 6);
    expect(service1.context.iterator).toBe(10);
  });

  test('#5 => Send NEXT and await 3 times -> iterator = 10, remains the same', async () => {
    service1.send({ type: 'NEXT', payload: {} });
    await fakeWaiter(DELAY, 3);
    expect(service1.context.iterator).toBe(10);
  });
});

describe('#2 => Complex', () => {
  const machine2 = createMachine(
    {
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
                      '/working/ui/final',
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
      context: t.buildObject({
        iterator: t.number,
        input: t.string,
        data: t.array(t.string),
      }),
      pContext: t.object,
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
        insertData: (pContext, context) => {
          context.data.push(context.input);
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
    },
  );

  const service2 = interpret(machine2, {
    pContext: {},
    context: { iterator: 0, input: '', data: [] },
  });

  test('#0 => start the service', () => {
    service2.start();
    expect(service2.context.iterator).toBe(0);
  });

  test('#1 => Await one delay -> iterator = 1', async () => {
    await fakeWaiter(DELAY);
    expect(service2.context.iterator).toBe(1);
  });

  test('#2 => Send Next', () => {
    service2.send({ type: 'NEXT', payload: {} });
  });

  test('#3 => Await twice delays -> iterator = 5', async () => {
    await fakeWaiter(DELAY, 2);
    expect(service2.context.iterator).toBe(5);
  });

  test('#4 => Await four delays -> iterator = 13', async ({ expect }) => {
    await fakeWaiter(DELAY, 4);
    expect(service2.context.iterator).toBe(13);
  });

  test('#5 => Send WRITE', () => {
    service2.send({ type: 'WRITE', payload: { value: 'a' } });
  });

  describe('#6 => Context input is modified', () => {
    test('#1 => input is not empty', () => {
      expect(service2.context.input).toBeDefined();
      expect(service2.context.input).not.toBe('');
    });

    test('#2 => input = a', () => {
      expect(service2.context.input).toBe('a');
    });
  });

  test.todo('#4 => Await four delays -> iterator = 13', async () => {
    await fakeWaiter(DELAY, 4);
    expect(service2.context.iterator).toBe(21);
  });
});
