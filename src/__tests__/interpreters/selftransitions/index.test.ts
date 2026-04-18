import { defaultT, fakeWaiter } from '#fixtures';
import { interpret } from '#interpreter';
import _machine1 from './index.1.machine';
import _machine2 from './index.2.machine';

beforeAll(() => {
  vi.useFakeTimers();
});

describe('Self Transitions', () => {
  const DELAY = 1000;
  it('should handle after self transitions', async () => {
    const machine = _machine1;

    machine.addOptions(() => ({
      delays: {
        DELAY,
      },
    }));

    const service = interpret(machine);

    service.start();
    expect(service.value).toEqual('idle');
    await vi.advanceTimersByTimeAsync(DELAY);
    expect(service.value).toEqual('active');
  });

  it('should handle always self transitions', async () => {
    const machine = _machine2;

    const service = interpret(machine);

    service.start();
    await fakeWaiter(0);
    expect(service.value).toEqual('active');
  });
});
