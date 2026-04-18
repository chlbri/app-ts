import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/interpreters/selftransitions/always.2.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY3: '/notActive',
            },
            always: { guards: 'returnFalse', target: '/active' },
          },
          active: {},
          notActive: {},
        },
      },
      defaultT,
    );
