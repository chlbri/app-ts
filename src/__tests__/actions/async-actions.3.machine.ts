import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/actions/async-actions.3.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          LOAD: { actions: 'loadUser', target: '/idle' },
        },
      },
    },
  },
);
