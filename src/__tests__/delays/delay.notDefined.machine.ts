import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/delays/delay.notDefined.machine',
    {
      initial: 'idle',
      states: {
        idle: {
          after: {
            DELAY: '/active',
          },
        },
        active: {},
      },
    },
    typings(),
  );
