import { createTests } from '@bemedev/vitest-extended';
import { assignByKey, getByKey, mergeByKey } from './contexts';

describe('functions', () => {
  describe('#01 => assignByKey', () => {
    const { acceptation, success } = createTests(assignByKey);

    describe('Acceptation', acceptation);

    describe(
      'Success',
      success(
        {
          invite: 'small object',
          parameters: [{ a: 1, b: true }, 'a', 2],
          expected: { a: 2, b: true },
        },

        {
          invite: 'nested object #1',
          parameters: [{ a: { b: 1 } }, 'a.b', 2],
          expected: { a: { b: 2 } },
        },

        {
          invite: 'nested object #2',
          parameters: [{ a: { b: { c: 1 } }, b: 'file' }, 'a.b.c', 2],
          expected: { a: { b: { c: 2 } }, b: 'file' },
        },

        {
          invite: 'nested object #3',
          parameters: [
            { a: { b: { c: 1 }, d: true }, b: 'file' },
            'a.d',
            false,
          ],
          expected: { a: { b: { c: 1 }, d: false }, b: 'file' },
        },
      ),
    );
  });

  describe('#02 => getByKey', () => {
    const { acceptation, success } = createTests(getByKey);

    describe('Acceptation', acceptation);

    describe(
      'Success',
      success(
        {
          invite: 'small object',
          parameters: [{ a: 1, b: true }, 'a'],
          expected: 1,
        },

        {
          invite: 'nested object #1',
          parameters: [{ a: { b: 3 } }, 'a.b'],
          expected: 3,
        },

        {
          invite: 'nested object #2',
          parameters: [{ a: { b: { c: 14 } }, b: 'file' }, 'a.b.c'],
          expected: 14,
        },

        {
          invite: 'nested object #3',
          parameters: [{ a: { b: { c: 1 }, d: true }, b: 'file' }, 'a.d'],
          expected: true,
        },
      ),
    );
  });

  describe('#03 => mergeByKey', () => {
    const func = mergeByKey({ a: 1, b: { c: 2 } });
    const { acceptation, success } = createTests(func);

    describe('Acceptation', acceptation);

    describe(
      'Success',
      success(
        {
          invite: 'small object',
          parameters: ['a', 2],
          expected: { a: 2 },
        },

        {
          invite: 'nested object #1',
          parameters: ['b.c', 3],
          expected: { b: { c: 3 } },
        },

        {
          invite: 'nested object #2',
          parameters: ['b.d', 4],
          expected: { b: { d: 4 } },
        },
      ),
    );
  });
});
