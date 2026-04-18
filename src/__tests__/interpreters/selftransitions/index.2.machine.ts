import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/selftransitions/index.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        always: ['/active'],
      },
      active: {},
    },
  },
);
