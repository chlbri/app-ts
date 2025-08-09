import type { TimerState } from '@bemedev/interval2';
import { PrimitiveObject } from '../types/index.js';
import type { State } from './interpreter.types';
declare class SubscriberClass2<
  Tc extends PrimitiveObject = PrimitiveObject,
> {
  #private;
  private _id;
  get id(): string;
  constructor(
    subscriber: (state: State<Tc>) => void,
    equals: (a: State<Tc>, b: State<Tc>) => boolean,
    _id: string,
  );
  get state(): TimerState;
  get cannotPerform(): boolean;
  fn(previous: State<Tc>, next: State<Tc>): void;
  close(): void;
  open(): void;
  unsubscribe(): void;
}
export type { SubscriberClass2 };
export type SubscriberOptions<
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  id?: string;
  equals?: (a: State<Tc>, b: State<Tc>) => boolean;
};
export declare const createSubscriber2: <
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  subscriber: (state: State<Tc>) => void,
  options?: SubscriberOptions<Tc>,
) => SubscriberClass2<Tc>;
//# sourceMappingURL=subscriber2.d.ts.map
