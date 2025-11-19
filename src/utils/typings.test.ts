import { transformPrimitiveObject, typings } from './typings';

describe('Coverage', () => {
  describe('TupleCustom typing', () => {
    it('should correctly transform TupleCustom types', () => {
      const _tuple = typings.tuple('string', 'boolean');

      expect(_tuple).toEqual(['string', 'boolean']);

      // #region Typing
      const tuple = transformPrimitiveObject(_tuple);
      expectTypeOf(tuple).toEqualTypeOf<[string, boolean]>();
      // #endregion
    });
  });
});
