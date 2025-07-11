import { createFakeWaiter } from '@bemedev/vitest-extended';
import {
  DEFAULT_MAX_TIME_PROMISE,
  DEFAULT_MIN_ACTIVITY_TIME,
} from '~constants';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import { constructSend, constructValue, defaultC } from '../fixtures';

describe('Interpreter integration ofr activities coverage', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  const DELAY = 1000;
  const activity1 = vi.fn().mockReturnValue(defaultC);
  const useWaiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

  describe('#01 => delay is not defined', () => {
    afterAll(() => {
      activity1.mockClear();
    });

    const machine = createMachine(
      {
        states: {
          state1: {
            activities: { DELAY: 'activity1' },
            on: {
              NEXT: '/state2',
            },
          },
          state2: {
            on: {
              NEXT: '/state1',
            },
          },
        },
      },
      { ...defaultC, eventsMap: { NEXT: {} }, promiseesMap: {} },
      { '/': 'state1' },
    );

    machine.addOptions(() => ({
      actions: {
        activity1,
      },
    }));

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);
    const useSendNext = (index: number) =>
      constructSend(service)('NEXT', index);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('state1', 2));

    describe('#03 => Check the warnings', () => {
      test('#01 => Length of warnings', () => {
        expect(service._warningsCollector?.size).toBe(1);
      });

      test('#02 => Check the warning', () => {
        expect(service._warningsCollector).toContain(
          'Delay (DELAY) is not defined',
        );
      });
    });

    test('#04 => activity1 is not called', () => {
      expect(activity1).not.toBeCalled();
    });

    test(...useSendNext(5));

    test(...useValue('state2', 6));

    test('#07 => add delay', () => {
      service.addOptions(() => ({
        delays: { DELAY },
      }));
    });

    test(...useSendNext(8));

    test(...useValue('state1', 9));

    test(...useWaiter(11));

    describe('#11 => Check Activity', () => {
      test('#01 => activity1 is called one time', () => {
        expect(activity1).toHaveBeenCalledTimes(1);
      });

      test('#02 => activity1 is called with correct params', () => {
        expect(activity1).toHaveBeenCalledWith({
          pContext: {},
          context: {},
          event: { type: 'NEXT', payload: {} },
          status: 'busy',
          tags: undefined,
          value: 'state1',
        });
      });
    });
  });

  describe('#02 => Duration', () => {
    const machine = createMachine(
      {
        states: {
          state1: {
            activities: { DELAY: 'activity1' },
            on: {
              NEXT: '/state2',
            },
          },
          state2: {
            on: {
              NEXT: '/state1',
            },
          },
        },
      },
      { ...defaultC, eventsMap: { NEXT: {} }, promiseesMap: {} },
      { '/': 'state1' },
    );

    machine.addOptions(() => ({
      actions: {
        activity1,
      },
    }));

    describe('01 => Delay is too short', () => {
      afterAll(() => {
        activity1.mockClear();
      });

      machine.addOptions(() => ({
        actions: {
          activity1,
        },
        delays: {
          DELAY: DEFAULT_MIN_ACTIVITY_TIME / 2,
        },
      }));

      const service = interpret(machine, defaultC);
      const useValue = constructValue(service);

      test('#01 => Start', () => {
        service.start();
      });

      test(...useValue('state1', 2));

      test('#03 => activity1 is not called', () => {
        expect(activity1).not.toBeCalled();
      });

      describe('#04 => Check the warnings', () => {
        test('#01 => Length of warnings', () => {
          expect(service._warningsCollector?.size).toBe(1);
        });

        test('#02 => Check the warning', () => {
          expect(service._warningsCollector).toContain(
            'Delay (DELAY) is too short',
          );
        });
      });
    });

    describe('02 => Delay is too long', () => {
      afterAll(() => {
        activity1.mockClear();
      });

      machine.addOptions(() => ({
        actions: {
          activity1,
        },
        delays: {
          DELAY: DEFAULT_MAX_TIME_PROMISE * 1.5,
        },
      }));

      const service = interpret(machine, defaultC);
      const useValue = constructValue(service);

      test('#01 => Start', () => {
        service.start();
      });

      test(...useValue('state1', 2));

      test('#03 => activity1 is not called', () => {
        expect(activity1).not.toBeCalled();
      });

      describe('#04 => Check the warnings', () => {
        test('#01 => Length of warnings', () => {
          expect(service._warningsCollector?.size).toBe(1);
        });

        test('#02 => Check the warning', () => {
          expect(service._warningsCollector).toContain(
            'Delay (DELAY) is too long',
          );
        });
      });

      test('#05 => Stop the service', () => {
        service.stop();
      });

      test(...createFakeWaiter.all(vi)(6, DEFAULT_MAX_TIME_PROMISE * 2));
    });
  });

  describe('03 => Cannot perform', () => {
    const activity2 = vi.fn().mockReturnValue(defaultC);
    const machine = createMachine(
      {
        states: {
          state1: {
            activities: { DELAY: 'activity2' },
            on: {
              NEXT: '/state2',
            },
          },
          state2: {
            on: {
              NEXT: '/state1',
            },
          },
        },
      },
      { ...defaultC, eventsMap: { NEXT: {} }, promiseesMap: {} },
      { '/': 'state1' },
    );

    machine.addOptions(() => ({
      actions: {
        activity2,
      },
      delays: {
        DELAY: () => DELAY * 2,
      },
    }));

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);
    const useSendNext = (index: number) =>
      constructSend(service)('NEXT', index);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('state1', 2));
    test(...useWaiter(5));
    test('#06 => activity2 is not called', () => {
      expect(activity2).not.toBeCalled();
    });
    test(...useValue('state1', 7));
    test(...useSendNext(8));
    test(...useValue('state2', 9));
    test(...useSendNext(10));
    test(...useValue('state1', 11));
    test(...useWaiter(12, 3));
    describe('#13 => Check Activity', () => {
      test('#01 => activity2 is called one time', () => {
        expect(activity2).toHaveBeenCalledTimes(1);
      });

      test('#02 => activity2 is called with correct params', () => {
        expect(activity2).toHaveBeenCalledWith({
          pContext: {},
          context: {},
          event: { type: 'NEXT', payload: {} },
          status: 'busy',
          tags: undefined,
          value: 'state1',
        });
      });
    });
  });
});
