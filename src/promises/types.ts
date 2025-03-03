import type {
  Fn,
  NOmit,
  NotUndefined,
  ReduceArray,
  Require,
} from '@bemedev/types';
import type {
  ActionConfig,
  ActionResult,
  FromActionConfig,
} from '~actions';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
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
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = FnMap<E, P, Pc, TC, Promise<any>>;

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

export type ExtractActionsFromFinally<T extends FinallyConfig> =
  ReduceArray<T> extends infer Tr
    ? Tr extends ActionConfig
      ? FromActionConfig<Tr>
      : _ExtractActionsFromMap<Tr>
    : never;

export type ExtractActionsFromPromisee<T extends PromiseConfig> =
  | _ExtractActionsFromMap<T['then']>
  | _ExtractActionsFromMap<T['catch']>
  | ExtractActionsFromFinally<NotUndefined<T['finally']>>;

export type ExtractSrcFromPromisee<T extends { src: string }> = T['src'];

export type ExtractMaxFromPromisee<T extends { max: string }> = T['max'];

export type ExtractGuardsFromPromise<T extends PromiseConfig> =
  | ExtractGuardsFromDelayed<T['then']>
  | ExtractGuardsFromDelayed<T['catch']>
  | ExtractGuardsFromDelayed<T['finally']>;

export type Promisee<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = {
  src: PromiseFunction2<E, P, Pc, TC>;
  description?: string;
  then: Transition<E, P, Pc, TC>[];
  catch: Transition<E, P, Pc, TC>[];
  finally: Transition<E, P, Pc, TC>[];
};

export type PromiseFunction2<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = Fn<[Pc, TC, ToEvents<E, P>], Promise<any>>;

export type PromiseeResult<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  event: ToEvents<E, P>;
  result: ActionResult<Pc, Tc>;
  target?: string;
};
