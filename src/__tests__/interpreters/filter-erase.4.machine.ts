import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/filter-erase.4.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          SET_NAME: {
            actions: 'setName',
          },
          CLEAR_NAME: {
            actions: 'clearName',
            target: '/cleared',
          },
        },
      },
      cleared: {},
    },
  },
);
