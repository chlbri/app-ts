import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/filter-erase.4.machine',
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_NAME: {
                  actions: 'setName',
                },
                CLEAR_NAME: {
                  actions: 'clearName',
                  target: '/cleared',
                },
              },
            },
            cleared: {},
          },
        },
        typings({
          context: {
            name: typings.optional('string'),
            data: 'number',
          },
          eventsMap: {
            SET_NAME: { name: 'string' },
            CLEAR_NAME: 'primitive',
          },
        }),
      );
