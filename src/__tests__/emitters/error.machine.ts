import { createMachine } from '#machine';

export default createMachine('src/__tests__/emitters/error.machine', {
  initial: 'idle',
  actors: {
    interval: {
      next: {
        actions: ['assigN'],
      },
      error: {
        actions: ['signals'],
      },
    },
  },
  states: {
    idle: {},
  },
});
