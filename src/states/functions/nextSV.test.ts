import { createTests } from '@bemedev/vitest-extended';
import { nextSV } from './nextSV';

describe('nextSV', () => {
  const { acceptation, success } = createTests(nextSV);

  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => success',
    success(
      {
        invite: 'empty from returns empty object',
        parameters: ['', 'test'],
        expected: {},
      },
      {
        invite: 'undefined target returns from',
        parameters: ['test'],
        expected: 'test',
      },
      {
        invite: 'empty target returns from',
        parameters: ['test', ''],
        expected: 'test',
      },
      {
        invite: 'target not including from returns target',
        parameters: ['test', 'other'],
        expected: 'test',
      },
      {
        invite: 'target including from that decomposes path',
        parameters: ['test', '/test/substate'],
        expected: { test: 'substate' },
      },
      {
        invite: 'empty object from returns empty object',
        parameters: [{}, '/test'],
        expected: {},
      },
      {
        invite: 'handles nested state transitions',
        parameters: [{ main: { sub: 'active' } }, '/main/sub/finished'],
        expected: { main: { sub: 'finished' } },
      },
      {
        invite: 'non-existing path returns target',
        parameters: [{ main: 'active' }, '/other/state'],
        expected: '/other/state',
      },
      {
        invite: 'handles deeply nested state transitions',
        parameters: [{ a: { b: { c: 'start' } } }, '/a/b/c/end'],
        expected: { a: { b: { c: 'end' } } },
      },
      {
        invite: 'handles multiple parallel states',
        parameters: [
          { main: 'active', secondary: 'idle' },
          '/main/finished',
        ],
        expected: { main: 'finished', secondary: 'idle' },
      },
      {
        invite: 'handles transitions with trailing delimiter',
        parameters: ['test', '/test/substate'],
        expected: { test: 'substate' },
      },
      {
        invite: 'handles transitions with multiple delimiters',
        parameters: ['test', '/test/sub/state'],
        expected: { test: { sub: 'state' } },
      },
      {
        invite: 'handles root level transitions',
        parameters: [{ main: 'active' }, '/idle'],
        expected: '/idle',
      },
      {
        invite: 'preserves unaffected nested states',
        parameters: [
          { main: { sub1: 'active', sub2: 'idle' } },
          '/main/sub1/finished',
        ],
        expected: { main: { sub1: 'finished', sub2: 'idle' } },
      },
      {
        invite: 'handles transitions to sibling states',
        parameters: [{ parent: { child1: 'active' } }, '/parent/child2'],
        expected: { parent: 'child2' },
      },
      {
        invite: 'handles invalid target path',
        parameters: [{ a: 'start' }, '/invalid/path/state'],
        expected: '/invalid/path/state',
      },
    ),
  );
});
