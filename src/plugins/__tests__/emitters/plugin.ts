import { definePlugin } from '../../functions/definePlugin';

/**
 * Plugin configuration for emitter support.
 *
 * This plugin enables Observable-based emitters in
 * Machine and Interpreter. It requires rxjs as a
 * peer dependency when used.
 *
 * This configuration is kept here so it can be extracted
 * into a separate library (e.g. @bemedev/app-ts-emitters)
 * that wraps rxjs and rx-pausable.
 */
export const emittersPlugin = definePlugin({
  name: 'emitters',
  description:
    'Enables Observable-based emitters for Machine and Interpreter',
  options: {
    /**
     * Whether to use rx-pausable for pausable observables.
     */
    pausable: true,
  },
  setup(options) {
    if (options?.pausable) {
      // Placeholder: In the real plugin library,
      // this would initialize rx-pausable integration.
    }
  },
});
