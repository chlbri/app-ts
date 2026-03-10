import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { Subject } from 'rxjs';
import { machineEmitter2, WAITERS } from './data';

vi.useFakeTimers();
describe('Error transitions testing)', () => {
  describe('#001 => string target', () => {
    const sub = () => new Subject<number>();

    const machine = createMachine(
      {
        initial: 'idle',
        actors: {
          src: 'sub1',
          id: 'interval',
          next: {
            actions: ['assigN'],
          },
          error: {
            actions: ['signals'],
          },
        },
        states: {
          idle: {},
        },
      },
      typings({
        actorsMap: {
          emitters: {
            sub1: { next: 'number', error: 'number' },
          },
        },
      }),
    ).provideOptions(() => ({
      actors: {
        emitters: {
          sub1: sub,
        },
      },
    }));

    const service = interpret(machine);

    const {} = constructTests(service, () => ({}));
  });

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
  test(...waiter(2));
  test(...useContext(90));
  //Resume without pause, no effect
  test(...resume());
  test(...waiter(50));
  test(...useContext(150));
  test(...stop());
});
