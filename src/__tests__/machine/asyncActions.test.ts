import { createMachine } from '#machine';
import { interpret } from '#interpreter';
import { typings } from '#utils';

vi.useFakeTimers();

describe('Machine createOptions - error handlers', () => {
  describe('#01 => assign', () => {
    const theError = 'assign error';

    describe('#01 => calls errorFn when fn throws', () => {
      const errorFn = vi.fn((state: any) => state);

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ assign }) => ({
        actions: {
          myAction: assign(
            'context',
            {
              TEST: async () => {
                throw theError;
              },
            },
            { error: errorFn },
          ),
        },
      }));

      const service = interpret(machine, {
        context: 42,
      });

      test('#01 => service is ready', () => {
        expect(service).toBeDefined();
        expect(service.isReady).toBe(true);
      });

      test('#02 => send event without throwing', async () => {
        await service.send('TEST');
      });

      test('#03 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });

      test('#04 => errorFn receives the thrown error as first arg', () => {
        expect(errorFn).toHaveBeenCalledWith({
          context: 42,
          pContext: undefined,
          payload: 'assign error',
          status: 'busy',
          tags: undefined,
          value: 'idle',
        });
      });
    });

    describe('#02 => errorFn return value affects the state', () => {
      const errorFn = vi.fn((state: any) => ({
        ...state,
        context: -1,
      }));

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ assign }) => ({
        actions: {
          myAction: assign(
            'context',
            async () => {
              throw theError;
            },
            { error: errorFn },
          ),
        },
      }));

      const service = interpret(machine, {
        context: 42,
      });

      test('#01 => error handler modifies context', async () => {
        await service.send('TEST');
        expect(service.context).toEqual({
          context: -1,
          pContext: undefined,
          payload: 'assign error',
          status: 'busy',
          tags: undefined,
          value: 'idle',
        });
      });

      test('#02 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });
    });

    describe('#03 => with max defined, still calls errorFn when fn throws', () => {
      const errorFn = vi.fn((state: any) => state);

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ assign }) => ({
        actions: {
          myAction: assign(
            'context',
            async () => {
              throw theError;
            },
            { error: errorFn, max: 5000 },
          ),
        },
      }));

      const service = interpret(machine, {
        context: 7,
      });

      test('#01 => send event without throwing', async () => {
        await service.send('TEST');
      });

      test('#02 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });
    });
  });

  describe('#02 => voidAction', () => {
    const theError = 'void error';

    describe('#01 => calls errorFn when fn throws', () => {
      const errorFn = vi.fn(() => theError);

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ voidAction }) => ({
        actions: {
          myAction: voidAction(
            async () => {
              throw theError;
            },
            { error: errorFn },
          ),
        },
      }));

      const service = interpret(machine, {
        context: 10,
      });

      test('#01 => service is ready', () => {
        expect(service).toBeDefined();
        expect(service.isReady).toBe(true);
      });

      test('#02 => send event without throwing', async () => {
        await service.send('TEST');
      });

      test('#03 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });

      test('#04 => errorFn receives the thrown error as first arg', () => {
        expect(errorFn).toHaveBeenCalledWith({
          context: 10,
          pContext: undefined,
          payload: 'void error',
          status: 'busy',
          tags: undefined,
          value: 'idle',
        });
      });

      test('#05 => errorFn receives context snapshot as second arg', () => {
        expect(errorFn).toHaveReturnedWith(theError);
      });
    });

    describe('#02 => errorFn return value affects the state', () => {
      const errorFn = vi.fn((state: any) => ({
        ...state,
        context: -99,
      }));

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ voidAction }) => ({
        actions: {
          myAction: voidAction(
            async ({ event }) => {
              console.log('Event that caused the error:', event);
              throw theError;
            },
            { error: errorFn },
          ),
        },
      }));

      const service = interpret(machine, {
        context: 10,
      });

      test("#01 => error handler doesn't modify context", async () => {
        await service.send('TEST');
        expect(service.context).toEqual(10);
      });

      test('#02 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });
    });

    describe('#03 => with max defined, still calls errorFn when fn throws', () => {
      const errorFn = vi.fn((state: any) => state);

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ voidAction }) => ({
        actions: {
          myAction: voidAction(
            {
              TEST: async () => {
                throw theError;
              },
            },
            { error: errorFn, max: 5000 },
          ),
        },
      }));

      const service = interpret(machine, {
        context: 3,
      });

      test('#01 => send event without throwing', async () => {
        await service.send('TEST');
      });

      test('#02 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });
    });

    describe('#03 => NO error', () => {
      const theData = { message: 'Success' };
      const passFn = vi.fn(async data => console.log(data));

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ voidAction }) => ({
        actions: {
          myAction: voidAction(
            {
              TEST: () => passFn(theData),
            },
            { error: () => ({}), max: 5000 },
          ),
        },
      }));

      const service = interpret(machine, {
        context: 3,
      });

      test('#01 => send event without throwing', () => {
        return service.send('TEST');
      });

      test('#02 => errorFn is called once', () => {
        expect(passFn).toHaveBeenCalledOnce();
      });

      test('#03 => errorFn receives the thrown error', () => {
        expect(passFn).toHaveBeenCalledWith(theData);
      });
    });
  });

  describe('#03 => sendTo', () => {
    const payload = 'sendTo error';
    const state = {
      context: 5,
      pContext: undefined,
      payload,
      status: 'busy',
      tags: undefined,
      value: 'idle',
    };

    describe('#01 => calls errorFn when fn throws', () => {
      const errorFn = vi.fn((state: any) => state);

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ sendTo }) => {
        const _sendTo = sendTo();
        return {
          actions: {
            myAction: _sendTo(
              async () => {
                throw payload;
              },
              { error: errorFn },
            ),
          },
        };
      });

      const service = interpret(machine, {
        context: state.context,
      });

      test('#01 => service is ready', () => {
        expect(service).toBeDefined();
        expect(service.isReady).toBe(true);
      });

      test('#02 => send event without throwing', async () => {
        await service.send('TEST');
      });

      test('#03 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });

      test('#04 => errorFn receives the thrown error as first arg', () => {
        expect(errorFn).toHaveBeenCalledWith(state);
      });

      test('#05 => errorFn receives context snapshot as second arg', () => {
        expect(errorFn).toHaveNthReturnedWith(1, state);
      });
    });

    describe('#02 => errorFn return value affects the state', () => {
      const errorFn = vi.fn((state: any) => ({
        ...state,
        context: 0,
      }));

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ sendTo }) => ({
        actions: {
          myAction: sendTo()(
            async () => {
              throw payload;
            },
            { error: errorFn },
          ),
        },
      }));

      const service = interpret(machine, {
        context: state.context,
      });

      test("#01 => error handler doesn't modify context", async () => {
        await service.send('TEST');
        expect(service.context).toEqual(state.context);
      });

      test('#02 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });
    });

    describe('#03 => with max defined, still calls errorFn when fn throws', () => {
      const errorFn = vi.fn(() => payload);

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TEST: {
                  target: 'idle',
                  actions: 'myAction',
                },
              },
            },
          },
        },
        typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
      ).provideOptions(({ sendTo }) => ({
        actions: {
          myAction: sendTo()(
            async () => {
              throw payload;
            },
            { error: errorFn, max: 5000 },
          ),
        },
      }));

      const service = interpret(machine, {
        context: 1,
      });

      test('#01 => send event without throwing', async () => {
        await service.send('TEST');
      });

      test('#02 => errorFn is called once', () => {
        expect(errorFn).toHaveBeenCalledOnce();
      });

      test('#03 => errorFn receives the thrown error', () => {
        expect(errorFn).toHaveNthReturnedWith(1, payload);
      });
    });
  });
});
