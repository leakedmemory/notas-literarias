import { type UserConfig, mergeConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";

import { res, PACKAGE_NAME, TARGET, IS_DEV, VERSION } from "./scripts/utils";

const baseConfig: UserConfig = {
  define: {
    __DEV__: IS_DEV,
    __NAME__: JSON.stringify(PACKAGE_NAME),
    __BROWSER__: TARGET,
    __VERSION__: JSON.stringify(VERSION),
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
    outDir: `dist/${IS_DEV ? "dev" : "prod"}/${TARGET}`,
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
