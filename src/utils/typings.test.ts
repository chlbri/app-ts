import { transformPrimitiveObject, typings } from './typings';

describe('Coverage', () => {
  it('#01 => should correctly transform TupleCustom types', () => {
    const _tuple = typings.tuple('string', 'boolean');

    expect(_tuple).toEqual(['string', 'boolean']);

    // #region Typing
    const tuple = transformPrimitiveObject(_tuple);
    expectTypeOf(tuple).toEqualTypeOf<[string, boolean]>();
    // #endregion
  });
  it('#02 => Record', () => {
    const _record = typings.record(
      typings.litterals('toto'),
      'Arthur',
      'Benoît',
      'Charles',
    );

    expect(_record).toStrictEqual({
      Arthur: 'toto',
      Benoît: 'toto',
      Charles: 'toto',
    });

    const record = transformPrimitiveObject(_record);

    expectTypeOf(record).toEqualTypeOf<{
      Arthur: 'toto';
      Benoît: 'toto';
      Charles: 'toto';
    }>();
  });
});
