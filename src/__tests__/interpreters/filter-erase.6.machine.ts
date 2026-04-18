import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/filter-erase.6.machine',
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_DATA: {
                  actions: 'setData',
                },
                CLEAR_ALL: {
                  actions: 'clearAll',
                  target: '/cleared',
                },
              },
            },
            cleared: {},
          },
        },
        typings({
          context: typings.partial({
            name: 'string',
            email: 'string',
            age: 'number',
          }),
          eventsMap: {
            SET_DATA: {
              name: 'string',
              email: 'string',
              age: 'number',
            },
            CLEAR_ALL: 'primitive',
          },
          promiseesMap: {},
        }),
      );
