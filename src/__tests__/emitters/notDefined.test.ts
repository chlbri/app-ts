import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { machineEmitter1 } from './data';

describe('Tests not defined emitters -> Machine1', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

  beforeAll(() => {
    vi.useFakeTimers();
    log.mockClear();
  });
  afterAll(() => {
    log.mockRestore();
  });

  const service = interpret(machineEmitter1, { context: 0 });
  const { start } = constructTests(service);

  test(...start());
  test('#02 => Error is emmitted', () => {
    expect(log).toHaveBeenCalledWith('Emitter (interval) is not defined');
  });
});
