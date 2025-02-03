import type { Fn, NOmit, Require } from '@bemedev/types';
import type { PrimitiveObject } from 'src/types/primitives';
import type { ActionConfig } from '~actions';
import type { MachineOptions } from '~config';
import type { EventObject } from '~events';
import type {
  ExtractActionsFromDelayed,
  ExtractGuardsFromDelayed,
  SingleOrArrayT,
  Transition,
  TransitionConfigMapA,
} from '~transitions';

export type PromiseFunction<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Te extends EventObject = EventObject,
  R = any,
> = Fn<[Pc, Tc, Te], Promise<R>>;

export type PromiseMap<
  Tc extends PrimitiveObject,
  Te extends EventObject,
> = Record<string, PromiseFunction<Tc, Te>>;

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

  // #region To perform
  // readonly autoForward?: boolean;
  // #endregion
  readonly max?: string;
  readonly description?: string;
  readonly then: SingleOrArrayT;
  readonly catch: SingleOrArrayT;
  readonly finally?: FinallyConfig;
};

export type ExtractActionsFromPromise<T extends PromiseConfig> =
  | ExtractActionsFromDelayed<T['then']>
  | ExtractActionsFromDelayed<T['catch']>
  | ExtractActionsFromDelayed<T['finally']>;

export type ExtractSrcFromPromise<T extends { src: string }> = T['src'];

export type ExtractMaxFromPromise<T extends { max: string }> = T['max'];

export type ExtractGuardsFromPromise<T extends PromiseConfig> =
  | ExtractGuardsFromDelayed<T['then']>
  | ExtractGuardsFromDelayed<T['catch']>
  | ExtractGuardsFromDelayed<T['finally']>;

export type Promisee<
  TC extends PrimitiveObject,
  TE extends EventObject = EventObject,
> = {
  readonly src: PromiseFunction<TC, TE>;
  readonly id?: string;
  readonly description?: string;
  readonly then: Transition<TC, TE>[];
  readonly catch: Transition<TC, TE>[];
  readonly finally: Transition<TC, TE>[];
};

export type ToPromiseSrc_F = <
  TC extends PrimitiveObject = PrimitiveObject,
  TE extends EventObject = EventObject,
>(params: {
  src: ActionConfig;
  promises?: MachineOptions<TC, TE>['promises'];
  strict?: boolean;
}) => PromiseFunction<TC, TE>;

export type ToPromise_F = <
  TC extends PrimitiveObject,
  TE extends EventObject = EventObject,
>(params: {
  promise: PromiseConfig;
  options?: NOmit<MachineOptions<TC, TE>, 'children' | 'delays'>;
  strict?: boolean;
}) => Promisee<TC, TE>;
