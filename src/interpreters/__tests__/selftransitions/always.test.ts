import { returnFalse } from '~guards';
import { interpret } from '~interpreter';
import { createMachine } from '~machines';
import {
  constructValue,
  constructWaiter,
  defaultC,
  defaultI,
  defaultT,
} from '../fixtures';

describe('Integration testing for interpret, Children', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  const DELAY = 1000;

  const useWaiter = constructWaiter(DELAY);

  describe('#01 => With delay', () => {
    const machine = createMachine(
      {
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
      defaultI,
    );

    machine.addOptions(() => ({
      delays: { DELAY },
    }));
    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('active', 2));
    test(...useWaiter(10, 3));
    test(...useValue('active', 4));
  });

  describe('#01 => With delay, but cannot reach caused by guard', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            after: {
              DELAY3: '/notActive',
            },
            always: { target: '/active', guards: 'returnFalse' },
          },
          active: {},
          notActive: {},
        },
      },
      defaultT,
      defaultI,
    );

    machine.addOptions(() => ({
      delays: { DELAY3: DELAY * 3 },
      predicates: { returnFalse },
    }));
    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('idle', 2));
    test(...useWaiter(1, 3));
    test(...useValue('idle', 4));
    test(...useWaiter(2, 5));
    test(...useValue('notActive', 6));
    test(...useWaiter(10, 7));
    test(...useValue('notActive', 8));
  });

  describe('#02 => complex, two always with parameters', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            always: [
              { target: '/result1', guards: 'returnFalse' },
              { target: '/result3', guards: 'returnFalse' },
              { target: '/result2' },
            ],
          },
          result1: {},
          result2: {},
          result3: {},
        },
      },
      defaultT,
      defaultI,
    );

    // machine.addPredicates({ returnFalse });
    machine.addOptions(({ isNotDefined }) => ({
      predicates: { returnFalse: isNotDefined('pContext') },
    }));
    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('result2', 2));
    test(...useWaiter(10, 3));
    test(...useValue('result2', 4));
  });
});
