import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { machineEmitter2, WAITERS } from './data';

vi.useFakeTimers();
describe('Simple Machine2 (from Machine1)', () => {
  const service = interpret(machineEmitter2, { context: 0 });

  const {
    useContext,
    waiter,
    useNext,
    start,
    resume,
    pause,
    stop,
    useStateValue,
  } = constructTests(service, ({ contexts, sender, waiter }) => ({
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
  test(...useStateValue('inactive'));
  test(...useNext());
  test(...useStateValue('active'));
  test(...useContext(75));
  //Resume without pause, no effect
  test(...resume());
  test(...waiter(50));
  test(...useContext(75));
  test(...stop());
});
