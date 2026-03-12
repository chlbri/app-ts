import type { FinallyConfig } from '#promises';
import type { SingleOrArrayT } from '#transitions';

export type CommonActor = {
  readonly description?: string;
};

export type _EmitterConfig<Paths extends string = string> = CommonActor & {
  readonly next: SingleOrArrayT<Paths>;
  readonly error?: SingleOrArrayT<Paths>;
  readonly complete?: FinallyConfig<Paths>;
};

export type EmitterConfig<Paths extends string = string> =
  _EmitterConfig<Paths> extends infer E
    ? E & { [K in Exclude<keyof E, keyof _EmitterConfig>]: never }
    : never;

export type _PromiseeConfig<Paths extends string = string> =
  CommonActor & {
    // Max wait time to perform the promise
    readonly max?: string;
    readonly then: SingleOrArrayT<Paths>;
    readonly catch: SingleOrArrayT<Paths>;
    readonly finally?: FinallyConfig<Paths>;
  };

export type PromiseeConfig<Paths extends string = string> =
  _PromiseeConfig<Paths> extends infer P
    ? P & { [K in Exclude<keyof P, keyof _PromiseeConfig>]: never }
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
  | PromiseeConfig<Paths>
  | ChildConfig<Paths>;
