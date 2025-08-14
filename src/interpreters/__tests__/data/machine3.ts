import { createMachine } from '#machine';
import { createConfig } from '#machines';
import { typings } from '#utils';

export const config3 = createConfig({
  description: 'cdd',
  initial: 'state1',
  states: {
    state1: {
      initial: 'state11',
      states: {
        state11: {
          initial: 'state111',
          states: {
            state111: {},
          },
        },
        state12: {
          activities: {
            DELAY5: 'deal',
            DELAY17: 'deal17',
          },
        },
      },
    },
    state2: {
      after: {
        DELAY: { actions: ['dodo1', 'doré'] },
        DELAY2: '/state2',
        DELAY3: { actions: 'dodo2' },
      },
      on: {
        EVENT: { actions: ['dodo3', 'doré1'] },
        EVENT2: '/',
        EVENT3: { actions: 'dodo5' },
      },
      always: [
        {
          actions: 'dodo6',
          guards: 'guard2',
          target: '/state1/state11',
        },
        {
          actions: ['dodo7', 'doré3', 'doré1'],
          guards: 'guard2',
          target: '/state1/state12',
        },
        '/state1/state11',
      ],
      promises: [
        {
          src: 'promise1',
          then: { actions: 'action1' },
          catch: [
            { guards: 'ert', actions: 'action14' },
            '/state1/state12',
          ],
          finally: [
            {
              actions: 'action13',
              guards: 'guar34',
            },
            {
              guards: 'guard4',
              actions: 'action13',
            },
            'action22',
          ],
        },
        {
          src: 'promise2',
          then: [
            { actions: 'action4', guards: 'guard2' },
            { actions: 'action3' },
          ],
          catch: [
            { guards: 'ert', actions: 'action15' },
            '/state1/state12',
          ],
          finally: [
            {
              guards: 'guard',
              actions: 'action12',
            },
            'action20',
          ],
        },
      ],
    },
  },
  machines: { description: 'A beautiful machine', name: 'machine1' },
});

export const machine3 = createMachine(
  config3,
  typings({
    eventsMap: {
      EVENT: { password: 'string', username: 'string' },
      EVENT2: 'boolean',
      EVENT3: { login: 'string', pwd: 'string' },
    },
    promiseesMap: {},
    pContext: { data: 'string' },
    context: { age: 'number' },
  }),
);

export type Machine3 = typeof machine3;

export type Config3 = typeof config3;
