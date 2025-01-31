import type { Unionize } from '@bemedev/types';
import type {
  AlwaysEvent,
  InitEvent,
} from 'src/machine/interpreter.types';
import type { PrimitiveObject } from '~types';

export type EventObject<T extends PrimitiveObject = PrimitiveObject> = {
  type: string;
  payload?: T;
};

export type EventsMap = Record<string, any>;

export type ToEvents<T extends EventsMap> =
  | (Unionize<T> extends infer U
      ? U extends any
        ? { type: keyof U; payload: U[keyof U] }
        : never
      : { type: string; payload: any })
  | InitEvent
  | AlwaysEvent;
