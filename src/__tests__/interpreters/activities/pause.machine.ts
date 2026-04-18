import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/activities/pause.machine',
    {
      initial: 'idle',
      states: {
        idle: {
          entry: 'inc',
          on: {
            PAUSE: { actions: 'pause' },
            RESUME: { actions: 'resume' },
            STOP: { actions: 'stop' },
            NEXT: '/next',
          },
        },
        next: {
          always: '/idle',
        },
      },
    },
    typings({
      eventsMap: {
        PAUSE: 'primitive',
        RESUME: 'primitive',
        STOP: 'primitive',
        NEXT: 'primitive',
      },

      promiseesMap: 'primitive',

      context: {
        iterator: 'number',
      },
    }),
  );
