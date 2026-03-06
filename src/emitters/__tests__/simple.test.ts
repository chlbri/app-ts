import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { machineEmitter2, WAITERS } from './data';

vi.useFakeTimers();
describe('Simple Machine2 (from Machine1)', () => {
  const service = interpret(machineEmitter2, { context: 0 });

  const { useContext, waiter, useNext, start, resume, pause, stop } =
    constructTests(service, ({ contexts, sender, waiter }) => ({
      useContext: contexts(({ context }) => context),
      useNext: sender('NEXT'),
      waiter: waiter(WAITERS.short),
    }));

  test(...start());
  test(...useContext(0));
  test(...waiter());
  test(...useContext(5));
  test(...useNext());
  test(...waiter());
  test(...useContext(15));
  test(...useNext());
  test(...waiter());
  test(...useContext(30));
  test(...useNext());
  test(...waiter());
  test(...useContext(50));
  test(...useNext());
  test(...pause());
  test(...waiter());
  test(...useContext(50));
  test(...resume());
  test(...waiter());
  test(...useContext(75));
  test(...useNext());
  test(...waiter(20));
  test(...useContext(75));
  test(...resume());
  test(...waiter(50));
  test(...useContext(75));
  test(...stop());
});
