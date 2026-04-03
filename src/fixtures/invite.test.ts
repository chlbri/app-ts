import { createTests } from '@bemedev/dev-utils/vitest-extended';
import { buildInvite } from './invite';

describe('buildInvite', () => {
  const { acceptation, success, fails } = createTests(buildInvite);

  describe('#00 => acceptation', acceptation);

  describe(
    '#01 => success',
    success(
      {
        invite: 'default',
        parameters: ['default'],
        expected: '#0 => default',
      },
      {
        invite: 'index = 0; max = 0',
        parameters: ['default', 0, 0],
        expected: '#0 => default',
      },
      {
        invite: 'index = 1; max = 100',
        parameters: ['default', 1, 100],
        expected: '#001 => default',
      },
      {
        invite: 'index = 2; max = 10',
        parameters: ['default', 2, 10],
        expected: '#02 => default',
      },
    ),
  );

  describe(
    '#02 => fails',
    fails(
      {
        invite: 'index < 0',
        parameters: ['default', -1, 10],
        error: 'index (-1) and max (10) must be positive integers',
      },
      {
        invite: 'max < 0',
        parameters: ['default', 0, -10],
        error: 'index (0) and max (-10) must be positive integers',
      },
      {
        invite: 'max < 0; index < 0',
        parameters: ['default', -1, -10],
        error: 'index (-1) and max (-10) must be positive integers',
      },
      {
        invite: 'index > max',
        parameters: ['default', 11, 10],
        error: 'index (11) must be less than or equal to max (10)',
      },
    ),
  );
});
