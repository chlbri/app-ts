import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/coverage/actors/emitter.machine',
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
