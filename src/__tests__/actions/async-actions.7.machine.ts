import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/actions/async-actions.7.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          DISPATCH: { actions: 'dispatchEvent', target: '/idle' },
        },
      },
    },
  },
);
