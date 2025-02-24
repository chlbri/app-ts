import sleep from '@bemedev/sleep';
import { createFakeWaiter } from '@bemedev/vitest-extended';
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
              then: '/active',
              catch: '/active',
            },
          },
          active: {},
        },
      },
      defaultT,
      defaultI,
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
              then: '/active',
              catch: '/inactive',
            },
          },
          active: {},
          inactive: {},
        },
      },
      defaultT,
      defaultI,
    );

    machine.addPromises({
      rejectPromise: () => Promise.reject(),
    });

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
              then: '/active',
              catch: '/inactive',
            },
          },
          active: {},
          inactive: {},
        },
      },
      defaultT,
      defaultI,
    );

    machine.addPromises({
      resolvePromise: () => Promise.resolve(),
    });

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
      { ...defaultC, eventsMap: { NEXT: {} } },
      defaultI,
    );

    machine.addPromises({
      rejectPromise: async () => {
        await sleep(DELAY * 2);
        return Promise.reject();
        // throw undefined;
      },
    });

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
              then: '/active',
              catch: '/inactive',
              max: 'DELAY',
            },
          },
          active: {},
          inactive: {},
        },
      },
      defaultT,
      defaultI,
    );

    machine.addPromises({
      rejectPromise: async () => {
        await sleep(DELAY * 2);
        return Promise.reject();
        // throw undefined;
      },
    });
    // #endregion

    describe('#01 => max is not defined', () => {
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

    describe('#01 => max is defined', () => {
      machine.addDelays({ DELAY });

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
      // throw undefined;
    };

    describe('#01 => Simple finally', () => {
      const actionVi = vi.fn();
      const machine = createMachine(
        {
          states: {
            idle: {
              promises: {
                src: 'rejectPromise',
                then: '/active',
                catch: '/active',
                finally: 'finalAction',
              },
            },
            active: {},
          },
        },
        defaultT,
        defaultI,
      );

      machine.addPromises({ rejectPromise });

      machine.addActions({
        finalAction: () => {
          actionVi('finalAction');
          return {};
        },
      });

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
                then: '/active',
                catch: '/active',
                finally: { actions: 'finalAction', guards: 'guard' },
              },
            },
            active: {},
          },
        },
        defaultT,
        defaultI,
      );

      const actionVi = vi.fn();
      const guard = vi.fn(() => false);
      machine.addPromises({ rejectPromise });
      machine.addPredicates({ guard });
      machine.addActions({
        finalAction: () => {
          actionVi('finalAction');
          return {};
        },
      });

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
          guard.mockImplementation(() => true);
        });

        afterAll(() => {
          actionVi.mockClear();
          guard.mockClear();
        });

        machine.addPredicates({ guard });

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
});
