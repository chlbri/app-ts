import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

const idM = 'machineNotDefined' as const;

export default createMachine('src/__tests__/machine/cov.2.machine',
        {
          initial: 'idle',
          states: {
            idle: {},
          },
          actors: {
            [idM]: {
              on: {},
            },
          },
        },
        defaultT as any,
        // defaultI,
      );
