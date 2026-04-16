import type { ActionConfig } from '#actions';
import type { SingleOrArrayT, TransitionConfigMapA } from '#transitions';
import type { Require } from '#bemedev/globals/types';

export type CommonActor = {
  readonly description?: string;
};

/**
 * The finally part of a completion configuration.
 *
 * @see {@linkcode TransitionConfigMapA} for the type of transition configurations.
 * @see {@linkcode ActionConfig} for the type of action configurations.
 */
export type FinallyConfig<Paths extends string = string> =
  TransitionConfigMapA<Paths> extends infer F extends
    TransitionConfigMapA<Paths>
    ?
        | (F | ActionConfig)
        | readonly [...Require<F, 'guards'>[], F | ActionConfig]
    : never;

export type _EmitterConfig<Paths extends string = string> = CommonActor & {
  readonly next: SingleOrArrayT<Paths>;
  readonly error?: SingleOrArrayT<Paths>;
  readonly complete?: FinallyConfig<Paths>;
};

export type EmitterConfig<Paths extends string = string> =
  _EmitterConfig<Paths> extends infer E
    ? E & { [K in Exclude<keyof E, keyof _EmitterConfig>]: never }
    : never;

export type ExtractSrcFromActor<T extends { src: string }> = T['src'];

export type _ChildConfig<Paths extends string = string> = CommonActor &
  (
    | {
        readonly on: Record<string, SingleOrArrayT<Paths>>;
        readonly contexts?: Record<string, string>;
      }
    | {
        readonly on?: Record<string, SingleOrArrayT<Paths>>;
        readonly contexts: Record<string, string>;
      }
  );

export type ChildConfig<Paths extends string = string> =
  _ChildConfig<Paths> extends infer C
    ? C & { [K in Exclude<keyof C, keyof _ChildConfig>]: never }
    : never;

export type ActorConfig<Paths extends string = string> =
  | EmitterConfig<Paths>
  | ChildConfig<Paths>;
