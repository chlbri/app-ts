import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/children.1.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        activities: { DELAY: 'inc' },
      },
    },
  },
  {
    context: 'number',
  },
);
