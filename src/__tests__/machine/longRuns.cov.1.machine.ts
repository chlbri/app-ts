import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/machine/longRuns.cov.1.machine',
      { __longRuns: true, initial: 'idle', states: { idle: {} } },
      typings({ eventsMap: {}, context: 'number' }),
    );
