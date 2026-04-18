import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/interpreters/selftransitions/after.5.machine',
      {
        initial: 'idle',
        states: {
          idle: { after: { DELAY: '/active' } },
          active: {},
        },
      },
      defaultT,
    );
