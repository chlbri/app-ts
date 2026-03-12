import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { nothing, notU, typings } from '#utils';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';

vi.useFakeTimers();

const SHORT = 200;

describe('Coverage actors', () => {
  describe('#01 => same emitter actor id in two states', () => {
    const machine = createMachine(
      {
        initial: 'inactive',
        states: {
          inactive: {
            on: { NEXT: '/active' },
            actors: {
              interval: { next: { actions: ['assignN'] } },
            },
          },
          active: {
            on: { NEXT: '/inactive' },
            actors: {
              interval: { next: { actions: ['assignN'] } },
            },
          },
        },
      },
      typings({
        context: 'number',
        eventsMap: { NEXT: 'primitive' },
        actorsMap: {
          emitters: {
            interval: { next: 'number', error: 'primitive' },
          },
        },
      }),
    );

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
            interval(SHORT).pipe(
              take(3),
              map(v => v + 1),
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

  describe('#02 => same child actor id in two states', () => {
    const DELAY = 350;
    const childMachine = createMachine(
      {
        activities: {
          DELAY: ['inc'],
          DELAY2: ['inc2'],
        },
      },
      typings({ context: { iter1: 'number', iter2: 'number' } }),
    ).provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context.iter1', ({ context }) => context.iter1 + 1),
        inc2: assign('context.iter2', ({ context }) => context.iter2 + 1),
      },
      delays: { DELAY, DELAY2: DELAY * 2 },
    }));

    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: { NEXT: '/working' },
            actors: {
              child: {
                contexts: {
                  '.': 'all',
                  iter1: 'iter1',
                },
              },
            },
          },
          working: {
            on: { NEXT: '/idle' },
            actors: {
              child: {
                contexts: {
                  iter2: 'iter2',
                },
              },
            },
          },
        },
      },
      typings({
        eventsMap: { NEXT: 'primitive' },
        actorsMap: { children: { child: {} } },
        pContext: {
          iter1: 'number',
          iter2: 'number',
          all: {
            iter1: 'number',
            iter2: 'number',
          },
        },
      }),
    );

    machine.addOptions(() => ({
      actors: {
        children: {
          child: () =>
            interpret(childMachine, { context: { iter1: 0, iter2: 0 } }),
        },
      },
    }));

    const service = interpret(machine, {
      pContext: {
        iter1: 0,
        iter2: 0,
        all: {
          iter1: 0,
          iter2: 0,
        },
      },
    });
    const {
      start,
      stop,
      send,
      useStateValue,
      waiter,
      useIter1,
      useIter2,
      useAll,
    } = constructTests(service, ({ waiter, contexts }) => ({
      waiter: waiter(DELAY),
      useIter1: contexts(({ pContext }) => pContext.iter1),
      useIter2: contexts(({ pContext }) => pContext.iter2),
      useAll: contexts(({ pContext }) => pContext.all),
    }));

    afterEach(() => console.warn(service._pContext));

    test(...start());

    test(...waiter());

    test(...useStateValue('idle'));

    test(...waiter());

    test(...send('NEXT'));

    test(...waiter());

    test(...useStateValue('working'));

    test(...waiter());

    test(...send('NEXT'));

    test(...waiter());

    test(...useStateValue('idle'));

    test(...waiter());

    test(...stop());
  });
});
