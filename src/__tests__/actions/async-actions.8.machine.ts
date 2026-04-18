import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/actions/async-actions.8.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          INC: { actions: 'inc', target: '/idle' },
        },
      },
    },
  },
);
