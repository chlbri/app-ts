import { ARRAY, transformPrimitiveObject, typings } from './typings';

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

    expectTypeOf(record).branded.toEqualTypeOf<{
      Arthur: 'toto';
      Benoît: 'toto';
      Charles: 'toto';
    }>();
  });

  it('#03 => custom without value returns empty object', () => {
    const _custom = typings.custom<string>();
    const result = transformPrimitiveObject(_custom);

    expect(result).toStrictEqual({});
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  it('#04 => custom with literal value returns empty object', () => {
    const _custom = typings.custom<number>(42);
    const result = transformPrimitiveObject(_custom);

    expect(result).toStrictEqual({});
    expectTypeOf(result).toEqualTypeOf<number>();
  });

  it('#05 => optional with a value', () => {
    const _optional = typings.optional('string');
    const result = transformPrimitiveObject(_optional);

    expect(result).toBeUndefined();
    expectTypeOf(result).toEqualTypeOf<string | undefined>();
  });

  it('#06 => optional without value', () => {
    const _optional = typings.optional();
    const result = transformPrimitiveObject(_optional);

    expect(result).toBeUndefined();
  });

  it('#07 => maybe is an alias for optional', () => {
    expect(typings.maybe).toBe(typings.optional);
  });

  it('#08 => litterals produces a union of literal types', () => {
    const _lit = typings.litterals('a', 'b', 'c');
    const result = transformPrimitiveObject(_lit);

    expectTypeOf(result).toEqualTypeOf<'a' | 'b' | 'c'>();
  });

  it('#09 => union returns first element at runtime and union type', () => {
    const _union = typings.union('string', 'number', 'boolean');

    expect(_union).toBe('string');

    const result = transformPrimitiveObject(_union);
    expectTypeOf(result).toEqualTypeOf<string | number | boolean>();
  });

  it('#10 => array wraps value in ArrayCustom', () => {
    const _array = typings.array('string');

    expect(_array).toStrictEqual({ [ARRAY]: 'string' });

    const result = transformPrimitiveObject(_array);
    expectTypeOf(result).toEqualTypeOf<string[]>();
  });

  it('#11 => discriminatedUnion returns union of discriminated shapes', () => {
    const _du = typings.discriminatedUnion(
      'type',
      { type: typings.litterals('a'), value: 'string' },
      { type: typings.litterals('b'), value: 'number' },
    );

    const result = transformPrimitiveObject(_du);
    expectTypeOf(result).branded.toEqualTypeOf<
      { type: 'a'; value: string } | { type: 'b'; value: number }
    >();
  });

  it('#12 => intersection merges objects at runtime and produces flat type', () => {
    const _inter = typings.intersection(
      { name: 'string' },
      { age: 'number' },
    );

    expect(_inter).toStrictEqual({ name: 'string', age: 'number' });

    const result = transformPrimitiveObject(_inter);
    expectTypeOf(result).branded.toEqualTypeOf<{
      name: string;
      age: number;
    }>();
  });

  it('#13 => partial preserves entries and produces Partial type', () => {
    const _partial = typings.partial({ name: 'string', age: 'number' });

    expect(_partial).toStrictEqual({ name: 'string', age: 'number' });

    const result = transformPrimitiveObject(_partial);
    expectTypeOf(result).branded.toEqualTypeOf<{
      name?: string;
      age?: number;
    }>();
  });

  it('#14 => any returns value as-is', () => {
    const _any = typings.any({ name: 'string' });

    expect(_any).toStrictEqual({ name: 'string' });
    expectTypeOf(_any).toEqualTypeOf<{ name: 'string' }>();
  });

  it('#15 => soa returns value as-is', () => {
    const value = { name: 'string' } as const;
    const _soa = typings.soa(value);

    expect(_soa).toBe(value);
  });

  it('#16 => sv is a Custom<StateValue> typed as empty object', () => {
    expect(typings.sv).toStrictEqual({});
  });

  it('#17 => typings() with custom context produces transformed result', () => {
    const result = typings({ context: { name: 'string' } });

    expect(result.context).toStrictEqual({ name: undefined });
    expectTypeOf(result.context).branded.toEqualTypeOf<{
      readonly name: string;
    }>();
  });

  it('#18 => typings() with optional context field', () => {
    const result = typings({
      context: { label: typings.optional('string') },
    });

    expect(result.context).toStrictEqual({ label: undefined });
    expectTypeOf(result.context).branded.toEqualTypeOf<{
      readonly label?: string;
    }>();
  });

  it('#19 => typings() with tuple eventsMap', () => {
    const result = typings({
      eventsMap: typings.union(
        { type: typings.litterals('CLICK') },
        { type: typings.litterals('SUBMIT'), data: 'string' },
      ),
    });

    expectTypeOf(result.eventsMap).branded.toEqualTypeOf<
      { type: 'CLICK' } | { type: 'SUBMIT'; data: string }
    >();
  });

  it('#20 => transformPrimitiveObject handles nested object maps', () => {
    const result = transformPrimitiveObject({
      name: 'string',
      count: 'number',
      active: 'boolean',
    });

    expect(result).toStrictEqual({
      name: undefined,
      count: undefined,
      active: undefined,
    });
    expectTypeOf(result).branded.toEqualTypeOf<{
      name: string;
      count: number;
      active: boolean;
    }>();
  });
});
