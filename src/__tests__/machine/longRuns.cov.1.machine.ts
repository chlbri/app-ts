import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/machine/longRuns.cov.1.machine',
  { __longRuns: true, initial: 'idle', states: { idle: {} } },
);
