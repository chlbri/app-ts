import { constructTests, defaultC, defaultT } from '#fixtures';
import { interpret } from '#interpreter';
import _machine1 from './always.1.machine';
import _machine2 from './always.2.machine';
import _machine3 from './always.3.machine';

describe('Integration testing for interpret, Children', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  const DELAY = 1000;

  describe('#01 => With delay', () => {
        const machine = _machine1;

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
        const machine = _machine2;

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
        const machine = _machine3;

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
