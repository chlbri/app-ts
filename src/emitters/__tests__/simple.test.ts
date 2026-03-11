import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { machineEmitter2, WAITERS } from './data';

vi.useFakeTimers();
describe('Simple Machine2 (from Machine1)', () => {
  const mockFn = vi.fn();
  const service = interpret(
    machineEmitter2.provideOptions(({ voidAction }) => ({
      actions: {
        mockCompleteAction: voidAction(() => {
          mockFn('Complete action executed');
        }),
      },
    })),
    { context: 0 },
  );

  const {
    useContext,
    waiter,
    useNext,
    start,
    resume,
    pause,
    stop,
    useStateValue,
    useMock,
  } = constructTests(
    service,
    ({ contexts, sender, waiter, tupleOf, index }) => ({
      useContext: contexts(({ context }) => context),
      useNext: sender('NEXT'),
      waiter: waiter(WAITERS.short),

      useMock: (fails = false) => {
        const invite = `#${index()} => mockFn called${fails ? ' => (fails)' : ''}`;

        return tupleOf(invite, () => {
          expect(mockFn).toHaveBeenCalledWith('Complete action executed');
        });
      },
    }),
  );

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
  test.fails(...useMock());
  test(...waiter());
  test(...useContext(75));
  test(...useStateValue('inactive'));
  test(...useNext());
  test(...useStateValue('active'));
  test(...useContext(75));
  test(...useMock());
  //Resume without pause, no effect
  test(...resume());
  test(...waiter(50));
  test(...useContext(75));
  test(...stop());
});
