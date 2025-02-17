import type { DefinedValue } from 'src/guards/types';
import type { EventsMap, ToEvents } from '~events';
import type { PrimitiveObject } from '~types';
import { isValue } from './value';

export type IsDefinedS_F = <
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  path: DefinedValue<E, Pc, Tc>,
) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => boolean;

export const isDefinedS: IsDefinedS_F = path => {
  return isValue(path, undefined);
};
