import { createMachine } from '#machine';

const idM = { name: 'machineNotDefined', description: 'Not defined' };

export default createMachine('src/__tests__/machine/cov.3.machine', {
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
});
