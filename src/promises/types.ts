import type {
  Fn,
  NOmit,
  NotUndefined,
  ReduceArray,
  Require,
} from '@bemedev/types';
import type { ActionConfig, ActionResult } from '~actions';
import type { EventsMap, ToEvents } from '~events';
import type {
  ExtractActionsFromMap,
  ExtractGuardsFromDelayed,
  SingleOrArrayT,
  Transition,
  TransitionConfigMapA,
} from '~transitions';
import type { FnMap, PrimitiveObject, SingleOrArrayL } from '~types';

export type PromiseFunction<
  E extends EventsMap = EventsMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = FnMap<E, Pc, TC, Promise<any>>;

export type FinallyConfig =
  NOmit<TransitionConfigMapA, 'target'> extends infer F extends NOmit<
    TransitionConfigMapA,
    'target'
  >
    ?
        | (F | ActionConfig)
        | readonly [...Require<F, 'guards'>[], F | ActionConfig]
    : never;

export type PromiseConfig = {
  readonly src: string;
  readonly id?: string;

  // Max wait time to perform the promise
  readonly max?: string;
  readonly description?: string;
  readonly then: SingleOrArrayT;
  readonly catch: SingleOrArrayT;
  readonly finally?: FinallyConfig;
};

type _ExtractActionsFromMap<T> = ExtractActionsFromMap<
  Extract<
    ReduceArray<NotUndefined<T>>,
    { actions: SingleOrArrayL<ActionConfig> }
  >
>;

export type ExtractActionsFromPromise<T extends PromiseConfig> =
  | _ExtractActionsFromMap<T['then']>
  | _ExtractActionsFromMap<T['catch']>
  | _ExtractActionsFromMap<T['finally']>;

export type ExtractSrcFromPromise<T extends { src: string }> = T['src'];

export type ExtractMaxFromPromise<T extends { max: string }> = T['max'];

export type ExtractGuardsFromPromise<T extends PromiseConfig> =
  | ExtractGuardsFromDelayed<T['then']>
  | ExtractGuardsFromDelayed<T['catch']>
  | ExtractGuardsFromDelayed<T['finally']>;

export type Promisee<
  E extends EventsMap = EventsMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = {
  src: PromiseFunction2<E, Pc, TC>;
  description?: string;
  then: Transition<E, Pc, TC>[];
  catch: Transition<E, Pc, TC>[];
  finally: Transition<E, Pc, TC>[];
};

export type PromiseFunction2<
  E extends EventsMap = EventsMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = Fn<[Pc, TC, ToEvents<E>], Promise<any>>;

export type PromiseeResult<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  event: ToEvents<E>;
  result: ActionResult<Pc, Tc>;
  target?: string;
};
