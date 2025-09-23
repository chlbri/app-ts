import type { EventsMap, PromiseeMap } from '#events';
import type { types } from '@bemedev/types';
import type { Emitter, EmitterMap } from 'src/emitters/types';
import { isDescriber } from '~types';
import type { EmitterConfig } from '../types';

export type ToEmitter_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
>(
  emitter: EmitterConfig,
  emitters?: EmitterMap<E, P, Pc, Tc>,
) => { emitter: Emitter<E, P, Pc, Tc>; id: string } | undefined;

/**
 * Converts a machine configuration to a machine object with an id.
 * * If the machine is a describer, it looks up the machine configuration by name.
 * * If the machine is a string, it looks up the machine configuration by that string.
 * * If the machine is not found in the provided machines map, it returns undefined.
 * @param _emitter of type {@linkcode EmitterConfig}, the machine configuration to convert.
 * @param emitters of type {@linkcode MachineMap}, the map of machines to look up the machine configuration.
 * @returns a machine object with an id, or undefined if the machine is not found.
 *
 * @see {@linkcode ChildS} for the structure of the machine object.
 * @see {@linkcode isDescriber} to check if the machine is a describer
 * @see {@linkcode EventsMap} for the events map
 * @see {@linkcode PromiseeMap} for the promisees map
 */
export const toEmitter: ToEmitter_F = (_emitter, emitters) => {
  if (isDescriber(_emitter)) {
    const emitter = emitters?.[_emitter.name];
    if (!emitter) return undefined;
    return { emitter, id: _emitter.name };
  }

  const emitter = emitters?.[_emitter];
  if (!emitter) return undefined;
  return { emitter, id: _emitter };
};
