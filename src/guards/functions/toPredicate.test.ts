import { toPredicate } from './toPredicate';

describe('toPredicate - coverage', () => {
  test('toPredicate - and', () => {
    const out = toPredicate(
      {},
      {},
      { and: ['non-exist2', 'non-exist1'] },
      {},
    );

    expect(out).toStrictEqual({
      errors: [
        'Predicate (non-exist2) is not defined',
        'Predicate (non-exist1) is not defined',
      ],
    });
  });

  test('toPredicate - or', () => {
    const out = toPredicate(
      {},
      {},
      { or: ['non-exist2', 'non-exist1'] },
      {},
    );

    expect(out).toStrictEqual({
      errors: [
        'Predicate (non-exist2) is not defined',
        'Predicate (non-exist1) is not defined',
      ],
    });
  });
});
