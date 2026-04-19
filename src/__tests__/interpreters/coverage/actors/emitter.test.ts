import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { notU } from '#utils';
import { createPausable } from '@bemedev/rx-pausable';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';
import machine from './emitter.machine';

vi.useFakeTimers();

const SHORT = 200;

describe('Coverage actors', () => {
  describe('#01 => same emitter actor id in two states', () => {
    machine.addOptions(({ assign }) => ({
      actions: {
        assignN: assign('context', {
          'interval::next': ({ payload, context }) =>
            notU(context) + payload,
        }),
      },
      actors: {
        emitters: {
          interval: () =>
            createPausable(
              interval(SHORT).pipe(
                take(3),
                map(v => v + 1),
              ),
            ),
        },
      },
    }));

    const service = interpret(machine, { context: 0 });
    const { start, stop, useStateValue, useNext, waiter, useContext } =
      constructTests(service, ({ sender, waiter, contexts }) => ({
        useNext: sender('NEXT'),
        waiter: waiter(SHORT),
        useContext: contexts(({ context }) => context),
      }));

    test(...start());
    test(...useStateValue('inactive'));
    test(...useContext(0));
    test(...waiter());
    test(...useContext(1));
    test(...waiter());
    test(...useContext(3));
    test(...waiter());
    test(...useContext(6));
    test(...useNext());
    test(...useStateValue('active'));
    test(...waiter());
    test(...useContext(7));
    test(...waiter());
    test(...useContext(9));
    test(...stop());
  });
});
