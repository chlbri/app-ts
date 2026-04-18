import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/interpreters/selftransitions/after.2.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY1: '/result1',
              DELAY2: '/result2',
            },
          },
          result1: {},
          result2: {},
        },
      },
      defaultT,
    );
