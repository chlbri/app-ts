import { defineConfig } from '#plugins';
import { emittersPlugin } from './src/plugins/__tests__/emitters';

export default defineConfig({
  mode: 'strict',
  plugins: [emittersPlugin],
});
