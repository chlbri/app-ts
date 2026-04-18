import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/filter-erase.6.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          SET_DATA: {
            actions: 'setData',
          },
          CLEAR_ALL: {
            actions: 'clearAll',
            target: '/cleared',
          },
        },
      },
      cleared: {},
    },
  },
);
