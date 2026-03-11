import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { machineEmitter3, WAITERS } from './data';

vi.useFakeTimers();
describe('#01 => Emitter Machine3 #1', () => {
  const service = interpret(machineEmitter3, { context: 0 });
  const {
    useContext,
    waiter,
    useNext,
    start,
    pause,
    resume,
    stop,
    useStateValue,
  } = constructTests(service, ({ contexts, sender, waiter }) => ({
    useContext: contexts(({ context }) => context),
    useNext: sender('NEXT'),
    waiter: waiter(WAITERS.short),
  }));

  test(...useStateValue('inactive'));
  test(...start());
  test(...useStateValue('inactive'));
  test(...waiter());
  test(...useContext(0));
  test(...useStateValue('inactive'));
  test(...useNext());
  test(...useStateValue('active'));
  test(...useContext(0));
  test(...waiter());
  test(...useContext(5));
  test(...useNext());
  test(...useStateValue('inactive'));
  test(...useContext(5));
  test(...waiter());
  test(...useContext(5));
  test(...useNext());
  test(...useStateValue('active'));
  test(...useContext(5));
  test(...waiter());
  test(...useStateValue('active'));
  test(...useContext(10));
  test(...useNext());
  test(...useStateValue('inactive'));
  test(...useNext());
  test(...useStateValue('active'));
  test(...pause());
  test(...waiter(40));
  test(...useContext(10));
  test(...resume());
  test(...waiter());
  test(...useContext(15));
  test(...useNext());
  test(...useStateValue('inactive'));
  test(...waiter());
  test(...useContext(15));
  test(...waiter());
  test(...useContext(15));
  test(...useNext());
  test(...useStateValue('active'));
  test(...waiter());
  test(...useContext(20));
  test(...useNext());
  test(...useStateValue('inactive'));
  test(...waiter(30));
  test(...useContext(20));
  test(...useNext());
  test(...useStateValue('active'));
  test(...waiter(2));
  test(...useContext(35));
  test(...useNext());
  test(...useStateValue('inactive'));
  test(...waiter(5));
  test(...useContext(35));
  test(...pause());
  test(...waiter(35));
  test(...useContext(35));
  test(...useStateValue('inactive'));
  test(...resume());
  test(...waiter(5));
  test(...useContext(35));
  test(...useNext());
  test(...useStateValue('active'));
  test(...useContext(35));
  test(...waiter(50));
  test(...useContext(110));
  test(...stop());
});

describe('#02 => Emitter Machine3, with complete #2', () => {
  const mockFn = vi.fn();
  const service = interpret(
    machineEmitter3.provideOptions(({ voidAction }) => ({
      actions: {
        mockCompleteAction: voidAction(() => {
          mockFn('Complete action executed');
        }),
      },
    })),
    { context: 0 },
  );
  const { useContext, waiter, useMock, useNext, start, stop } =
    constructTests(
      service,
      ({ contexts, sender, waiter, tupleOf, index }) => ({
        useContext: contexts(({ context }) => context),
        useNext: sender('NEXT'),
        waiter: waiter(WAITERS.short),

        useMock: (fails = false) => {
          const invite = `#${index()} => mockFn called${fails ? ' => (fails)' : ''}`;

          return tupleOf(invite, () => {
            expect(mockFn).toHaveBeenCalledWith(
              'Complete action executed',
            );
          });
        },
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
  test.fails(...useMock());
  test(...useContext(30));
  test.fails(...useMock());
  test(...waiter());
  test(...useContext(50));
  test.fails(...useMock());
  test(...waiter());
  test(...useContext(75));
  test(...useMock());
  test(...stop());
});
