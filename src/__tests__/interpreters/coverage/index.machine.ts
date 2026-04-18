import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/coverage/index.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            entry: ['inc'],
            on: {
              INC: { actions: ['inc', 'neverRun'] },
              'INC.PRIVATE': { actions: 'incPrivate' },
              NEXT: {
                description: 'Next',
                actions: ['inc', 'incPrivate'],
                target: '/final',
              },
            },
          },
          final: {},
        },
      },
      typings({
        eventsMap: {
          INC: 'primitive',
          'INC.PRIVATE': 'primitive',
          NEXT: 'primitive',
        },
        context: 'number',
        pContext: 'number',
      }),
    );
