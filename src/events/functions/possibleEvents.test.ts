import { createTests } from '@bemedev/vitest-extended';
import { possibleEvents } from './possibleEvents';

describe('possibleEvents', () => {
  const { acceptation, success } = createTests(possibleEvents);

  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => success',
    success(
      {
        invite: 'should return an empty array when input is empty',
        parameters: {},
        expected: [],
      },
      {
        invite:
          'should return an array of event keys when input has defined events',
        parameters: {
          node1: { on: { event1: 'any', event2: 'any' } },
          node2: { on: { event3: 'any' } },
        },
        expected: ['event1', 'event2', 'event3'],
      },
      {
        invite: 'should ignore nodes without events',
        parameters: {
          node1: { on: { event1: 'any' } },
          node2: {},
          node3: { on: { event2: 'any' } },
        },
        expected: ['event1', 'event2'],
      },
      {
        invite: 'should handle nodes with undefined events',
        parameters: {
          node1: { on: { event1: 'any' } },
          node2: { on: undefined },
          node3: { on: { event2: 'any' } },
        },
        expected: ['event1', 'event2'],
      },
    ),
  );
});
