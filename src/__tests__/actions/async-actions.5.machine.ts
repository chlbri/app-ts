import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/actions/async-actions.5.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              PING: { actions: 'ping', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { PING: 'primitive' },
        context: { errored: 'boolean' },
      }),
    );
