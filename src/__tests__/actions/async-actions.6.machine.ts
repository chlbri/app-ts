import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/actions/async-actions.6.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          FILTER: { actions: 'filterEven' },
        },
      },
    },
  },
);
