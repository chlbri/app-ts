import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

const idM = { name: 'machineNotDefined', description: 'Not defined' };

export default createMachine(
  'src/__tests__/machine/cov.3.machine',
  {
    initial: 'idle',
    states: {
      idle: {},
    },
    actors: {
      [idM.name]: {
        description: idM.description,
        on: {},
      },
    },
  },
  defaultT as any,
  // defaultI,
);
