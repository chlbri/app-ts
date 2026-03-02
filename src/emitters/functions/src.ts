import { Observable } from 'rxjs';
import type { EmittersMap } from '../types';

export type ToObservable_F = <T = any>(
  emitter: string,
  emitters?: EmittersMap,
) => Observable<T> | undefined;

/**
 * Converts a machine configuration to a machine object with an id.
 * * If the machine is a describer, it looks up the machine configuration by name.
 * * If the machine is a string, it looks up the machine configuration by that string.
 * * If the machine is not found in the provided machines map, it returns undefined.
 * @param _emitter of type {@linkcode EmitterSrcConfig}, the machine configuration to convert.
 * @param emitters of type {@linkcode EmittersMap}, the map of emitters to look up the emitter configuration.
 * @returns an emitter object with an id, or undefined if the emitter is not found.
 *
 * @see {@linkcode ChildS} for the structure of the emitter object.
 * @see {@linkcode isDescriber} to check if the emitter is a describer
 * @see {@linkcode EventsMap} for the events map
 * @see {@linkcode ActorsConfigMap} for the actors map
 */
export const toObservable: ToObservable_F = (_emitter, emitters) => {
  const emitter = emitters?.[_emitter];
  if (!emitter) return undefined;
  return emitter;
};
