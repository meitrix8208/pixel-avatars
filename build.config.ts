import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: ["src/index.ts"],
  externals: ["sharp", "citty"],
  rollup: {
    emitCJS: true,
    esbuild: {
      minify: true,
    },
  },
});
