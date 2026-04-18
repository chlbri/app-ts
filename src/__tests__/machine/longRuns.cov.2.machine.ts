import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/machine/longRuns.cov.2.machine',
  { initial: 'idle', states: { idle: {} } },
);
