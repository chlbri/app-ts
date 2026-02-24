import type { FinallyConfig } from '#promises';
import type { SingleOrArrayT } from '#transitions';

type CommonActor = {
  readonly src: string;
  readonly description?: string;
};

type EmitterConfig<Paths extends string = string> = CommonActor & {
  readonly next: SingleOrArrayT<Paths>;
  readonly error?: SingleOrArrayT<Paths>;
  readonly complete?: FinallyConfig<Paths>;
};

type PromiseeConfig<Paths extends string = string> = CommonActor & {
  // Max wait time to perform the promise
  readonly max?: string;
  readonly then: SingleOrArrayT<Paths>;
  readonly catch: SingleOrArrayT<Paths>;
  readonly finally?: FinallyConfig<Paths>;
};

type MachineConfig<Paths extends string = string> = CommonActor &
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

export type Actor<Paths extends string = string> =
  | EmitterConfig<Paths>
  | PromiseeConfig<Paths>
  | MachineConfig<Paths>;
