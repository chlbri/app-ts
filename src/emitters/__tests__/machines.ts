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

export const machineEmitter1 = createMachine(
  {
    initial: 'initialize',
    actors: {
      src: 'interval',
      id: 'interval',
      next: {
        actions: ['assigN'],
      },
    },

    states: {
      initialize: {
        always: {
          actions: ['initialize'],
          target: '/inactive',
        },
      },
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
      initialize: assign('context', () => 0),
    },
    actors: {
      emitters: {
        interval: interval(WAITERS.short).pipe(
          take(5),
          map(v => v + 1),
          map(v => v * 5),
        ),
      },
    },
  }),
);

export const machineEmitter3 = createMachine(
  {
    initial: 'initialize',

    states: {
      initialize: {
        always: {
          actions: ['initialize'],
          target: '/inactive',
        },
      },
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
          src: 'interval',
          id: 'interval1',
          next: {
            actions: ['assigN'],
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
        interval: { next: 'number', error: 'primitive' },
      },
    },
  }),
).provideOptions(({ assign }) => ({
  actions: {
    assigN: assign('context', {
      'interval::next': ({ payload, context }) => {
        return notU(context) + payload;
      },
    }),
    initialize: assign('context', () => 0),
  },
  actors: {
    emitters: {
      interval: interval(WAITERS.short).pipe(
        take(5),
        map(v => v + 1),
        map(v => v * 5),
      ),
    },
  },
}));
