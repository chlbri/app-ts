/**
 * Type augmentations for the emitters plugin.
 *
 * This file follows the same pattern as `@testing-library/jest-dom`
 * augmenting vitest's `Assertion` interface, or `vitest/globals`
 * adding `describe`/`it`/`expect` globally.
 *
 * Usage — add to your tsconfig.json:
 * ```json
 * {
 *   "compilerOptions": {
 *     "typeRoots": ["./node_modules/@types", "./types"],
 *     "types": ["vitest/globals", "node", "app-ts-emitters"]
 *   }
 * }
 * ```
 *
 * In the published package (@bemedev/app-ts-emitters) this would be
 * the package's `types` entry point.
 */

import type { EmitterConfigMap } from '#emitters';

/**
 * Augment the base `ActorsConfigMap` interface to add emitter support.
 * Without this file included, Machine and Interpreter have no emitter types.
 *
 * @see {@linkcode EmitterConfigMap} for the emitter definition shape.
 */
declare module '#events' {
  interface ActorsConfigMap {
    emitters?: EmitterConfigMap;
  }
}
