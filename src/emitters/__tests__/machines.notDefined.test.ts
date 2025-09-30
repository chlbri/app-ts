import { interpret } from '#interpreter';
import { machineEmitter1 } from './machines';

describe('Tests not defined emitters', () => {
  const service = interpret(machineEmitter1, { context: 0 });

  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

  beforeAll(() => {
    vi.useFakeTimers();
    log.mockClear();
  });
  afterAll(() => {
    log.mockRestore();
  });

  test('#01 => Start the service', service.start);
  test('#02 => Error is emmitted', () => {
    expect(log).toHaveBeenCalledWith('Emitter (interval) is not defined');
  });
});
