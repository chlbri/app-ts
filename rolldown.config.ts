import { PLUGIN_BUILDERS } from "@bemedev/rollup-config";
import { globSync } from "glob";
import { extname, relative } from "node:path";
import type { Plugin } from "rolldown";
import { defineConfig } from "rolldown";
import ts from "typescript";

// ─── Constants (mirrors @bemedev/rollup-config defaults) ──────────────────────

const DEFAULT_EXCLUDE = [
  "**/__tests__/**/*",
  "**/*.test.ts",
  "**/*.test-d.ts",
  "**/*.fixtures.ts",
  "**/fixtures.ts",
  "src/fixtures/**/*.ts",
];

const DEFAULT_CIRCULAR_DEPS = [
  "**/types.ts",
  "**/type.ts",
  "**/*.types.ts",
  "**/*.type.ts",
];

const DEFAULT_DIR = "lib";

// Excludes mirroring tsconfig.dts options (src-prefixed for tsc)
const DTS_EXCLUDE = [
  "src/**/__tests__/**/*",
  "src/**/*.test.ts",
  "src/**/*.test-d.ts",
  "src/**/*.fixtures.ts",
  "src/**/fixtures.ts",
  "src/fixtures/**/*.ts",
  "src/**/*.example.ts",
  "src/**/experimental.ts",
  "src/.vitest.ts",
  "src/**/*.gen.ts",
  "src/**/test.ts",
];

// ─── User options (as passed to defineConfig.bemedev) ─────────────────────────

const _ignoresJS = [
  "**/*.example.ts",
  "**/experimental.ts",
  "**/src/.vitest.ts",
  "**/test.ts",
];

const _excludesTS = [
  "**/src/.vitest.ts",
  "**/*.gen.ts",
  "**/*.example.ts",
  "**/experimental.ts",
  "**/test.ts",
];

// ─── Computed values (defineConfig.bemedev logic) ─────────────────────────────

const dir = DEFAULT_DIR;
const sourcemap = true; // sourcemap is undefined → true per bemedev logic
const circularDeps = [...DEFAULT_CIRCULAR_DEPS];
const ignoresJS = [..._ignoresJS, ...DEFAULT_CIRCULAR_DEPS];
const excludesTS = [...DEFAULT_EXCLUDE, ..._excludesTS];

// ─── buildInput helper ─────────────────────────────────────────────────────────

function buildInput(...ignores: string[]) {
  return Object.fromEntries(
    globSync("src/**/*.ts", {
      ignore: DEFAULT_EXCLUDE.concat(ignores),
    }).map((file) => {
      const key = relative(
        "src",
        file.slice(0, file.length - extname(file).length),
      );
      const value = `${process.cwd()}/${file}`;
      return [key, value];
    }),
  );
}

// ─── DTS plugin ───────────────────────────────────────────────────────────────
// rolldown transforms TypeScript natively via oxc but does not emit .d.ts.
// This plugin uses the TypeScript programmatic API in closeBundle to do it.

function dtsPlugin(): Plugin {
  let done = false;

  return {
    name: "bemedev-dts",
    closeBundle: {
      order: "post",
      handler() {
        if (done) return;
        done = true;

        const cwd = process.cwd();
        const tsconfigPath = ts.findConfigFile(
          cwd,
          ts.sys.fileExists,
          "tsconfig.json",
        )!;

        const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
        const host = ts.createCompilerHost({});

        const parsed = ts.parseJsonConfigFileContent(
          {
            ...configFile.config,
            include: ["src"],
            exclude: DTS_EXCLUDE,
            compilerOptions: {
              ...configFile.config.compilerOptions,
              rootDir: "./src",
              outDir: dir,
              noEmit: false,
              emitDeclarationOnly: true,
              declaration: true,
              declarationMap: true,
            },
          },
          ts.sys,
          cwd,
        );

        const program = ts.createProgram(
          parsed.fileNames,
          parsed.options,
          host,
        );
        const emitResult = program.emit();

        const errors = ts
          .getPreEmitDiagnostics(program)
          .concat(emitResult.diagnostics)
          .filter((d) => d.category === ts.DiagnosticCategory.Error);

        if (errors.length > 0) {
          console.error(ts.formatDiagnosticsWithColorAndContext(errors, host));
        }

        console.log("DTS generation complete");
      },
    },
  };
}

// ─── Plugins ──────────────────────────────────────────────────────────────────

const plugins = [
  PLUGIN_BUILDERS.alias(),
  PLUGIN_BUILDERS.tsPaths({ colors: true }),
  PLUGIN_BUILDERS.circulars({ exclude: circularDeps }),
  PLUGIN_BUILDERS.externals({
    optDeps: false,
    builtinsPrefix: "strip",
    include: excludesTS,
  }),
  PLUGIN_BUILDERS.clean({ ignoresJS, sourcemap, dir }),
  dtsPlugin(),
];

// ─── Config ───────────────────────────────────────────────────────────────────

export default defineConfig({
  input: buildInput(),
  plugins,
  output: [
    {
      format: "es",
      sourcemap,
      preserveModulesRoot: "src",
      dir,
      preserveModules: true,
      entryFileNames: "[name].js",
    },
    {
      format: "cjs",
      sourcemap,
      preserveModulesRoot: "src",
      dir,
      preserveModules: true,
      entryFileNames: "[name].cjs",
    },
  ],
});
