import { DEFAULT_MAX_TIME_PROMISE } from '#constants';
import { interpret } from '#interpreter';
import _machineWithLong1 from './longRuns.cov.1.machine';
import _machineWithoutLong2 from './longRuns.cov.2.machine';
import _machine3 from './longRuns.cov.3.machine';
import _machine4 from './longRuns.cov.4.machine';
import _machine5 from './longRuns.cov.5.machine';

vi.useFakeTimers();

/** One second past the default 10-minute promise limit */
const BEYOND_MAX = DEFAULT_MAX_TIME_PROMISE + 100_000;

describe('longRuns - no timeout limit for async actions and after', () => {
  describe('#01 => longRuns property propagation', () => {
    const machineWithLong = _machineWithLong1;

    const machineWithoutLong = _machineWithoutLong2;

    test('#01 => machine.longRuns is true when __longRuns: true', () => {
      expect(machineWithLong.longRuns).toBe(true);
    });

    test('#02 => machine.longRuns is false when __longRuns is not set', () => {
      expect(machineWithoutLong.longRuns).toBe(false);
    });

    const serviceWithLong = interpret(machineWithLong, { context: 0 });
    const serviceWithoutLong = interpret(machineWithoutLong, {
      context: 0,
    });

    test('#03 => service.longRuns is true when __longRuns: true', () => {
      expect(serviceWithLong.longRuns).toBe(true);
    });

    test('#04 => service.longRuns is false when __longRuns is not set', () => {
      expect(serviceWithoutLong.longRuns).toBe(false);
    });
  });

  describe('#02 => without __longRuns: async action times out at DEFAULT_MAX_TIME_PROMISE', () => {
    const machine = _machine3.provideOptions(({ voidAction }) => ({
      actions: {
        slowAction: voidAction(
          () =>
            new Promise<void>(resolve => setTimeout(resolve, BEYOND_MAX)),
          { error: () => {} },
        ),
      },
    }));

    const service = interpret(machine, { context: 0 });

    test('#01 => start', service.start);

    test('#02 => send TEST rejects when action exceeds DEFAULT_MAX_TIME_PROMISE', async () => {
      let caught = false;
      const sendPromise = service.send('TEST').catch(() => {
        caught = true;
      });
      await vi.advanceTimersByTimeAsync(DEFAULT_MAX_TIME_PROMISE + 1);
      await sendPromise;
      expect(caught).toBe(true);
    });
  });

  describe('#03 => with __longRuns: true: async action completes beyond DEFAULT_MAX_TIME_PROMISE', () => {
    const done = vi.fn();

    const machine = _machine4.provideOptions(({ voidAction }) => ({
      actions: {
        slowAction: voidAction(
          () =>
            new Promise<void>(resolve =>
              setTimeout(() => {
                done();
                resolve();
              }, BEYOND_MAX),
            ),
          { error: () => {} },
        ),
      },
    }));

    const service = interpret(machine, { context: 0 });

    test('#01 => start', service.start);

    test('#02 => send TEST resolves after BEYOND_MAX with no timeout', async () => {
      const sendPromise = service.send('TEST');
      await vi.advanceTimersByTimeAsync(BEYOND_MAX + 1);
      await sendPromise;
    });

    test('#03 => the slow action completed (done called once)', () => {
      expect(done).toHaveBeenCalledOnce();
    });
  });

  describe('#04 => after transition with __longRuns: true', () => {
    const DELAY = 5_000;

    const machine = _machine5;

    machine.addOptions(() => ({
      delays: { DELAY },
    }));

    const service = interpret(machine, { context: 0 });

    test('#01 => start', () => {
      service.start();
    });

    test('#02 => state is idle before delay elapses', () => {
      expect(service.value).toEqual('idle');
    });

    test('#03 => state transitions to active after DELAY (no limit applies)', async () => {
      await vi.advanceTimersByTimeAsync(DELAY + 1);
      expect(service.value).toEqual('active');
    });
  });
});
