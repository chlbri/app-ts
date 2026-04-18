import { createMachine } from '#machine';
import { defaultT } from '#fixtures';
import { createConfig } from '#machines';

const simpleConfig = createConfig({
  initial: 'idle',
  states: {
    idle: {
      after: {
        DELAY: '/active',
      },
    },
    active: {},
  },
});

export default createMachine(
  'src/__tests__/interpreters/selftransitions/after.1.machine',
  simpleConfig,
  defaultT,
);
