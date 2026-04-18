import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/coverage/actors/2ids.1.machine',
  {
    activities: {
      DELAY: ['inc'],
      DELAY2: ['inc2'],
    },
  },
);
