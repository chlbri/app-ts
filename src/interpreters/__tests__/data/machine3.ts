import { t } from '@bemedev/types';
import { createMachine } from '~machine';
import { createConfig } from '~machines';

export const config3 = createConfig({
  description: 'cdd',
  states: {
    state1: {
      states: {
        state11: {
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
        EVENT2: '/state4',
        EVENT3: { actions: 'dodo5' },
      },
      always: [
        { actions: 'dodo6', guards: 'guard2', target: '/state3' },
        {
          actions: ['dodo7', 'doré3', 'doré1'],
          guards: 'guard2',
          target: '/state3',
        },
        '/state1',
      ],
      promises: [
        {
          src: 'promise1',
          then: { actions: 'action1' },
          catch: [{ guards: 'ert', actions: 'action14' }, '/state1'],
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
          catch: [{ guards: 'ert', actions: 'action15' }, '/state1'],
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
  {
    pContext: { data: t.string },
    context: { age: t.number },
    eventsMap: {
      EVENT: { password: t.string, username: t.string },
      EVENT2: t.boolean,
      EVENT3: { login: t.string, pwd: t.string },
    },
  },
  { '/': 'state1', '/state1': 'state11', '/state1/state11': 'state111' },
);

export type Machine3 = typeof machine3;

export type Config3 = typeof config3;
