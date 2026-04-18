import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/interpreters/selftransitions/always.1.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY: '/notActive',
            },
            always: '/active',
          },
          active: {},
          notActive: {},
        },
      },
      defaultT,
    );
