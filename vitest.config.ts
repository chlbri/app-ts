import { aliasTs } from '@bemedev/dev-utils/vitest-alias';
import { exclude } from '@bemedev/dev-utils/vitest-exclude';
import { defineConfig } from 'vitest/config';
import tsconfig from './tsconfig.json';

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
        '**/*.test-d.ts',
        '**/*.machine.ts',
        '**/experimental.ts',
        '**/fixtures.ts',
        '**/libs/bemedev/**/*',
        '**/fixture.ts',
        '**/*.fixture.ts',
        '**/test.ts',
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
      provider: 'v8',
    },
  },
});
