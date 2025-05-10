import { type UserConfig, mergeConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";

import { res } from "./utils";
import packageJson from "../../package.json";

export const targetBrowser = process.env.BROWSER || "firefox";
export const isDev = process.env.NODE_ENV !== "prod";
export const name = JSON.stringify(packageJson.name);

const baseConfig: UserConfig = {
  define: {
    __DEV__: isDev,
    __NAME__: name,
    __BROWSER__: JSON.stringify(targetBrowser),
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
    outDir: `dist/${targetBrowser}`,
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
