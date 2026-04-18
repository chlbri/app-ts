import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/children.5.machine',
  {
    actors: {
      child: {
        on: {
          NEXT: {
            actions: ['notify'],
          },
        },
      },
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          NEXT: {
            actions: ['sendChildNext'],
          },
        },
      },
    },
  },
);
