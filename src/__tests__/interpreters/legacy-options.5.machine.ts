import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/legacy-options.5.machine',
  {
    initial: 'idle',
    states: {
      idle: {},
    },
  },
);
