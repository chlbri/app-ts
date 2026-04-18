import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/filter-erase.5.machine',
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_USER: {
                  actions: 'setUser',
                },
                CLEAR_EMAIL: {
                  actions: 'clearEmail',
                },
              },
            },
          },
        },
        typings({
          context: {
            user: {
              name: 'string',
              email: typings.optional('string'),
            },
          },
          eventsMap: {
            SET_USER: { name: 'string', email: 'string' },
            CLEAR_EMAIL: 'primitive',
          },
          promiseesMap: {},
        }),
      );
