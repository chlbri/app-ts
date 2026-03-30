/**
 * Placeholder for the emitters plugin type augmentations.
 *
 * When `@bemedev/app-ts-emitters` is published, it will augment
 * `ActorsConfigMap` from `#events` to add emitter support,
 * following the same pattern as `@testing-library/jest-dom`
 * augmenting vitest's `Assertion` interface.
 *
 * ## Usage (tsconfig.json)
 * ```json
 * {
 *   "compilerOptions": {
 *     "typeRoots": ["./node_modules/@types", "./node_modules", "./types"],
 *     "types": ["vitest/globals", "node", "app-ts-emitters"]
 *   }
 * }
 * ```
 */

export {};
