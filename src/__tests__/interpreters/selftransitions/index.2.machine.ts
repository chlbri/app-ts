import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/interpreters/selftransitions/index.2.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            always: ['/active'],
          },
          active: {},
        },
      },
      defaultT,
    );
