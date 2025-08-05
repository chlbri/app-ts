import sleep from '@bemedev/sleep';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { returnFalse, returnTrue } from '~guards';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import {
  constructSend,
  constructValue,
  defaultC,
  defaultI,
  defaultT,
} from '../fixtures';

const DELAY = 1000;
const useWaiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

describe('promisee', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  describe('#01 => Promise is not defined', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            promises: {
              src: 'notDefined',
              then: {},
              catch: {},
              description: 'notDefined',
            },
          },
          active: {},
        },
      },
      defaultT,
      {
        ...defaultI,
        targets: {
          '/idle.promises.then': '/active',
          '/idle.promises.catch': '/active',
        },
      },
    );
    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });
    test(...useValue('idle', 2));
    test(...createFakeWaiter.all(vi)(3));
    test(...useValue('idle', 4));
  });

  describe('#02 => Promise rejects', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            promises: {
              src: 'rejectPromise',
              then: {},
              catch: {},
            },
          },
          active: {},
          inactive: {},
        },
      },
      defaultT,
      {
        ...defaultI,
        targets: {
          '/idle.promises.then': '/active',
          '/idle.promises.catch': '/inactive',
        },
      },
    );

    machine.addOptions(() => ({
      promises: {
        rejectPromise: () => Promise.reject(),
      },
    }));

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('inactive', 2));
  });

  describe('#03 => Promise resolves', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            promises: {
              src: 'resolvePromise',
              then: {},
              catch: {},
            },
          },
          active: {},
          inactive: {},
        },
      },
      defaultT,
      {
        ...defaultI,
        targets: {
          '/idle.promises.then': '/active',
          '/idle.promises.catch': '/inactive',
        },
      },
    );

    machine.addOptions(() => ({
      promises: {
        resolvePromise: () => Promise.resolve(),
      },
    }));

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('active', 2));
  });

  describe('#04 => cannotPerform', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            promises: {
              src: 'rejectPromise',
              then: {},
              catch: {},
            },
            on: {
              NEXT: {},
            },
          },
          active: {},
          active2: {},
          inactive: {},
        },
      },
      { ...defaultT, eventsMap: { NEXT: {} } },
      {
        ...defaultI,
        targets: {
          '/idle.promises.then': '/active',
          '/idle.promises.catch': '/inactive',
          '/idle.on.NEXT': '/active2',
        },
      },
    );

    machine.addOptions(() => ({
      promises: {
        rejectPromise: async () => {
          await sleep(DELAY * 2);
          return Promise.reject();
        },
      },
    }));

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);
    const useSend = constructSend(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('idle', 2));
    test(...useWaiter(3));
    test(...useSend('NEXT', 4));
    test(...useValue('active2', 5));
    test(...useWaiter(3, 2));
  });

  describe('#05 => with max', () => {
    // #region config
    const machine = createMachine(
      {
        states: {
          idle: {
            promises: {
              src: 'rejectPromise',
              then: {},
              catch: {},
              max: 'DELAY',
            },
          },
          active: {},
          inactive: {},
        },
      },
      defaultT,
      {
        ...defaultI,
        targets: {
          '/idle.promises.then': '/active',
          '/idle.promises.catch': '/inactive',
        },
      },
    );

    machine.addOptions(() => ({
      promises: {
        rejectPromise: async () => {
          await sleep(DELAY * 2);
          return Promise.reject();
        },
      },
    }));
    // #endregion

    describe('#01 => max is not defined', () => {
      const service = interpret(machine, defaultC);
      const useValue = constructValue(service);
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      const error = 'Delay (DELAY) is not defined';

      test('#01 => Start', () => {
        service.start();
      });

      test(...useValue('idle', 2));
      test(...useWaiter(3, 1));
      test(...useValue('idle', 4));
      test(...useWaiter(3, 2));
      test(...useValue('idle', 5));

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

      const service = interpret(machine, defaultC);
      const useValue = constructValue(service);

      test('#01 => Start', () => {
        service.start();
      });

      test(...useValue('idle', 2));
      test(...useWaiter(3, 1));
      test(...useValue('idle', 4));
      test(...useWaiter(3, 2));
      test(...useValue('idle', 5));
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
          states: {
            idle: {
              promises: {
                src: 'rejectPromise',
                then: {},
                catch: {},
                finally: 'finalAction',
              },
            },
            active: {},
          },
        },
        defaultT,
        {
          ...defaultI,
          targets: {
            '/idle.promises.then': '/active',
            '/idle.promises.catch': '/active',
          },
        },
      );

      machine.addOptions(() => ({
        promises: { rejectPromise },
        actions: {
          finalAction: () => {
            actionVi('finalAction');
            return {};
          },
        },
      }));

      const service = interpret(machine, defaultC);
      const useValue = constructValue(service);

      test('#01 => Start', () => {
        service.start();
      });

      test(...useValue('idle', 2));
      test(...useWaiter(3, 2));
      test(...useValue('active', 4));

      describe('#05 => actionVi is called one time', () => {
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
          states: {
            idle: {
              promises: {
                src: 'rejectPromise',
                then: {},
                catch: {},
                finally: { actions: 'finalAction', guards: 'guard' },
              },
            },
            active: {},
          },
        },
        defaultT,
        {
          ...defaultI,
          targets: {
            '/idle.promises.then': '/active',
            '/idle.promises.catch': '/active',
          },
        },
      );

      const actionVi = vi.fn();
      const guard = vi.fn(returnFalse);
      machine.addOptions(() => ({
        promises: { rejectPromise },
        predicates: { guard },
        actions: {
          finalAction: () => {
            actionVi('finalAction');
            return {};
          },
        },
      }));

      describe('#01 => Transition not pass', () => {
        afterAll(() => {
          actionVi.mockClear();
          guard.mockClear();
        });

        const service = interpret(machine, defaultC);
        const useValue = constructValue(service);

        test('#01 => Start', () => {
          service.start();
        });

        test(...useValue('idle', 2));
        test(...useWaiter(3, 2));
        test(...useValue('active', 4));

        test('#05 => guard is called one time', () => {
          expect(guard).toHaveBeenCalledTimes(1);
        });

        test('#06 => actionVi is not called', () => {
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

        machine.addOptions(() => ({
          promises: { rejectPromise },
          predicates: { guard },
          actions: {
            finalAction: () => {
              actionVi('finalAction');
              return {};
            },
          },
        }));

        const service = interpret(machine, defaultC);
        const useValue = constructValue(service);

        test('#01 => Start', () => {
          service.start();
        });

        test(...useValue('idle', 2));
        test(...useWaiter(3, 2));
        test(...useValue('active', 4));

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

  describe('#07 => Getters', () => {});
});
