import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/filter-erase.5.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          SET_USER: {
            actions: 'setUser',
          },
          CLEAR_EMAIL: {
            actions: 'clearEmail',
          },
        },
      },
    },
  },
);
