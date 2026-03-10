import { constructTests, defaultC, defaultT } from '#fixtures';
import { returnFalse } from '#guards';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { createConfig } from '#machines';

const DELAY = 1000;

vi.useFakeTimers();

describe('after', () => {
  beforeAll(() => {});

  const simpleConfig = createConfig({
    initial: 'idle',
    states: {
      idle: {
        after: {
          DELAY: '/active',
        },
      },
      active: {},
    },
  });

  describe('#01 => simple', () => {
    const machine = createMachine(simpleConfig, defaultT);

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
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY1: '/result1',
              DELAY2: '/result2',
            },
          },
          result1: {},
          result2: {},
        },
      },
      defaultT,
    );

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
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY: { guards: 'returnFalse', target: '/result1' },
              DELAY2: '/result2',
            },
          },
          result1: {},
          result2: {},
        },
      },
      defaultT,
    );
    machine.addOptions(() => ({
      delays: {
        DELAY,
        DELAY2: DELAY * 4,
      },
      predicates: {
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
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY2: '/active',
            },
            on: {
              NEXT: '/active',
            },
          },
          active: {
            on: {
              NEXT: '/idle',
            },
          },
        },
      },
      { ...defaultT, eventsMap: { NEXT: {} } },
    );

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
    test(...useWaiter(3));
    test(...useStateValue('active'));
  });
});
