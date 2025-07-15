import {
  PartialCustom,
  type PARTIAL,
  type TransformPrimitiveObject,
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
      [PARTIAL]: 'undefined';
      age: 'number';
    }>;

    expectTypeOf<TTT4>().toExtend<{
      age: number;
      '$$app-ts => partial$$': undefined;
    }>();
  });

  it('#05 => should transform with "undefined" as number', () => {
    type TTT5 = TransformPrimitiveObject<{
      [PARTIAL]: undefined;
      age: 'number';
    }>;

    expectTypeOf<TTT5>().toExtend<{
      age?: number | undefined;
    }>();
  });
});
