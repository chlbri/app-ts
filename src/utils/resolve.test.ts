import { createTests } from '@bemedev/vitest-extended';
import { resolve } from './resolve';

describe('#01 => Resolve', () => {
  const { acceptation, success } = createTests(resolve);

  describe('#01.00 => Acceptation', acceptation);

  describe(
    '#01.01 => For parents',
    success(
      {
        invite: 'Parent, on step',
        expected: '/parent/child/grandchild',
        parameters: [
          '/parent/child/grandchild/grantchild',
          '../grandchild',
        ],
      },

      {
        invite: 'Parent, on step without name',
        expected: '/parent/child/grandchild',
        parameters: ['/parent/child/grandchild/grantchild', '..'],
      },

      {
        invite: 'Parent, on step without name and "/" at the end',
        expected: '/parent/child/grandchild',
        parameters: ['/parent/child/grandchild/grantchild', '../'],
      },

      {
        invite: 'Same path, without name #1',
        expected: '/parent/child/grandchild/grantchild',
        parameters: ['/parent/child/grandchild/grantchild', '.'],
      },

      {
        invite: 'Same path, without name #2',
        expected: '/parent/child/grandchild/grantchild',
        parameters: ['/parent/child/grandchild/grantchild', './'],
      },

      {
        invite: 'Parent, on step, but missing args',
        expected: '/parent/child/grandchild',
        parameters: [
          '/parent/child/grandchild/grantchild',
          '../../grandchild',
        ],
      },

      {
        invite: 'Two steps, without name',
        expected: '/parent/child',
        parameters: ['/parent/child/grandchild/grantchild', '../../'],
      },
      {
        invite: '3 steps',
        expected: '/parent',
        parameters: [
          '/parent/child/grandchild/grantchild',
          '../../../parent',
        ],
      },
      {
        invite: '3 steps, without name',
        expected: '/parent',
        parameters: ['/parent/child/grandchild/grantchild', '../../../'],
      },

      {
        invite: '4 steps, with name',
        expected: '/parent',
        parameters: [
          '/parent/child/grandchild/grantchild',
          '../../../../parent',
        ],
      },
      {
        invite: '4 steps, with ranom name',
        expected: '/random',
        parameters: [
          '/parent/child/grandchild/grantchild',
          '../../../../random',
        ],
      },

      {
        invite: 'out of bounds',
        expected: '/',
        parameters: [
          '/parent/child/grandchild/grantchild',
          '../../../../../',
        ],
      },

      {
        invite: 'out of bounds, with random name',
        expected: '/random',
        parameters: [
          '/parent/child/grandchild/grantchild',
          '../../../../../random',
        ],
      },

      {
        invite: 'Get the origin',
        expected: '/',
        parameters: ['/parent/child/grandchild/grantchild', '/'],
      },

      {
        invite: 'Get the origin',
        expected: '/',
        parameters: ['/parent/child/grandchild', '/'],
      },
    ),
  );

  describe(
    '#01.02 => For children',
    success(
      {
        invite: 'Child, on step',
        expected: '/parent/child/grandchild',
        parameters: ['/parent/child', './grandchild'],
      },

      {
        invite: 'Child, on step without name and "/" at the end',
        expected: '/parent/child/grandchild',
        parameters: ['/parent', './child/grandchild'],
      },
    ),
  );
});
