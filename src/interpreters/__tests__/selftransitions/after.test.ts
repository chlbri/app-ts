import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import { constructValue, constructWaiter } from '../fixtures';

const DELAY = 1000;
const defaultC = { pContext: {}, context: {} };
const defaultT = { ...defaultC, eventsMap: {} };
const defaultI = { '/': 'idle' } as const;
const useWaiter = constructWaiter(DELAY);

describe('after', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('#01 => simple', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            after: {
              DELAY: '/active',
            },
          },
          active: {},
        },
      },
      defaultT,
      defaultI,
    );

    machine.addDelays({
      DELAY,
    });

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('idle', 2));

    test(...useWaiter(1, 3));

    test(...useValue('active', 4));
  });

  describe('#02 => complex, two delays', () => {
    const machine = createMachine(
      {
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
      defaultI,
    );

    machine.addDelays({
      DELAY1: DELAY * 3,
      DELAY2: DELAY * 2,
    });

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('idle', 2));

    test(...useWaiter(1, 3));

    test(...useValue('idle', 4));

    test(...useWaiter(1, 5));

    test(...useValue('result2', 6));

    test(...useWaiter(10, 7));

    test(...useValue('result2', 8));
  });

  describe('#02 => complex, two delays with parameters', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            after: {
              DELAY: { target: '/result1', guards: 'guard1' },
              DELAY2: '/result2',
            },
          },
          result1: {},
          result2: {},
        },
      },
      defaultT,
      defaultI,
    );

    machine.addDelays({
      DELAY,
      DELAY2: DELAY * 4,
    });

    machine.addPredicates({
      guard1: () => false,
    });

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('idle', 2));

    test(...useWaiter(1, 3));

    test(...useValue('idle', 4));

    test(...useWaiter(1, 5));

    test(...useValue('idle', 6));

    test(...useWaiter(2, 7));

    test(...useValue('result2', 8));

    test(...useWaiter(12, 9));

    test(...useValue('result2', 10));
  });
});
