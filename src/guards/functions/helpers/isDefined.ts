import type { DefinedValue } from 'src/guards/types';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import type { PrimitiveObject } from '~types';
import { isNotValue, isValue } from './value';

export type IsDefinedS_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  path: DefinedValue<Pc, Tc>,
) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E, P>) => boolean;

export const isDefinedS: IsDefinedS_F = path => {
  return isNotValue(path, undefined, null);
};

export const isNotDefinedS: IsDefinedS_F = path => {
  return isValue(path, undefined, null);
};
