import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/activities/perform.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        activities: {
          DELAY: 'inc',
        },
        on: {
          PAUSE: { actions: 'pause' },
          RESUME: { actions: 'resume' },
          STOP: { actions: 'stop' },
        },
      },
    },
  },
);
