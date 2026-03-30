import { defineConfig } from '#plugins';
import { emittersPlugin } from '../emitters';

/**
 * Example configuration file located inside the src folder.
 * This simulates an `app-ts.config.ts` placed inside `src/`.
 */
export default defineConfig({
  mode: 'normal',
  plugins: [emittersPlugin],
});
