import { DEFAULT_MAX_TIME_PROMISE } from '#constants';
import { constructTests, defaultC } from '#fixtures';
import { returnFalse } from '#guards';
import { interpret } from '#interpreter';
import _machine1 from './after.1.machine';
import _machine2 from './after.2.machine';
import _machine3 from './after.3.machine';
import _machine4 from './after.4.machine';
import _machine5 from './after.5.machine';

const DELAY = 1000;

vi.useFakeTimers();

describe('after', () => {
  beforeAll(() => {});

  describe('#01 => simple', () => {
    const machine = _machine1;

    machine.addOptions(() => ({
      delays: {
        DELAY,
      },
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
    test(...useWaiter());
    test(...useStateValue('active'));
  });

  describe('#02 => complex, two delays', () => {
    const machine = _machine2;

    machine.addOptions(() => ({
      delays: {
        DELAY1: DELAY * 3,
        DELAY2: DELAY * 2,
      },
    }));

    const service = interpret(machine);

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
    test(...useWaiter(1));
    test(...useStateValue('result2'));
    test(...useWaiter(10));
    test(...useStateValue('result2'));
  });

  describe('#03 => complex, two delays with parameters', () => {
    const machine = _machine3;
    machine.addOptions(() => ({
      delays: {
        DELAY,
        DELAY2: DELAY * 4,
      },
      guards: {
        returnFalse,
      },
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
    test(...useWaiter(1));
    test(...useStateValue('idle'));
    test(...useWaiter(2));
    test(...useStateValue('result2'));
    test(...useWaiter(12));
    test(...useStateValue('result2'));
  });

  describe('#04 => Inside the remainings', () => {
    vi.useRealTimers();
    const machine = _machine4;

    machine.addOptions(() => ({
      delays: {
        DELAY2: DELAY * 3,
      },
    }));

    const service = interpret(machine, defaultC);

    const { useStateValue, useWaiter, start, send } = constructTests(
      service,
      ({ waiter }) => ({
        useWaiter: waiter(DELAY),
      }),
    );

    test(...start());
    test(...useStateValue('idle'));
    test(...useWaiter(1));
    test(...send('NEXT'));
    test(...useStateValue('active'));
    test(...useWaiter(4));
    test(...useStateValue('active'));
    test(...send('NEXT'));
    test(...useStateValue('idle'));
    test(...useWaiter(1));
    test(...useStateValue('idle'));
    test(...useWaiter(2));
    test(...send('NEXT'));
    test(...useStateValue('idle'));
    test(...useWaiter(1));
    test(...useStateValue('idle'));
    test(...send('NEXT'));
    test(...useStateValue('active'));
    test(...send('NEXT'));
    test(...useStateValue('idle'));
    test(...useWaiter(1));
    test(...useStateValue('idle'));
    test(...send('NEXT'));
    test(...useStateValue('active'));
    test(...useWaiter(4));
    test(...useStateValue('active'));
    test(...send('NEXT'));
    test(...useStateValue('idle'));
    test(...useWaiter(4));
    test(...useStateValue('active'));
  });

  describe('#05 => after transition - delay is too long', () => {
    vi.useFakeTimers();
    const machine = _machine5;

    machine.addOptions(() => ({
      delays: {
        DELAY: DEFAULT_MAX_TIME_PROMISE * 1.5,
      },
    }));

    const service = interpret(machine, defaultC);
    const { useStateValue, start, stop, useLong } = constructTests(
      service,
      ({ waiter }) => ({
        useLong: waiter(DEFAULT_MAX_TIME_PROMISE),
      }),
    );

    test(...start());
    test(...useStateValue('idle'));

    describe('#03 => Check the warnings', () => {
      test('#01 => Length of warnings', () => {
        expect(service._warningsCollector?.size).toBe(1);
      });

      test('#02 => Check the warning', () => {
        expect(service._warningsCollector).toContain(
          'Delay DELAY is too long',
        );
      });
    });

    test(...stop());
    test(...useLong(2));
  });
});
