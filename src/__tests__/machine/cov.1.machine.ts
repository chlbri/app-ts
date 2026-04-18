import { createMachine } from '#machine';

export default createMachine('src/__tests__/machine/cov.1.machine', {
  initial: 'idle',
  states: {
    idle: {
      on: {
        NEXT: '/state1',
      },
    },
    state1: {
      activities: { DELAY: 'inc' },
      initial: 'state11',
      states: {
        state11: {
          initial: 'state111',
          states: {
            state111: {
              initial: 'state1111',
              states: {
                state1111: {},
              },
            },
            state112: {},
          },
        },
      },
    },
  },
});
