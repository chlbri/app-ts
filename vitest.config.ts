import { aliasTs } from '@bemedev/vitest-alias';
import { configDefaults, defineConfig } from 'vitest/config';
import tsconfig from './tsconfig.json';

export default defineConfig({
  plugins: [aliasTs(tsconfig as any)],
  test: {
    bail: 10,
    maxConcurrency: 10,
    passWithNoTests: true,
    slowTestThreshold: 3000,
    globals: true,
    logHeapUsage: true,
    typecheck: {
      enabled: true,
      only: false,
      ignoreSourceErrors: true,
    },
    coverage: {
      enabled: true,
      exclude: [...configDefaults.exclude, '**/index.ts', '**/types.ts'],
    },
  },
});
