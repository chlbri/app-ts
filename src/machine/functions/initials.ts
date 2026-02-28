import type { ActionConfig } from '#actions';
import { fromDescriber } from 'src/types/primitives';
import type { Initial, InitialsMap } from '../types';

export type ToInitials_F = (
  initial: ActionConfig,
  initials?: InitialsMap,
) => Initial | undefined;

/**
 * Converts a child configuration to a child machine object.
 * @param _initial of type {@linkcode EmitterSrcConfig}, the machine configuration to convert.
 * @param initials of type {@linkcode EmitterMap}, the map of emitters to look up the emitter configuration.
 * @returns an emitter object with an id, or undefined if the emitter is not found.
 *
 * @see {@linkcode EventsMap} for the events map
 * @see {@linkcode ActorsConfigMap} for the actors map
 */
export const toInitials: ToInitials_F = (_initial, initials) => {
  const id = fromDescriber(_initial);
  return initials?.[id];
};
