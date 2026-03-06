import { aliasTs } from '@bemedev/vitest-alias';
import { defineConfig } from 'vitest/config';
import tsconfig from './tsconfig.json';
import { exclude } from '@bemedev/vitest-exclude';

export default defineConfig({
  plugins: [
    aliasTs(tsconfig as any),
    exclude.withPattern(
      {
        patternTest: [
          'src/interpreters/__tests__/activities/interpreter.cov.test.ts',
          'src/interpreters/interpreter.cov2.test.ts',
          'src/interpreters/__tests__/data/machine1.test.ts',
          'src/interpreters/__tests__/data/machine2.cov.test.ts',
          'src/interpreters/__tests__/data/machine23.test.ts',
          'src/emitters/__tests__/machines.test.ts',
          'src/emitters/__tests__/machines.children.test.ts',
        ],
        patternCov: ['**/*.ts'],
      },
      {
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
      },
    ),
  ],
  test: {
    bail: 10,
    maxConcurrency: 10,
    passWithNoTests: true,
    slowTestThreshold: 3000,
    globals: true,
    logHeapUsage: true,
    setupFiles: ['./vitest.setup.ts'],

    // typecheck: {
    //   enabled: true,
    //   ignoreSourceErrors: true,
    // },
    coverage: {
      enabled: true,
      reportsDirectory: '.coverage',
      all: true,
      provider: 'v8',
      extension: '.ts',
    },
  },
});
