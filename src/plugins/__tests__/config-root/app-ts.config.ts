import { defineConfig } from '#plugins';
import { emittersPlugin } from '../emitters';

/**
 * Example configuration file located at root level.
 * This simulates an `app-ts.config.ts` placed at the
 * project root.
 */
export default defineConfig({
  mode: 'strict',
  plugins: [emittersPlugin],
});
