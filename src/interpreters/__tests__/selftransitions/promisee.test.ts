import { constructTests, defaultC } from '#fixtures';
import { returnFalse, returnTrue } from '#guards';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import sleep from '@bemedev/sleep';

const DELAY = 1000;

const fixtureTypings = <const T extends string>(value: T) =>
  typings({
    actorsMap: {
      promisees: {
        [value]: {
          then: 'primitive',
          catch: 'primitive',
        },
      } as Record<T, { then: 'primitive'; catch: 'primitive' }>,
    },
  });

describe('promisee', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('#01 => Promise is not defined', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            actors: {
              src: 'notDefined',
              then: '/active',
              catch: '/active',
              description: 'notDefined',
            },
          },
          active: {},
        },
      },
      fixtureTypings('notDefined'),
    );
    const service = interpret(machine);

    const { start, useWaiter, useStateValue } = constructTests(
      service,
      ({ waiter }) => ({
        useWaiter: waiter(0),
      }),
    );

    test(...start());
    test(...useStateValue('idle'));
    test(...useWaiter());
    test(...useStateValue('idle'));
  });

  describe('#02 => Promise rejects', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            actors: {
              src: 'rejectPromise',
              then: '/active',
              catch: '/inactive',
            },
          },
          active: {},
          inactive: {},
        },
      },
      fixtureTypings('rejectPromise'),
    );

    machine.addOptions(() => ({
      actors: {
        promises: {
          rejectPromise: () => Promise.reject(),
        },
      },
    }));

    const service = interpret(machine, defaultC);
    const { start, useStateValue } = constructTests(service);
    test(...start());
    test(...useStateValue('inactive'));
  });

  describe('#03 => Promise resolves', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            actors: {
              src: 'resolvePromise',
              then: '/active',
              catch: '/inactive',
            },
          },
          active: {},
          inactive: {},
        },
      },
      fixtureTypings('resolvePromise'),
    );

    machine.addOptions(() => ({
      actors: {
        promises: {
          resolvePromise: () => Promise.resolve({}),
        },
      },
    }));

    const service = interpret(machine);
    const { start, useStateValue } = constructTests(service);
    test(...start());
    test(...useStateValue('active'));
  });

  describe('#04 => cannotPerform', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            actors: {
              src: 'rejectPromise',
              then: '/active',
              catch: '/inactive',
            },
            on: {
              NEXT: '/active2',
            },
          },
          active: {},
          active2: {},
          inactive: {},
        },
      },
      typings({
        actorsMap: {
          promisees: {
            rejectPromise: {
              then: 'primitive',
              catch: 'primitive',
            },
          },
        },
        eventsMap: {
          NEXT: 'primitive',
        },
      }),
    );

    machine.addOptions(() => ({
      actors: {
        promises: {
          rejectPromise: async () => {
            await sleep(DELAY * 2);
            return Promise.reject();
          },
        },
      },
    }));

    const service = interpret(machine);

    const { start, useStateValue, send, useWaiter } = constructTests(
      service,
      ({ waiter }) => ({
        useWaiter: waiter(DELAY),
      }),
    );

    test(...start());
    test(...useStateValue('idle'));
    test(...useWaiter());
    test(...send('NEXT'));
    test(...useStateValue('active2'));
    test(...useWaiter(3));
  });

  describe('#05 => with max', () => {
    // #region config
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            actors: {
              src: 'rejectPromise',
              then: '/active',
              catch: '/inactive',
              max: 'DELAY',
            },
          },
          active: {},
          inactive: {},
        },
      },
      fixtureTypings('rejectPromise'),
    );

    machine.addOptions(() => ({
      actors: {
        promises: {
          rejectPromise: async () => {
            await sleep(DELAY * 2);
            return Promise.reject();
          },
        },
      },
    }));
    // #endregion

    describe('#01 => max is not defined', () => {
      const service = interpret(machine);

      const { start, useStateValue, useWaiter } = constructTests(
        service,
        ({ waiter }) => ({
          useWaiter: waiter(DELAY),
        }),
      );

      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      const error = 'Delay (DELAY) is not defined';

      test(...start());
      test(...useStateValue('inactive'));
      test(...useWaiter(3));
      test(...useStateValue('inactive'));
      test(...useWaiter(3));
      test(...useStateValue('inactive'));

      describe('#06 => Error is throwing', () => {
        test('#01 => Length of collector is one', () => {
          expect(service._warningsCollector).toHaveLength(1);
        });

        test('#02 => Contain the error', () => {
          expect(service._warningsCollector).toContain(error);
        });

        describe('#03 => console.log', () => {
          test('#01 => called one time', () => {
            expect(log).toBeCalledTimes(1);
          });

          test('#02 => called with the error', () => {
            expect(log).toHaveBeenNthCalledWith(1, error);
          });
        });
      });

      afterAll(() => {
        log.mockClear();
      });
    });

    describe('#01 => max is defined', () => {
      machine.addOptions(() => ({
        delays: { DELAY },
      }));

      const service = interpret(machine);

      const { start, useStateValue, useWaiter } = constructTests(
        service,
        ({ waiter }) => ({
          useWaiter: waiter(DELAY),
        }),
      );

      test(...start());
      test(...useStateValue('idle'));
      test(...useWaiter(3));
      test(...useStateValue('inactive'));
      test(...useWaiter(3));
      test(...useStateValue('inactive'));
    });
  });

  describe('#06 => With finally', () => {
    const rejectPromise = async () => {
      await sleep(DELAY * 2);
      return Promise.reject();
    };

    describe('#01 => Simple finally', () => {
      const actionVi = vi.fn();
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              actors: {
                src: 'rejectPromise',
                then: '/active',
                catch: '/inactive',
                finally: 'finalAction',
              },
            },
            active: {},
            inactive: {},
          },
        },
        fixtureTypings('rejectPromise'),
      );

      machine.addOptions(({ voidAction }) => ({
        actors: {
          promises: { rejectPromise },
        },
        actions: {
          finalAction: voidAction(() => actionVi('finalAction')),
        },
      }));

      const service = interpret(machine, defaultC);

      const { start, useStateValue, useWaiter } = constructTests(
        service,
        ({ waiter }) => ({
          useWaiter: waiter(DELAY),
        }),
      );

      test(...start());
      test(...useStateValue('idle'));
      test(...useWaiter(3));
      test(...useStateValue('inactive'));

      describe('#04 => actionVi is called one time', () => {
        test('#01 => Called one time', () => {
          expect(actionVi).toHaveBeenCalledTimes(1);
        });

        test('#02 => Called with finalAction', () => {
          expect(actionVi).toHaveBeenNthCalledWith(1, 'finalAction');
        });
      });
    });

    describe('#02 => Transition finally', () => {
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              actors: {
                src: 'rejectPromise',
                then: '/active',
                catch: '/active',
                finally: { actions: 'finalAction', guards: 'guard' },
              },
            },
            active: {},
          },
        },
        fixtureTypings('rejectPromise'),
      );

      const actionVi = vi.fn();
      const guard = vi.fn(returnFalse);

      machine.addOptions(({ voidAction }) => ({
        actors: {
          promises: { rejectPromise },
        },
        predicates: { guard },
        actions: {
          finalAction: voidAction(() => actionVi('finalAction')),
        },
      }));

      describe('#01 => Transition not pass', () => {
        afterAll(() => {
          actionVi.mockClear();
          guard.mockClear();
        });

        const service = interpret(machine);

        const { start, useStateValue, useWaiter } = constructTests(
          service,
          ({ waiter }) => ({
            useWaiter: waiter(DELAY),
          }),
        );

        test(...start());
        test(...useStateValue('idle'));
        test(...useWaiter(3));
        test(...useStateValue('active'));

        test('#04 => guard is called one time', () => {
          expect(guard).toHaveBeenCalledTimes(1);
        });

        test('#05 => actionVi is not called', () => {
          expect(actionVi).not.toBeCalled();
        });
      });

      describe('#02 => Transition  pass', () => {
        beforeAll(() => {
          guard.mockImplementation(returnTrue);
        });

        afterAll(() => {
          actionVi.mockClear();
          guard.mockClear();
        });

        const service = interpret(machine, defaultC);

        const { start, useStateValue, useWaiter } = constructTests(
          service,
          ({ waiter }) => ({
            useWaiter: waiter(DELAY),
          }),
        );

        test(...start());
        test(...useStateValue('idle'));
        test(...useWaiter(3));
        test(...useStateValue('active'));

        test('#05 => guard is called one time', () => {
          expect(guard).toHaveBeenCalledTimes(1);
        });

        describe('#05 => actionVi is called one time', () => {
          test('#01 => Called one time', () => {
            expect(actionVi).toHaveBeenCalledTimes(1);
          });

          test('#02 => Called with finalAction', () => {
            expect(actionVi).toHaveBeenNthCalledWith(1, 'finalAction');
          });
        });
      });
    });
  });
});
