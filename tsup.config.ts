import { builtinModules } from "node:module"
import { defineConfig } from "tsup"

const mode = process.env.NODE_ENV || "development"
const isProd = mode === "production"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es2018",
  clean: true,
  dts: true,
  splitting: false,
  bundle: true,
  shims: true,
  sourcemap: !isProd,
  minify: isProd,
  banner: {
    js: "#!/usr/bin/env node"
  },
  env: {
    NODE_ENV: process.env.NODE_ENV || "production"
  },
  external: [
    "commander",
    "chalk",
    "zod",
    ...builtinModules.flatMap(m => [m, `node:${m}`])
  ],
  platform: "node",
  skipNodeModulesBundle: true,
  keepNames: true
})
