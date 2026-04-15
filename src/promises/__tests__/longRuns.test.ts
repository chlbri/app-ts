import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { createMachine } from '#machines';
import { typings } from '#utils';
import { sleep } from '@bemedev/sleep';

describe('Tests for longrun promises', () => {
  const LONG_DELAY = 450_000;
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
            actors: {
              longRunTask: {
                resolves: '/success',
                catch: '/failure',
              },
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
        actorsMap: {
          promisees: {
            longRunTask: {
              resolves: 'primitive',
              catch: 'primitive',
            },
          },
        },
      }),
    ).provideOptions(({ voidAction }) => ({
      actors: {
        promises: {
          longRunTask: () => sleep(LONG_DELAY * 2) as any,
        },
      },
      actions: {
        notifySuccess: voidAction(() => console.log('Success!')),
        notifyFailure: voidAction(() => console.log('Failure!')),
      },
    }));

    const service = interpret(machine);

    beforeAll(() => {
      vi.useFakeTimers();
      log.mockClear();
    });

    const { start, useStateValue, send, useWaiter, useConsole } =
      constructTests(service, ({ waiter, tupleOf }) => {
        const strings: (string | string[])[] = [];
        return {
          useWaiter: waiter(LONG_DELAY),
          useConsole: (
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
          },
        };
      });

    test(...start(0));

    test('#01 => __longRun value', () => {
      expect(service.longRuns).toBe(true);
    });

    test(...useStateValue('idle', 2));
    describe(...useConsole(3));
    test(...send('NEXT', 4));
    test(...useStateValue('promise', 5));
    describe(...useConsole(6));
    test(...useWaiter(1, 7));
    test(...useStateValue('promise', 8));
    test(...useWaiter(1, 9));
    test(...useStateValue('success', 10));
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
            actors: {
              longRunTask: {
                resolves: '/success',
                catch: '/failure',
              },
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
        actorsMap: {
          promisees: {
            longRunTask: {
              resolves: 'primitive',
              catch: 'primitive',
            },
          },
        },
      }),
    ).provideOptions(({ voidAction }) => ({
      actors: {
        promises: {
          longRunTask: () => sleep(LONG_DELAY * 2) as any,
        },
      },
      actions: {
        notifySuccess: voidAction(() => console.log('Success!')),
        notifyFailure: voidAction(() => console.log('Failure!')),
      },
    }));

    const service = interpret(machine);

    beforeAll(() => {
      vi.useFakeTimers();
      log.mockClear();
    });

    const { start, useStateValue, send, useWaiter, useConsole } =
      constructTests(service, ({ waiter, tupleOf }) => {
        const strings: (string | string[])[] = [];
        return {
          useWaiter: waiter(LONG_DELAY),
          useConsole: (
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
          },
        };
      });

    test(...start(0));
    test('#01 => __longRun value', () =>
      expect(service.longRuns).toBe(false));
    test(...useStateValue('idle', 2));
    describe(...useConsole(4));
    test(...send('NEXT', 5));
    test(...useStateValue('promise', 5));
    describe(...useConsole(6));
    test(...useWaiter(1, 5));
    test(...useStateValue('promise', 8));
    test(...useWaiter(1, 9));
    test(...useStateValue('failure', 10));
    describe(...useConsole(11, 'Failure!'));
  });
});
