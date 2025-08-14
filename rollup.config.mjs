import { defineConfig } from '@bemedev/rollup-config';

export default defineConfig.bemedev({
  declarationMap: true,
  ignoresJS: [
    '**/*.example.ts',
    '**/experimental.ts',
    '**/src/types/**/*.ts',
    '**/*.gen.ts',
    '**/src/.vitest.ts',
  ],
  excludesTS: [
    '**/src/.vitest.ts',
    '**/*.gen.ts',
    '**/*.example.ts',
    '**/experimental.ts',
  ],
});
