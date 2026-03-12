import { constructTests, defaultC, defaultT } from '#fixtures';
import { interpret } from '#interpreter';
import { createMachine } from '#machines';

describe('Integration testing for interpret, Children', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  const DELAY = 1000;

  describe('#01 => With delay', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY: '/notActive',
            },
            always: '/active',
          },
          active: {},
          notActive: {},
        },
      },
      defaultT,
    );

    machine.addOptions(() => ({
      delays: { DELAY },
    }));

    machine.createOptions(() => ({
      delays: { DELAY },
      ezre: {},
    }));
    const service = interpret(machine, defaultC);

    const { useStateValue, useWaiter, start } = constructTests(
      service,
      ({ waiter }) => ({
        useWaiter: waiter(DELAY),
      }),
    );

    test(...start());
    test(...useStateValue('active'));
    test(...useWaiter(10));
    test(...useStateValue('active'));
  });

  describe('#01 => With delay, but cannot reach caused by guard', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY3: '/notActive',
            },
            always: { guards: 'returnFalse', target: '/active' },
          },
          active: {},
          notActive: {},
        },
      },
      defaultT,
    );

    machine.addOptions(({ isDefined }) => ({
      delays: { DELAY3: DELAY * 3 },
      predicates: { returnFalse: isDefined('context') },
    }));
    const service = interpret(machine, defaultC);

    const { useStateValue, useWaiter, start } = constructTests(
      service,
      ({ waiter }) => ({
        useWaiter: waiter(DELAY),
      }),
    );

    test(...start());
    test(...useStateValue('idle'));
    test(...useWaiter(1));
    test(...useStateValue('idle'));
    test(...useWaiter(2));
    test(...useStateValue('notActive'));
    test(...useWaiter(10));
    test(...useStateValue('notActive'));
  });

  describe('#02 => complex, two always with parameters', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            always: [
              { guards: 'returnFalse', target: '/result1' },
              { guards: 'returnFalse', target: '/result3' },
              '/result2',
            ],
          },
          result1: {},
          result2: {},
          result3: {},
        },
      },
      defaultT,
    );

    // machine.addPredicates({ returnFalse });
    machine.addOptions(({ isDefined }) => ({
      predicates: { returnFalse: isDefined('pContext') },
    }));

    const service = interpret(machine);

    const { useStateValue, useWaiter, start } = constructTests(
      service,
      ({ waiter }) => ({
        useWaiter: waiter(DELAY),
      }),
    );

    test(...start());
    test(...useStateValue('result2'));
    test(...useWaiter(10));
    test(...useStateValue('result2'));
  });
});
