import type { FinallyConfig } from '#promises';
import type { SingleOrArrayT } from '#transitions';
import type { Describer } from './types/primitives';

export type CommonActor = {
  readonly src: string;
  readonly description?: string;
};

export type EmitterConfig<Paths extends string = string> = CommonActor & {
  readonly id: string;
  readonly next: SingleOrArrayT<Paths>;
  readonly error?: SingleOrArrayT<Paths>;
  readonly complete?: FinallyConfig<Paths>;
};

export type PromiseeConfig<Paths extends string = string> = CommonActor & {
  // Max wait time to perform the promise
  readonly max?: string;
  readonly then: SingleOrArrayT<Paths>;
  readonly catch: SingleOrArrayT<Paths>;
  readonly finally?: FinallyConfig<Paths>;
};

export type ExtractSrcFromActor<T extends { src: string }> = T['src'];

export type InitialConfig = string | Describer;

export type ChildConfig<Paths extends string = string> = CommonActor & {
  readonly id: string;
} & (
    | {
        readonly on: Record<string, SingleOrArrayT<Paths>>;
        readonly contexts?: Record<string, string>;
      }
    | {
        readonly on?: Record<string, SingleOrArrayT<Paths>>;
        readonly contexts: Record<string, string>;
      }
  );

export type ActorConfig<Paths extends string = string> =
  | EmitterConfig<Paths>
  | PromiseeConfig<Paths>
  | ChildConfig<Paths>;
