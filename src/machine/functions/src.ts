import type { AnyInterpreter } from '#interpreters';
import type { ChildrenMap } from '../types';

export type ToChildSrc_F = (
  child: string,
  children?: ChildrenMap,
) => AnyInterpreter | undefined;

/**
 * Converts a child configuration to a child machine object.
 * @param _child of type {@linkcode EmitterSrcConfig}, the machine configuration to convert.
 * @param children of type {@linkcode EmitterMap}, the map of emitters to look up the emitter configuration.
 * @returns an emitter object with an id, or undefined if the emitter is not found.
 *
 * @see {@linkcode EventsMap} for the events map
 * @see {@linkcode ActorsConfigMap} for the actors map
 */
export const toChildSrc: ToChildSrc_F = (_child, children) => {
  const child = children?.[_child];
  if (!child) return undefined;
  return child.renew;
};
