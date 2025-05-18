import { type UserConfig, mergeConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";

import { res, packageName, target, isDev, version } from "./utils";

const baseConfig: UserConfig = {
  define: {
    __DEV__: isDev,
    __NAME__: JSON.stringify(packageName),
    __BROWSER__: target,
    __VERSION__: JSON.stringify(version),
  },
  plugins: [
    // ref: https://github.com/unplugin/unplugin-auto-import?tab=readme-ov-file#configuration
    AutoImport({
      imports: [
        {
          "webextension-polyfill": [["=", "browser"]],
        },
      ],
      dts: res("src", "auto-imports.d.ts"),
    }),
  ],
  build: {
    outDir: `dist/${isDev ? "dev" : "prod"}/${target}`,
    emptyOutDir: false,
  },
  optimizeDeps: {
    include: ["webextension-polyfill"],
  },
};

export const devConfig: UserConfig = mergeConfig(baseConfig, {
  mode: "development",
  server: {
    port: 8080,
  },
  build: {
    watch: true,
    sourcemap: "inline",
    minify: false,
  },
  esbuild: {
    minifyIdentifiers: false,
    keepNames: true,
  },
});

export const prodConfig: UserConfig = mergeConfig(baseConfig, {
  mode: "production",
  build: {
    sourcemap: false,
    minify: "esbuild",
  },
});
