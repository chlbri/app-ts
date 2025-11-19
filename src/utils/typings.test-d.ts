import {
  PartialCustom,
  type PARTIAL,
  type TransformPrimitiveObject,
  type inferT,
} from './typings';

describe('#01 => CustomPartial', () => {
  it('#01 => If contains "PARTIAL" value, it is a CustomPartial', () => {
    type TTT1 = {
      [PARTIAL]: undefined;
    } & {
      age: number;
    };

    expectTypeOf<TTT1>().toExtend<Partial<PartialCustom>>();
  });

  it('#02 => If not contains "PARTIAL" value, it is not a CustomPartial', () => {
    type TTT2 = {
      age: number;
    };

    expectTypeOf<TTT2>().not.toExtend<Partial<PartialCustom>>();
  });

  it('#03 => Test the strictly right type', () => {
    type TTT3 = {
      [PARTIAL]: undefined;
    };

    expectTypeOf<TTT3>().toExtend<Partial<PartialCustom>>();
  });

  it('#04 => should transform with "undefined" as string', () => {
    type TTT4 = TransformPrimitiveObject<{
      age: 'number';
      [PARTIAL]: 'undefined';
    }>;

    expectTypeOf<TTT4>().branded.toEqualTypeOf<{
      age: number;
      '$$app-ts => partial$$'?: undefined;
    }>();
  });

  it('#05 => should transform with "undefined" as number', () => {
    type TTT5 = inferT<{
      [PARTIAL]: undefined;
      age: 'number';
    }>;

    expectTypeOf<TTT5>().toEqualTypeOf<{
      age?: number | undefined;
    }>();
  });
});
