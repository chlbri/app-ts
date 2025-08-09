import type { FlatMapN, NodeConfig } from '../types';
export type FlatMap_F<T extends NodeConfig = NodeConfig> = <const SN extends T, Wc extends boolean = true>(config: SN, withChildren?: Wc, delimiter?: string, path?: string) => FlatMapN<SN, Wc>;
/**
 * Flattens a state node configuration into a map structure.
 *
 * @param node - The state node configuration to flatten.
 * @param withChildren - Whether to include child states in the output.
 * @param delimiter - The delimiter to use for paths in the output map. Defaults to {@linkcode DEFAULT_DELIMITER}.
 * @param path - The current path in the output map (used for recursion).
 * @returns A flat map of the state node configuration.
 *
 * @see {@linkcode FlatMap_F} for more details.
 */
export declare const flatMap: FlatMap_F;
//# sourceMappingURL=flatMap.d.ts.map