import { aliasTs } from '@bemedev/vitest-alias';
import { defineConfig } from 'vitest/config';
import tsconfig from './tsconfig.json';
import { exclude } from '@bemedev/vitest-exclude';

export default defineConfig({
  plugins: [
    aliasTs(tsconfig as any),
    exclude({
      ignoreCoverageFiles: [
        '**/index.ts',
        '**/types.ts',
        '**/*.example.ts',
        '**/*.types.ts',
        '**/*.typegen.ts',
        '**/*.fixtures.ts',
        '**/experimental.ts',
        '**/fixtures.ts',
        '**/libs/bemedev/**/*',
        '**/fixture.ts',
        '**/*.fixture.ts',
      ],
    }),
  ],
  test: {
    bail: 10,
    maxConcurrency: 10,
    passWithNoTests: true,
    slowTestThreshold: 3000,
    globals: true,
    logHeapUsage: true,
    setupFiles: ['./vitest.setup.ts'],

    typecheck: {
      enabled: true,
      ignoreSourceErrors: true,
    },
    coverage: {
      enabled: true,
      reportsDirectory: '.coverage',
      all: true,
      provider: 'v8',
      extension: '.ts',
    },
  },
});
