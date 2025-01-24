import { reFunction } from '@bemedev/basicfunc';
import { createTests } from '@bemedev/vitest-extended';
import { Machine } from '~machine';
import { config1 } from './fixtures';

describe('provideInitials', () => {
  const machine = new Machine(config1);

  const provide = reFunction(machine, 'provideInitials');

  const { acceptation, success } = createTests(provide);

  describe('#0 => Acceptation', acceptation);

  const expected1 = {
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
          DELAY: {
            actions: ['dodo1', 'doré'],
          },
          DELAY2: '/state2',
          DELAY3: {
            actions: 'dodo2',
          },
        },
        on: {
          EVENT: {
            actions: ['dodo3', 'doré1'],
          },
          EVENT2: '/state4',
          EVENT3: {
            actions: 'dodo5',
          },
        },
        always: [
          {
            actions: 'dodo6',
            guards: 'guard2',
            target: '/state3',
          },
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
            then: {
              actions: 'action1',
            },
            catch: [
              {
                guards: 'ert',
                actions: 'action14',
              },
              '/state1',
            ],
            finally: [
              {
                actions: 'action13',
                guards: 'guar34',
              },
              {
                in: '/state4',
                actions: 'action13',
              },
              'action22',
            ],
          },
          {
            src: 'promise2',
            then: [
              {
                actions: 'action4',
                guards: 'guard2',
              },
              {
                actions: 'action3',
              },
            ],
            catch: [
              {
                guards: 'ert',
                actions: 'action15',
              },
              '/state1',
            ],
            finally: [
              {
                in: '/state4',
                actions: 'action12',
              },
              'action20',
            ],
          },
        ],
      },
    },
  } as const;

  const expected2 = {
    description: 'cdd',
    initial: 'state2',
    states: {
      state1: {
        initial: 'state12',
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
          DELAY: {
            actions: ['dodo1', 'doré'],
          },
          DELAY2: '/state2',
          DELAY3: {
            actions: 'dodo2',
          },
        },
        on: {
          EVENT: {
            actions: ['dodo3', 'doré1'],
          },
          EVENT2: '/state4',
          EVENT3: {
            actions: 'dodo5',
          },
        },
        always: [
          {
            actions: 'dodo6',
            guards: 'guard2',
            target: '/state3',
          },
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
            then: {
              actions: 'action1',
            },
            catch: [
              {
                guards: 'ert',
                actions: 'action14',
              },
              '/state1',
            ],
            finally: [
              {
                actions: 'action13',
                guards: 'guar34',
              },
              {
                in: '/state4',
                actions: 'action13',
              },
              'action22',
            ],
          },
          {
            src: 'promise2',
            then: [
              {
                actions: 'action4',
                guards: 'guard2',
              },
              {
                actions: 'action3',
              },
            ],
            catch: [
              {
                guards: 'ert',
                actions: 'action15',
              },
              '/state1',
            ],
            finally: [
              {
                in: '/state4',
                actions: 'action12',
              },
              'action20',
            ],
          },
        ],
      },
    },
  } as const;

  describe(
    '#2 => success',
    success(
      {
        invite: 'First child as initial',
        parameters: {
          '/': 'state1',
          '/state1': 'state11',
          '/state1/state11': 'state111',
        },
        expected: expected1,
      },
      {
        invite: 'Second child as initial',
        parameters: {
          '/': 'state2',
          '/state1': 'state12',
          '/state1/state11': 'state111',
        },
        expected: expected2,
      },
    ),
  );

  test.todo('Console.log', () => {
    const actual = provide({
      '/': 'state1',
      '/state1': 'state11',
      '/state1/state11': 'state111',
    });

    console.log(JSON.stringify(actual, null, 2));
  });
});
