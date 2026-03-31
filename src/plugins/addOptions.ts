import { PrimitiveObject, Fn } from '#bemedev/globals/types';
import { EventObject } from '#events';
import { AddOption } from '#machines';
import { FnR, RecordS } from '~types';

type OptionFn<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Fn<any[], FnR<E, Pc, Tc, T>>;

type Options<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = RecordS<OptionFn<E, Pc, Tc, T>>;

export type AddOptionHelper_Fn = <
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Addons extends Options<E, Pc, Tc, T> = Options<E, Pc, Tc, T>,
>(
  legacy: Pick<
    AddOption<E, Pc, Tc, T>,
    | 'assign'
    | 'batch'
    | 'erase'
    | 'filter'
    | 'isDefined'
    | 'isNotDefined'
    | 'isNotValue'
    | 'isValue'
    | 'voidAction'
  >,
) => Addons;

type AddOptions_Fn = <
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  const Addons extends Options<E, Pc, Tc, T> = Options<E, Pc, Tc, T>,
>(
  legacy: AddOption<E, Pc, Tc, T>,
  helpers: (
    legacy: Pick<
      AddOption<E, Pc, Tc, T>,
      | 'assign'
      | 'batch'
      | 'erase'
      | 'filter'
      | 'isDefined'
      | 'isNotDefined'
      | 'isNotValue'
      | 'isValue'
      | 'voidAction'
    >,
  ) => Addons,
) => AddOption<E, Pc, Tc, T> & Addons;

export const addOptions: AddOptions_Fn = (legacy, helpers) => {
  const out = {
    ...legacy,
    ...helpers(legacy),
  };

  return out;
};
