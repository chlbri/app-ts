import { createMachine } from '#machine';
import { interpret } from '../../interpreter';
import { defaultT } from '../fixtures';

beforeAll(() => {
  vi.useFakeTimers();
});

describe('Self Transitions', () => {
  const DELAY = 1000;
  it('should handle after self transitions', async () => {
    const machine = createMachine(
      {
        initial: 'idle',
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
    );

    machine.addOptions(() => ({
      delays: {
        DELAY,
      },
    }));

    const service = interpret(machine, {
      pContext: {},
      context: {},
    });

    service.start();
    expect(service.value).toEqual('idle');

    await vi.advanceTimersByTimeAsync(DELAY);
    expect(service.value).toEqual('active');
  });

  it('should handle always self transitions', async () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            always: ['/active'],
          },
          active: {},
        },
      },
      defaultT,
    );

    const service = interpret(machine, {
      pContext: {},
      context: {},
    });

    service.start();
    expect(service.value).toEqual('active');
  });

  it('should handle promise self transitions', async () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            promises: [
              {
                src: 'resolvePromise',
                then: '/active',
                catch: '/active',
              },
            ],
          },
          active: {},
        },
      },
      defaultT,
    );

    machine.addOptions(() => ({
      promises: {
        resolvePromise: () => Promise.resolve({}),
      },
    }));

    const service = interpret(machine, {
      pContext: {},
      context: {},
    });

    service.start();
    expect(service.value).toEqual('idle');
    await vi.advanceTimersByTimeAsync(0);
    expect(service.value).toEqual('active');
  });
});
