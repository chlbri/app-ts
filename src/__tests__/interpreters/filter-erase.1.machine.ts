import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/filter-erase.1.machine',
        {
          initial: 'state1',
          states: {
            state1: {
              on: {
                ADD: {
                  actions: 'addNumbers',
                },
                FILTER: {
                  actions: 'filterEven',
                  target: '/state2',
                },
              },
            },
            state2: {
              on: {
                RESET: '/state1',
              },
            },
          },
        },
        typings({
          context: {
            numbers: typings.array('number'),
          },
          eventsMap: {
            ADD: {
              values: typings.array('number'),
            },
            FILTER: 'primitive',
            RESET: 'primitive',
          },
        }),
      );
