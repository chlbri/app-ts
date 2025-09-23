import { createMachine } from '#machine';
import { typings } from '#utils';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';
import { tap } from 'rxjs/internal/operators/tap';

export const WAITERS = {
  short: 200,
  medium: 500,
  long: 1000,
};

export const machineEmitter1 = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {},
    },
    emitters: [
      {
        description: 'interval emitter',
        name: 'interval',
      },
    ],
  },
  typings({
    context: 'number',
  }),
).provideOptions(() => ({
  emitters: {
    interval: ({ merge, status }) => {
      return interval(WAITERS.short)
        .pipe(
          take(5),
          map(v => v + 1),
          map(v => v * 5),
          tap(() => console.warn('status', '=>', status)),
          tap((x) => console.warn('context', '=>', x)),
        )
        .subscribe(context => merge({ context }));
    },
  },
}));
