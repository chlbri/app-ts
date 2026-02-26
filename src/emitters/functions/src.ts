import type { Observable } from 'rxjs';
import type { EmitterMap } from '../types2';

export type ToEmitterSrc_F = <R = any>(
  emitter: string,
  emitters?: EmitterMap,
) => Observable<R> | undefined;

/**
 * Converts a machine configuration to a machine object with an id.
 * * If the machine is a describer, it looks up the machine configuration by name.
 * * If the machine is a string, it looks up the machine configuration by that string.
 * * If the machine is not found in the provided machines map, it returns undefined.
 * @param _emitter of type {@linkcode EmitterSrcConfig}, the machine configuration to convert.
 * @param emitters of type {@linkcode EmitterMap}, the map of emitters to look up the emitter configuration.
 * @returns an emitter object with an id, or undefined if the emitter is not found.
 *
 * @see {@linkcode ChildS} for the structure of the emitter object.
 * @see {@linkcode isDescriber} to check if the emitter is a describer
 * @see {@linkcode EventsMap} for the events map
 * @see {@linkcode ActorsConfigMap} for the actors map
 */
export const toEmitterSrc: ToEmitterSrc_F = (_emitter, emitters) => {
  const emitter = emitters?.[_emitter];
  if (!emitter) return undefined;
  return emitter;
};
