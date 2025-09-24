import { createPausable } from '#emitters';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';

export const WAITERS = {
  short: 200,
  medium: 500,
  long: 1000,
};

export const machineEmitter1 = createMachine(
  {
    initial: 'inactive',
    emitters: {
      interval1: 'interval',
    },
    states: {
      inactive: {
        on: {
          NEXT: '/active',
        },
      },
      active: {
        on: {
          NEXT: '/inactive',
        },
      },
    },
  },
  typings({
    context: 'number',
    eventsMap: {
      NEXT: 'primitive',
    },
  }),
).provideOptions(() => ({
  emitters: {
    interval: ({ merge, selector }) => {
      const ctx = selector(({ context }) => context);
      const TAKE_COUNT = 5;

      return createPausable(
        interval(WAITERS.short).pipe(
          take(TAKE_COUNT),
          map(v => v + 1),
          map(v => v * 5),
        ),
        value => merge({ context: ctx() + value }),
      );
    },
  },
}));
