import { definePlugin } from '../../functions/definePlugin';

/**
 * Reference implementation of the emitters plugin for `@bemedev/app-ts`.
 *
 * ## Pattern (like @testing-library/jest-dom with vitest)
 *
 * This plugin follows the same pattern as `@testing-library/jest-dom`
 * augmenting vitest's `Assertion` interface:
 * - The base library (`@bemedev/app-ts`) does NOT include emitters.
 * - This plugin adds emitter support via TypeScript declaration merging.
 * - Type augmentation lives in `types/app-ts-emitters/index.d.ts`.
 *
 * ## Type setup (tsconfig.json)
 * ```json
 * {
 *   "compilerOptions": {
 *     "typeRoots": ["./node_modules/@types", "./types"],
 *     "types": ["vitest/globals", "node", "app-ts-emitters"]
 *   }
 * }
 * ```
 *
 * ## Runtime setup (app-ts.config.ts)
 * ```ts
 * import { defineConfig } from '@bemedev/app-ts';
 * import { emittersPlugin } from '@bemedev/app-ts-emitters';
 *
 * export default defineConfig({
 *   mode: 'strict',
 *   plugins: [emittersPlugin],
 * });
 * ```
 *
 * ## Published library
 * In production this will be extracted to `@bemedev/app-ts-emitters`,
 * wrapping rxjs and rx-pausable as peer dependencies.
 */
export const emittersPlugin = definePlugin({
  name: 'emitters',
  description:
    'Enables Observable-based emitters for Machine and Interpreter',
  options: {
    /**
     * Whether to use rx-pausable for pausable observables.
     * Requires `@bemedev/rx-pausable` as a peer dependency.
     */
    pausable: true,
  },
  setup(options) {
    if (options?.pausable) {
      // In the real plugin library (@bemedev/app-ts-emitters),
      // this would initialize the rx-pausable integration with
      // the interpreter's emitter collection system.
    }
  },
});
