import { createMachine } from '#machine';

export default createMachine('src/__tests__/actions/actions.1.machine', {
  initial: 'state1',
  states: {
    state1: {
      always: {
        actions: 'action1',
        target: '/state2',
      },
    },
    state2: {
      on: {
        NEXT: '/state1',
      },
    },
  },
});
