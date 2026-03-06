import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { machineEmitter3, WAITERS } from './data';

vi.useFakeTimers();
describe('#01 => Emitter Machine3 #1', () => {
  const service = interpret(machineEmitter3, { context: 0 });
  const { useContext, waiter, useNext, start, pause, resume, stop } =
    constructTests(service, ({ contexts, sender, waiter }) => ({
      useContext: contexts(({ context }) => context),
      useNext: sender('NEXT'),
      waiter: waiter(WAITERS.short),
    }));

  test(...start());
  test(...waiter());
  test(...useContext(0));
  test(...useNext());
  test(...waiter());
  test(...useContext(5));
  test(...useNext());
  test(...waiter());
  test(...useContext(5));
  test(...useNext());
  test(...useContext(5));
  test(...waiter());
  test(...useContext(30));
  test(...useNext());
  test(...pause());
  test(...waiter());
  test(...useContext(30));
  test(...resume());
  test(...waiter());
  test(...useContext(30));
  test(...useNext());
  test(...waiter());
  test(...useContext(30));
  test(...useNext());
  test(...waiter());
  test(...useContext(30));
  test(...useNext());
  test(...waiter());
  test(...useContext(50));
  test(...useNext());
  test(...waiter());
  test(...useContext(50));
  test(...useNext());
  test(...waiter(5));
  test(...useContext(95));
  test(...waiter(35));
  test(...useContext(95));
  test(...resume());
  test(...waiter(5));
  test(...stop());
});

describe('#02 => Emitter Machine3 #2', () => {
  const service = interpret(machineEmitter3, { context: 0 });
  const { useContext, waiter, useNext, start, stop } = constructTests(
    service,
    ({ contexts, sender, waiter }) => ({
      useContext: contexts(({ context }) => context),
      useNext: sender('NEXT'),
      waiter: waiter(WAITERS.short),
    }),
  );

  test(...start());
  test(...waiter());
  test(...useContext(0));
  test(...useNext());
  test(...waiter());
  test(...useContext(5));
  test(...waiter());
  test(...useContext(15));
  test(...waiter());
  test(...useContext(30));
  test(...waiter());
  test(...useContext(50));
  test(...waiter());
  test(...useContext(75));
  test(...stop());
});
