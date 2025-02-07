import { t } from '@bemedev/types';
import { createMachine } from '~machine';
import { interpret } from '../interpreter';
import { fakeDB } from './activities.test.data';

const fakeWaiter = async (ms = 0, times = 1) => {
  for (let i = 0; i < times; i++) {
    await vi.advanceTimersByTimeAsync(ms);
  }
};

const DELAY = 170;

const log = vi.spyOn(console, 'log');
beforeAll(() => {
  vi.useFakeTimers();
});

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
    },
  );

  const service2 = interpret(machine2, {
    pContext: {},
    context: { iterator: 0, input: '', data: [] },
  });

  test('#00 => start the service', () => {
    service2.start();
    expect(service2.context.iterator).toBe(0);
  });

  test('#01 => Await one delay -> iterator = 1', async () => {
    await fakeWaiter(DELAY);
    expect(log).not.toBeCalled();
    expect(service2.context.iterator).toBe(1);
  });

  test('#02 => Send Next', () => {
    service2.send({ type: 'NEXT', payload: {} });
  });

  describe('#03 => Await twice delay', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 2));

    test('#01 => iterator = 5', async () => {
      expect(service2.context.iterator).toBe(5);
    });

    describe('#02 => console.log is called', () => {
      test('#01 => console.log is called', () => {
        expect(log).toBeCalled();
      });

      test('#02 => console.log is called with sendPanelToUser twice', () => {
        expect(log).toHaveBeenNthCalledWith(2, 'sendPanelToUser');
        expect(log).toHaveBeenCalledTimes(2);
        log.mockClear();
      });
    });
  });

  describe('#04 => Await four delays', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 4));

    test('#01 => iterator = 13', async () => {
      expect(service2.context.iterator).toBe(13);
    });

    describe('#02 => console.log is called', () => {
      test('#01 => console.log is called', () => {
        expect(log).toBeCalled();
      });

      test('#02 => console.log is called with sendPanelToUser 4 times', () => {
        expect(log).toHaveBeenNthCalledWith(4, 'sendPanelToUser');
        expect(log).toHaveBeenCalledTimes(4);
        log.mockClear();
      });
    });
  });

  test('#05 => Send WRITE', () => {
    service2.send({ type: 'WRITE', payload: { value: 'a' } });
  });

  describe('#06 => Context input is modified', () => {
    test('#01 => input is not empty', () => {
      expect(service2.context.input).toBeDefined();
      expect(service2.context.input).not.toBe('');
    });

    test('#02 => input = a', () => {
      expect(service2.context.input).toBe('a');
    });
  });

  describe('#07 => Await four delays', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 4));

    test('#01 => iterator = 13', async () => {
      expect(service2.context.iterator).toBe(21);
    });

    describe('#02 => console.log is called', () => {
      test('#01 => console.log is called', () => {
        expect(log).toBeCalled();
      });

      test('#02 => console.log is called with sendPanelToUser 4 times', () => {
        expect(log).toHaveBeenNthCalledWith(4, 'sendPanelToUser');
        expect(log).toHaveBeenCalledTimes(4);
        log.mockClear();
      });
    });
  });

  test('#08 => Send FETCH', async () => {
    service2.send('FETCH');
  });

  test('#09 => Wait for promise', () => fakeWaiter());

  describe('#10 => Data is inserted', () => {
    test('#01 => Data is not empty', () => {
      expect(service2.context.data).toBeDefined();
      expect(service2.context.data).not.toHaveLength(0);
    });

    test('#02 => Data has length of 17', () => {
      expect(service2.context.data).toHaveLength(17);
    });

    test('#03 => Data has the right values', () => {
      const expected = fakeDB.filter(item => item.name.includes('a'));
      expect(service2.context.data).toStrictEqual(expected);
    });
  });

  describe('#10 => Await four delays', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 4));

    test('#01 => iterator = 13', async () => {
      expect(service2.context.iterator).toBe(29);
    });

    test('#02 => console.log is not called', () => {
      expect(log).not.toBeCalled();
    });
  });

  test('#11 => Send WRITE', () => {
    service2.send({ type: 'WRITE', payload: { value: '' } });
  });

  test('#12 => Send WRITE again', () => {
    service2.send({ type: 'WRITE', payload: { value: '' } });
  });

  describe('#13 => Await four delays', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 4));

    test('#01 => iterator = 13', async () => {
      expect(service2.context.iterator).toBe(37);
    });

    describe('#02 => console.log is called', () => {
      test('#01 => console.log is called', () => {
        expect(log).toBeCalled();
      });

      test('#02 => console.log is called with sendPanelToUser 4 times', () => {
        expect(log).toHaveBeenCalledTimes(4);
        expect(log).toHaveBeenNthCalledWith(4, 'Input, please !!');
        log.mockClear();
      });
    });
  });

  test('#14 => Pause the service', () => {
    service2.pause();
  });
});
