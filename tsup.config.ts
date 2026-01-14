import { builtinModules } from "node:module"
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: "cjs",
  clean: true,
  dts: false,
  target: "node18",
  banner: {
    js: "#!/usr/bin/env node"
  },
  bundle: true,
  platform: "node",
  external: [
    ...builtinModules.flatMap(moduleName => [moduleName, `node:${moduleName}`])
  ],
  skipNodeModulesBundle: true,
})
