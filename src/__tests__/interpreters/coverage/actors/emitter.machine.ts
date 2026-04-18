import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/coverage/actors/emitter.machine',
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
);
