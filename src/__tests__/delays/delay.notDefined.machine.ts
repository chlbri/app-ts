import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/delays/delay.notDefined.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        after: {
          DELAY: '/active',
        },
      },
      active: {},
    },
  },
);
