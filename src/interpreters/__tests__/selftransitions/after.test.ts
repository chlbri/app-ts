import { DEFAULT_MAX_TIME_PROMISE } from '#constants';
import { returnFalse } from '#guards';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { createConfig } from '#machines';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import {
  constructSend,
  constructValue,
  constructWaiter,
  defaultC,
  defaultI,
  defaultT,
} from '../fixtures';

const DELAY = 1000;

const useWaiter = constructWaiter(DELAY);

describe('after', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  const simpleConfig = createConfig({
    states: {
      idle: {
        after: {
          DELAY: {},
        },
      },
      active: {},
    },
  });

  describe('#01 => simple', () => {
    const machine = createMachine(simpleConfig, defaultT, {
      ...defaultI,
      targets: { '/idle.after.DELAY': '/active' },
    });

    machine.addOptions(() => ({
      delays: {
        DELAY,
      },
    }));

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
              DELAY1: {},
              DELAY2: {},
            },
          },
          result1: {},
          result2: {},
        },
      },
      defaultT,
      {
        ...defaultI,
        targets: {
          '/idle.after.DELAY1': '/result1',
          '/idle.after.DELAY2': '/result2',
        },
      },
    );

    machine.addOptions(() => ({
      delays: {
        DELAY1: DELAY * 3,
        DELAY2: DELAY * 2,
      },
    }));

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

  describe('#03 => complex, two delays with parameters', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            after: {
              DELAY: { guards: 'returnFalse' },
              DELAY2: {},
            },
          },
          result1: {},
          result2: {},
        },
      },
      defaultT,
      {
        ...defaultI,
        targets: {
          '/idle.after.DELAY': '/result1',
          '/idle.after.DELAY2': '/result2',
        },
      },
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

  describe('#04 => Delay is too long', () => {
    const machine = createMachine(simpleConfig, defaultT, defaultI);

    machine.addOptions(() => ({
      delays: {
        DELAY: DEFAULT_MAX_TIME_PROMISE + DELAY,
      },
    }));

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('idle', 2));
    test(...createFakeWaiter.all(vi)(3, DEFAULT_MAX_TIME_PROMISE + DELAY));
    test(...useValue('idle', 4));
  });

  describe('#05 => Delay is not defined', () => {
    const machine = createMachine(simpleConfig, defaultT, defaultI);
    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });
    test(...useValue('idle', 2));
    test(...createFakeWaiter.all(vi)(3));
    test(...useValue('idle', 4));
  });

  describe('#07 => Inside the remainings', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            after: {
              DELAY2: {},
            },
            on: {
              NEXT: {},
            },
          },
          active: {
            on: {
              NEXT: {},
            },
          },
        },
      },
      { ...defaultT, eventsMap: { NEXT: {} } },
      {
        ...defaultI,
        targets: {
          '/idle.after.DELAY2': '/active',
          '/idle.on.NEXT': '/active',
          '/active.on.NEXT': '/idle',
        },
      },
    );

    machine.addOptions(() => ({
      delays: {
        DELAY2: DELAY * 3,
      },
    }));

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);
    const useSend = constructSend(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('idle', 2));
    test(...useWaiter(1, 3));
    test(...useSend('NEXT', 4));
    test(...useValue('active', 5));
    test(...useWaiter(4, 6));
    test(...useValue('active', 7));
    test(...useSend('NEXT', 8));
    test(...useValue('idle', 9));
    test(...useWaiter(1, 10));
    test(...useValue('idle', 11));
    test(...useWaiter(2, 12));
    test(...useSend('NEXT', 13));
    test(...useValue('idle', 14));
    test(...useWaiter(1, 15));
    test(...useValue('idle', 16));
    test(...useSend('NEXT', 17));
    test(...useValue('active', 18));
    test(...useSend('NEXT', 19));
    test(...useValue('idle', 20));
    test(...useWaiter(1, 21));
    test(...useValue('idle', 22));
    test(...useSend('NEXT', 23));
    test(...useValue('active', 24));
    test(...useWaiter(4, 25));
    test(...useValue('active', 26));
    test(...useSend('NEXT', 27));
    test(...useValue('idle', 28));
    test(...useWaiter(3, 29));
    test(...useValue('active', 30));
  });
});
