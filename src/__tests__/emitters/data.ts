import { createMachine } from '#machine';
import { notU, typings } from '#utils';
import { createPausable } from '@bemedev/rx-pausable';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';

export const WAITERS = {
  short: 200,
  medium: 500,
  long: 1000,
};

export const machineEmitter1 = createMachine('src/__tests__/emitters/data',
  {
    initial: 'inactive',
    actors: {
      interval: {
        next: {
          actions: ['assigN'],
        },
        complete: {
          actions: ['mockCompleteAction'],
        },
      },
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
    actorsMap: {
      emitters: {
        interval: { next: 'number', error: 'primitive' },
      },
    },
  }),
);

export const machineEmitter2 = machineEmitter1.provideOptions(
  ({ assign }) => ({
    actions: {
      assigN: assign('context', {
        'interval::next': ({ payload, context }) =>
          notU(context) + payload,
      }),
    },
    actors: {
      emitters: {
        interval: () =>
          createPausable(
            interval(WAITERS.short).pipe(
              take(5),
              map(v => v + 1),
              map(v => v * 5),
            ),
          ),
      },
    },
  }),
);

export const machineEmitter3 = createMachine('src/__tests__/emitters/data._2',
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
        actors: {
          interval1: {
            next: {
              actions: ['assigN'],
            },
            description: 'Interval emitter for active state',
            complete: {
              name: 'mockCompleteAction',
              description: 'Mock complete action',
            },
          },
        },
      },
    },
  },
  typings({
    context: 'number',
    eventsMap: {
      NEXT: 'primitive',
    },
    actorsMap: {
      emitters: {
        interval1: { next: 'number', error: 'primitive' },
      },
    },
  }),
).provideOptions(({ assign }) => ({
  actions: {
    assigN: assign('context', {
      'interval1::next': ({ payload, context }) => {
        return notU(context) + payload;
      },
    }),
  },
  actors: {
    emitters: {
      interval1: () =>
        createPausable(
          interval(WAITERS.short).pipe(
            take(5),
            map(v => v + 1),
            map(v => v * 5),
          ),
        ),
    },
  },
}));
