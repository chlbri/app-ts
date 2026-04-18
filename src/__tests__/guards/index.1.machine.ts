import { createMachine } from '#machine';

export default createMachine('src/__tests__/guards/index.1.machine', {
  initial: 'state1',
  states: {
    state1: {
      always: {
        guards: 'guard1',
        target: '/state2',
      },
    },
    state2: {},
  },
});
