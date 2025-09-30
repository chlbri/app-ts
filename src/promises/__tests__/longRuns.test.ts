import { interpret } from '#interpreter';
import { createMachine } from '#machines';
import { typings } from '#utils';
import sleep from '@bemedev/sleep';
import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { createFakeWaiter } from '@bemedev/vitest-extended';

describe('Tests for longrun promises', () => {
  const DELAY = 450_000;
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  afterAll(() => {
    log.mockRestore();
  });

  describe('#01 => Has longRuns', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        __longRuns: true,
        states: {
          idle: {
            on: {
              NEXT: '/promise',
            },
          },
          promise: {
            promises: {
              src: 'longRunTask',
              then: '/success',
              catch: '/failure',
            },
          },
          success: {
            entry: 'notifySuccess',
          },
          failure: {
            entry: 'notifyFailure',
          },
        },
      },
      typings({
        eventsMap: { NEXT: 'primitive' },
      }),
    ).provideOptions(({ voidAction }) => ({
      promises: {
        longRunTask: () => sleep(DELAY * 2),
      },
      actions: {
        notifySuccess: voidAction(() => console.log('Success!')),
        notifyFailure: voidAction(() => console.log('Failure!')),
      },
    }));

    const service = interpret(machine);

    // #region Hooks

    beforeAll(() => {
      vi.useFakeTimers();
      log.mockClear();
    });

    const useWaiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

    const strings: (string | string[])[] = [];
    const useConsole = (
      index: number,
      ..._strings: (string | string[])[]
    ) => {
      const inviteStrict = `#02 => Check strict string`;

      const strict = () => {
        const calls = strings.map(data => [data].flat());
        expect(log.mock.calls).toStrictEqual(calls);
      };

      const inviteLength = `#01 => Length of calls is : ${_strings.length}`;

      const length = () => {
        strings.push(..._strings);
        expect(log.mock.calls.length).toBe(strings.length);
      };

      const invite = `#${index < 10 ? '0' + index : index} => Check the console`;
      const func = () => {
        test(inviteLength, length);
        test(inviteStrict, strict);
      };

      return tupleOf(invite, func);
    };

    const useValue = (value: string, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => value is "${value}"`;
      return tupleOf(invite, async () => {
        expect(service.value).toBe(value);
      });
    };

    type SE = Parameters<typeof service.send>[0];

    // #region Hooks
    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    // #endregion

    test('#00 => Start the service', service.start);
    test('#01 => __longRun value', () =>
      expect(service.longRuns).toBe(true));
    test(...useValue('idle', 2));
    describe(...useConsole(3));
    test(...useSend('NEXT', 4));
    test(...useValue('promise', 5));
    describe(...useConsole(6));
    test(...useWaiter(7));
    test(...useValue('promise', 8));
    test(...useWaiter(9));
    test(...useValue('success', 10));
    describe(...useConsole(11, 'Success!'));
  });

  describe('#02 => No longRuns', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        __longRuns: false,
        states: {
          idle: {
            on: {
              NEXT: '/promise',
            },
          },
          promise: {
            promises: {
              src: 'longRunTask',
              then: '/success',
              catch: '/failure',
            },
          },
          success: {
            entry: 'notifySuccess',
          },
          failure: {
            entry: 'notifyFailure',
          },
        },
      },
      typings({
        eventsMap: { NEXT: 'primitive' },
      }),
    ).provideOptions(({ voidAction }) => ({
      promises: {
        longRunTask: () => sleep(DELAY * 2),
      },
      actions: {
        notifySuccess: voidAction(() => console.log('Success!')),
        notifyFailure: voidAction(() => console.log('Failure!')),
      },
    }));

    const service = interpret(machine);

    // #region Hooks

    beforeAll(() => {
      vi.useFakeTimers();
      log.mockClear();
    });

    const useWaiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

    const strings: (string | string[])[] = [];
    const useConsole = (
      index: number,
      ..._strings: (string | string[])[]
    ) => {
      const inviteStrict = `#02 => Check strict string`;

      const strict = () => {
        const calls = strings.map(data => [data].flat());
        expect(log.mock.calls).toStrictEqual(calls);
      };

      const inviteLength = `#01 => Length of calls is : ${_strings.length}`;

      const length = () => {
        strings.push(..._strings);
        expect(log.mock.calls.length).toBe(strings.length);
      };

      const invite = `#${index < 10 ? '0' + index : index} => Check the console`;
      const func = () => {
        test(inviteLength, length);
        test(inviteStrict, strict);
      };

      return tupleOf(invite, func);
    };

    const useValue = (value: string, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => value is "${value}"`;
      return tupleOf(invite, async () => {
        expect(service.value).toBe(value);
      });
    };

    type SE = Parameters<typeof service.send>[0];

    // #region Hooks
    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    // #endregion

    test('#00 => Start the service', service.start);
    test('#01 => __longRun value', () =>
      expect(service.longRuns).toBe(false));
    test(...useValue('idle', 2));
    describe(...useConsole(4));
    test(...useSend('NEXT', 5));
    test(...useValue('promise', 5));
    describe(...useConsole(6));
    test(...useWaiter(5));
    test(...useValue('promise', 8));
    test(...useWaiter(9));
    test(...useValue('failure', 10));
    describe(...useConsole(11, 'Failure!'));
  });
});
