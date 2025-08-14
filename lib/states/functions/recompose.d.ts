import type { NodeConfig } from '../types';
export type RecomposeConfig_F = <T extends NodeConfig>(shape: T) => NodeConfig;
/**
 * Recompose a configuration object into a nested structure based on the provided shape.
 *
 * @param shape - The shape of the configuration to recompose.
 * @returns A recomposed configuration object.
 *
 * @see {@linkcode RecomposeConfig_F} for type details.
 * @see {@linkcode recomposeObjectUrl} for the implementation of the recomposition logic.
 * @see {@linkcode merge} for merging objects.
 */
export declare const recomposeConfig: RecomposeConfig_F;
//# sourceMappingURL=recompose.d.ts.map