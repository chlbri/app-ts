import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/coverage/actors/2ids.1.machine',
      {
        activities: {
          DELAY: ['inc'],
          DELAY2: ['inc2'],
        },
      },
      typings({ context: { iter1: 'number', iter2: 'number' } }),
    );
