import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { createPausable } from '@bemedev/rx-pausable';
import { Subject } from 'rxjs';

vi.useFakeTimers();
describe('Error transitions testing)', () => {
  describe('#001 => string target', () => {
    const sub = new Subject<number>();
    const mock = vi.fn();
    const DELAY = 100;
    sub.subscribe({
      next: value => {
        console.warn('Next received in subject subscription:', value);
      },
      error: value => {
        console.warn('Error received in subject subscription:', value);
      },
      complete: () => console.warn('Subject completed'),
    });

    const machine = createMachine(
      {
        initial: 'idle',
        actors: {
          interval: {
            next: {
              actions: ['assigN'],
            },
            error: {
              actions: ['signals'],
            },
          },
        },
        states: {
          idle: {},
        },
      },
      typings({
        actorsMap: {
          emitters: {
            interval: { next: 'number', error: 'number' },
          },
        },
        context: 'number',
      }),
    ).provideOptions(({ assign, voidAction }) => ({
      actors: { emitters: { interval: () => createPausable(sub) } },

      actions: {
        assigN: assign('context', {
          'interval::next': ({ payload, context }) => context + payload,
        }),

        signals: voidAction({
          'interval::error': ({ payload }) => {
            mock('Error received:', payload);
            console.warn('Error received:', payload);
          },
          'interval::next': ({ payload }) => {
            mock('NEXT received:', payload);
            console.warn('Next received:', payload);
          },
        }),
      },
    }));

    const service = interpret(machine, { context: 0 });

    const { useNext, useError, useContext, useMock, start, waiter } =
      constructTests(service, ({ index, contexts, waiter }) => ({
        useNext: (value: number) => {
          const invite = `#${index()} => sub1.next(${value})`;
          return tupleOf(invite, () => {
            const [, fn] = waiter(DELAY)();
            fn().then(() => sub.next(value));
          });
        },

        useError: (value: number) => {
          const invite = `#${index()} => sub1.error(${value})`;
          return tupleOf(invite, () => {
            const [, fn] = waiter(DELAY)();
            fn().then(() => sub.error(value));
          });
        },

        useMock: (payload: number, fails = false) => {
          const invite = `#${index()} => mock('Error received:', ${payload})${fails ? ' => (fails)' : ''}`;

          return tupleOf(invite, () => {
            expect(mock).toHaveBeenCalledWith('Error received:', payload);
          });
        },

        useContext: contexts(({ context }) => context),
        waiter: waiter(DELAY),
      }));

    test(...start());
    test(...useContext(0));
    test(...useNext(5));
    test(...useContext(0));
    test(...waiter());
    test(...useNext(10));
    test(...useContext(5));
    test(...waiter());
    test(...useContext(15));
    test(...useError(20));
    test.fails(...useMock(20, true));
    test(...waiter(45));
    test(...useMock(20));
    test(...useContext(15));
  });
});
