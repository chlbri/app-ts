import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/filter-erase.1.machine',
  {
    initial: 'state1',
    states: {
      state1: {
        on: {
          ADD: {
            actions: 'addNumbers',
          },
          FILTER: {
            actions: 'filterEven',
            target: '/state2',
          },
        },
      },
      state2: {
        on: {
          RESET: '/state1',
        },
      },
    },
  },
);
