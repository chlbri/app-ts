import { createMachine } from '#machine';

export const DELAY = 1000;

export const machine = createMachine(
  'src/__tests__/interpreters/activities/constants',
  {
    initial: 'state1',
    states: {
      state1: {
        activities: { DELAY: 'activity1' },
        on: {
          NEXT: '/state2',
        },
      },
      state2: {
        on: {
          NEXT: '/state1',
        },
      },
    },
  },
);
