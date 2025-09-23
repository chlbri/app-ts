import { createMachine } from '#machine';
import { typings } from '#utils';
import { Subscription, type Observable } from 'rxjs';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';
import { tap } from 'rxjs/internal/operators/tap';

export function tapWhile<T>(
  predicate: (value: T) => boolean,
  sideEffect: (value: T) => void,
) {
  return (source: Observable<T>) =>
    source.pipe(
      tap(value => {
        if (predicate(value)) {
          sideEffect(value);
        }
      }),
    );
}

export const WAITERS = {
  short: 200,
  medium: 500,
  long: 1000,
};

export const machineEmitter1 = createMachine(
  {
    initial: 'inactive',
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
    emitters: [
      {
        description: 'interval emitter',
        name: 'interval',
      },
    ],
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
      const value = selector(({ value }) => value);
      const TAKE_COUNT = 5;

      const out = interval(WAITERS.short).pipe(
        take(TAKE_COUNT),
        tap(() => console.warn('status', '=>', value())),
        map(v => v + 1),
        map(v => v * 5),
      );

      let sub: Subscription | undefined;

      return {
        start: () => {
          sub = out.subscribe(value => merge({ context: ctx() + value }));
          return sub;
        },
        stop: () => {
          return sub?.unsubscribe();
        },
      };
    },
  },
}));
