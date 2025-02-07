import { createTests } from '@bemedev/vitest-extended';
import { nextSV } from './functions';

describe('NextSV', () => {
  const { success } = createTests(nextSV);

  describe(
    'SUcc',
    success(
      {
        invite: 'to perform #1',
        parameters: [
          { working: { fetch: 'idle', ui: 'idle' } },
          '/working/ui/input',
        ],
        expected: { working: { fetch: 'idle', ui: 'input' } },
      },
      {
        invite: 'to perform #2',
        parameters: [
          { working: { fetch: 'idle', ui: 'idle' } },
          '/working/fetch/fetch',
        ],
        expected: { working: { fetch: 'fetch', ui: 'idle' } },
      },
    ),
  );
});
